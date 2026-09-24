import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import { Opportunity as OpportunityModel } from '@/models/Opportunity';

export const runtime = 'nodejs';

type PaymentStatus = 'toplam_ucret' | 'alinan_ucret' | 'gider';

interface StatementEntry {
  id: string;
  islemTuru: string;
  isAdi: string;
  musteri: string;
  aciklama?: string;
  odemeDurumu: PaymentStatus;
  miktar: number;
  paraBirimi: string;
  olusturmaTarihi: Date;
}

interface StatementRow {
  id: string;
  tarih: Date;
  isAdi: string;
  musteri: string;
  islemTuru: string;
  aciklama: string;
  paraBirimi: string;
  anlasilan: number;
  alinan: number;
  eksik: number;
  gider: number;
  karZarar: number;
}

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const formatTransactionType = (type: string) => {
  if (type === 'calisma_izni') return 'Çalışma İzni';
  if (type === 'ikamet_izni') return 'İkamet İzni';
  return 'Diğer İşlem';
};

const formatCurrency = (amount: number, currency: string) => {
  const validCurrency = ['TRY', 'USD', 'EUR', 'GBP'].includes(currency) ? currency : 'TRY';
  return `${new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)} ${validCurrency}`;
};

const formatDate = (date: Date) => new Intl.DateTimeFormat('tr-TR').format(new Date(date));

function buildStatementRows(entries: StatementEntry[]) {
  const grouped = new Map<string, StatementRow>();

  entries.forEach((entry) => {
    const paraBirimi = entry.paraBirimi || 'TRY';
    const key = `${entry.id}-${paraBirimi}`;
    const row = grouped.get(key) || {
      id: entry.id,
      tarih: new Date(entry.olusturmaTarihi),
      isAdi: entry.isAdi || 'İşlem adı belirtilmemiş',
      musteri: entry.musteri || 'Müşteri bilgisi yok',
      islemTuru: entry.islemTuru,
      aciklama: '',
      paraBirimi,
      anlasilan: 0,
      alinan: 0,
      eksik: 0,
      gider: 0,
      karZarar: 0
    };

    if (entry.odemeDurumu === 'toplam_ucret') row.anlasilan += entry.miktar;
    if (entry.odemeDurumu === 'alinan_ucret') row.alinan += entry.miktar;
    if (entry.odemeDurumu === 'gider') row.gider += entry.miktar;
    if (entry.aciklama && !row.aciklama.split(' | ').includes(entry.aciklama)) {
      row.aciklama = row.aciklama ? `${row.aciklama} | ${entry.aciklama}` : entry.aciklama;
    }
    row.eksik = Math.max(row.anlasilan - row.alinan, 0);
    row.karZarar = row.alinan - row.gider;
    grouped.set(key, row);
  });

  return Array.from(grouped.values()).sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
}

