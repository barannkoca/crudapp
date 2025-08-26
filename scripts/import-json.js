const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function importJsonData() {
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
    
    // MongoDB Extended JSON format'ını düzelt
    console.log('🔧 MongoDB Extended JSON format düzeltiliyor...');
    const cleanedRecords = records.map(record => {
      const cleanedRecord = { ...record };
      
      // _id alanını kaldır (MongoDB otomatik oluşturacak)
      delete cleanedRecord._id;
      
      // $oid alanlarını ObjectId'ye çevir
      if (cleanedRecord.user && cleanedRecord.user.$oid) {
        cleanedRecord.user = cleanedRecord.user.$oid;
      }
      if (cleanedRecord.corporate && cleanedRecord.corporate.$oid) {
        cleanedRecord.corporate = cleanedRecord.corporate.$oid;
      }
      
      // $date alanlarını Date objesine çevir
      if (cleanedRecord.kayit_tarihi && cleanedRecord.kayit_tarihi.$date) {
        cleanedRecord.kayit_tarihi = new Date(cleanedRecord.kayit_tarihi.$date);
      }
      if (cleanedRecord.dogum_tarihi && cleanedRecord.dogum_tarihi.$date) {
        cleanedRecord.dogum_tarihi = new Date(cleanedRecord.dogum_tarihi.$date);
      }
      if (cleanedRecord.gecerlilik_tarihi && cleanedRecord.gecerlilik_tarihi.$date) {
        cleanedRecord.gecerlilik_tarihi = new Date(cleanedRecord.gecerlilik_tarihi.$date);
      }
      if (cleanedRecord.createdAt && cleanedRecord.createdAt.$date) {
        cleanedRecord.createdAt = new Date(cleanedRecord.createdAt.$date);
      }
      if (cleanedRecord.updatedAt && cleanedRecord.updatedAt.$date) {
        cleanedRecord.updatedAt = new Date(cleanedRecord.updatedAt.$date);
      }
      
      return cleanedRecord;
    });
    
    // Records collection'ına ekle
    const recordsCollection = db.collection('records');
    
    // Önce collection'ı temizle (isteğe bağlı)
    console.log('🧹 Eski records collection temizleniyor...');
    await recordsCollection.deleteMany({});
    
    // Yeni verileri ekle
    console.log('📝 Veriler MongoDB\'ye ekleniyor...');
    const result = await recordsCollection.insertMany(cleanedRecords);
    
    console.log(`✅ ${result.insertedCount} kayıt başarıyla import edildi`);
    
    // İstatistikleri göster
    const totalRecords = await recordsCollection.countDocuments();
    console.log(`📊 Toplam kayıt sayısı: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Script'i çalıştır
if (require.main === module) {
  importJsonData()
    .then(() => {
      console.log('🎉 JSON import başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ JSON import başarısız:', error);
      process.exit(1);
    });
}

module.exports = { importJsonData };
