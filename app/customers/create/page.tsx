"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPhotoUpload } from "@/components/CustomerPhotoUpload";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    yabanci_kimlik_no: "",
    uyrugu: "",
    cinsiyeti: "" as "Erkek" | "Kadın" | "",
    telefon_no: "",
    eposta: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const validateField = (field: string, value: string) => {
    let error = "";
    
    switch (field) {
      case 'ad':
        if (!value.trim()) {
          error = "Ad alanı zorunludur";
        } else if (value.trim().length < 2) {
          error = "Ad en az 2 karakter olmalıdır";
        }
        break;
      case 'soyad':
        if (!value.trim()) {
          error = "Soyad alanı zorunludur";
        } else if (value.trim().length < 2) {
          error = "Soyad en az 2 karakter olmalıdır";
        }
        break;
      case 'cinsiyeti':
        if (!value) {
          error = "Cinsiyet seçimi zorunludur";
        }
        break;
      case 'yabanci_kimlik_no':
        if (value && value.length < 5) {
          error = "Yabancı kimlik numarası en az 5 karakter olmalıdır";
        }
        break;
      case 'telefon_no':
        if (value) {
          const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            error = "Geçerli bir telefon numarası giriniz";
          }
        }
        break;
      case 'eposta':
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Geçerli bir email adresi giriniz";
          }
        }
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Tüm alanları kontrol et
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Alan dokunuldu olarak işaretle
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Anlık validasyon yap
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleBlur = (field: string) => {
    // Alan dokunuldu olarak işaretle
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validasyon yap
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tüm alanları dokunulmuş olarak işaretle
    const allFields = Object.keys(formData);
    const newTouched: {[key: string]: boolean} = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    if (!validateForm()) {
      toast.error("Lütfen form hatalarını düzeltin");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Form verilerini ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value);
        }
      });

      // Fotoğraf varsa ekle
      if (photo) {
        submitData.append('photo', photo);
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Müşteri başarıyla oluşturuldu!");
        router.push('/customers');
      } else {
        toast.error(result.message || "Müşteri oluşturulamadı");
      }
    } catch (error) {
      console.error('Müşteri oluşturma hatası:', error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 w-full">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Geri Dön
          </button>
          <div className="ml-4">
            <h1 className="text-xl font-semibold">
              Yeni Müşteri Oluştur
            </h1>
            <p className="text-sm text-muted-foreground">
              Müşteri bilgilerini doldurarak yeni bir müşteri kaydı oluşturun
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 w-full">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Müşteri Bilgileri
              </CardTitle>
              <CardDescription>
                Müşteri bilgilerini doldurarak yeni bir müşteri kaydı oluşturun
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Ad Soyad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad">Ad *</Label>
                    <Input
                      id="ad"
                      value={formData.ad}
                      onChange={(e) => handleInputChange('ad', e.target.value)}
                      onBlur={() => handleBlur('ad')}
                      placeholder="Müşteri adı"
                      required
                    />
                    {touched.ad && errors.ad && <p className="text-sm text-red-500">{errors.ad}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="soyad">Soyad *</Label>
                    <Input
                      id="soyad"
                      value={formData.soyad}
                      onChange={(e) => handleInputChange('soyad', e.target.value)}
                      onBlur={() => handleBlur('soyad')}
                      placeholder="Müşteri soyadı"
                      required
                    />
                    {touched.soyad && errors.soyad && <p className="text-sm text-red-500">{errors.soyad}</p>}
                  </div>
                </div>

                {/* Yabancı Kimlik No ve Uyruk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yabanci_kimlik_no">Yabancı Kimlik No</Label>
                    <Input
                      id="yabanci_kimlik_no"
                      value={formData.yabanci_kimlik_no}
                      onChange={(e) => handleInputChange('yabanci_kimlik_no', e.target.value)}
                      onBlur={() => handleBlur('yabanci_kimlik_no')}
                      placeholder="Yabancı kimlik numarası"
                    />
                    {touched.yabanci_kimlik_no && errors.yabanci_kimlik_no && <p className="text-sm text-red-500">{errors.yabanci_kimlik_no}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="uyrugu">Uyruk</Label>
                    <Input
                      id="uyrugu"
                      value={formData.uyrugu}
                      onChange={(e) => handleInputChange('uyrugu', e.target.value)}
                      onBlur={() => handleBlur('uyrugu')}
                      placeholder="Uyruk"
                    />
                    {touched.uyrugu && errors.uyrugu && <p className="text-sm text-red-500">{errors.uyrugu}</p>}
                  </div>
                </div>

                {/* Cinsiyet */}
                <div className="space-y-2">
                  <Label htmlFor="cinsiyeti">Cinsiyet *</Label>
                  <Select
                    value={formData.cinsiyeti}
                    onValueChange={(value) => handleInputChange('cinsiyeti', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Erkek">Erkek</SelectItem>
                      <SelectItem value="Kadın">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.cinsiyeti && errors.cinsiyeti && <p className="text-sm text-red-500">{errors.cinsiyeti}</p>}
                </div>

                {/* İletişim Bilgileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefon_no">Telefon No</Label>
                    <Input
                      id="telefon_no"
                      value={formData.telefon_no}
                      onChange={(e) => handleInputChange('telefon_no', e.target.value)}
                      onBlur={() => handleBlur('telefon_no')}
                      placeholder="05XX XXX XX XX"
                      type="tel"
                    />
                    {touched.telefon_no && errors.telefon_no && <p className="text-sm text-red-500">{errors.telefon_no}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eposta">E-posta</Label>
                    <Input
                      id="eposta"
                      value={formData.eposta}
                      onChange={(e) => handleInputChange('eposta', e.target.value)}
                      onBlur={() => handleBlur('eposta')}
                      placeholder="ornek@email.com"
                      type="email"
                    />
                    {touched.eposta && errors.eposta && <p className="text-sm text-red-500">{errors.eposta}</p>}
                  </div>
                </div>

                {/* Fotoğraf Yükleme */}
                <CustomerPhotoUpload
                  onFileSelect={setPhoto}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                />

                {/* Butonlar */}
                <div className="flex gap-3 pt-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Oluşturuluyor..." : "Müşteri Oluştur"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 