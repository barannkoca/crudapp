import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CustomerService, CustomerRepository } from '@/services/CustomerService';
import { Opportunity } from '@/models/Opportunity';

// Dependency Injection
const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

// GET - Müşteriye ait fırsatları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Önce müşterinin var olup olmadığını kontrol et
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Müşteri bulunamadı'
      }, { status: 404 });
    }
    
    // Müşteriye ait fırsatları getir (optimize edilmiş)
    const opportunities = await Opportunity.find({ 
      musteri: id 
    })
    .select('islem_turu durum olusturma_tarihi kayit_numarasi sira_no kayit_tarihi isveren pozisyon islem_adi genel_aciklama aciklamalar ucretler')
    .sort({ 
      olusturma_tarihi: -1 
    })
    .limit(50); // Müşteri detayında daha az kayıt
    
    return NextResponse.json({
      success: true,
      data: opportunities,
      message: 'Müşteri fırsatları başarıyla getirildi'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Müşteri fırsatları getirilirken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteri fırsatları getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 