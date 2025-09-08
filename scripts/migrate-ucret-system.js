const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateUcretSystem() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('🔌 MongoDB bağlantısı başarılı!');
    
    const db = client.db();
    const collection = db.collection('opportunities');
    
    // Mevcut ücret yapısını analiz et
    const opportunities = await collection.find({
      ucretler: { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`📊 Toplam ${opportunities.length} fırsat bulundu`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const opportunity of opportunities) {
      try {
        const newUcretler = opportunity.ucretler.map(ucret => {
          // Sadece ödeme durumunu güncelle, diğer alanları koru
          const newUcret = {
            miktar: ucret.miktar, // Mevcut alan korundu
            para_birimi: ucret.para_birimi,
            aciklama: ucret.aciklama || '',
            odeme_tarihi: ucret.odeme_tarihi
          };
          
          // Ödeme durumunu yeni sisteme göre ayarla
          switch (ucret.odeme_durumu) {
            case 'odendi':
              newUcret.odeme_durumu = 'alinan_ucret';
              break;
            case 'beklemede':
              newUcret.odeme_durumu = 'toplam_ucret';
              break;
            case 'iptal_edildi':
              newUcret.odeme_durumu = 'gider';
              break;
            default:
              // Bilinmeyen durum için varsayılan
              newUcret.odeme_durumu = 'toplam_ucret';
              console.log(`⚠️  Bilinmeyen ödeme durumu: ${ucret.odeme_durumu} - Fırsat ID: ${opportunity._id}`);
          }
          
          return newUcret;
        });
        
        // Güncelle
        await collection.updateOne(
          { _id: opportunity._id },
          { 
            $set: { 
              ucretler: newUcretler,
              guncelleme_tarihi: new Date()
            }
          }
        );
        
        migratedCount++;
        console.log(`✅ Fırsat güncellendi: ${opportunity._id}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Hata - Fırsat ID: ${opportunity._id}`, error.message);
      }
    }
    
    console.log(`\n📈 Migration tamamlandı:`);
    console.log(`✅ Başarılı: ${migratedCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    
    // Sonuçları kontrol et
    const newStats = await collection.aggregate([
      { $unwind: '$ucretler' },
      { $group: { _id: '$ucretler.odeme_durumu', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n📊 Yeni ödeme durumu dağılımı:');
    newStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} adet`);
    });
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
  } finally {
    await client.close();
  }
}

// Test modu - sadece analiz yap, güncelleme yapma
async function testMigration() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('🧪 Test modu - Migration analizi');
    
    const db = client.db();
    const collection = db.collection('opportunities');
    
    const opportunities = await collection.find({
      ucretler: { $exists: true, $ne: [] }
    }).limit(3).toArray();
    
    console.log('\n📋 Örnek dönüşümler:');
    
    opportunities.forEach(opp => {
      console.log(`\nFırsat ID: ${opp._id}`);
      console.log('ESKİ YAPI:');
      opp.ucretler.forEach((ucret, index) => {
        console.log(`  ${index + 1}. Miktar: ${ucret.miktar}, Durum: ${ucret.odeme_durumu}`);
      });
      
      console.log('YENİ YAPI:');
      opp.ucretler.forEach((ucret, index) => {
        let newStatus = '';
        switch (ucret.odeme_durumu) {
          case 'odendi':
            newStatus = 'alinan_ucret';
            break;
          case 'beklemede':
            newStatus = 'toplam_ucret';
            break;
          case 'iptal_edildi':
            newStatus = 'gider';
            break;
        }
        console.log(`  ${index + 1}. Miktar: ${ucret.miktar}, Durum: ${newStatus}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await client.close();
  }
}

// Komut satırı argümanlarına göre çalıştır
const args = process.argv.slice(2);
if (args.includes('--test')) {
  testMigration();
} else {
  console.log('🚀 Migration başlatılıyor...');
  console.log('💡 Test için: node scripts/migrate-ucret-system.js --test');
  migrateUcretSystem();
}
