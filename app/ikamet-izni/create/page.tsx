"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CustomerList } from "@/components/CustomerList"
import { ICustomer } from "@/types/Customer"
import { FileUploadField } from "@/components/fields/FileUploadField"
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, X } from "lucide-react"

// İkamet izni form verileri
interface IkametIzniFormData {
  musteri_id: string;
  kayit_ili: string;
  yapilan_islem: string;
  ikamet_turu: string;
  kayit_tarihi: string;
  kayit_numarasi: string;
  gecerlilik_tarihi: string;
  randevu_tarihi: string;
  pdf_dosya?: File;
  ucretler: Array<{
    miktar: number;
    para_birimi: string;
    aciklama: string;
    odeme_durumu: string;
  }>;
  aciklamalar: Array<{
    baslik: string;
    icerik: string;
    onem_derecesi: string;
  }>;
}

// Stepper adımları
const steps = [
  { id: 1, title: "Müşteri Seçimi", icon: "👤" },
  { id: 2, title: "İkamet Bilgileri & PDF", icon: "🏠" },
  { id: 3, title: "Ücretler & Açıklamalar", icon: "💰" },
  { id: 4, title: "Önizleme & Onay", icon: "✅" }
];

export default function CreateIkametIzniPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  
  // Form verileri
  const [formData, setFormData] = useState<IkametIzniFormData>({
    musteri_id: "",
    kayit_ili: "",
    yapilan_islem: "",
    ikamet_turu: "",
    kayit_tarihi: "",
    kayit_numarasi: "",
    gecerlilik_tarihi: "",
    randevu_tarihi: "",
    pdf_dosya: undefined,
    ucretler: [],
    aciklamalar: []
  });

  // Müşteri arama
  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setCustomers([]);
      setShowCustomerList(false);
      return;
    }
    
    setIsLoadingCustomers(true);
    
    try {
      const response = await fetch(`/api/customers/select?search=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setCustomers(data.data || []);
          setShowCustomerList(true);
        } else {
          console.error("Müşteri arama hatası:", data.message);
          setCustomers([]);
        }
      } else {
        console.error("Müşteri arama hatası:", response.status);
        setCustomers([]);
      }
    } catch (error) {
      console.error("Müşteri arama hatası:", error);
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Müşteri seçimi
  const handleCustomerSelect = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, musteri_id: customer._id as string }));
    setShowCustomerList(false);
    setSearchInputValue(""); // Input'u temizle
  };

  // Form alanı güncelleme
  const updateFormField = (field: keyof IkametIzniFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Ücret ekleme
  const addUcret = () => {
    setFormData(prev => ({
      ...prev,
      ucretler: [...prev.ucretler, {
        miktar: 0,
        para_birimi: "TRY",
        aciklama: "",
        odeme_durumu: "beklemede"
      }]
    }));
  };

  // Ücret silme
  const removeUcret = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ucretler: prev.ucretler.filter((_, i) => i !== index)
    }));
  };

  // Ücret güncelleme
  const updateUcret = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ucretler: prev.ucretler.map((ucret, i) => 
        i === index ? { ...ucret, [field]: value } : ucret
      )
    }));
  };

  // Açıklama ekleme
  const addAciklama = () => {
    setFormData(prev => ({
      ...prev,
      aciklamalar: [...prev.aciklamalar, {
        baslik: "",
        icerik: "",
        onem_derecesi: "orta"
      }]
    }));
  };

  // Açıklama silme
  const removeAciklama = (index: number) => {
    setFormData(prev => ({
      ...prev,
      aciklamalar: prev.aciklamalar.filter((_, i) => i !== index)
    }));
  };

  // Açıklama güncelleme
  const updateAciklama = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      aciklamalar: prev.aciklamalar.map((aciklama, i) => 
        i === index ? { ...aciklama, [field]: value } : aciklama
      )
    }));
  };

  // Sonraki adım
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Önceki adım
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form gönderme
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // FormData oluştur (PDF için)
      const formDataToSend = new FormData();
      
      // Temel veriler
      formDataToSend.append('musteri_id', formData.musteri_id);
      formDataToSend.append('islem_turu', 'ikamet_izni');
      
      // Detaylar
      const detaylar = {
        kayit_ili: formData.kayit_ili,
        yapilan_islem: formData.yapilan_islem,
        ikamet_turu: formData.ikamet_turu,
        kayit_tarihi: formData.kayit_tarihi,
        kayit_numarasi: formData.kayit_numarasi,
        gecerlilik_tarihi: formData.gecerlilik_tarihi,
        randevu_tarihi: formData.randevu_tarihi
      };
      
      formDataToSend.append('detaylar', JSON.stringify(detaylar));
      
      // PDF dosyası
      if (formData.pdf_dosya) {
        formDataToSend.append('pdf_dosya', formData.pdf_dosya);
      }
      
      // Açıklamalar ve ücretler
      formDataToSend.append('aciklamalar', JSON.stringify(formData.aciklamalar));
      formDataToSend.append('ucretler', JSON.stringify(formData.ucretler));

      const response = await fetch("/api/opportunities", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "İkamet izni oluşturulurken bir hata oluştu");
      }

      toast.success("İkamet izni başarıyla oluşturuldu");
      router.push("/dashboard");
    } catch (error) {
      console.error("İkamet izni oluşturma hatası:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("İkamet izni oluşturulurken bir hata oluştu");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                İkamet İzni Oluştur
              </h1>
              <p className="text-sm text-gray-600">
                Yeni ikamet izni fırsatı oluşturun
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{steps[currentStep - 1].icon}</span>
                  {steps[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="customer-search">Müşteri Ara</Label>
                      <div className="relative mt-2">
                        <Input
                          id="customer-search"
                          placeholder="Müşteri adı, email veya telefon ile ara..."
                          value={selectedCustomer ? `${selectedCustomer.ad} ${selectedCustomer.soyad}` : searchInputValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchInputValue(value);
                            
                            if (value === "") {
                              setSelectedCustomer(null);
                              updateFormField("musteri_id", "");
                              setShowCustomerList(false);
                            } else {
                              searchCustomers(value);
                            }
                          }}
                          onFocus={() => {
                            if (selectedCustomer) {
                              setSelectedCustomer(null);
                              updateFormField("musteri_id", "");
                              setSearchInputValue("");
                            }
                          }}
                        />
                        {showCustomerList && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            <CustomerList
                              customers={customers}
                              onCustomerSelect={handleCustomerSelect}
                              isLoading={isLoadingCustomers}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        En az 2 karakter yazarak müşteri arayabilirsiniz
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kayit_ili">Kayıt İli *</Label>
                        <Select value={formData.kayit_ili} onValueChange={(value) => updateFormField("kayit_ili", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="İl seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="İstanbul">İstanbul</SelectItem>
                            <SelectItem value="Ankara">Ankara</SelectItem>
                            <SelectItem value="İzmir">İzmir</SelectItem>
                            <SelectItem value="Bursa">Bursa</SelectItem>
                            <SelectItem value="Antalya">Antalya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="yapilan_islem">Yapılan İşlem *</Label>
                        <Select value={formData.yapilan_islem} onValueChange={(value) => updateFormField("yapilan_islem", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="İşlem seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="İlk Kayıt">İlk Kayıt</SelectItem>
                            <SelectItem value="Adres Değişikliği">Adres Değişikliği</SelectItem>
                            <SelectItem value="Yenileme">Yenileme</SelectItem>
                            <SelectItem value="Kayıp/Çalınma">Kayıp/Çalınma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="ikamet_turu">İkamet Türü *</Label>
                        <Select value={formData.ikamet_turu} onValueChange={(value) => updateFormField("ikamet_turu", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tür seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Süresiz">Süresiz</SelectItem>
                            <SelectItem value="Süreli">Süreli</SelectItem>
                            <SelectItem value="Öğrenci">Öğrenci</SelectItem>
                            <SelectItem value="Çalışma">Çalışma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="kayit_tarihi">Kayıt Tarihi *</Label>
                        <Input
                          type="date"
                          value={formData.kayit_tarihi}
                          onChange={(e) => updateFormField("kayit_tarihi", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="kayit_numarasi">Kayıt Numarası</Label>
                        <Input
                          placeholder="Kayıt numarası"
                          value={formData.kayit_numarasi}
                          onChange={(e) => updateFormField("kayit_numarasi", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="kayit_numarasi">Kayıt Numarası *</Label>
                        <Input
                          placeholder="Kayıt numarasını girin"
                          value={formData.kayit_numarasi}
                          onChange={(e) => updateFormField("kayit_numarasi", e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          İkamet izni kayıt numarası (zorunlu)
                        </p>
                      </div>
                    </div>

                    {/* PDF Yükleme */}
                    <div>
                      <Label htmlFor="pdf_dosya">PDF Dosyası (İsteğe Bağlı)</Label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-4">
                          İkamet izni ile ilgili PDF dosyası yükleyebilirsiniz
                        </p>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateFormField("pdf_dosya", file);
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.pdf_dosya && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{formData.pdf_dosya.name}</span>
                              <button
                                type="button"
                                onClick={() => updateFormField("pdf_dosya", undefined)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Boyut: {(formData.pdf_dosya.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gecerlilik_tarihi">Geçerlilik Tarihi</Label>
                        <Input
                          type="date"
                          value={formData.gecerlilik_tarihi}
                          onChange={(e) => updateFormField("gecerlilik_tarihi", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="randevu_tarihi">Randevu Tarihi</Label>
                        <Input
                          type="date"
                          value={formData.randevu_tarihi}
                          onChange={(e) => updateFormField("randevu_tarihi", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Ücretler */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Ücretler</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addUcret}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ücret Ekle
                        </Button>
                      </div>

                      {formData.ucretler.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                          <p>Henüz ücret eklenmemiş</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.ucretler.map((ucret, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium">Ücret #{index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeUcret(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <Label>Miktar</Label>
                                    <Input
                                      type="number"
                                      value={ucret.miktar || ""}
                                      onChange={(e) => updateUcret(index, "miktar", parseFloat(e.target.value) || 0)}
                                      placeholder="0"
                                    />
                                  </div>

                                  <div>
                                    <Label>Para Birimi</Label>
                                    <Select value={ucret.para_birimi} onValueChange={(value) => updateUcret(index, "para_birimi", value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="TRY">TRY</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Ödeme Durumu</Label>
                                    <Select value={ucret.odeme_durumu} onValueChange={(value) => updateUcret(index, "odeme_durumu", value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="beklemede">
                                          <Badge variant="secondary">Beklemede</Badge>
                                        </SelectItem>
                                        <SelectItem value="odendi">
                                          <Badge variant="default">Ödendi</Badge>
                                        </SelectItem>
                                        <SelectItem value="iptal_edildi">
                                          <Badge variant="destructive">İptal</Badge>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Açıklama</Label>
                                    <Input
                                      value={ucret.aciklama}
                                      onChange={(e) => updateUcret(index, "aciklama", e.target.value)}
                                      placeholder="Ücret açıklaması"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Açıklamalar */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Açıklamalar</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addAciklama}>
                          <Plus className="h-4 w-4 mr-2" />
                          Açıklama Ekle
                        </Button>
                      </div>

                      {formData.aciklamalar.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                          <p>Henüz açıklama eklenmemiş</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.aciklamalar.map((aciklama, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium">Açıklama #{index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAciklama(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <Label>Başlık</Label>
                                    <Input
                                      value={aciklama.baslik}
                                      onChange={(e) => updateAciklama(index, "baslik", e.target.value)}
                                      placeholder="Açıklama başlığı"
                                    />
                                  </div>

                                  <div>
                                    <Label>Önem Derecesi</Label>
                                    <Select value={aciklama.onem_derecesi} onValueChange={(value) => updateAciklama(index, "onem_derecesi", value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="dusuk">
                                          <Badge variant="secondary">Düşük</Badge>
                                        </SelectItem>
                                        <SelectItem value="orta">
                                          <Badge variant="default">Orta</Badge>
                                        </SelectItem>
                                        <SelectItem value="yuksek">
                                          <Badge variant="destructive">Yüksek</Badge>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label>İçerik</Label>
                                  <Textarea
                                    value={aciklama.icerik}
                                    onChange={(e) => updateAciklama(index, "icerik", e.target.value)}
                                    placeholder="Açıklama içeriği..."
                                    rows={3}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Önizleme</h3>
                      <p className="text-sm text-blue-700">
                        Tüm bilgileri kontrol edin ve onaylayın.
                      </p>
                    </div>

                    {/* Müşteri Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Müşteri Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedCustomer ? (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {selectedCustomer.ad.charAt(0)}{selectedCustomer.soyad.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{selectedCustomer.ad} {selectedCustomer.soyad}</p>
                              <p className="text-sm text-gray-600">{selectedCustomer.eposta}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-red-600">Müşteri seçilmemiş</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* İkamet Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">İkamet Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Kayıt İli</Label>
                            <p>{formData.kayit_ili || "Belirtilmemiş"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Yapılan İşlem</Label>
                            <p>{formData.yapilan_islem || "Belirtilmemiş"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">İkamet Türü</Label>
                            <p>{formData.ikamet_turu || "Belirtilmemiş"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Kayıt Tarihi</Label>
                            <p>{formData.kayit_tarihi || "Belirtilmemiş"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Sıra No</Label>
                            <p>
                              <span className="text-gray-500">Otomatik atanacak</span>
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Kayıt Numarası</Label>
                            <p>{formData.kayit_numarasi || "Belirtilmemiş"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ücretler Özeti */}
                    {formData.ucretler.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Ücretler ({formData.ucretler.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {formData.ucretler.map((ucret, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span>{ucret.aciklama || `Ücret ${index + 1}`}</span>
                                <span className="font-medium">{ucret.miktar} {ucret.para_birimi}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* PDF Dosyası Özeti */}
                    {formData.pdf_dosya && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">PDF Dosyası</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{formData.pdf_dosya.name}</p>
                              <p className="text-xs text-gray-500">
                                {(formData.pdf_dosya.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Açıklamalar Özeti */}
                    {formData.aciklamalar.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Açıklamalar ({formData.aciklamalar.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {formData.aciklamalar.map((aciklama, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded">
                                <p className="font-medium">{aciklama.baslik}</p>
                                <p className="text-sm text-gray-600">{aciklama.icerik}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>İlerleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        currentStep >= step.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`text-sm ${
                        currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tamamlanan</span>
                      <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Önceki
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              Sonraki
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  İkamet İzni Oluştur
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 