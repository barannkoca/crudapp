const mongoose = require('mongoose');

// Test için basit bir audit log şeması
const testAuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'],
    required: true
  },
  resourceType: {
    type: String,
    enum: ['Customer', 'Opportunity', 'User'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Başarısız işlemlerde null olabilir
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const TestAuditLog = mongoose.model('TestAuditLog', testAuditLogSchema);

async function testAuditLog() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ MongoDB\'ye bağlandı');

    // Test 1: Başarılı işlem (resourceId ile)
    const successLog = new TestAuditLog({
      userId: new mongoose.Types.ObjectId(),
      userEmail: 'test@example.com',
      action: 'CREATE',
      resourceType: 'Customer',
      resourceId: new mongoose.Types.ObjectId(),
      success: true
    });
    await successLog.save();
    console.log('✅ Başarılı işlem kaydı oluşturuldu');

    // Test 2: Başarısız işlem (resourceId olmadan)
    const failureLog = new TestAuditLog({
      userId: new mongoose.Types.ObjectId(),
      userEmail: 'test@example.com',
      action: 'CREATE',
      resourceType: 'Customer',
      resourceId: undefined, // Başarısız işlemde resourceId yok
      success: false,
      errorMessage: 'Validation failed'
    });
    await failureLog.save();
    console.log('✅ Başarısız işlem kaydı oluşturuldu');

    // Test 3: Eski hata durumu (string "unknown" ile)
    try {
      const invalidLog = new TestAuditLog({
        userId: new mongoose.Types.ObjectId(),
        userEmail: 'test@example.com',
        action: 'CREATE',
        resourceType: 'Customer',
        resourceId: 'unknown', // Bu artık hata vermemeli
        success: false,
        errorMessage: 'Test error'
      });
      await invalidLog.save();
      console.log('❌ Bu kayıt hata vermeliydi ama kaydedildi');
    } catch (error) {
      console.log('✅ Beklenen hata alındı:', error.message);
    }

    console.log('🎉 Tüm testler tamamlandı!');
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

testAuditLog();