function getTotals(rows: StatementRow[]) {
  return rows.reduce<Record<string, Omit<StatementRow, 'id' | 'tarih' | 'isAdi' | 'musteri' | 'islemTuru' | 'aciklama' | 'paraBirimi'>>>((totals, row) => {
    if (!totals[row.paraBirimi]) totals[row.paraBirimi] = { anlasilan: 0, alinan: 0, eksik: 0, gider: 0, karZarar: 0 };
    totals[row.paraBirimi].anlasilan += row.anlasilan;
    totals[row.paraBirimi].alinan += row.alinan;
    totals[row.paraBirimi].eksik += row.eksik;
    totals[row.paraBirimi].gider += row.gider;
    totals[row.paraBirimi].karZarar += row.karZarar;
    return totals;
  }, {});
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));
  const requestId = crypto.randomUUID();
  let stage = 'validation';

  if (!Number.isInteger(year) || !Number.isInteger(month) || year < 2000 || month < 1 || month > 12) {
    return NextResponse.json({ success: false, error: 'Geçerli bir yıl ve ay gönderilmelidir.' }, { status: 400 });
  }

  try {
    console.info('[monthly-statement-pdf] Başlatıldı', { requestId, year, month });
    stage = 'database-connect';
    await connectDB();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    stage = 'database-query';
    const entries = await OpportunityModel.aggregate([
      { $match: { olusturma_tarihi: { $gte: startDate, $lt: endDate }, 'ucretler.0': { $exists: true } } },
      { $unwind: '$ucretler' },
      { $match: { 'ucretler.miktar': { $type: 'number', $gt: 0 }, 'ucretler.odeme_durumu': { $in: ['toplam_ucret', 'alinan_ucret', 'gider'] } } },
      { $lookup: { from: 'customers', localField: 'musteri', foreignField: '_id', as: 'customer' } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          islemTuru: '$islem_turu',
          isAdi: { $ifNull: ['$detaylar.islem_adi', { $ifNull: ['$detaylar.isveren', '$detaylar.kayit_numarasi'] }] },
          musteri: { $trim: { input: { $concat: [{ $ifNull: ['$customer.ad', ''] }, ' ', { $ifNull: ['$customer.soyad', ''] }] } } },
          aciklama: '$ucretler.aciklama',
          odemeDurumu: '$ucretler.odeme_durumu',
          miktar: '$ucretler.miktar',
          paraBirimi: '$ucretler.para_birimi',
          olusturmaTarihi: '$olusturma_tarihi'
        }
      },
      { $sort: { olusturmaTarihi: 1 } }
    ]).exec() as StatementEntry[];

    console.info('[monthly-statement-pdf] Kayıtlar alındı', { requestId, entryCount: entries.length });
    stage = 'statement-rows';
    const rows = buildStatementRows(entries);
    const totals = getTotals(rows);
    console.info('[monthly-statement-pdf] Ekstre satırları oluşturuldu', { requestId, rowCount: rows.length, currencies: Object.keys(totals) });

    stage = 'pdf-document';
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28, bufferPages: true });
    const chunks: Buffer[] = [];
    const pdf = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const fontDirectory = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts');
    const regularFont = path.join(fontDirectory, 'LiberationSans-Regular.ttf');
    const boldFont = path.join(fontDirectory, 'LiberationSans-Bold.ttf');
    console.info('[monthly-statement-pdf] Font kontrolü', {
      requestId,
      regularFontExists: existsSync(regularFont),
      boldFontExists: existsSync(boldFont)
    });
    stage = 'pdf-fonts';
    doc.registerFont('AppRegular', regularFont);
    doc.registerFont('AppBold', boldFont);
    doc.font('AppRegular');

    const pageWidth = doc.page.width;
    const left = doc.page.margins.left;
    const right = pageWidth - doc.page.margins.right;
    const columns = [58, 110, 70, 77, 70, 75, 65, 180, 80];
    const headers = ['Tarih', 'İş', 'Tür', 'Anlaşılan', 'Alınan', 'Eksik', 'Gider', 'Açıklama', 'Kâr/Zarar'];
    let tableY = 108;

    const drawHeader = () => {
      const logoPath = path.join(process.cwd(), 'public', 'turnalarlogo.png');
      if (existsSync(logoPath)) doc.image(logoPath, left, 28, { fit: [130, 40] });
      doc.font('AppBold').fontSize(17).fillColor('#1f2937').text(`${monthNames[month - 1]} ${year} Gelir-Gider Ekstresi`, left, 75);
      doc.font('AppRegular').fontSize(8).fillColor('#6b7280').text('İş bazında gelir, gider ve tahsilat durumu', left, 94);

      let x = left;
      doc.rect(left, tableY, right - left, 20).fill('#e5e7eb');
      headers.forEach((header, index) => {
        doc.font('AppBold').fontSize(6.5).fillColor('#374151').text(header, x + 3, tableY + 7, { width: columns[index] - 6, align: index >= 3 ? 'right' : 'left' });
        x += columns[index];
      });
      tableY += 20;
    };

    drawHeader();

    const drawRow = (values: string[], isTotal = false) => {
      doc.font(isTotal ? 'AppBold' : 'AppRegular').fontSize(6.5);
      const rowHeight = Math.max(18, ...values.map((value, index) => doc.heightOfString(value, { width: columns[index] - 6, align: index >= 3 ? 'right' : 'left' }) + 8));
      if (tableY + rowHeight > doc.page.height - doc.page.margins.bottom - 18) {
        doc.addPage();
        tableY = 108;
        drawHeader();
      }
      if (isTotal) doc.rect(left, tableY, right - left, rowHeight).fill('#f3f4f6');
      let x = left;
      values.forEach((value, index) => {
        const isNegative = index === 8 && value.startsWith('-');
        const color = isNegative || index === 6 ? '#b91c1c' : index === 4 || (index === 8 && value.startsWith('+')) ? '#047857' : index === 5 ? '#b45309' : '#1f2937';
        doc.fillColor(color).text(value, x + 3, tableY + 5, { width: columns[index] - 6, align: index >= 3 ? 'right' : 'left' });
        x += columns[index];
      });
      doc.moveTo(left, tableY + rowHeight).lineTo(right, tableY + rowHeight).lineWidth(0.3).strokeColor('#d1d5db').stroke();
      tableY += rowHeight;
    };

    stage = 'pdf-rows';
    rows.forEach((row) => drawRow([
      formatDate(row.tarih),
      `${row.isAdi}\n${row.musteri}`,
      formatTransactionType(row.islemTuru),
      formatCurrency(row.anlasilan, row.paraBirimi),
      formatCurrency(row.alinan, row.paraBirimi),
      formatCurrency(row.eksik, row.paraBirimi),
      formatCurrency(row.gider, row.paraBirimi),
      row.aciklama || '-',
      `${row.karZarar < 0 ? '-' : '+'}${formatCurrency(Math.abs(row.karZarar), row.paraBirimi)}`
    ]));

    Object.entries(totals).forEach(([currency, total]) => drawRow([
      '', `${currency} toplamı`, '',
      formatCurrency(total.anlasilan, currency),
      formatCurrency(total.alinan, currency),
      formatCurrency(total.eksik, currency),
      formatCurrency(total.gider, currency),
      '', `${total.karZarar < 0 ? '-' : '+'}${formatCurrency(Math.abs(total.karZarar), currency)}`
    ], true));

    stage = 'pdf-footer';
    const pages = doc.bufferedPageRange();
    for (let index = 0; index < pages.count; index++) {
      doc.switchToPage(index);
      const footerY = doc.page.height - doc.page.margins.bottom - 10;
      doc.font('AppRegular').fontSize(7).fillColor('#6b7280').text(
        `Turnalar Göç | Oluşturulma: ${formatDate(new Date())} | Sayfa ${index + 1}/${pages.count}`,
        left,
        footerY,
        { width: right - left, align: 'center', lineBreak: false }
      );
    }

    stage = 'pdf-finalize';
    doc.end();
    const pdfBuffer = await pdf;
    console.info('[monthly-statement-pdf] PDF oluşturuldu', { requestId, bytes: pdfBuffer.length, pageCount: pages.count });
    const filename = `${year}-${String(month).padStart(2, '0')}-gelir-gider-ekstresi.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[monthly-statement-pdf] Hata', {
      requestId,
      stage,
      error: details,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      success: false,
      error: 'Aylık ekstre PDF olarak oluşturulamadı.',
      debugId: requestId,
      stage,
      details
    }, { status: 500 });
  }
}
