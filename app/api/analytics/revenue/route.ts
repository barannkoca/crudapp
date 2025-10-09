import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Opportunity } from '@/models/Opportunity';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // URL parametrelerini al
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '12');

    // Gelir analizi
    const revenueStats = await Opportunity.aggregate([
      {
        $unwind: '$ucretler'
      },
      {
        $group: {
          _id: {
            currency: '$ucretler.para_birimi',
            paymentStatus: '$ucretler.odeme_durumu'
          },
          totalAmount: { $sum: '$ucretler.miktar' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.currency': 1, '_id.paymentStatus': 1 }
      }
    ]);

    // Aylık gelir trendi (detaylı) - Sadece olusturma_tarihi bazlı
    const monthlyRevenue = await Opportunity.aggregate([
      {
        $match: {
          olusturma_tarihi: { $gte: new Date(new Date().setMonth(new Date().getMonth() - months)) },
          'ucretler.miktar': { $exists: true, $ne: null, $gt: 0 }
        }
      },
      { $unwind: { path: '$ucretler', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: {
            year: { $year: '$olusturma_tarihi' },
            month: { $month: '$olusturma_tarihi' },
            currency: '$ucretler.para_birimi',
            paymentStatus: '$ucretler.odeme_durumu'
          },
          totalAmount: { $sum: '$ucretler.miktar' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // İşlem türüne göre gelir
    const revenueByType = await Opportunity.aggregate([
      {
        $unwind: '$ucretler'
      },
      {
        $match: {
          'ucretler.odeme_durumu': 'alinan_ucret'
        }
      },
      {
        $group: {
          _id: {
            islemTuru: '$islem_turu',
            currency: '$ucretler.para_birimi'
          },
          totalAmount: { $sum: '$ucretler.miktar' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Bekleyen ödemeler
    const pendingPayments = await Opportunity.aggregate([
      {
        $unwind: '$ucretler'
      },
      {
        $match: {
          'ucretler.odeme_durumu': 'toplam_ucret'
        }
      },
      {
        $group: {
          _id: '$ucretler.para_birimi',
          totalAmount: { $sum: '$ucretler.miktar' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aylık detaylı gelir analizi (yeni sistem) - Sadece olusturma_tarihi bazlı
    const monthlyDetailedRevenue = await Opportunity.aggregate([
      {
        $match: {
          olusturma_tarihi: { $gte: new Date(new Date().setMonth(new Date().getMonth() - months)) },
          'ucretler.miktar': { $exists: true, $ne: null, $gt: 0 }
        }
      },
      { $unwind: { path: '$ucretler', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: {
            year: { $year: '$olusturma_tarihi' },
            month: { $month: '$olusturma_tarihi' },
            islem_turu: '$islem_turu',
            odeme_durumu: '$ucretler.odeme_durumu',
            currency: '$ucretler.para_birimi'
          },
          totalAmount: { $sum: '$ucretler.miktar' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenueStats,
        monthlyRevenue,
        revenueByType,
        pendingPayments,
        monthlyDetailedRevenue
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası: Gelir analizi alınamadı' },
      { status: 500 }
    );
  }
}
