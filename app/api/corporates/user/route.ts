import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
import { Corporate } from "@/models/Corporate";
import connectDB from "@/lib/mongodb";

export async function GET() {
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

    // Kullanıcının corporate bilgilerini getir
    const user = await User.findById(session.user.id)
      .select('corporate role');

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    if (!user.corporate) {
      return NextResponse.json(null);
    }

    // Şirket bilgilerini getir
    const corporateDoc = await Corporate.findById(user.corporate).select('name');
    
    if (!corporateDoc) {
      return NextResponse.json(
        { error: 'Şirket bulunamadı' },
        { status: 404 }
      );
    }

    const corporate = {
      _id: user.corporate,
      name: corporateDoc.name,
      role: user.role
    };

    return NextResponse.json(corporate);
  } catch (error: any) {
    console.error('Corporate bilgileri alınamadı:', error);
    return NextResponse.json(
      { error: error.message || 'Corporate bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
