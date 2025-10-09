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
      
      // Son 5 fırsat — tarih normalize edilerek sıralama
      OpportunityModel.aggregate([
        { $addFields: {
            eventDate: {
              $ifNull: [
                {
                  $let: {
                    vars: { t: { $type: '$olusturma_tarihi' } },
                    in: {
                      $switch: {
                        branches: [
                          { case: { $eq: ['$$t', 'date'] }, then: '$olusturma_tarihi' },
                          { case: { $eq: ['$$t', 'string'] }, then: { $convert: { input: '$olusturma_tarihi', to: 'date', onError: null, onNull: null } } },
                          { case: { $eq: ['$$t', 'object'] }, then: {
                              $let: {
                                vars: { d: { $getField: { field: '$date', input: '$olusturma_tarihi' } } },
                                in: {
                                  $switch: {
                                    branches: [
                                      { case: { $eq: [{ $type: '$$d' }, 'date'] }, then: '$$d' },
                                      { case: { $eq: [{ $type: '$$d' }, 'string'] }, then: { $convert: { input: '$$d', to: 'date', onError: null, onNull: null } } },
                                      { case: { $eq: [{ $type: '$$d' }, 'object'] }, then: { $convert: { input: { $getField: { field: '$numberLong', input: '$$d' } }, to: 'long', onError: null, onNull: null } } },
                                    ],
                                    default: null
                                  }
                                }
                              }
                            }
                          },
                        ],
                        default: null
                      }
                    }
                  }
                },
                { $toDate: '$_id' }
              ]
            }
          }
        },
        { $sort: { eventDate: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'customers', localField: 'musteri', foreignField: '_id', as: 'musteriDoc' } },
        { $unwind: { path: '$musteriDoc', preserveNullAndEmptyArrays: true } },
        { $project: { islem_turu: 1, durum: 1, olusturma_tarihi: 1, musteri: { _id: '$musteriDoc._id', ad: '$musteriDoc.ad', soyad: '$musteriDoc.soyad' } } }
      ]).exec(),
      
      // Son 6 ayın istatistikleri (tarih normalize: string/date yoksa _id)
      OpportunityModel.aggregate([
        { $addFields: {
            eventDate: {
              $ifNull: [
                // 1) olusturma_tarihi: date | string | object{$date} | object{$date:{ $numberLong }}
                {
                  $let: {
                    vars: { t: { $type: '$olusturma_tarihi' } },
                    in: {
                      $switch: {
                        branches: [
                          { case: { $eq: ['$$t', 'date'] }, then: '$olusturma_tarihi' },
                          { case: { $eq: ['$$t', 'string'] }, then: { $convert: { input: '$olusturma_tarihi', to: 'date', onError: null, onNull: null } } },
                          { case: { $eq: ['$$t', 'object'] }, then: {
                              $let: {
                                vars: { d: { $getField: { field: '$date', input: '$olusturma_tarihi' } } },
                                in: {
                                  $switch: {
                                    branches: [
                                      { case: { $eq: [{ $type: '$$d' }, 'date'] }, then: '$$d' },
                                      { case: { $eq: [{ $type: '$$d' }, 'string'] }, then: { $convert: { input: '$$d', to: 'date', onError: null, onNull: null } } },
                                      { case: { $eq: [{ $type: '$$d' }, 'object'] }, then: { $convert: { input: { $getField: { field: '$numberLong', input: '$$d' } }, to: 'long', onError: null, onNull: null } } },
                                    ],
                                    default: null
                                  }
                                }
                              }
                            }
                          },
                        ],
                        default: null
                      }
                    }
                  }
                },
                // 2) createdAt: date | string | object{$date}
                {
                  $let: {
                    vars: { t: { $type: '$createdAt' } },
                    in: {
                      $switch: {
                        branches: [
                          { case: { $eq: ['$$t', 'date'] }, then: '$createdAt' },
                          { case: { $eq: ['$$t', 'string'] }, then: { $convert: { input: '$createdAt', to: 'date', onError: null, onNull: null } } },
                          { case: { $eq: ['$$t', 'object'] }, then: { $convert: { input: { $getField: { field: '$date', input: '$createdAt' } }, to: 'date', onError: null, onNull: null } } },
                        ],
                        default: null
                      }
                    }
                  }
                },
                // 3) fallback: _id zamanı
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

    // Aylık istatistiklerde eksik ayları 0 ile doldur (her zaman son 6 ay)
    const now = new Date();
    const monthsToShow = 6;
    const monthlyMap = new Map<string, number>();
    (monthlyStats as Array<{ _id: { year: number; month: number }, count: number }>).forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      monthlyMap.set(key, item.count);
    });
    const filledMonthlyStats: Array<{ _id: { year: number; month: number }, count: number }> = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      filledMonthlyStats.push({ _id: { year: y, month: m }, count: monthlyMap.get(key) ?? 0 });
    }

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
        monthlyStats: filledMonthlyStats
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
