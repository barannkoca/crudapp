import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Customer as CustomerModel } from '@/models/Customer';
import { Opportunity as OpportunityModel } from '@/models/Opportunity';
import { User as UserModel } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Genel istatistikler
    const [
      totalCustomers,
      totalOpportunities,
      totalUsers,
      opportunitiesByType,
      opportunitiesByStatus,
      recentOpportunities,
      monthlyStats
    ] = await Promise.all([
      CustomerModel.countDocuments().exec(),
      OpportunityModel.countDocuments().exec(),
      UserModel.countDocuments().exec(),
      
      // İşlem türüne göre dağılım
      OpportunityModel.aggregate([
        {
          $group: {
            _id: '$islem_turu',
            count: { $sum: 1 }
          }
        }
      ]).exec(),
      
      // Durum bazlı dağılım
      OpportunityModel.aggregate([
        {
          $group: {
            _id: '$durum',
            count: { $sum: 1 }
          }
        }
      ]).exec(),
      
      // Son 5 fırsat
      (OpportunityModel as any).find({})
        .populate('musteri', 'ad soyad')
        .sort({ olusturma_tarihi: -1 })
        .limit(5)
        .select('islem_turu durum olusturma_tarihi musteri')
        .lean()
        .exec(),
      
      // Son 6 ayın istatistikleri (tarih normalize: string/date yoksa _id)
      OpportunityModel.aggregate([
        { $addFields: {
            eventDate: {
              $ifNull: [
                {
                  $cond: {
                    if: { $eq: [{ $type: '$olusturma_tarihi' }, 'string'] },
                    then: { $toDate: '$olusturma_tarihi' },
                    else: '$olusturma_tarihi'
                  }
                },
                { $toDate: '$_id' }
              ]
            }
          }
        },
        {
          $match: {
            eventDate: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$eventDate' },
              month: { $month: '$eventDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]).exec()
    ]);

    // Müşteri cinsiyet dağılımı
    const genderDistribution = await CustomerModel.aggregate([
      {
        $group: {
          _id: '$cinsiyeti',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    // Ülke dağılımı (uyrugu alanından) — Türkçe karakter normalize + fallback
    let countryDistribution;
    try {
      countryDistribution = await CustomerModel.aggregate([
        { $match: { uyrugu: { $exists: true, $ne: null } } },
        {
          $project: {
            normalized: {
              $let: {
                vars: { s: { $toString: { $ifNull: ['$uyrugu', ''] } } },
                in: {
                  $toUpper: {
                    $trim: {
                      input: {
                        $reduce: {
                          input: [
                            ['ı', 'i'], ['İ', 'I'], ['ü', 'u'], ['Ü', 'U'],
                            ['ö', 'o'], ['Ö', 'O'], ['ç', 'c'], ['Ç', 'C'],
                            ['ş', 's'], ['Ş', 'S'], ['ğ', 'g'], ['Ğ', 'G']
                          ],
                          initialValue: '$$s',
                          in: {
                            $replaceAll: {
                              input: '$$value',
                              find: { $arrayElemAt: ['$$this', 0] },
                              replacement: { $arrayElemAt: ['$$this', 1] }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        { $group: { _id: '$normalized', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).exec();
    } catch (e) {
      console.error('Country normalization failed, falling back:', e);
      countryDistribution = await CustomerModel.aggregate([
        { $match: { uyrugu: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: { $toUpper: { $trim: { input: { $toString: { $ifNull: ['$uyrugu', ''] } } } } },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).exec();
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalOpportunities,
          totalUsers
        },
        opportunitiesByType,
        opportunitiesByStatus,
        genderDistribution,
        countryDistribution,
        recentOpportunities,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { success: false, error: 'Analytics verileri alınamadı' },
      { status: 500 }
    );
  }
}
