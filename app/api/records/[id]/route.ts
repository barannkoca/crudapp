import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Record } from "@/models/Record";
import connectDB from "@/lib/mongodb";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const viewPdf = searchParams.get('viewPdf') === 'true';
    const recordId = params.id;

    await connectDB();

    if (viewPdf) {
      // PDF görüntüleme modu
      const record = await Record.findOne({
        _id: recordId,
        corporate: session.user.corporate
      }).select('kayit_pdf');

      if (!record) {
        return NextResponse.json(
          { error: 'Kayıt bulunamadı' },
          { status: 404 }
        );
      }

      if (!record.kayit_pdf?.data) {
        return NextResponse.json(
          { error: 'PDF bulunamadı' },
          { status: 404 }
        );
      }

      const pdfBuffer = Buffer.from(record.kayit_pdf.data, 'base64');
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': record.kayit_pdf.contentType || 'application/pdf',
          'Content-Disposition': 'inline; filename="document.pdf"'
        }
      });
    }

    // Normal kayıt detayı modu
    const record = await Record.findOne({
      _id: recordId,
      user: session.user.id
    }).populate('user', 'name');

    if (!record) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Kayıt getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

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

    const { durum, gecerlilik_tarihi, randevu_tarihi } = await request.json();


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
    if (randevu_tarihi) {
      updateData.randevu_tarihi = new Date(randevu_tarihi);
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

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;{
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const { id: recordId } = await params;

    await connectDB();

    const record = await Record.findOneAndDelete({
      _id: recordId,
      user: session.user.id
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Kayıt başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kayıt silme hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
}