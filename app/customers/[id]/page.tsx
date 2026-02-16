"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICustomer } from "@/types/Customer";
import { FirsatTuru, IslemTuru, FirsatDurumu } from "@/types/Opportunity";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerPhotoUpload } from "@/components/CustomerPhotoUpload";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [opportunities, setOpportunities] = useState<FirsatTuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcessType, setSelectedProcessType] = useState<IslemTuru | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasOpportunities, setHasOpportunities] = useState(false);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCustomerDetails();
      fetchCustomerOpportunities();
    }
  }, [params.id]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      const result = await response.json();

      if (response.ok) {
        setCustomer(result.data);
        // Sadece edit mode kapalıysa editData'yı güncelle
        if (!editMode) {
          setEditData({
            ad: result.data.ad,
            soyad: result.data.soyad,
            telefon_no: result.data.telefon_no,
            eposta: result.data.eposta,
            dogum_tarihi: result.data.dogum_tarihi,
            adres: result.data.adres
          });
        }
      } else {
        toast.error("Müşteri bilgileri yüklenemedi");
        router.push('/customers');
      }
    } catch (error) {
      console.error('Müşteri detay getirme hatası:', error);
      toast.error("Bir hata oluştu");
    }
  };

  const fetchCustomerOpportunities = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}/opportunities`);
      const result = await response.json();

      if (response.ok) {
        const opportunities = result.data || [];
        setOpportunities(opportunities);
        setHasOpportunities(opportunities.length > 0);
        setOpportunitiesCount(opportunities.length);
      } else {
        console.error('Fırsatlar yüklenemedi');
      }
    } catch (error) {
      console.error('Fırsat getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: FirsatDurumu) => {
    switch (status) {
      case FirsatDurumu.BEKLEMEDE:
        return "bg-yellow-100 text-yellow-800";
      case FirsatDurumu.ISLEMDE:
        return "bg-blue-100 text-blue-800";
      case FirsatDurumu.ONAYLANDI:
        return "bg-green-100 text-green-800";
      case FirsatDurumu.REDDEDILDI:
        return "bg-red-100 text-red-800";
      case FirsatDurumu.TAMAMLANDI:
        return "bg-gray-100 text-gray-800";
      case FirsatDurumu.IPTAL_EDILDI:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProcessTypeText = (type: IslemTuru) => {
    switch (type) {
      case IslemTuru.CALISMA_IZNI:
        return "Çalışma İzni";
      case IslemTuru.IKAMET_IZNI:
        return "İkamet İzni";
      case IslemTuru.DIGER:
        return "Diğer İşlem";
      default:
        return "Bilinmeyen";
    }
  };

  const handleCreateNewProcess = () => {
    if (!selectedProcessType) {
      toast.error("Lütfen bir işlem türü seçin");
      return;
    }

    switch (selectedProcessType) {
      case IslemTuru.CALISMA_IZNI:
        router.push(`/calisma-izni/create?customerId=${params.id}`);
        break;
      case IslemTuru.IKAMET_IZNI:
        router.push(`/ikamet-izni/create?customerId=${params.id}`);
        break;
      case IslemTuru.DIGER:
        router.push(`/diger-islemler/create?customerId=${params.id}`);
        break;
      default:
        toast.error("Geçersiz işlem türü");
    }
    setIsDialogOpen(false);
    setSelectedProcessType(null);
  };

  const saveCustomerChanges = async () => {
    if (!customer || !editData) return;

    try {
      setSaving(true);

      // Eğer fotoğraf seçildiyse FormData kullan
      if (selectedPhoto) {
        const formData = new FormData();
        formData.append('photo', selectedPhoto);
        formData.append('ad', editData.ad);
        formData.append('soyad', editData.soyad);
        formData.append('telefon_no', editData.telefon_no || '');
        formData.append('eposta', editData.eposta || '');
        formData.append('dogum_tarihi', editData.dogum_tarihi || '');
        formData.append('adres', editData.adres || '');

        const response = await fetch(`/api/customers/${customer._id}`, {
          method: 'PUT',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          setCustomer(result.data);
          setEditMode(false);
          setSelectedPhoto(null);
          toast.success("Müşteri bilgileri ve fotoğraf başarıyla güncellendi");
        } else {
          const error = await response.json();
          toast.error(error.message || "Değişiklikler kaydedilirken hata oluştu");
        }
      } else {
        // Fotoğraf yoksa normal JSON gönder
        const response = await fetch(`/api/customers/${customer._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editData)
        });

        if (response.ok) {
          const result = await response.json();
          setCustomer(result.data);
          setEditMode(false);
          toast.success("Müşteri bilgileri başarıyla güncellendi");
        } else {
          const error = await response.json();
          toast.error(error.message || "Değişiklikler kaydedilirken hata oluştu");
        }
      }
    } catch (error) {
      toast.error("Değişiklikler kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/customers/${customer._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Müşteri başarıyla silindi");
        router.push('/customers');
      } else {
        const errorData = await response.json();
        console.error('Silme hatası:', errorData);

        // Hata mesajını daha detaylı göster
        let errorMessage = "Müşteri silinemedi";

        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (response.status === 400) {
          errorMessage = "Bu müşteri ile ilgili işlemler bulunmaktadır. Önce işlemleri tamamlayın veya silin.";
        } else if (response.status === 404) {
          errorMessage = "Müşteri bulunamadı";
        } else if (response.status === 500) {
          errorMessage = "Sunucu hatası oluştu";
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Silme işlemi hatası:', error);
      toast.error("Müşteri silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Müşteri Bulunamadı</h1>
          <Button onClick={() => router.push('/customers')}>
            Müşteri Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {customer.ad} {customer.soyad}
            </h1>
            <p className="text-gray-600">Müşteri Detayları</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Geri Dön
            </Button>
            {editMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditMode(false);
                    setEditData({
                      ad: customer.ad,
                      soyad: customer.soyad,
                      telefon_no: customer.telefon_no,
                      eposta: customer.eposta,
                      dogum_tarihi: customer.dogum_tarihi,
                      adres: customer.adres
                    });
                    setSelectedPhoto(null);
                  }}
                >
                  İptal
                </Button>
                <Button
                  size="sm"
                  onClick={saveCustomerChanges}
                  disabled={saving}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Düzenle
                </Button>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={hasOpportunities}
                      className={hasOpportunities ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {hasOpportunities ? `Sil (${opportunitiesCount} işlem var)` : 'Sil'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {hasOpportunities ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        )}
                        {hasOpportunities ? 'Müşteri Silinemez' : 'Müşteriyi Sil'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {hasOpportunities ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800">Silme İşlemi Engellendi</h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                Bu müşteri ile ilgili <strong>{opportunitiesCount} adet işlem</strong> bulunmaktadır.
                                Müşteriyi silmek için önce tüm işlemleri tamamlamanız veya silmeniz gerekmektedir.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div>
                                <h4 className="text-sm font-medium text-red-800">Dikkat!</h4>
                                <p className="text-sm text-red-700 mt-1">
                                  Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          disabled={deleting}
                        >
                          İptal
                        </Button>
                        {!hasOpportunities && (
                          <Button
                            variant="destructive"
                            onClick={handleDeleteCustomer}
                            disabled={deleting}
                          >
                            {deleting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Siliniyor...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Sil
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Müşteri Bilgileri */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-cyan-200">
                {customer.photo?.data ? (
                  <img
                    src={`data:${customer.photo.contentType};base64,${customer.photo.data}`}
                    alt={`${customer.ad} ${customer.soyad}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editMode && (
              <div className="mb-6">
                <CustomerPhotoUpload
                  onFileSelect={setSelectedPhoto}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={5 * 1024 * 1024}
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ad</label>
                  {editMode ? (
                    <Input
                      value={editData?.ad || ''}
                      onChange={(e) => setEditData({ ...editData, ad: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.ad}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Soyad</label>
                  {editMode ? (
                    <Input
                      value={editData?.soyad || ''}
                      onChange={(e) => setEditData({ ...editData, soyad: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.soyad}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cinsiyet</label>
                  <p className="text-lg text-gray-900">{customer.cinsiyeti}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Uyruk</label>
                  <p className="text-lg text-gray-900">{customer.uyrugu || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Yabancı Kimlik No</label>
                  <p className="text-lg text-gray-900">{customer.yabanci_kimlik_no || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon</label>
                  {editMode ? (
                    <Input
                      value={editData?.telefon_no || ''}
                      onChange={(e) => setEditData({ ...editData, telefon_no: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{customer.telefon_no || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">E-posta</label>
                  {editMode ? (
                    <Input
                      type="email"
                      value={editData?.eposta || ''}
                      onChange={(e) => setEditData({ ...editData, eposta: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{customer.eposta || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Doğum Tarihi</label>
                  {editMode ? (
                    <Input
                      type="date"
                      value={editData?.dogum_tarihi ? new Date(editData.dogum_tarihi).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({ ...editData, dogum_tarihi: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">
                      {customer.dogum_tarihi ? new Date(customer.dogum_tarihi).toLocaleDateString('tr-TR') : '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Adres</label>
                  {editMode ? (
                    <Textarea
                      value={editData?.adres || ''}
                      onChange={(e) => setEditData({ ...editData, adres: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{customer.adres || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İşlemler ve İzinler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>İşlemler ve İzinler</span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    Yeni İşlem Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>İşlem Türü Seçin</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select onValueChange={(value) => setSelectedProcessType(value as IslemTuru)}>
                      <SelectTrigger>
                        <SelectValue placeholder="İşlem türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={IslemTuru.CALISMA_IZNI}>Çalışma İzni</SelectItem>
                        <SelectItem value={IslemTuru.IKAMET_IZNI}>İkamet İzni</SelectItem>
                        <SelectItem value={IslemTuru.DIGER}>Diğer İşlem</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleCreateNewProcess}>
                        Devam Et
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz İşlem Bulunmuyor</h3>
                <p className="text-gray-500 mb-4">Bu müşteri için henüz herhangi bir işlem veya izin kaydı oluşturulmamış.</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      İlk İşlemi Oluştur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>İşlem Türü Seçin</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select onValueChange={(value) => setSelectedProcessType(value as IslemTuru)}>
                        <SelectTrigger>
                          <SelectValue placeholder="İşlem türü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={IslemTuru.CALISMA_IZNI}>Çalışma İzni</SelectItem>
                          <SelectItem value={IslemTuru.IKAMET_IZNI}>İkamet İzni</SelectItem>
                          <SelectItem value={IslemTuru.DIGER}>Diğer İşlem</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          İptal
                        </Button>
                        <Button onClick={handleCreateNewProcess}>
                          Devam Et
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-cyan-50">
                      <TableHead className="font-semibold text-cyan-700">İşlem Türü</TableHead>
                      <TableHead className="font-semibold text-cyan-700">Durum</TableHead>
                      <TableHead className="font-semibold text-cyan-700">Oluşturma Tarihi</TableHead>
                      <TableHead className="font-semibold text-cyan-700">Güncelleme Tarihi</TableHead>
                      <TableHead className="font-semibold text-cyan-700">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opportunity, index) => (
                      <motion.tr
                        key={opportunity._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-cyan-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          const id = (opportunity as any)._id;
                          switch (opportunity.islem_turu) {
                            case IslemTuru.CALISMA_IZNI:
                              router.push(`/calisma-izni/${id}`);
                              break;
                            case IslemTuru.IKAMET_IZNI:
                              router.push(`/ikamet-izni/${id}`);
                              break;
                            case IslemTuru.DIGER:
                              router.push(`/diger-islemler/${id}`);
                              break;
                            default:
                              router.push(`/opportunities/${id}`);
                          }
                        }}
                      >
                        <TableCell className="font-medium">
                          {getProcessTypeText(opportunity.islem_turu)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(opportunity.durum)}>
                            {opportunity.durum}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {opportunity.islem_turu === IslemTuru.IKAMET_IZNI && opportunity.detaylar?.kayit_tarihi
                            ? (() => {
                              try {
                                const dateData = opportunity.detaylar.kayit_tarihi;
                                const date = dateData && typeof dateData === 'object' && (dateData as any).$date
                                  ? new Date((dateData as any).$date)
                                  : new Date(dateData);
                                return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('tr-TR');
                              } catch {
                                return '-';
                              }
                            })()
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-sm">
                          {opportunity.olusturma_tarihi
                            ? (() => {
                              try {
                                const dateData = opportunity.olusturma_tarihi;
                                const date = dateData && typeof dateData === 'object' && (dateData as any).$date
                                  ? new Date((dateData as any).$date)
                                  : new Date(dateData);
                                return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('tr-TR');
                              } catch {
                                return '-';
                              }
                            })()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = (opportunity as any)._id;
                                switch (opportunity.islem_turu) {
                                  case IslemTuru.CALISMA_IZNI:
                                    router.push(`/calisma-izni/${id}`);
                                    break;
                                  case IslemTuru.IKAMET_IZNI:
                                    router.push(`/ikamet-izni/${id}`);
                                    break;
                                  case IslemTuru.DIGER:
                                    router.push(`/diger-islemler/${id}`);
                                    break;
                                  default:
                                    router.push(`/opportunities/${id}`);
                                }
                              }}
                            >
                              Görüntüle
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 