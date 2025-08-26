const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function addCustomerPhotos() {
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
    
    // Customers collection'ını al
    const customersCollection = db.collection('customers');
    
    let updatedCount = 0;
    let photoCount = 0;
    
    // Her kayıt için müşteri fotoğrafını ekle
    for (const record of records) {
      if (record.photo && record.photo.data) {
        try {
          // Müşteriyi bul (ad ve soyad ile eşleştir)
          const customer = await customersCollection.findOne({
            ad: record.adi,
            soyad: record.soyadi
          });
          
          if (customer) {
            // Photo verisini güncelle
            const photoData = {
              data: record.photo.data,
              contentType: record.photo.contentType || 'image/jpeg'
            };
            
            // Müşteriyi güncelle
            await customersCollection.updateOne(
              { _id: customer._id },
              { 
                $set: { 
                  photo: photoData,
                  updatedAt: new Date()
                }
              }
            );
            
            updatedCount++;
            console.log(`✅ ${customer.ad} ${customer.soyad} için fotoğraf eklendi`);
          } else {
            console.log(`⚠️  Müşteri bulunamadı: ${record.adi} ${record.soyadi}`);
          }
          
          photoCount++;
        } catch (error) {
          console.error(`❌ Hata: ${record.adi} ${record.soyadi} için fotoğraf eklenirken hata oluştu:`, error.message);
        }
      }
    }
    
    console.log('\n📊 İşlem Tamamlandı!');
    console.log(`📸 Toplam fotoğraf sayısı: ${photoCount}`);
    console.log(`✅ Güncellenen müşteri sayısı: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
addCustomerPhotos();

