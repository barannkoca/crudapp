import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

// Müşteri seçimi için müşteri listesini getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // Arama filtresi
    const filter: any = {};
    if (search) {
      filter.$or = [
        { ad: { $regex: search, $options: 'i' } },
        { soyad: { $regex: search, $options: 'i' } },
        { eposta: { $regex: search, $options: 'i' } },
        { telefon_no: { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await Customer.find(filter)
      .select('_id ad soyad eposta telefon_no photo')
      .sort({ ad: 1, soyad: 1 })
      .limit(20) // Limit'i azalttık performans için
      .lean(); // Mongoose lean() ile daha hızlı sorgu
    
    return NextResponse.json({
      success: true,
      data: customers,
      message: 'Müşteriler başarıyla getirildi'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Müşteri seçimi hatası:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteriler getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 