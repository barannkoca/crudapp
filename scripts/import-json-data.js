const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB bağlantı string'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';

async function importJsonData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('MongoDB bağlantısı başarılı');
    
    const db = client.db('crudapp');
    
    // JSON dosyalarının yolları
    const jsonFiles = [
      { file: 'customers.json', collection: 'customers' },
      { file: 'opportunities.json', collection: 'opportunities' },
      { file: 'users.json', collection: 'users' }
    ];
    
    for (const { file, collection } of jsonFiles) {
      const filePath = path.join(__dirname, 'data', file);
      
      if (fs.existsSync(filePath)) {
        console.log(`${file} dosyası bulundu, yükleniyor...`);
        
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Eğer array değilse array'e çevir
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        if (dataArray.length > 0) {
          const result = await db.collection(collection).insertMany(dataArray);
          console.log(`${collection} collection'ına ${result.insertedCount} döküman eklendi`);
        } else {
          console.log(`${file} dosyası boş`);
        }
      } else {
        console.log(`${file} dosyası bulunamadı: ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error('Import hatası:', error);
  } finally {
    await client.close();
  }
}

// Script'i çalıştır
if (require.main === module) {
  importJsonData();
}

module.exports = { importJsonData };




