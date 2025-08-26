const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function checkDates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db(DB_NAME);
    
    // Opportunities collection'ını kontrol et
    const opportunities = await db.collection('opportunities').find({}).limit(5).toArray();
    
    console.log('📊 İlk 5 fırsat kaydı:');
    opportunities.forEach((opp, index) => {
      console.log(`\n--- Fırsat ${index + 1} ---`);
      console.log('ID:', opp._id);
      console.log('Oluşturma tarihi:', opp.olusturma_tarihi);
      console.log('Güncelleme tarihi:', opp.guncelleme_tarihi);
      
      if (opp.detaylar) {
        console.log('Detaylar:');
        console.log('  Kayıt tarihi:', opp.detaylar.kayit_tarihi);
        console.log('  Geçerlilik tarihi:', opp.detaylar.gecerlilik_tarihi);
        console.log('  Randevu tarihi:', opp.detaylar.randevu_tarihi);
      }
      
      // Tarih formatını test et
      if (opp.olusturma_tarihi) {
        try {
          const date = new Date(opp.olusturma_tarihi);
          console.log('  Oluşturma tarihi (parsed):', date.toISOString());
          console.log('  Geçerli tarih mi:', !isNaN(date.getTime()));
        } catch (error) {
          console.log('  ❌ Tarih parse hatası:', error.message);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
  }
}

checkDates();
