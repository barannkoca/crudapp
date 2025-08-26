const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function checkPhotos() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db(DB_NAME);
    
    // Customers collection'ını al
    const customersCollection = db.collection('customers');
    
    // Toplam müşteri sayısı
    const totalCustomers = await customersCollection.countDocuments();
    console.log(`👥 Toplam müşteri sayısı: ${totalCustomers}`);
    
    // Fotoğrafı olan müşteri sayısı
    const customersWithPhotos = await customersCollection.countDocuments({
      'photo.data': { $exists: true }
    });
    console.log(`📸 Fotoğrafı olan müşteri sayısı: ${customersWithPhotos}`);
    
    // Fotoğrafı olmayan müşteri sayısı
    const customersWithoutPhotos = totalCustomers - customersWithPhotos;
    console.log(`❌ Fotoğrafı olmayan müşteri sayısı: ${customersWithoutPhotos}`);
    
    // Örnek müşteri fotoğraflarını göster
    console.log('\n📋 Örnek müşteri fotoğrafları:');
    const sampleCustomers = await customersCollection.find({
      'photo.data': { $exists: true }
    }).limit(5).toArray();
    
    sampleCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.ad} ${customer.soyad}`);
      console.log(`   📸 Fotoğraf boyutu: ${customer.photo.data.length} bytes`);
      console.log(`   📄 Content Type: ${customer.photo.contentType}`);
      console.log('');
    });
    
    console.log('✅ Fotoğraf kontrolü tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
checkPhotos();



