import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
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

    // Kullanıcı durumunu getir
    const user = await User.findById(session.user.id).select('status');

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: user.status });
  } catch (error: any) {
    console.error('Kullanıcı durumu alınamadı:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcı durumu alınamadı' },
      { status: 500 }
    );
  }
}
