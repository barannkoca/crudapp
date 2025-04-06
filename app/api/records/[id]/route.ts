import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Record } from "@/models/Record";
import connectDB from "@/lib/mongodb";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    await connectDB();

    const { durum, gecerlilik_tarihi } = await request.json();

    if (!durum || !["beklemede", "onaylandi", "reddedildi"].includes(durum)) {
      return NextResponse.json(
        { error: "Geçersiz durum değeri" },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Onaylandı durumunda geçerlilik tarihi zorunlu
    if (durum === "onaylandi" && !gecerlilik_tarihi) {
      return NextResponse.json(
        { error: "Onaylanan kayıtlar için geçerlilik tarihi zorunludur" },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const updateData: any = { durum };
    
    // Eğer onaylandı ise geçerlilik tarihini ekle
    if (durum === "onaylandi" && gecerlilik_tarihi) {
      updateData.gecerlilik_tarihi = new Date(gecerlilik_tarihi);
    }

    const record = await Record.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
      updateData,
      { new: true }
    ).select("-photo.data -kayit_pdf.data");

    if (!record) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return NextResponse.json(record, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error("Kayıt güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Kayıt güncellenirken bir hata oluştu" },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 