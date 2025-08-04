import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Record } from "@/models/Record";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";
import { Corporate } from "@/models/Corporate";
import connectDB from "@/lib/mongodb";

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

// Kayıt oluşturma
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

    let userCorporate: any;

    // Veritabanı bağlantısı
    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');

      // Kullanıcıyı kontrol et
      const user = await User.findById(session.user.id)
        .select('corporate status')
        .populate({
          path: 'corporate',
          select: 'name'
        });

      // Güvenlik kontrolleri:
      // 1. Kullanıcının status'u active olmalı
      // 2. Şirketi olmalı
      if (user.status !== 'active' || !user?.corporate) {
        let errorMessage = '';
        
        if (!user?.corporate) {
          errorMessage = 'Kayıt oluşturmak için bir şirkete üye olmanız gerekiyor.';
        } else if (user.status === 'pending') {
          errorMessage = 'Hesabınız henüz onaylanmamış. Kayıt oluşturmak için hesabınızın onaylanmasını bekleyin.';
        } else if (user.status === 'inactive') {
          errorMessage = 'Hesabınız şu anda aktif değil. Kayıt oluşturmak için hesabınızın aktif olması gerekiyor.';
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 403 }
        );
      }

      // Tüm güvenlik kontrolleri geçildiyse corporate'i kullan
      userCorporate = user.corporate;
      
      // Corporate'in geçerli olduğunu kontrol et
      if (!userCorporate?._id) {
        return NextResponse.json(
          { error: 'Şirket bilgilerinize ulaşılamadı. Lütfen daha sonra tekrar deneyin.' },
          { status: 500 }
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

    // Son sıra numarasını bul
    const lastRecord = await Record.findOne({ corporate: userCorporate._id })
      .sort({ sira_no: -1 })
      .select('sira_no');

    const nextSiraNo = (lastRecord?.sira_no || 0) + 1;

    // Form verilerini al
    const formData = await request.formData();
    
    // Zorunlu alanları kontrol et
    const requiredFields = [
      'musteri_id',
      'kayit_ili',
      'yapilan_islem',
      'ikamet_turu',
      'kayit_tarihi',
      'kayit_numarasi'
    ];

    const missingFields = requiredFields.filter(field => !formData.get(field));
    if (missingFields.length > 0) {
      console.error('Eksik alanlar:', missingFields);
      return NextResponse.json(
        { error: `Aşağıdaki alanlar zorunludur: ${missingFields.join(', ')}` },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Dosyaları işle
    const kayitPdf = formData.get('kayit_pdf') as File;

    let kayitPdfData = null;
    let kayitPdfContentType = null;

    try {
      if (kayitPdf) {
        const kayitPdfBuffer = Buffer.from(await kayitPdf.arrayBuffer());
        kayitPdfData = kayitPdfBuffer.toString('base64');
        kayitPdfContentType = kayitPdf.type;
        console.log('PDF başarıyla yüklendi');
      }
    } catch (error) {
      console.error('Dosya dönüştürme hatası:', error);
      return NextResponse.json(
        { error: 'Dosyalar işlenirken bir hata oluştu' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Müşteriyi kontrol et
    const musteriId = formData.get('musteri_id') as string;
    const musteri = await Customer.findById(musteriId);
    if (!musteri) {
      return NextResponse.json(
        { error: 'Seçilen müşteri bulunamadı' },
        { status: 404 }
      );
    }

    // Kayıt verilerini hazırla
    const recordData: any = {
      musteri: musteriId,
      islem_turu: 'kayit',
      durum: 'beklemede',
      kayit_ili: formData.get('kayit_ili') as string,
      yapilan_islem: formData.get('yapilan_islem') as string,
      ikamet_turu: formData.get('ikamet_turu') as string,
      kayit_tarihi: new Date(formData.get('kayit_tarihi') as string),
      kayit_numarasi: formData.get('kayit_numarasi') as string,
      aciklama: formData.get('aciklama') as string || undefined,
      kayit_pdf: kayitPdfData ? {
        data: kayitPdfData,
        contentType: kayitPdfContentType
      } : undefined,
      sira_no: nextSiraNo,
      gecerlilik_tarihi: formData.get('gecerlilik_tarihi') ? new Date(formData.get('gecerlilik_tarihi') as string) : undefined,
      randevu_tarihi: formData.get('randevu_tarihi') ? new Date(formData.get('randevu_tarihi') as string) : undefined
    };

    console.log('Kayıt verileri hazırlandı:', {
      ...recordData,
      kayit_pdf: kayitPdfData ? 'Var' : 'Yok'
    });

    try {
      const record = await Record.create(recordData);
      console.log('Kayıt başarıyla oluşturuldu:', record._id);
      
      // Hassas verileri çıkar
      const responseData = {
        _id: record._id,
        kayit_numarasi: record.kayit_numarasi,
        musteri: {
          _id: musteri._id,
          ad: musteri.ad,
          soyad: musteri.soyad
        },
        message: 'İkamet izni kaydı başarıyla oluşturuldu'
      };
      
      return NextResponse.json(responseData, {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (createError) {
      console.error('Kayıt oluşturma hatası (MongoDB):', createError);
      return NextResponse.json(
        { error: createError instanceof Error ? createError.message : 'Kayıt oluşturulamadı' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Kayıt oluşturulurken bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Kayıtları getirme
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    await connectDB();

    // Önce kullanıcıyı ve corporate bilgisini al
    const user = await User.findById(session.user.id)
      .select('corporate')
      .populate('corporate');

    if (!user?.corporate) {
      return NextResponse.json(
        { error: 'Şirket bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Corporate'a ait kayıtları getir
    const records = await Record.find({})
      .sort({ createdAt: -1 })
      .select('-kayit_pdf.data')
      .populate('musteri', 'ad soyad photo');

    return NextResponse.json(records);
  } catch (error) {
    console.error('Kayıtları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kayıtlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 