#!/usr/bin/env node

/**
 * Çalışma İzni Alanları Migration Scripti
 * 
 * Bu script çalışma izni fırsatlarından gereksiz alanları kaldırır:
 * - sozlesme_turu
 * - maas  
 * - calisma_saati
 * 
 * Yerine yeni alanlar ekler:
 * - kayit_tarihi
 * - calisma_izni_bitis_tarihi
 * 
 * Kullanım:
 * node scripts/migrate-calisma-izni-fields.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  console.error('Lütfen .env dosyasında MONGODB_URI değişkenini tanımlayın.');
  process.exit(1);
}

async function migrateCalismaIzniFields() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı!');
    
    const db = client.db();
    const opportunitiesCollection = db.collection('opportunities');
    
    // Çalışma izni fırsatlarını bul
    console.log('🔍 Çalışma izni fırsatları aranıyor...');
    const calismaIzniOpportunities = await opportunitiesCollection.find({
      islem_turu: 'calisma_izni'
    }).toArray();
    
    console.log(`📊 Toplam ${calismaIzniOpportunities.length} çalışma izni fırsatı bulundu.`);
    
    if (calismaIzniOpportunities.length === 0) {
      console.log('ℹ️  Güncellenecek çalışma izni fırsatı bulunamadı.');
      return;
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Her çalışma izni fırsatını güncelle
    for (const opportunity of calismaIzniOpportunities) {
      try {
        const updateFields = {};
        const unsetFields = {};
        
        // Eski alanları kaldır
        if (opportunity.detaylar?.sozlesme_turu !== undefined) {
          unsetFields['detaylar.sozlesme_turu'] = '';
        }
        if (opportunity.detaylar?.maas !== undefined) {
          unsetFields['detaylar.maas'] = '';
        }
        if (opportunity.detaylar?.calisma_saati !== undefined) {
          unsetFields['detaylar.calisma_saati'] = '';
        }
        if (opportunity.detaylar?.is_baslama_tarihi !== undefined) {
          unsetFields['detaylar.is_baslama_tarihi'] = '';
        }
        
        // Yeni alanları ekle (eğer yoksa)
        if (!opportunity.detaylar?.kayit_tarihi) {
          updateFields['detaylar.kayit_tarihi'] = opportunity.olusturma_tarihi || new Date();
        }
        if (!opportunity.detaylar?.calisma_izni_bitis_tarihi) {
          // Boş bırak, sonradan eklenecek
          updateFields['detaylar.calisma_izni_bitis_tarihi'] = null;
        }
        
        // Güncelleme yap
        const updateOperation = {};
        if (Object.keys(updateFields).length > 0) {
          updateOperation.$set = updateFields;
        }
        if (Object.keys(unsetFields).length > 0) {
          updateOperation.$unset = unsetFields;
        }
        
        if (Object.keys(updateOperation).length > 0) {
          await opportunitiesCollection.updateOne(
            { _id: opportunity._id },
            updateOperation
          );
          updatedCount++;
          
          console.log(`✅ Güncellendi: ${opportunity._id} - Müşteri: ${opportunity.musteri?.ad || 'Bilinmiyor'}`);
        } else {
          console.log(`ℹ️  Güncelleme gerekmiyor: ${opportunity._id}`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Hata (${opportunity._id}):`, error.message);
      }
    }
    
    console.log('\n📈 Migration Özeti:');
    console.log(`✅ Başarıyla güncellenen: ${updatedCount}`);
    console.log(`❌ Hata olan: ${errorCount}`);
    console.log(`📊 Toplam işlenen: ${calismaIzniOpportunities.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration başarıyla tamamlandı!');
    } else {
      console.log('\n⚠️  Migration tamamlandı ancak bazı hatalar oluştu.');
    }
    
  } catch (error) {
    console.error('❌ Migration sırasında hata oluştu:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
}

// Migration'ı çalıştır
if (require.main === module) {
  migrateCalismaIzniFields()
    .then(() => {
      console.log('✨ Migration scripti tamamlandı.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration scripti başarısız:', error);
      process.exit(1);
    });
}

module.exports = { migrateCalismaIzniFields };
