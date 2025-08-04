"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPhotoUpload } from "@/components/CustomerPhotoUpload";
import { toast } from "sonner";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ad || !formData.soyad || !formData.cinsiyeti) {
      toast.error("Ad, soyad ve cinsiyet alanları zorunludur");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-6"
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Yeni Müşteri Oluştur
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
                    placeholder="Müşteri adı"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soyad">Soyad *</Label>
                  <Input
                    id="soyad"
                    value={formData.soyad}
                    onChange={(e) => handleInputChange('soyad', e.target.value)}
                    placeholder="Müşteri soyadı"
                    required
                  />
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
                    placeholder="Yabancı kimlik numarası"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uyrugu">Uyruk</Label>
                  <Input
                    id="uyrugu"
                    value={formData.uyrugu}
                    onChange={(e) => handleInputChange('uyrugu', e.target.value)}
                    placeholder="Uyruk"
                  />
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
              </div>

              {/* İletişim Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefon_no">Telefon No</Label>
                  <Input
                    id="telefon_no"
                    value={formData.telefon_no}
                    onChange={(e) => handleInputChange('telefon_no', e.target.value)}
                    placeholder="05XX XXX XX XX"
                    type="tel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eposta">E-posta</Label>
                  <Input
                    id="eposta"
                    value={formData.eposta}
                    onChange={(e) => handleInputChange('eposta', e.target.value)}
                    placeholder="ornek@email.com"
                    type="email"
                  />
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
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
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
    </motion.div>
  );
} 