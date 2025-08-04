const mongoose = require('mongoose');

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';

async function migrateRecords() {
  try {
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Eski Record modelini tanımla (eski schema ile)
    const oldRecordSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      corporate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corporate',
        required: true,
      },
      kayit_ili: String,
      yapilan_islem: String,
      ikamet_turu: String,
      kayit_tarihi: Date,
      kayit_numarasi: String,
      adi: String,
      soyadi: String,
      baba_adi: String,
      anne_adi: String,
      yabanci_kimlik_no: String,
      uyrugu: String,
      cinsiyeti: String,
      medeni_hali: String,
      dogum_tarihi: Date,
      belge_turu: String,
      belge_no: String,
      telefon_no: String,
      eposta: String,
      aciklama: String,
      photo: {
        data: String,
        contentType: String,
        _id: false,
      },
      kayit_pdf: {
        data: String,
        contentType: String,
        _id: false,
      },
      durum: {
        type: String,
        enum: ['beklemede', 'onaylandi', 'reddedildi'],
        default: 'beklemede'
      },
      gecerlilik_tarihi: Date,
      sira_no: Number,
      randevu_tarihi: Date
    }, {
      timestamps: true,
      strict: false // Eski veriler için strict: false
    });

    const OldRecord = mongoose.model('Record', oldRecordSchema, 'records');

    // Customer modelini tanımla
    const customerSchema = new mongoose.Schema({
      ad: String,
      soyad: String,
      yabanci_kimlik_no: String,
      uyrugu: String,
      cinsiyeti: String,
      telefon_no: String,
      eposta: String,
      photo: {
        data: String,
        contentType: String,
        _id: false,
      }
    }, {
      timestamps: true,
      strict: false
    });

    const Customer = mongoose.model('Customer', customerSchema, 'customers');

    // Eski kayıtları al
    console.log('Eski kayıtlar alınıyor...');
    const oldRecords = await OldRecord.find({});
    console.log(`${oldRecords.length} adet eski kayıt bulundu`);

    if (oldRecords.length === 0) {
      console.log('Migrate edilecek kayıt yok');
      return;
    }

    // Her eski kayıt için yeni Customer oluştur ve Record'u güncelle
    for (const oldRecord of oldRecords) {
      console.log(`Kayıt işleniyor: ${oldRecord.adi} ${oldRecord.soyadi}`);

      try {
        // Önce Customer var mı kontrol et
        let customer = await Customer.findOne({
          ad: oldRecord.adi,
          soyad: oldRecord.soyadi,
          yabanci_kimlik_no: oldRecord.yabanci_kimlik_no
        });

        // Customer yoksa oluştur
        if (!customer) {
          customer = await Customer.create({
            ad: oldRecord.adi,
            soyad: oldRecord.soyadi,
            yabanci_kimlik_no: oldRecord.yabanci_kimlik_no,
            uyrugu: oldRecord.uyrugu,
            cinsiyeti: oldRecord.cinsiyeti,
            telefon_no: oldRecord.telefon_no,
            eposta: oldRecord.eposta,
            photo: oldRecord.photo
          });
          console.log(`Yeni müşteri oluşturuldu: ${customer._id}`);
        }

        // Record'u yeni yapıya güncelle
        const updatedRecord = {
          musteri: customer._id,
          islem_turu: 'kayit',
          durum: oldRecord.durum || 'beklemede',
          kayit_ili: oldRecord.kayit_ili,
          yapilan_islem: oldRecord.yapilan_islem,
          ikamet_turu: oldRecord.ikamet_turu,
          kayit_tarihi: oldRecord.kayit_tarihi,
          kayit_numarasi: oldRecord.kayit_numarasi,
          aciklama: oldRecord.aciklama,
          kayit_pdf: oldRecord.kayit_pdf,
          gecerlilik_tarihi: oldRecord.gecerlilik_tarihi,
          sira_no: oldRecord.sira_no,
          randevu_tarihi: oldRecord.randevu_tarihi,
          createdAt: oldRecord.createdAt,
          updatedAt: oldRecord.updatedAt
        };

        // Eski record'u güncelle
        await OldRecord.findByIdAndUpdate(oldRecord._id, updatedRecord);
        console.log(`Record güncellendi: ${oldRecord._id}`);

      } catch (error) {
        console.error(`Kayıt işlenirken hata: ${oldRecord._id}`, error);
      }
    }

    console.log('Migration tamamlandı!');
    console.log(`${oldRecords.length} adet kayıt işlendi`);

  } catch (error) {
    console.error('Migration hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
migrateRecords(); 