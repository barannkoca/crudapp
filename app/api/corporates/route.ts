import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Corporate } from "@/models/Corporate";
import { User } from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    // Veritabanı bağlantısı
    await connectDB();

    // Form verilerini al
    const formData = await request.formData();
    const name = formData.get('name') as string;

    if (!name) {
      return NextResponse.json(
        { error: 'Şirket adı zorunludur' },
        { status: 400 }
      );
    }

    // Şirket verilerini hazırla
    const corporateData = {
      name,
      owner: session.user.id
    };

    // Şirketi oluştur
    const corporate = await Corporate.create(corporateData);

    // Kullanıcıya şirketi ekle
    await User.findByIdAndUpdate(
      session.user.id,
      {
        corporate: corporate._id,
        role: 'owner'
      }
    );

    return NextResponse.json(corporate);
  } catch (error: any) {
    console.error('Şirket oluşturma hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Şirket oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
