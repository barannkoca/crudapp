const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Cloud (Atlas) bağlantı bilgileri
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const CLOUD_MONGODB_URI = process.env.MONGODB_URI; // Cloud URI
const LOCAL_DB_NAME = process.env.LOCAL_DB_NAME || 'crudapp';
const CLOUD_DB_NAME = process.env.DB_NAME || 'crudapp';

async function migrateToCloud() {
  const localClient = new MongoClient(LOCAL_MONGODB_URI);
  const cloudClient = new MongoClient(CLOUD_MONGODB_URI);
  
  try {
    console.log('🔌 Yerel MongoDB\'ye bağlanılıyor...');
    await localClient.connect();
    console.log('✅ Yerel MongoDB bağlantısı başarılı');
    
    console.log('☁️ MongoDB Cloud\'a bağlanılıyor...');
    await cloudClient.connect();
    console.log('✅ MongoDB Cloud bağlantısı başarılı');
    
    const localDb = localClient.db(LOCAL_DB_NAME);
    const cloudDb = cloudClient.db(CLOUD_DB_NAME);
    
    // Migration işlemleri
    await migrateCollection(localDb, cloudDb, 'customers', 'Müşteriler');
    await migrateCollection(localDb, cloudDb, 'opportunities', 'Fırsatlar');
    await migrateCollection(localDb, cloudDb, 'users', 'Kullanıcılar');
    await migrateCollection(localDb, cloudDb, 'auditlogs', 'Audit Logları');
    
    console.log('🎉 Cloud migration tamamlandı!');
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  } finally {
    await localClient.close();
    await cloudClient.close();
  }
}

async function migrateCollection(localDb, cloudDb, collectionName, displayName) {
  console.log(`📦 ${displayName} migrate ediliyor...`);
  
  const localCollection = localDb.collection(collectionName);
  const cloudCollection = cloudDb.collection(collectionName);
  
  // Yerel verileri al
  const localData = await localCollection.find({}).toArray();
  console.log(`📊 ${localData.length} ${displayName.toLowerCase()} bulundu`);
  
  if (localData.length === 0) {
    console.log(`ℹ️ ${displayName} verisi bulunamadı, atlanıyor...`);
    return;
  }
  
  // Cloud'da collection'ı temizle (isteğe bağlı)
  const shouldClearCloud = process.env.CLEAR_CLOUD_COLLECTIONS === 'true';
  if (shouldClearCloud) {
    console.log(`🧹 Cloud ${displayName.toLowerCase()} collection'ı temizleniyor...`);
    await cloudCollection.deleteMany({});
  }
  
  // Verileri cloud'a kopyala
  if (localData.length > 0) {
    // Batch işlemi için verileri böl
    const batchSize = 100;
    for (let i = 0; i < localData.length; i += batchSize) {
      const batch = localData.slice(i, i + batchSize);
      
      try {
        const result = await cloudCollection.insertMany(batch, { 
          ordered: false, // Hata durumunda devam et
          writeConcern: { w: 1 } // Performans için
        });
        console.log(`✅ ${result.insertedCount} ${displayName.toLowerCase()} eklendi (batch ${Math.floor(i/batchSize) + 1})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Bazı ${displayName.toLowerCase()} zaten mevcut, atlanıyor...`);
        } else {
          console.error(`❌ ${displayName} batch hatası:`, error.message);
        }
      }
    }
  }
  
  // İstatistikleri göster
  const cloudCount = await cloudCollection.countDocuments();
  console.log(`📊 Cloud'da toplam ${cloudCount} ${displayName.toLowerCase()}`);
}

// Veri doğrulama fonksiyonu
async function validateMigration() {
  const localClient = new MongoClient(LOCAL_MONGODB_URI);
  const cloudClient = new MongoClient(CLOUD_MONGODB_URI);
  
  try {
    await localClient.connect();
    await cloudClient.connect();
    
    const localDb = localClient.db(LOCAL_DB_NAME);
    const cloudDb = cloudClient.db(CLOUD_DB_NAME);
    
    console.log('\n🔍 Migration doğrulaması yapılıyor...');
    
    const collections = ['customers', 'opportunities', 'users', 'auditlogs'];
    
    for (const collectionName of collections) {
      const localCount = await localDb.collection(collectionName).countDocuments();
      const cloudCount = await cloudDb.collection(collectionName).countDocuments();
      
      console.log(`${collectionName}:`);
      console.log(`  Yerel: ${localCount}`);
      console.log(`  Cloud: ${cloudCount}`);
      console.log(`  Durum: ${localCount === cloudCount ? '✅ Başarılı' : '❌ Farklı'}`);
    }
    
  } catch (error) {
    console.error('❌ Doğrulama hatası:', error);
  } finally {
    await localClient.close();
    await cloudClient.close();
  }
}

// Script'i çalıştır
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'validate') {
    validateMigration()
      .then(() => {
        console.log('🎉 Doğrulama tamamlandı!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Doğrulama başarısız:', error);
        process.exit(1);
      });
  } else {
    migrateToCloud()
      .then(() => {
        console.log('🎉 Cloud migration başarıyla tamamlandı!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Cloud migration başarısız:', error);
        process.exit(1);
      });
  }
}

module.exports = { migrateToCloud, validateMigration };
