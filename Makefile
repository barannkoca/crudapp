# Migration Makefile
# Bu Makefile migration işlemlerini otomatize eder

.PHONY: help migrate clean check setup all

# Varsayılan hedef
help:
	@echo "🚀 Migration Makefile - Kullanılabilir Komutlar:"
	@echo ""
	@echo "📋 Temel Komutlar:"
	@echo "  make all          - Tüm migration işlemlerini sırayla çalıştır"
	@echo "  make setup        - Test verilerini import et"
	@echo "  make migrate      - Fotoğraf ve PDF'leri migrate et"
	@echo "  make check        - Migration sonuçlarını kontrol et"
	@echo "  make clean        - Migration log dosyalarını temizle"
	@echo ""
	@echo "🔧 Yardımcı Komutlar:"
	@echo "  make help         - Bu yardım mesajını göster"
	@echo "  make status       - Mevcut durumu kontrol et"
	@echo "  make backup       - Veritabanı yedeği al"
	@echo "  make restore      - Veritabanı yedeğini geri yükle"
	@echo ""
	@echo "📊 Detaylı Kontroller:"
	@echo "  make check-photos - Sadece fotoğrafları kontrol et"
	@echo "  make check-pdfs   - Sadece PDF'leri kontrol et"
	@echo ""

# Ana migration süreci
all: setup migrate check
	@echo "🎉 Tüm migration işlemleri tamamlandı!"

# Test verilerini import et
setup:
	@echo "📥 Test verilerini import ediliyor..."
	@node scripts/import-test-data.js
	@echo "✅ Test verileri başarıyla import edildi"

# Fotoğraf ve PDF'leri migrate et
migrate:
	@echo "🔄 Fotoğraf ve PDF'ler migrate ediliyor..."
	@node scripts/migrate-photos-and-pdfs.js
	@echo "✅ Migration tamamlandı"

# Migration sonuçlarını kontrol et
check:
	@echo "🔍 Migration sonuçları kontrol ediliyor..."
	@node scripts/check-migration-results.js
	@echo "✅ Kontrol tamamlandı"

# Sadece fotoğrafları kontrol et
check-photos:
	@echo "📸 Fotoğraflar kontrol ediliyor..."
	@node scripts/check-photos.js

# Sadece PDF'leri kontrol et
check-pdfs:
	@echo "📄 PDF'ler kontrol ediliyor..."
	@node scripts/check-migration-results.js | grep -A 20 "PDF"

# Mevcut durumu kontrol et
status:
	@echo "📊 Mevcut durum kontrol ediliyor..."
	@node scripts/check-migration-results.js | head -20

# Veritabanı yedeği al
backup:
	@echo "💾 Veritabanı yedeği alınıyor..."
	@mkdir -p backups
	@mongodump --uri="$(shell grep MONGODB_URI .env | cut -d '=' -f2)" --out=backups/$(shell date +%Y%m%d_%H%M%S)
	@echo "✅ Yedek alındı: backups/$(shell date +%Y%m%d_%H%M%S)"

# Veritabanı yedeğini geri yükle
restore:
	@echo "⚠️  Hangi yedeği geri yüklemek istiyorsunuz?"
	@echo "📁 Mevcut yedekler:"
	@ls -la backups/ 2>/dev/null || echo "   Yedek bulunamadı"
	@echo ""
	@echo "Kullanım: make restore-backup BACKUP_DIR=backups/YYYYMMDD_HHMMSS"

# Belirli bir yedeği geri yükle
restore-backup:
	@if [ -z "$(BACKUP_DIR)" ]; then \
		echo "❌ BACKUP_DIR parametresi gerekli"; \
		echo "Kullanım: make restore-backup BACKUP_DIR=backups/YYYYMMDD_HHMMSS"; \
		exit 1; \
	fi
	@if [ ! -d "$(BACKUP_DIR)" ]; then \
		echo "❌ Yedek dizini bulunamadı: $(BACKUP_DIR)"; \
		exit 1; \
	fi
	@echo "🔄 Yedek geri yükleniyor: $(BACKUP_DIR)"
	@mongorestore --uri="$(shell grep MONGODB_URI .env | cut -d '=' -f2)" $(BACKUP_DIR)
	@echo "✅ Yedek geri yüklendi"

# Migration log dosyalarını temizle
clean:
	@echo "🧹 Log dosyaları temizleniyor..."
	@rm -f *.log
	@rm -f migration-*.txt
	@echo "✅ Temizlik tamamlandı"

# Hızlı test (sadece kontrol)
test: check
	@echo "✅ Test tamamlandı"

# Sadece migration (setup olmadan)
migrate-only:
	@echo "🔄 Sadece migration çalıştırılıyor..."
	@node scripts/migrate-photos-and-pdfs.js

# Sadece setup (migration olmadan)
setup-only:
	@echo "📥 Sadece setup çalıştırılıyor..."
	@node scripts/import-test-data.js

# Detaylı rapor
report:
	@echo "📊 Detaylı Migration Raporu"
	@echo "================================"
	@node scripts/check-migration-results.js
	@echo ""
	@echo "📁 Script Dosyaları:"
	@ls -la scripts/
	@echo ""
	@echo "📅 Son Çalıştırma: $(shell date)"

# Geliştirici modu (daha detaylı loglar)
dev: 
	@echo "🔧 Geliştirici modu başlatılıyor..."
	@DEBUG=* node scripts/import-test-data.js
	@DEBUG=* node scripts/migrate-photos-and-pdfs.js
	@DEBUG=* node scripts/check-migration-results.js

# Hızlı reset (temizle ve yeniden başla)
reset: clean all
	@echo "🔄 Sistem sıfırlandı ve yeniden başlatıldı"

# Sadece belirli bir script'i çalıştır
run:
	@if [ -z "$(SCRIPT)" ]; then \
		echo "❌ SCRIPT parametresi gerekli"; \
		echo "Kullanım: make run SCRIPT=script-name"; \
		echo "Örnek: make run SCRIPT=check-migration-results"; \
		exit 1; \
	fi
	@echo "▶️  $(SCRIPT) çalıştırılıyor..."
	@node scripts/$(SCRIPT).js
