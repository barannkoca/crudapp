const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp';
const DB_NAME = process.env.DB_NAME || 'crudapp';

async function migrateDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db(DB_NAME);
    
    // Eski collection'ları kontrol et
    const collections = await db.listCollections().toArray();
    console.log('📋 Mevcut collection\'lar:', collections.map(c => c.name));
    
    // Migration işlemleri
    await migrateCustomers(db);
    await migrateOpportunities(db);
    await migrateUsers(db);
    
    console.log('🎉 Migration tamamlandı!');
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function migrateCustomers(db) {
  console.log('👥 Müşteri verilerini migrate ediliyor...');
  
  const customersCollection = db.collection('customers');
  const oldCustomersCollection = db.collection('customers_old');
  
  // Eski müşteri verilerini kontrol et
  const oldCustomers = await oldCustomersCollection.find({}).toArray();
  console.log(`📊 ${oldCustomers.length} eski müşteri bulundu`);
  
  if (oldCustomers.length === 0) {
    console.log('ℹ️ Eski müşteri verisi bulunamadı, atlanıyor...');
    return;
  }
  
  // Yeni formata dönüştür
  const migratedCustomers = oldCustomers.map(customer => ({
    ad: customer.ad || customer.name || '',
    soyad: customer.soyad || customer.surname || customer.lastName || '',
    yabanci_kimlik_no: customer.yabanci_kimlik_no || customer.foreignId || customer.idNumber || null,
    uyrugu: customer.uyrugu || customer.nationality || null,
    cinsiyeti: customer.cinsiyeti || customer.gender || 'Erkek',
    telefon_no: customer.telefon_no || customer.phone || customer.telefon || null,
    eposta: customer.eposta || customer.email || null,
    dogum_tarihi: customer.dogum_tarihi || customer.birthDate || customer.dogumTarihi || null,
    adres: customer.adres || customer.address || null,
    photo: customer.photo || null,
    createdAt: customer.createdAt || customer.created_at || new Date(),
    updatedAt: customer.updatedAt || customer.updated_at || new Date()
  }));
  
  // Yeni verileri ekle
  if (migratedCustomers.length > 0) {
    const result = await customersCollection.insertMany(migratedCustomers);
    console.log(`✅ ${result.insertedCount} müşteri migrate edildi`);
  }
}

async function migrateOpportunities(db) {
  console.log('📋 Fırsat verilerini migrate ediliyor...');
  
  const opportunitiesCollection = db.collection('opportunities');
  const oldRecordsCollection = db.collection('records');
  
  // Eski kayıt verilerini kontrol et
  const oldRecords = await oldRecordsCollection.find({}).toArray();
  
  console.log(`📊 ${oldRecords.length} eski kayıt bulundu`);
  
  // Kayıtları fırsat olarak migrate et
  if (oldRecords.length > 0) {
    const migratedRecords = [];
    
    for (const record of oldRecords) {
      // Önce müşteri bilgilerini oluştur
      const customerData = {
        ad: record.adi || '',
        soyad: record.soyadi || '',
        yabanci_kimlik_no: record.yabanci_kimlik_no || null,
        uyrugu: record.uyrugu || null,
        cinsiyeti: record.cinsiyeti || 'Erkek',
        telefon_no: record.telefon || null,
        eposta: record.eposta || null,
        dogum_tarihi: record.dogum_tarihi || null,
        adres: record.adres || null,
        createdAt: record.createdAt || new Date(),
        updatedAt: record.updatedAt || new Date()
      };
      
      // Müşteriyi ekle ve ID'sini al
      const customerResult = await db.collection('customers').insertOne(customerData);
      
      migratedRecords.push({
        musteri: customerResult.insertedId,
        islem_turu: 'ikamet_izni', // Tüm kayıtlar ikamet izni
        durum: mapDurum(record.durum || 'beklemede'),
        olusturma_tarihi: record.createdAt || new Date(),
        guncelleme_tarihi: record.updatedAt || new Date(),
        aciklamalar: [],
        ucretler: [],
        pdf_dosyalari: record.photo ? [record.photo] : [],
        detaylar: {
          kayit_ili: record.kayit_ili || null,
          yapilan_islem: record.yapilan_islem || null,
          ikamet_turu: record.ikamet_turu || null,
          kayit_tarihi: record.kayit_tarihi || null,
          kayit_numarasi: record.kayit_numarasi || null,
          baba_adi: record.baba_adi || null,
          anne_adi: record.anne_adi || null,
          dogum_yeri: record.dogum_yeri || null,
          medeni_durumu: record.medeni_durumu || null,
          gecerlilik_tarihi: record.gecerlilik_tarihi || null
        }
      });
    }
    
    const result = await opportunitiesCollection.insertMany(migratedRecords);
    console.log(`✅ ${result.insertedCount} kayıt fırsat olarak migrate edildi`);
  }
}

