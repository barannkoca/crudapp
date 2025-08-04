import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CustomerService, CustomerRepository } from '@/services/CustomerService';
import { ICustomerCreate } from '@/types/Customer';

// Dependency Injection
const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

// GET - Tüm müşterileri getir
export async function GET() {
  try {
    await connectDB();
    
    const customers = await customerService.getAllCustomers();
    
    return NextResponse.json({
      success: true,
      data: customers,
      message: 'Müşteriler başarıyla getirildi'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Müşteriler getirilirken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteriler getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// POST - Yeni müşteri oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    // Form verilerini al
    const customerData: ICustomerCreate = {
      ad: formData.get('ad') as string,
      soyad: formData.get('soyad') as string,
      yabanci_kimlik_no: formData.get('yabanci_kimlik_no') as string || undefined,
      uyrugu: formData.get('uyrugu') as string || undefined,
      cinsiyeti: formData.get('cinsiyeti') as "Erkek" | "Kadın",
      telefon_no: formData.get('telefon_no') as string || undefined,
      eposta: formData.get('eposta') as string || undefined,
    };

    // Fotoğraf varsa ekle
    const photoFile = formData.get('photo') as File;
    if (photoFile && photoFile.size > 0) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      
      customerData.photo = {
        data: base64String,
        contentType: photoFile.type
      };
    }

    // Validasyon
    if (!customerData.ad || !customerData.soyad || !customerData.cinsiyeti) {
      return NextResponse.json({
        success: false,
        message: 'Ad, soyad ve cinsiyet alanları zorunludur'
      }, { status: 400 });
    }

    // Müşteriyi oluştur
    const newCustomer = await customerService.createCustomer(customerData);
    
    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: 'Müşteri başarıyla oluşturuldu'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Müşteri oluşturulurken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteri oluşturulamadı',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 