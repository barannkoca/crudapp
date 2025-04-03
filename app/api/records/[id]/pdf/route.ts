import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { Record } from "@/models/Record";
import connectDB from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Veritabanı bağlantısı
    await connectDB();

    // Kaydı bul
    const record = await Record.findOne({
      _id: params.id,
      user: session.user.id,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    // PDF verisi yoksa hata döndür
    if (!record.kayit_pdf?.data) {
      return NextResponse.json(
        { error: "Bu kayıt için PDF bulunamadı" },
        { status: 404 }
      );
    }

    // Base64 verisini buffer'a dönüştür
    const buffer = Buffer.from(record.kayit_pdf.data, "base64");

    // PDF dosyasını döndür
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": record.kayit_pdf.contentType || "application/pdf",
        "Content-Disposition": `attachment; filename="kayit-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF indirme hatası:", error);
    return NextResponse.json(
      { error: "PDF indirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 