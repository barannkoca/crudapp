const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function checkMigrationResults() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db(DB_NAME);
    
    // Customers collection'ını kontrol et
    console.log('\n👥 MÜŞTERİ KONTROLÜ:');
    const customersCollection = db.collection('customers');
    
    const totalCustomers = await customersCollection.countDocuments();
    console.log(`📊 Toplam müşteri sayısı: ${totalCustomers}`);
    
    const customersWithPhotos = await customersCollection.countDocuments({
      'photo.data': { $exists: true }
    });
    console.log(`📸 Fotoğrafı olan müşteri sayısı: ${customersWithPhotos}`);
    
    const customersWithoutPhotos = totalCustomers - customersWithPhotos;
    console.log(`❌ Fotoğrafı olmayan müşteri sayısı: ${customersWithoutPhotos}`);
    
    // Opportunities collection'ını kontrol et
    console.log('\n📋 FIRSAT KONTROLÜ:');
    const opportunitiesCollection = db.collection('opportunities');
    
    const totalOpportunities = await opportunitiesCollection.countDocuments();
    console.log(`📊 Toplam fırsat sayısı: ${totalOpportunities}`);
    
    const ikametOpportunities = await opportunitiesCollection.countDocuments({
      islem_turu: 'ikamet_izni'
    });
    console.log(`🏠 İkamet izni fırsat sayısı: ${ikametOpportunities}`);
    
    const opportunitiesWithPdfs = await opportunitiesCollection.countDocuments({
      'pdf_dosyalari.0': { $exists: true }
    });
    console.log(`📄 PDF'si olan fırsat sayısı: ${opportunitiesWithPdfs}`);
    
    const ikametWithPdfs = await opportunitiesCollection.countDocuments({
      islem_turu: 'ikamet_izni',
      'pdf_dosyalari.0': { $exists: true }
    });
    console.log(`📄 İkamet izni PDF'si olan fırsat sayısı: ${ikametWithPdfs}`);
    
    // Örnek müşteri fotoğraflarını göster
    console.log('\n📋 ÖRNEK MÜŞTERİ FOTOĞRAFLARI:');
    const sampleCustomers = await customersCollection.find({
      'photo.data': { $exists: true }
    }).limit(3).toArray();
    
    sampleCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.ad} ${customer.soyad}`);
      console.log(`   📸 Fotoğraf boyutu: ${customer.photo.data.length} bytes`);
      console.log(`   📄 Content Type: ${customer.photo.contentType}`);
      console.log('');
    });
    
    // Örnek ikamet izni PDF'lerini göster
    console.log('\n📋 ÖRNEK İKAMET İZNİ PDF\'LERİ:');
    const sampleOpportunities = await opportunitiesCollection.find({
      islem_turu: 'ikamet_izni',
      'pdf_dosyalari.0': { $exists: true }
    }).limit(3).toArray();
    
    sampleOpportunities.forEach((opportunity, index) => {
      console.log(`${index + 1}. Fırsat ID: ${opportunity._id}`);
      console.log(`   📄 PDF sayısı: ${opportunity.pdf_dosyalari.length}`);
      if (opportunity.pdf_dosyalari.length > 0) {
        const pdf = opportunity.pdf_dosyalari[0];
        console.log(`   📄 PDF boyutu: ${pdf.data.length} bytes`);
        console.log(`   📄 Content Type: ${pdf.contentType}`);
        if (pdf.originalName) {
          console.log(`   📄 Dosya adı: ${pdf.originalName}`);
        }
      }
      console.log('');
    });
    
    // İstatistikler
    console.log('\n📊 İSTATİSTİKLER:');
    const photoSuccessRate = totalCustomers > 0 ? ((customersWithPhotos / totalCustomers) * 100).toFixed(2) : 0;
    const pdfSuccessRate = ikametOpportunities > 0 ? ((ikametWithPdfs / ikametOpportunities) * 100).toFixed(2) : 0;
    
    console.log(`📸 Fotoğraf başarı oranı: %${photoSuccessRate}`);
    console.log(`📄 PDF başarı oranı: %${pdfSuccessRate}`);
    
    console.log('\n✅ Kontrol tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  checkMigrationResults()
    .then(() => {
      console.log('🎉 Kontrol başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Kontrol başarısız:', error);
      process.exit(1);
    });
}

module.exports = { checkMigrationResults };
