const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function migratePhotosAndPdfs() {
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
    
    let photoCount = 0;
    let pdfCount = 0;
    let customerUpdateCount = 0;
    let opportunityUpdateCount = 0;
    
    // Her kayıt için işlem yap
    for (const record of records) {
      try {
        // 1. Müşteri fotoğrafını ekle
        if (record.photo && record.photo.data) {
          const customer = await customersCollection.findOne({
            ad: record.adi,
            soyad: record.soyadi
          });
          
          if (customer) {
            const photoData = {
              data: record.photo.data,
              contentType: record.photo.contentType || 'image/jpeg'
            };
            
            await customersCollection.updateOne(
              { _id: customer._id },
              { 
                $set: { 
                  photo: photoData,
                  updatedAt: new Date()
                }
              }
            );
            
            customerUpdateCount++;
            console.log(`✅ ${customer.ad} ${customer.soyad} için fotoğraf eklendi`);
          } else {
            console.log(`⚠️  Müşteri bulunamadı: ${record.adi} ${record.soyadi}`);
          }
          
          photoCount++;
        }
        
        // 2. PDF'yi ikamet iznine ekle
        if (record.kayit_pdf && record.kayit_pdf.data) {
          // Bu müşteriye ait ikamet izni fırsatını bul
          const customer = await customersCollection.findOne({
            ad: record.adi,
            soyad: record.soyadi
          });
          
          if (customer) {
            const opportunity = await opportunitiesCollection.findOne({
              musteri: customer._id,
              islem_turu: 'ikamet_izni'
            });
            
            if (opportunity) {
              // PDF verisini hazırla
              const pdfData = {
                data: record.kayit_pdf.data,
                contentType: record.kayit_pdf.contentType || 'application/pdf',
                originalName: `kayit_pdf_${record.adi}_${record.soyadi}.pdf`,
                uploadDate: new Date()
              };
              
              // PDF'yi pdf_dosyalari array'ine ekle
              await opportunitiesCollection.updateOne(
                { _id: opportunity._id },
                { 
                  $push: { 
                    pdf_dosyalari: pdfData
                  },
                  $set: {
                    guncelleme_tarihi: new Date()
                  }
                }
              );
              
              opportunityUpdateCount++;
              console.log(`📄 ${record.adi} ${record.soyadi} için PDF ikamet iznine eklendi`);
            } else {
              console.log(`⚠️  İkamet izni fırsatı bulunamadı: ${record.adi} ${record.soyadi}`);
            }
            
            pdfCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Hata: ${record.adi} ${record.soyadi} için işlem yapılırken hata oluştu:`, error.message);
      }
    }
    
    console.log('\n📊 Migration Tamamlandı!');
    console.log(`📸 Toplam fotoğraf sayısı: ${photoCount}`);
    console.log(`📄 Toplam PDF sayısı: ${pdfCount}`);
    console.log(`✅ Güncellenen müşteri sayısı: ${customerUpdateCount}`);
    console.log(`✅ Güncellenen fırsat sayısı: ${opportunityUpdateCount}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  migratePhotosAndPdfs()
    .then(() => {
      console.log('🎉 Migration başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration başarısız:', error);
      process.exit(1);
    });
}

module.exports = { migratePhotosAndPdfs };