async function migrateUsers(db) {
  console.log('👤 Kullanıcı verilerini migrate ediliyor...');
  
  const usersCollection = db.collection('users');
  const oldUsersCollection = db.collection('users_old');
  
  // Eski kullanıcı verilerini kontrol et
  const oldUsers = await oldUsersCollection.find({}).toArray();
  console.log(`📊 ${oldUsers.length} eski kullanıcı bulundu`);
  
  if (oldUsers.length === 0) {
    console.log('ℹ️ Eski kullanıcı verisi bulunamadı, atlanıyor...');
    return;
  }
  
  // Yeni formata dönüştür
  const migratedUsers = oldUsers.map(user => ({
    email: user.email,
    name: user.name || user.ad || user.firstName || '',
    password: user.password,
    status: mapUserStatus(user.status || user.durum),
    image: user.image || user.photo || null,
    googleId: user.googleId || user.google_id || null,
    role: user.role || 'user',
    createdAt: user.createdAt || user.created_at || new Date(),
    updatedAt: user.updatedAt || user.updated_at || new Date()
  }));
  
  // Yeni verileri ekle
  if (migratedUsers.length > 0) {
    const result = await usersCollection.insertMany(migratedUsers);
    console.log(`✅ ${result.insertedCount} kullanıcı migrate edildi`);
  }
}

// Yardımcı fonksiyonlar
function mapIslemTuru(oldType) {
  const typeMap = {
    'calisma': 'calisma_izni',
    'work': 'calisma_izni',
    'work_permit': 'calisma_izni',
    'ikamet': 'ikamet_izni',
    'residence': 'ikamet_izni',
    'residence_permit': 'ikamet_izni',
    'diger': 'diger',
    'other': 'diger',
    'other_process': 'diger'
  };
  
  return typeMap[oldType?.toLowerCase()] || 'diger';
}

function mapDurum(oldStatus) {
  const statusMap = {
    'beklemede': 'beklemede',
    'pending': 'beklemede',
    'waiting': 'beklemede',
    'islemde': 'islemde',
    'processing': 'islemde',
    'in_progress': 'islemde',
    'onaylandi': 'onaylandi',
    'approved': 'onaylandi',
    'reddedildi': 'reddedildi',
    'rejected': 'reddedildi',
    'tamamlandi': 'tamamlandi',
    'completed': 'tamamlandi',
    'iptal_edildi': 'iptal_edildi',
    'cancelled': 'iptal_edildi'
  };
  
  return statusMap[oldStatus?.toLowerCase()] || 'beklemede';
}

function mapUserStatus(oldStatus) {
  const statusMap = {
    'active': 'active',
    'aktif': 'active',
    'inactive': 'inactive',
    'pasif': 'inactive',
    'pending': 'pending',
    'beklemede': 'pending'
  };
  
  return statusMap[oldStatus?.toLowerCase()] || 'pending';
}

function mapDetaylar(record) {
  // Eski alanları yeni detaylar yapısına dönüştür
  const detaylar = {};
  
  // Çalışma izni alanları
  if (record.isveren) detaylar.isveren = record.isveren;
  if (record.pozisyon) detaylar.pozisyon = record.pozisyon;
  if (record.maas) detaylar.maas = record.maas;
  if (record.calisma_saati) detaylar.calisma_saati = record.calisma_saati;
  if (record.is_baslama_tarihi) detaylar.is_baslama_tarihi = record.is_baslama_tarihi;
  
  // İkamet izni alanları
  if (record.yapilan_islem) detaylar.yapilan_islem = record.yapilan_islem;
  if (record.ikamet_turu) detaylar.ikamet_turu = record.ikamet_turu;
  if (record.kayit_tarihi) detaylar.kayit_tarihi = record.kayit_tarihi;
  if (record.kayit_numarasi) detaylar.kayit_numarasi = record.kayit_numarasi;
  if (record.gecerlilik_tarihi) detaylar.gecerlilik_tarihi = record.gecerlilik_tarihi;
  
  // Diğer işlem alanları
  if (record.islem_adi) detaylar.islem_adi = record.islem_adi;
  if (record.baslama_tarihi) detaylar.baslama_tarihi = record.baslama_tarihi;
  if (record.bitis_tarihi) detaylar.bitis_tarihi = record.bitis_tarihi;
  if (record.aciklama) detaylar.aciklama = record.aciklama;
  if (record.notlar) detaylar.notlar = record.notlar;
  
  return detaylar;
}

// Script'i çalıştır
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('🎉 Migration başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration başarısız:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
