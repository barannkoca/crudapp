// Ödeme durumu yardımcı fonksiyonları

export const getPaymentStatusLabel = (status: string): string => {
  switch (status) {
    case 'toplam_ucret':
      return 'Toplam Ücret';
    case 'alinan_ucret':
      return 'Alınan Ücret';
    case 'gider':
      return 'Gider';
    // Eski sistem uyumluluğu için
    case 'beklemede':
      return 'Beklemede';
    case 'odendi':
      return 'Ödendi';
    case 'iptal_edildi':
      return 'İptal';
    default:
      return status;
  }
};

export const getPaymentStatusDescription = (status: string): string => {
  switch (status) {
    case 'toplam_ucret':
      return 'Anlaşılan toplam ücret';
    case 'alinan_ucret':
      return 'Ödenen miktar';
    case 'gider':
      return 'Masraf/gider';
    // Eski sistem uyumluluğu için
    case 'beklemede':
      return 'Ödeme bekleniyor';
    case 'odendi':
      return 'Ödeme tamamlandı';
    case 'iptal_edildi':
      return 'Ödeme iptal edildi';
    default:
      return '';
  }
};

export const getPaymentStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'toplam_ucret':
      return 'outline'; // Mavi outline
    case 'alinan_ucret':
      return 'default'; // Yeşil
    case 'gider':
      return 'destructive'; // Kırmızı
    // Eski sistem uyumluluğu için
    case 'beklemede':
      return 'secondary';
    case 'odendi':
      return 'default';
    case 'iptal_edildi':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'toplam_ucret':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'alinan_ucret':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'gider':
      return 'bg-red-100 text-red-800 border-red-200';
    // Eski sistem uyumluluğu için
    case 'beklemede':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'odendi':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'iptal_edildi':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
