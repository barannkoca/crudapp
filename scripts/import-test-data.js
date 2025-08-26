const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function importTestData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db(DB_NAME);
    
    // JSON dosyasını oku
    console.log('📖 JSON dosyası okunuyor...');
    const jsonData = fs.readFileSync('scripts/test.records.json', 'utf8');
    const records = JSON.parse(jsonData);
    
    console.log(`📊 ${records.length} kayıt bulundu`);
    
    // Collections
    const customersCollection = db.collection('customers');
    const opportunitiesCollection = db.collection('opportunities');
    
    let customerCount = 0;
    let opportunityCount = 0;
    
    // Her kayıt için müşteri ve fırsat oluştur
    for (const record of records) {
      try {
        // 1. Müşteri oluştur
        const customerData = {
          ad: record.adi || '',
          soyad: record.soyadi || '',
          yabanci_kimlik_no: record.yabanci_kimlik_no || null,
          uyrugu: record.uyrugu || null,
          cinsiyeti: record.cinsiyeti || 'Erkek',
          telefon_no: record.telefon || null,
          eposta: record.eposta || null,
          dogum_tarihi: record.dogum_tarihi || null,
          adres: record.adres || null,
          photo: record.photo || null,
          createdAt: record.createdAt || new Date(),
          updatedAt: record.updatedAt || new Date()
        };
        
        // Müşteriyi ekle
        const customerResult = await customersCollection.insertOne(customerData);
        customerCount++;
        
        // 2. İkamet izni fırsatı oluştur
        const opportunityData = {
          musteri: customerResult.insertedId,
          islem_turu: 'ikamet_izni',
          durum: mapDurum(record.durum || 'beklemede'),
          olusturma_tarihi: record.createdAt || new Date(),
          guncelleme_tarihi: record.updatedAt || new Date(),
          aciklamalar: [],
          ucretler: [],
          pdf_dosyalari: [],
          detaylar: {
            kayit_ili: record.kayit_ili || null,
            yapilan_islem: record.yapilan_islem || null,
            ikamet_turu: record.ikamet_turu || null,
            kayit_tarihi: record.kayit_tarihi || null,
            randevu_tarihi: record.randevu_tarihi || null,
            kayit_numarasi: record.kayit_numarasi || null,
            baba_adi: record.baba_adi || null,
            anne_adi: record.anne_adi || null,
            dogum_yeri: record.dogum_yeri || null,
            medeni_durumu: record.medeni_durumu || null,
            gecerlilik_tarihi: record.gecerlilik_tarihi || null
          }
        };
        
        // Fırsatı ekle
        await opportunitiesCollection.insertOne(opportunityData);
        opportunityCount++;
        
        console.log(`✅ ${record.adi} ${record.soyadi} için müşteri ve fırsat oluşturuldu`);
        
      } catch (error) {
        console.error(`❌ Hata: ${record.adi} ${record.soyadi} için veri oluşturulurken hata oluştu:`, error.message);
      }
    }
    
    console.log('\n📊 Import Tamamlandı!');
    console.log(`👥 Oluşturulan müşteri sayısı: ${customerCount}`);
    console.log(`📋 Oluşturulan fırsat sayısı: ${opportunityCount}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Yardımcı fonksiyonlar
function mapDurum(oldStatus) {
  const statusMap = {
    'beklemede': 'beklemede',
    'pending': 'beklemede',
    'waiting': 'beklemede',
    'islemde': 'islemde',
    'processing': 'islemde',
    'in_progress': 'islemde',
    'onaylandi': 'onaylandi',
    'approved': 'onaylandi',
    'reddedildi': 'reddedildi',
    'rejected': 'reddedildi',
    'tamamlandi': 'tamamlandi',
    'completed': 'tamamlandi',
    'iptal_edildi': 'iptal_edildi',
    'cancelled': 'iptal_edildi'
  };
  
  return statusMap[oldStatus?.toLowerCase()] || 'beklemede';
}

// Script'i çalıştır
if (require.main === module) {
  importTestData()
    .then(() => {
      console.log('🎉 Import başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import başarısız:', error);
      process.exit(1);
    });
}

module.exports = { importTestData };
