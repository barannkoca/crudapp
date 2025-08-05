import { NextRequest, NextResponse } from 'next/server';
import { Opportunity } from '@/models/Opportunity';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fırsat istatistikleri
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const musteri_id = searchParams.get('musteri_id');

    // Filtreleme kriterleri
    const filter: any = {};
    if (musteri_id) filter.musteri = musteri_id;

    // İstatistikler
    const stats = await Opportunity.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          toplam_firsat: { $sum: 1 },
          bekleyen: { $sum: { $cond: [{ $eq: ['$durum', 'beklemede'] }, 1, 0] } },
          islemde: { $sum: { $cond: [{ $eq: ['$durum', 'islemde'] }, 1, 0] } },
          onaylandi: { $sum: { $cond: [{ $eq: ['$durum', 'onaylandi'] }, 1, 0] } },
          reddedildi: { $sum: { $cond: [{ $eq: ['$durum', 'reddedildi'] }, 1, 0] } },
          tamamlandi: { $sum: { $cond: [{ $eq: ['$durum', 'tamamlandi'] }, 1, 0] } },
          iptal_edildi: { $sum: { $cond: [{ $eq: ['$durum', 'iptal_edildi'] }, 1, 0] } },
          
          // İşlem türlerine göre
          calisma_izni: { $sum: { $cond: [{ $eq: ['$islem_turu', 'calisma_izni'] }, 1, 0] } },
          ikamet_izni: { $sum: { $cond: [{ $eq: ['$islem_turu', 'ikamet_izni'] }, 1, 0] } },
          diger: { $sum: { $cond: [{ $eq: ['$islem_turu', 'diger'] }, 1, 0] } },
          
          // Toplam ücret
          toplam_ucret: { $sum: { $sum: '$ucretler.miktar' } }
        }
      }
    ]);

    // Son 30 günlük fırsatlar
    const son30Gun = new Date();
    son30Gun.setDate(son30Gun.getDate() - 30);
    
    const son30GunStats = await Opportunity.aggregate([
      { 
        $match: { 
          ...filter,
          olusturma_tarihi: { $gte: son30Gun } 
        } 
      },
      {
        $group: {
          _id: null,
          son30_gun_firsat: { $sum: 1 }
        }
      }
    ]);

    // Aylık trend (son 6 ay)
    const son6Ay = new Date();
    son6Ay.setMonth(son6Ay.getMonth() - 6);
    
    const aylikTrend = await Opportunity.aggregate([
      { 
        $match: { 
          ...filter,
          olusturma_tarihi: { $gte: son6Ay } 
        } 
      },
      {
        $group: {
          _id: {
            yil: { $year: '$olusturma_tarihi' },
            ay: { $month: '$olusturma_tarihi' }
          },
          sayi: { $sum: 1 }
        }
      },
      { $sort: { '_id.yil': 1, '_id.ay': 1 } }
    ]);

    const result = {
      genel: stats[0] || {
        toplam_firsat: 0,
        bekleyen: 0,
        islemde: 0,
        onaylandi: 0,
        reddedildi: 0,
        tamamlandi: 0,
        iptal_edildi: 0,
        calisma_izni: 0,
        ikamet_izni: 0,
        diger: 0,
        toplam_ucret: 0
      },
      son30_gun: son30GunStats[0]?.son30_gun_firsat || 0,
      aylik_trend: aylikTrend
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('İstatistikler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'İstatistikler getirilemedi' },
      { status: 500 }
    );
  }
} 