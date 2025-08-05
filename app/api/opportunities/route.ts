import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Opportunity } from '@/models/Opportunity';
import { Customer } from '@/models/Customer';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';
import { IslemTuru, FirsatDurumu, ParaBirimi } from '@/types/Opportunity';

// Dosyayı Base64'e çeviren yardımcı fonksiyon
async function fileToBase64(file: File): Promise<{ data: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Base64 string'inden MIME type'ı ayır
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        resolve({
          data: matches[2],
          contentType: matches[1]
        });
      } else {
        reject(new Error('Geçersiz dosya formatı'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

// Fırsat oluşturma
export async function POST(request: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Veritabanı bağlantısı
    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');

      // Kullanıcıyı kontrol et
      const user = await User.findById(session.user.id)
        .select('status');

      // Güvenlik kontrolleri:
      // 1. Kullanıcının status'u active olmalı
      if (user.status !== 'active') {
        let errorMessage = '';
        
        if (user.status === 'pending') {
          errorMessage = 'Hesabınız henüz onaylanmamış. Fırsat oluşturmak için hesabınızın onaylanmasını bekleyin.';
        } else if (user.status === 'inactive') {
          errorMessage = 'Hesabınız şu anda aktif değil. Fırsat oluşturmak için hesabınızın aktif olması gerekiyor.';
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 403 }
        );
      }

    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json(
        { error: 'Veritabanı bağlantısı kurulamadı' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      const formData = await request.formData();
      
      // Form verilerini al
      const musteriId = formData.get('musteri_id') as string;
      const islemTuru = formData.get('islem_turu') as string;
      
      // Müşteriyi kontrol et
      const musteri = await Customer.findById(musteriId);
      if (!musteri) {
        return NextResponse.json(
          { error: 'Müşteri bulunamadı' },
          { status: 404 }
        );
      }

      // Ana fırsat verileri
      let opportunityData: any = {
        musteri: musteriId,
        islem_turu: islemTuru,
        durum: FirsatDurumu.BEKLEMEDE,
        olusturma_tarihi: new Date(),
        guncelleme_tarihi: new Date(),
        olusturan_kullanici: session.user.id
      };

      // Genel açıklama
      const genelAciklama = formData.get('genel_aciklama') as string;
      if (genelAciklama) {
        opportunityData.genel_aciklama = genelAciklama;
      }

      // Açıklamalar
      const aciklamalarJson = formData.get('aciklamalar') as string;
      if (aciklamalarJson) {
        try {
          const aciklamalar = JSON.parse(aciklamalarJson);
          opportunityData.aciklamalar = aciklamalar.map((aciklama: any) => ({
            ...aciklama,
            yazan_kullanici: session.user.name || session.user.email,
            tarih: new Date()
          }));
        } catch (error) {
          console.error('Açıklamalar parse hatası:', error);
        }
      }

      // Ücretler
      const ucretlerJson = formData.get('ucretler') as string;
      if (ucretlerJson) {
        try {
          const ucretler = JSON.parse(ucretlerJson);
          opportunityData.ucretler = ucretler;
        } catch (error) {
          console.error('Ücretler parse hatası:', error);
        }
      }

      // İşlem türüne göre özel alanları ekle
      if (islemTuru === IslemTuru.IKAMET_IZNI) {
        // İkamet izni alanları
        opportunityData.kayit_ili = formData.get('kayit_ili') as string;
        opportunityData.yapilan_islem = formData.get('yapilan_islem') as string;
        opportunityData.ikamet_turu = formData.get('ikamet_turu') as string;
        opportunityData.kayit_tarihi = formData.get('kayit_tarihi') as string;
        opportunityData.kayit_numarasi = formData.get('kayit_numarasi') as string;
        opportunityData.aciklama = formData.get('aciklama') as string;
        opportunityData.gecerlilik_tarihi = formData.get('gecerlilik_tarihi') as string;
        opportunityData.sira_no = formData.get('sira_no') ? parseInt(formData.get('sira_no') as string) : undefined;
        opportunityData.randevu_tarihi = formData.get('randevu_tarihi') as string;

        // PDF dosyası varsa ekle
        const pdfFile = formData.get('kayit_pdf') as File;
        if (pdfFile && pdfFile.size > 0) {
          const pdfData = await fileToBase64(pdfFile);
          opportunityData.kayit_pdf = pdfData;
        }
      } else if (islemTuru === IslemTuru.CALISMA_IZNI) {
        // Çalışma izni alanları
        opportunityData.isveren = formData.get('isveren') as string;
        opportunityData.pozisyon = formData.get('pozisyon') as string;
        opportunityData.sozlesme_turu = formData.get('sozlesme_turu') as string;
        opportunityData.calisma_baslama_tarihi = formData.get('calisma_baslama_tarihi') ? new Date(formData.get('calisma_baslama_tarihi') as string) : undefined;
        opportunityData.calisma_bitis_tarihi = formData.get('calisma_bitis_tarihi') ? new Date(formData.get('calisma_bitis_tarihi') as string) : undefined;
        opportunityData.maas = formData.get('maas') ? parseFloat(formData.get('maas') as string) : undefined;
        opportunityData.calisma_saati = formData.get('calisma_saati') ? parseInt(formData.get('calisma_saati') as string) : undefined;
        opportunityData.is_yeri_adresi = formData.get('is_yeri_adresi') as string;
        opportunityData.is_yeri_telefonu = formData.get('is_yeri_telefonu') as string;
        opportunityData.calisma_aciklama = formData.get('calisma_aciklama') as string;
      } else if (islemTuru === IslemTuru.DIGER) {
        // Diğer işlem alanları
        opportunityData.islem_adi = formData.get('islem_adi') as string;
        opportunityData.diger_baslama_tarihi = formData.get('diger_baslama_tarihi') ? new Date(formData.get('diger_baslama_tarihi') as string) : undefined;
        opportunityData.diger_bitis_tarihi = formData.get('diger_bitis_tarihi') ? new Date(formData.get('diger_bitis_tarihi') as string) : undefined;
        opportunityData.diger_aciklama = formData.get('diger_aciklama') as string;
        opportunityData.ek_bilgiler = formData.get('ek_bilgiler') as string;
      }

      // Fırsatı oluştur
      const opportunity = new Opportunity(opportunityData);
      await opportunity.save();

      return NextResponse.json(
        { 
          success: true,
          message: 'Fırsat başarıyla oluşturuldu',
          data: opportunity
        },
        { status: 201 }
      );

    } catch (error) {
      console.error('Fırsat oluşturma hatası:', error);
      return NextResponse.json(
        { error: 'Fırsat oluşturulamadı' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Fırsatları listele
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const islemTuru = searchParams.get('islem_turu');
    const musteriId = searchParams.get('musteri_id');
    
    // Sorgu oluştur
    let query: any = {};
    
    // İşlem türü filtresi
    if (islemTuru) {
      query.islem_turu = islemTuru;
    }
    
    // Müşteri filtresi
    if (musteriId) {
      query.musteri = musteriId;
    }
    
    // Sadece gerekli alanları seç (performans için)
    const opportunities = await Opportunity.find(query)
      .select('musteri islem_turu durum olusturma_tarihi kayit_numarasi sira_no kayit_tarihi isveren pozisyon islem_adi genel_aciklama aciklamalar ucretler')
      .populate('musteri', 'ad soyad photo')
      .sort({ olusturma_tarihi: -1 })
      .limit(100); // Sayfalama için limit
    
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Fırsatlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Fırsatlar getirilemedi' },
      { status: 500 }
    );
  }
} 