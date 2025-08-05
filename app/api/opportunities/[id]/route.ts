import { NextRequest, NextResponse } from 'next/server';
import { Opportunity } from '@/models/Opportunity';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Tek fırsat detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { id } = await params;

    const opportunity = await Opportunity.findById(id)
      .populate('musteri', 'ad soyad email telefon')
      .lean();

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Fırsat bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);

  } catch (error) {
    console.error('Fırsat detayı getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Fırsat detayı getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Fırsat güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { durum, detaylar, aciklamalar, ucretler, pdf_dosya } = body;

    // Fırsatı bul
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Fırsat bulunamadı' },
        { status: 404 }
      );
    }

    // Güncelleme alanları
    const updateData: any = {
      guncelleme_tarihi: new Date()
    };

    if (durum) updateData.durum = durum;
    if (detaylar) updateData.detaylar = detaylar;
    if (aciklamalar) updateData.aciklamalar = aciklamalar;
    if (ucretler) updateData.ucretler = ucretler;
    if (pdf_dosya) updateData.pdf_dosya = pdf_dosya;

    // İşlem türüne göre özel alanları güncelle
    if (opportunity.islem_turu === 'calisma_izni' && detaylar) {
      updateData.isveren = detaylar.isveren;
      updateData.pozisyon = detaylar.pozisyon;
      updateData.sozlesme_turu = detaylar.sozlesme_turu;
      updateData.maas = detaylar.maas;
      updateData.calisma_saati = detaylar.calisma_saati;
    }

    if (opportunity.islem_turu === 'ikamet_izni' && detaylar) {
      updateData.kayit_ili = detaylar.kayit_ili;
      updateData.yapilan_islem = detaylar.yapilan_islem;
      updateData.ikamet_turu = detaylar.ikamet_turu;
      updateData.kayit_tarihi = detaylar.kayit_tarihi;
      updateData.kayit_numarasi = detaylar.kayit_numarasi;
      updateData.aciklama = detaylar.aciklama;
      updateData.gecerlilik_tarihi = detaylar.gecerlilik_tarihi;
      updateData.sira_no = detaylar.sira_no;
      updateData.randevu_tarihi = detaylar.randevu_tarihi;
    }

    if (opportunity.islem_turu === 'diger' && detaylar) {
      updateData.islem_adi = detaylar.islem_adi;
      updateData.diger_baslama_tarihi = detaylar.diger_baslama_tarihi;
      updateData.diger_bitis_tarihi = detaylar.diger_bitis_tarihi;
      updateData.diger_aciklama = detaylar.diger_aciklama;
      updateData.ek_bilgiler = detaylar.ek_bilgiler;
    }

    // Fırsatı güncelle
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('musteri', 'ad soyad email telefon');

    return NextResponse.json(updatedOpportunity);

  } catch (error) {
    console.error('Fırsat güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Fırsat güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Fırsat sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { id } = await params;

    const opportunity = await Opportunity.findByIdAndDelete(id);
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Fırsat bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Fırsat başarıyla silindi' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fırsat silinirken hata:', error);
    return NextResponse.json(
      { error: 'Fırsat silinemedi' },
      { status: 500 }
    );
  }
} 