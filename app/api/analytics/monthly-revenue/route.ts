import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { OpportunityRepository } from '@/src/repositories/opportunity.repository';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // URL parametrelerini al
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '12');

    // OpportunityRepository instance'ı oluştur
    const opportunityRepo = new OpportunityRepository();

    // Aylık gelir istatistiklerini al
    const monthlyRevenueStats = await opportunityRepo.getMonthlyRevenueStats(months);

    return NextResponse.json({
      success: true,
      data: monthlyRevenueStats
    });

  } catch (error) {
    console.error('Monthly revenue analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Aylık gelir analizi alınamadı' },
      { status: 500 }
    );
  }
}


