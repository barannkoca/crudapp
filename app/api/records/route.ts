import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Record } from "@/models/Record";
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

    // Veritabanı bağlantısı
    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
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

    // Form verilerini al
    const formData = await request.formData();
    
    // Zorunlu alanları kontrol et
    const requiredFields = [
      'kayit_ili',
      'yapilan_islem',
      'kayit_tarihi',
      'kayit_numarasi',
      'adi',
      'soyadi',
      'cinsiyeti',
      'telefon_no',
      'eposta'
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
    const photo = formData.get('photo') as File;
    const kayitPdf = formData.get('kayit_pdf') as File;

    let photoBuffer = null;
    let kayitPdfBuffer = null;

    try {
      if (photo) {
        photoBuffer = Buffer.from(await photo.arrayBuffer());
        console.log('Fotoğraf başarıyla yüklendi');
      }
      if (kayitPdf) {
        kayitPdfBuffer = Buffer.from(await kayitPdf.arrayBuffer());
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

    // Kayıt verilerini hazırla
    const recordData = {
      user: session.user.id,
      kayit_ili: formData.get('kayit_ili') as string,
      yapilan_islem: formData.get('yapilan_islem') as string,
      kayit_tarihi: new Date(formData.get('kayit_tarihi') as string),
      kayit_numarasi: formData.get('kayit_numarasi') as string,
      adi: formData.get('adi') as string,
      soyadi: formData.get('soyadi') as string,
      baba_adi: formData.get('baba_adi') as string || undefined,
      anne_adi: formData.get('anne_adi') as string || undefined,
      yabanci_kimlik_no: formData.get('yabanci_kimlik_no') ? formData.get('yabanci_kimlik_no') as string : undefined,
      uyrugu: formData.get('uyrugu') as string || undefined,
      cinsiyeti: formData.get('cinsiyeti') as string,
      medeni_hali: formData.get('medeni_hali') as string || undefined,
      dogum_tarihi: formData.get('dogum_tarihi') ? new Date(formData.get('dogum_tarihi') as string) : undefined,
      belge_turu: formData.get('belge_turu') as string || undefined,
      belge_no: formData.get('belge_no') as string || undefined,
      telefon_no: formData.get('telefon_no') as string,
      eposta: formData.get('eposta') as string,
      aciklama: formData.get('aciklama') as string || undefined,
      durum: 'beklemede',
      photo: photoBuffer ? {
        data: photoBuffer,
        contentType: photo.type
      } : undefined,
      kayit_pdf: kayitPdfBuffer ? {
        data: kayitPdfBuffer,
        contentType: kayitPdf.type
      } : undefined,
    };

    console.log('Kayıt verileri hazırlandı:', {
      ...recordData,
      photo: photoBuffer ? 'Var' : 'Yok',
      kayit_pdf: kayitPdfBuffer ? 'Var' : 'Yok'
    });

    try {
      const record = await Record.create(recordData);
      console.log('Kayıt başarıyla oluşturuldu:', record._id);
      
      // Hassas verileri çıkar
      const responseData = {
        _id: record._id,
        kayit_numarasi: record.kayit_numarasi,
        adi: record.adi,
        soyadi: record.soyadi,
        message: 'Kayıt başarıyla oluşturuldu'
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
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    await connectDB();

    const records = await Record.find({ user: session.user.id })
      .sort({ createdAt: -1 }) // timestamps kullandığımız için created_at yerine createdAt
      .select('-photo.data -kayit_pdf.data');

    return NextResponse.json(records);
  } catch (error) {
    console.error('Kayıtları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kayıtlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 