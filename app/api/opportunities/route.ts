import { NextRequest, NextResponse } from 'next/server';
import { Opportunity } from '@/models/Opportunity';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fırsatları listele
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const islem_turu = searchParams.get('islem_turu');
    const durum = searchParams.get('durum');
    const musteri_id = searchParams.get('musteri_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filtreleme kriterleri
    const filter: any = {};
    
    if (islem_turu) filter.islem_turu = islem_turu;
    if (durum) filter.durum = durum;
    if (musteri_id) filter.musteri = musteri_id;

    // Fırsatları getir
    const opportunities = await Opportunity.find(filter)
      .populate('musteri', 'ad soyad email telefon')
      .sort({ olusturma_tarihi: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Toplam sayı
    const total = await Opportunity.countDocuments(filter);

    return NextResponse.json(opportunities);

  } catch (error) {
    console.error('Fırsatlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Fırsatlar getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni fırsat oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    let body;
    let musteri_id, islem_turu, detaylar, aciklamalar, ucretler, pdf_dosya;
    
    // FormData kontrolü
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      musteri_id = formData.get('musteri_id') as string;
      islem_turu = formData.get('islem_turu') as string;
      detaylar = JSON.parse(formData.get('detaylar') as string);
      aciklamalar = JSON.parse(formData.get('aciklamalar') as string);
      ucretler = JSON.parse(formData.get('ucretler') as string);
      pdf_dosya = formData.get('pdf_dosya') as File;
    } else {
      body = await request.json();
      ({ musteri_id, islem_turu, detaylar, aciklamalar, ucretler, pdf_dosya } = body);
    }

    // Validasyon
    if (!musteri_id || !islem_turu) {
      return NextResponse.json(
        { error: 'Müşteri ID ve işlem türü gerekli' },
        { status: 400 }
      );
    }

    // Yeni fırsat oluştur
    const newOpportunity = new Opportunity({
      musteri: musteri_id,
      islem_turu,
      detaylar,
      aciklamalar: aciklamalar || [],
      ucretler: ucretler || [],
      pdf_dosya,
      olusturma_tarihi: new Date(),
      guncelleme_tarihi: new Date()
    });

    // İşlem türüne göre özel alanları set et
    if (islem_turu === 'calisma_izni' && detaylar) {
      newOpportunity.isveren = detaylar.isveren;
      newOpportunity.pozisyon = detaylar.pozisyon;
      newOpportunity.sozlesme_turu = detaylar.sozlesme_turu;
      newOpportunity.maas = detaylar.maas;
      newOpportunity.calisma_saati = detaylar.calisma_saati;
      
      // Çalışma izni için otomatik sıra no sistemi
      if (!detaylar.sira_no || detaylar.sira_no === 0) {
        const currentYear = new Date().getFullYear();
        const lastOpportunity = await Opportunity.findOne({
          islem_turu: 'calisma_izni',
          olusturma_tarihi: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }).sort({ sira_no: -1 });
        
        const nextSiraNo = lastOpportunity ? lastOpportunity.sira_no + 1 : 1;
        newOpportunity.sira_no = nextSiraNo;
      } else {
        newOpportunity.sira_no = detaylar.sira_no;
      }
    }

    if (islem_turu === 'ikamet_izni' && detaylar) {
      newOpportunity.kayit_ili = detaylar.kayit_ili;
      newOpportunity.yapilan_islem = detaylar.yapilan_islem;
      newOpportunity.ikamet_turu = detaylar.ikamet_turu;
      newOpportunity.kayit_tarihi = detaylar.kayit_tarihi;
      newOpportunity.kayit_numarasi = detaylar.kayit_numarasi;
      newOpportunity.gecerlilik_tarihi = detaylar.gecerlilik_tarihi;
      newOpportunity.randevu_tarihi = detaylar.randevu_tarihi;
      
      // Otomatik sıra no sistemi
      const currentYear = new Date().getFullYear();
      const lastOpportunity = await Opportunity.findOne({
        islem_turu: 'ikamet_izni',
        olusturma_tarihi: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1)
        }
      }).sort({ sira_no: -1 });
      
      const nextSiraNo = lastOpportunity ? lastOpportunity.sira_no + 1 : 1;
      newOpportunity.sira_no = nextSiraNo;
    }

    if (islem_turu === 'diger' && detaylar) {
      newOpportunity.islem_adi = detaylar.islem_adi;
      newOpportunity.diger_baslama_tarihi = detaylar.diger_baslama_tarihi;
      newOpportunity.diger_bitis_tarihi = detaylar.diger_bitis_tarihi;
      newOpportunity.diger_aciklama = detaylar.diger_aciklama;
      newOpportunity.ek_bilgiler = detaylar.ek_bilgiler;
      
      // Diğer işlemler için otomatik sıra no sistemi
      if (!detaylar.sira_no || detaylar.sira_no === 0) {
        const currentYear = new Date().getFullYear();
        const lastOpportunity = await Opportunity.findOne({
          islem_turu: 'diger',
          olusturma_tarihi: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }).sort({ sira_no: -1 });
        
        const nextSiraNo = lastOpportunity ? lastOpportunity.sira_no + 1 : 1;
        newOpportunity.sira_no = nextSiraNo;
      } else {
        newOpportunity.sira_no = detaylar.sira_no;
      }
    }

    // PDF dosyası işleme
    if (pdf_dosya && pdf_dosya instanceof File) {
      const bytes = await pdf_dosya.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      
      newOpportunity.pdf_dosya = {
        data: base64Data,
        contentType: pdf_dosya.type
      };
    }

    const savedOpportunity = await newOpportunity.save();
    
    // Populate müşteri bilgileri
    await savedOpportunity.populate('musteri', 'ad soyad email telefon');

    return NextResponse.json(savedOpportunity, { status: 201 });

  } catch (error) {
    console.error('Fırsat oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Fırsat oluşturulamadı' },
      { status: 500 }
    );
  }
} 