import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Opportunity as OpportunityModel } from '@/models/Opportunity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get('year'));
    const month = Number(searchParams.get('month'));

    if (!Number.isInteger(year) || !Number.isInteger(month) || year < 2000 || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir yıl ve ay gönderilmelidir.' },
        { status: 400 }
      );
    }

    await connectDB();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const entries = await OpportunityModel.aggregate([
      {
        $match: {
          olusturma_tarihi: { $gte: startDate, $lt: endDate },
          'ucretler.0': { $exists: true }
        }
      },
      { $unwind: '$ucretler' },
      {
        $match: {
          'ucretler.miktar': { $type: 'number', $gt: 0 },
          'ucretler.odeme_durumu': { $in: ['toplam_ucret', 'alinan_ucret', 'gider'] }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'musteri',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          islemTuru: '$islem_turu',
          isAdi: {
            $ifNull: [
              '$detaylar.islem_adi',
              { $ifNull: ['$detaylar.isveren', '$detaylar.kayit_numarasi'] }
            ]
          },
          musteri: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$customer.ad', ''] },
                  ' ',
                  { $ifNull: ['$customer.soyad', ''] }
                ]
              }
            }
          },
          aciklama: '$ucretler.aciklama',
          odemeDurumu: '$ucretler.odeme_durumu',
          miktar: '$ucretler.miktar',
          paraBirimi: '$ucretler.para_birimi',
          odemeTarihi: '$ucretler.odeme_tarihi',
          olusturmaTarihi: '$olusturma_tarihi'
        }
      },
      { $sort: { olusturmaTarihi: 1, odemeTarihi: 1 } }
    ]).exec();

    const normalizedEntries = entries.map((entry: any) => ({
      ...entry,
      isAdi: entry.isAdi || 'İşlem adı belirtilmemiş',
      musteri: entry.musteri || 'Müşteri bilgisi yok'
    }));

    return NextResponse.json({ success: true, data: { entries: normalizedEntries } });
  } catch (error) {
    console.error('Monthly statement analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Aylık ekstre alınamadı.' },
      { status: 500 }
    );
  }
}
