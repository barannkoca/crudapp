import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Opportunity } from '@/models/Opportunity';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Müşteri kayıt trendi (son 12 ay)
    const customerRegistrationTrend = await Customer.aggregate([
      // createdAt normalizasyonu: date | string | object{$date}; yoksa _id tarihi
      {
        $addFields: {
          createdAtNorm: {
            $ifNull: [
              {
                $let: {
                  vars: { t: { $type: '$createdAt' } },
                  in: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$$t', 'date'] }, then: '$createdAt' },
                        { case: { $eq: ['$$t', 'string'] }, then: { $toDate: '$createdAt' } },
                        { case: { $eq: ['$$t', 'object'] }, then: { $toDate: '$createdAt.$date' } },
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
      {
        $match: {
          createdAtNorm: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAtNorm' },
            month: { $month: '$createdAtNorm' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).exec();

    // Müşteri cinsiyet dağılımı
    const genderDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$cinsiyeti',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    // Ülke dağılımı — normalize + fallback
    let countryDistribution;
    try {
      countryDistribution = await Customer.aggregate([
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
        { $limit: 15 }
      ]).exec();
    } catch (e) {
      console.error('Customer country normalization failed, fallback:', e);
      countryDistribution = await Customer.aggregate([
        { $match: { uyrugu: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: { $toUpper: { $trim: { input: { $toString: { $ifNull: ['$uyrugu', ''] } } } } },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]).exec();
    }

    // En aktif müşteriler (en çok işlem yapan)
    const mostActiveCustomers = await Opportunity.aggregate([
      {
        $group: {
          _id: '$musteri',
          opportunityCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          _id: 1,
          ad: '$customer.ad',
          soyad: '$customer.soyad',
          opportunityCount: 1
        }
      },
      {
        $sort: { opportunityCount: -1 }
      },
      {
        $limit: 10
      }
    ]).exec();

    // Müşteri yaş analizi (telefon numarasından çıkarım yaparak)
    const customerAgeAnalysis = await Customer.aggregate([
      {
        $match: {
          telefon_no: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          phoneLength: { $strLenCP: '$telefon_no' }
        }
      },
      {
        $group: {
          _id: '$phoneLength',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).exec();

    return NextResponse.json({
      success: true,
      data: {
        customerRegistrationTrend,
        genderDistribution,
        countryDistribution,
        mostActiveCustomers,
        customerAgeAnalysis
      }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Müşteri analizi alınamadı' },
      { status: 500 }
    );
  }
}
