const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function checkMigration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db(DB_NAME);
    
    // Collection'ları kontrol et
    const collections = await db.listCollections().toArray();
    console.log('📋 Mevcut collection\'lar:', collections.map(c => c.name));
    
    // Müşteri sayısını kontrol et
    const customersCount = await db.collection('customers').countDocuments();
    console.log(`👥 Müşteri sayısı: ${customersCount}`);
    
    // Fırsat sayısını kontrol et
    const opportunitiesCount = await db.collection('opportunities').countDocuments();
    console.log(`📋 Fırsat sayısı: ${opportunitiesCount}`);
    
    // Örnek müşteri göster
    console.log('\n📊 Örnek Müşteri:');
    const sampleCustomer = await db.collection('customers').findOne();
    if (sampleCustomer) {
      console.log({
        id: sampleCustomer._id,
        ad: sampleCustomer.ad,
        soyad: sampleCustomer.soyad,
        uyrugu: sampleCustomer.uyrugu,
        cinsiyeti: sampleCustomer.cinsiyeti,
        telefon_no: sampleCustomer.telefon_no,
        eposta: sampleCustomer.eposta
      });
    }
    
    // Örnek fırsat göster
    console.log('\n📊 Örnek Fırsat:');
    const sampleOpportunity = await db.collection('opportunities').findOne();
    if (sampleOpportunity) {
      console.log({
        id: sampleOpportunity._id,
        islem_turu: sampleOpportunity.islem_turu,
        durum: sampleOpportunity.durum,
        musteri_id: sampleOpportunity.musteri,
        detaylar: sampleOpportunity.detaylar
      });
    }
    
    // İstatistikler
    console.log('\n📈 İstatistikler:');
    
    // İşlem türü dağılımı
    const islemTuruStats = await db.collection('opportunities').aggregate([
      { $group: { _id: '$islem_turu', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('İşlem Türü Dağılımı:');
    islemTuruStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Durum dağılımı
    const durumStats = await db.collection('opportunities').aggregate([
      { $group: { _id: '$durum', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nDurum Dağılımı:');
    durumStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Uyruk dağılımı
    const uyrukStats = await db.collection('customers').aggregate([
      { $group: { _id: '$uyrugu', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nUyruk Dağılımı:');
    uyrukStats.forEach(stat => {
      console.log(`  ${stat._id || 'Belirtilmemiş'}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Script'i çalıştır
if (require.main === module) {
  checkMigration()
    .then(() => {
      console.log('\n🎉 Migration kontrolü tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration kontrolü başarısız:', error);
      process.exit(1);
    });
}

module.exports = { checkMigration };

