import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CustomerService, CustomerRepository } from '@/services/CustomerService';
import { ICustomerUpdate } from '@/types/Customer';

// Dependency Injection
const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

// GET - Tek müşteriyi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Müşteri bulunamadı'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Müşteri başarıyla getirildi'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Müşteri getirilirken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteri getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// PUT - Müşteriyi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    // Form verilerini al
    const customerData: ICustomerUpdate = {
      ad: formData.get('ad') as string || undefined,
      soyad: formData.get('soyad') as string || undefined,
      yabanci_kimlik_no: formData.get('yabanci_kimlik_no') as string || undefined,
      uyrugu: formData.get('uyrugu') as string || undefined,
      cinsiyeti: formData.get('cinsiyeti') as "Erkek" | "Kadın" || undefined,
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

    const { id } = await params;
    // Müşteriyi güncelle
    const updatedCustomer = await customerService.updateCustomer(id, customerData);
    
    if (!updatedCustomer) {
      return NextResponse.json({
        success: false,
        message: 'Müşteri bulunamadı'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: 'Müşteri başarıyla güncellendi'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Müşteri güncellenirken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteri güncellenemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// DELETE - Müşteriyi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const isDeleted = await customerService.deleteCustomer(id);
    
    if (!isDeleted) {
      return NextResponse.json({
        success: false,
        message: 'Müşteri bulunamadı'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla silindi'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Müşteri silinirken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Müşteri silinemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 