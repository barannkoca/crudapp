"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IDigerFirsati, FirsatDurumu, ParaBirimi } from '@/types/Opportunity';
import { formatDate } from '@/lib/utils';
import { getPaymentStatusLabel, getPaymentStatusVariant, getPaymentStatusDescription } from '@/lib/payment-utils';
import { UcretDisplayCard } from '@/components/UcretDisplayCard';

export default function DigerIslemlerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<IDigerFirsati | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchOpportunityDetail(params.id as string);
    }
  }, [params.id]);

  const fetchOpportunityDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/opportunities/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data.data);
        setEditData({
          durum: data.data.durum,
          detaylar: { ...data.data.detaylar },
          ucretler: [...(data.data.ucretler || [])],
          aciklamalar: [...(data.data.aciklamalar || [])]
        });
      } else {
        setError('İşlem detayları yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('İşlem detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!opportunity || !editData) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/opportunities/${opportunity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        await fetchOpportunityDetail(opportunity._id!);
        setEditMode(false);
      } else {
        setError('Değişiklikler kaydedilirken hata oluştu');
      }
    } catch (error) {
      setError('Değişiklikler kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const addUcret = () => {
    const newUcret = {
      miktar: 0,
      para_birimi: ParaBirimi.TRY,
      aciklama: '',
      odeme_durumu: 'beklemede' as const
    };
    setEditData({
      ...editData,
      ucretler: [...(editData.ucretler || []), newUcret]
    });
  };

  const updateUcret = (index: number, field: string, value: any) => {
    const updatedUcretler = [...editData.ucretler];
    updatedUcretler[index] = { ...updatedUcretler[index], [field]: value };
    setEditData({ ...editData, ucretler: updatedUcretler });
  };

  const removeUcret = (index: number) => {
    const updatedUcretler = editData.ucretler.filter((_: any, i: number) => i !== index);
    setEditData({ ...editData, ucretler: updatedUcretler });
  };

  const addAciklama = () => {
    const newAciklama = {
      baslik: '',
      icerik: '',
      tarih: new Date(),
      onem_derecesi: 'orta' as const
    };
    setEditData({
      ...editData,
      aciklamalar: [...(editData.aciklamalar || []), newAciklama]
    });
  };

  const updateAciklama = (index: number, field: string, value: any) => {
    const updatedAciklamalar = [...editData.aciklamalar];
    updatedAciklamalar[index] = { ...updatedAciklamalar[index], [field]: value };
    setEditData({ ...editData, aciklamalar: updatedAciklamalar });
  };

  const removeAciklama = (index: number) => {
    const updatedAciklamalar = editData.aciklamalar.filter((_: any, i: number) => i !== index);
    setEditData({ ...editData, aciklamalar: updatedAciklamalar });
  };

  const getStatusColor = (status: FirsatDurumu) => {
    switch (status) {
      case FirsatDurumu.BEKLEMEDE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FirsatDurumu.ONAYLANDI:
        return 'bg-green-100 text-green-800 border-green-200';
      case FirsatDurumu.REDDEDILDI:
        return 'bg-red-100 text-red-800 border-red-200';
      case FirsatDurumu.ISLEMDE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case FirsatDurumu.TAMAMLANDI:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case FirsatDurumu.IPTAL_EDILDI:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIslemDurumColor = (durum?: string) => {
    switch (durum?.toLowerCase()) {
      case 'başvuru':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'onay':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  const formatCurrency = (amount: number) => {
    if (!amount) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const downloadPdf = (pdf: any, index: number) => {
    const link = document.createElement('a');
    link.href = `data:${pdf.contentType};base64,${pdf.data}`;
    link.download = pdf.dosya_adi || `diger-islem-${index + 1}.pdf`;
    link.click();
  };

  const viewPdf = (pdf: any) => {
    try {
      const blob = new Blob([Uint8Array.from(atob(pdf.data), c => c.charCodeAt(0))], {
        type: pdf.contentType
      });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('PDF açılamadı:', error);
      window.open(`data:${pdf.contentType};base64,${pdf.data}`, '_blank');
    }
  };

  const handlePdfUpload = (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      setError('Sadece PDF dosyaları yüklenebilir');
      return;
    }
    setPdfFiles(prev => [...prev, ...pdfFiles]);
  };

  const removePdfFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPdfs = async () => {
    if (!opportunity || pdfFiles.length === 0) return;
    
    try {
      setUploadingPdfs(true);
      const formData = new FormData();
      
      pdfFiles.forEach((file, index) => {
        formData.append(`pdf_${index}`, file);
      });

      const response = await fetch(`/api/opportunities/${opportunity._id}/upload-pdfs`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchOpportunityDetail(opportunity._id!);
        setPdfFiles([]);
      } else {
        setError('PDF dosyaları yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('PDF dosyaları yüklenirken hata oluştu');
    } finally {
      setUploadingPdfs(false);
    }
  };

  const deletePdf = async (pdfIndex: number) => {
    if (!opportunity) return;
    
    try {
      const response = await fetch(`/api/opportunities/${opportunity._id}/delete-pdf/${pdfIndex}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchOpportunityDetail(opportunity._id!);
      } else {
        setError('PDF silinirken hata oluştu');
      }
    } catch (error) {
      setError('PDF silinirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex-1 overflow-auto p-6 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex-1 overflow-auto p-6 w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Hata</h3>
            <p className="text-muted-foreground">{error}</p>
            <Link href="/diger-islemler" className="mt-4 inline-block">
              <Button variant="outline">Geri Dön</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 w-full">
        <div className="flex items-center gap-2">
          <Link 
            href="/diger-islemler"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Diğer İşlemler Listesi
          </Link>
          <div className="ml-4">
            <h1 className="text-xl font-semibold text-purple-700">
              Diğer İşlem Detayları
            </h1>
            <p className="text-sm text-muted-foreground">
              {opportunity.musteri?.ad} {opportunity.musteri?.soyad}
            </p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {editMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select 
                value={editData.durum} 
                onValueChange={(value) => setEditData({...editData, durum: value})}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FirsatDurumu.BEKLEMEDE}>Beklemede</SelectItem>
                  <SelectItem value={FirsatDurumu.ISLEMDE}>İşlemde</SelectItem>
                  <SelectItem value={FirsatDurumu.ONAYLANDI}>Onaylandı</SelectItem>
                  <SelectItem value={FirsatDurumu.REDDEDILDI}>Reddedildi</SelectItem>
                  <SelectItem value={FirsatDurumu.TAMAMLANDI}>Tamamlandı</SelectItem>
                  <SelectItem value={FirsatDurumu.IPTAL_EDILDI}>İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {!editMode && (
            <Badge className={`${getStatusColor(opportunity.durum)}`}>
              {opportunity.durum}
            </Badge>
          )}
          
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditMode(false);
                    setEditData({
                      durum: opportunity.durum,
                      detaylar: { ...opportunity.detaylar },
                      ucretler: [...(opportunity.ucretler || [])],
                      aciklamalar: [...(opportunity.aciklamalar || [])]
                    });
                  }}
                >
                  İptal
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveChanges} 
                  disabled={saving}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setEditMode(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sol Kolon - Ana Bilgiler */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Müşteri Bilgileri */}
              <Card className="border-purple-200 bg-purple-50 border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3 text-purple-700">
                    {opportunity.musteri?.photo && opportunity.musteri.photo.data ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500">
                        <img
                          src={`data:${opportunity.musteri.photo.contentType};base64,${opportunity.musteri.photo.data}`}
                          alt={`${opportunity.musteri.ad} ${opportunity.musteri.soyad}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">
                        {opportunity.musteri?.ad} {opportunity.musteri?.soyad}
                      </div>
                      <div className="text-sm text-purple-600 font-normal">
                        Müşteri Bilgileri
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {opportunity.musteri?.telefon && (
                    <div className="flex justify-between">
                      <span className="font-medium">Telefon:</span>
                      <span>{opportunity.musteri.telefon}</span>
                    </div>
                  )}
                  {opportunity.musteri?.email && (
                    <div className="flex justify-between">
                      <span className="font-medium">E-posta:</span>
                      <span>{opportunity.musteri.email}</span>
                    </div>
                  )}
                  {opportunity.musteri?.kimlik_no && (
                    <div className="flex justify-between">
                      <span className="font-medium">Kimlik No:</span>
                      <span>{opportunity.musteri.kimlik_no}</span>
                    </div>
                  )}
                  {opportunity.musteri?.adres && (
                    <div>
                      <span className="font-medium">Adres:</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {opportunity.musteri.adres}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* İşlem Detayları */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700">İşlem Detayları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">İşlem Adı:</span>
                        {editMode ? (
                          <Input
                            value={editData.detaylar?.islem_adi || ''}
                            onChange={(e) => setEditData({
                              ...editData,
                              detaylar: { ...editData.detaylar, islem_adi: e.target.value }
                            })}
                            placeholder="İşlem adı girin"
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-lg font-semibold">
                            {opportunity.detaylar?.islem_adi || 'Belirtilmemiş'}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">İşlem Durumu:</span>
                        {editMode ? (
                          <Input
                            value={editData.detaylar?.islem_durumu || ''}
                            onChange={(e) => setEditData({
                              ...editData,
                              detaylar: { ...editData.detaylar, islem_durumu: e.target.value }
                            })}
                            placeholder="İşlem durumu girin"
                            className="mt-1"
                          />
                        ) : (
                          <div className="mt-1">
                            <Badge className={`${getIslemDurumColor(opportunity.detaylar?.islem_durumu)}`}>
                              {opportunity.detaylar?.islem_durumu || 'Belirtilmemiş'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">Başlama Tarihi:</span>
                        {editMode ? (
                          <Input
                            type="date"
                            value={editData.detaylar?.baslama_tarihi ? 
                              new Date(editData.detaylar.baslama_tarihi).toISOString().split('T')[0] : ''
                            }
                            onChange={(e) => setEditData({
                              ...editData,
                              detaylar: { ...editData.detaylar, baslama_tarihi: e.target.value }
                            })}
                            className="mt-1"
                          />
                        ) : (
                          opportunity.detaylar?.baslama_tarihi && (
                            <p className="text-lg">{formatDate(opportunity.detaylar.baslama_tarihi)}</p>
                          )
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Bitiş Tarihi:</span>
                        {editMode ? (
                          <Input
                            type="date"
                            value={editData.detaylar?.bitis_tarihi ? 
                              new Date(editData.detaylar.bitis_tarihi).toISOString().split('T')[0] : ''
                            }
                            onChange={(e) => setEditData({
                              ...editData,
                              detaylar: { ...editData.detaylar, bitis_tarihi: e.target.value }
                            })}
                            className="mt-1"
                          />
                        ) : (
                          opportunity.detaylar?.bitis_tarihi && (
                            <p className="text-lg">{formatDate(opportunity.detaylar.bitis_tarihi)}</p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">İşlem Açıklaması:</span>
                    {editMode ? (
                      <Textarea
                        value={editData.detaylar?.aciklama || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          detaylar: { ...editData.detaylar, aciklama: e.target.value }
                        })}
                        placeholder="İşlem açıklaması..."
                        className="mt-2"
                        rows={3}
                      />
                    ) : (
                      opportunity.detaylar?.aciklama && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-purple-700 whitespace-pre-wrap">
                            {opportunity.detaylar.aciklama}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">İşlem Notları:</span>
                    {editMode ? (
                      <Textarea
                        value={editData.detaylar?.notlar || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          detaylar: { ...editData.detaylar, notlar: e.target.value }
                        })}
                        placeholder="İşlem notları..."
                        className="mt-2"
                        rows={3}
                      />
                    ) : (
                      opportunity.detaylar?.notlar && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-purple-700 whitespace-pre-wrap">
                            {opportunity.detaylar.notlar}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Açıklamalar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700 flex justify-between items-center">
                    Açıklamalar
                    {editMode && (
                      <Button
                        size="sm"
                        onClick={addAciklama}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Yeni
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {editData.aciklamalar?.map((aciklama: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        {editMode ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={aciklama.onem_derecesi} 
                                  onValueChange={(value) => updateAciklama(index, 'onem_derecesi', value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="dusuk">Düşük</SelectItem>
                                    <SelectItem value="orta">Orta</SelectItem>
                                    <SelectItem value="yuksek">Yüksek</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeAciklama(index)}
                              >
                                Sil
                              </Button>
                            </div>
                            <Input
                              value={aciklama.baslik || ''}
                              onChange={(e) => updateAciklama(index, 'baslik', e.target.value)}
                              placeholder="Başlık"
                            />
                            <Textarea
                              value={aciklama.icerik || ''}
                              onChange={(e) => updateAciklama(index, 'icerik', e.target.value)}
                              placeholder="Açıklama içeriği"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={aciklama.onem_derecesi === 'yuksek' ? 'destructive' : 
                                              aciklama.onem_derecesi === 'orta' ? 'default' : 'secondary'}>
                                  {aciklama.onem_derecesi} önem
                                </Badge>
                                {aciklama.yazan_kullanici && (
                                  <span className="text-sm text-gray-500">
                                    {aciklama.yazan_kullanici}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(aciklama.tarih)}
                              </span>
                            </div>
                            {aciklama.baslik && (
                              <h4 className="font-semibold mb-1">{aciklama.baslik}</h4>
                            )}
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {aciklama.icerik}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sağ Kolon - Ücretler ve PDF'ler */}
            <div className="space-y-6">

              {/* Ücretler */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700 flex justify-between items-center">
                    Ücretler
                    {editMode && (
                      <Button
                        size="sm"
                        onClick={addUcret}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Yeni
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div className="space-y-3">
                      {editData.ucretler?.map((ucret: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        {editMode ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">Ücret {index + 1}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeUcret(index)}
                              >
                                Sil
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                value={ucret.miktar || ''}
                                onChange={(e) => updateUcret(index, 'miktar', parseFloat(e.target.value) || 0)}
                                placeholder="Miktar"
                              />
                              <Select 
                                value={ucret.para_birimi || ParaBirimi.TRY} 
                                onValueChange={(value) => updateUcret(index, 'para_birimi', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={ParaBirimi.TRY}>TRY</SelectItem>
                                  <SelectItem value={ParaBirimi.USD}>USD</SelectItem>
                                  <SelectItem value={ParaBirimi.EUR}>EUR</SelectItem>
                                  <SelectItem value={ParaBirimi.GBP}>GBP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Input
                              value={ucret.aciklama || ''}
                              onChange={(e) => updateUcret(index, 'aciklama', e.target.value)}
                              placeholder="Açıklama"
                            />
                            <Select 
                              value={ucret.odeme_durumu || 'beklemede'} 
                              onValueChange={(value) => updateUcret(index, 'odeme_durumu', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="toplam_ucret">Toplam Ücret</SelectItem>
                                <SelectItem value="alinan_ucret">Alınan Ücret</SelectItem>
                                <SelectItem value="gider">Gider</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={ucret.odeme_tarihi ? 
                                new Date(ucret.odeme_tarihi).toISOString().split('T')[0] : ''
                              }
                              onChange={(e) => updateUcret(index, 'odeme_tarihi', e.target.value)}
                              placeholder="Ödeme Tarihi"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-lg">
                                {formatCurrency(ucret.miktar)} {ucret.para_birimi}
                              </span>
                              <Badge variant={getPaymentStatusVariant(ucret.odeme_durumu)}>
                                {getPaymentStatusLabel(ucret.odeme_durumu)}
                              </Badge>
                            </div>
                            {ucret.aciklama && (
                              <p className="text-sm text-muted-foreground">{ucret.aciklama}</p>
                            )}
                            {ucret.odeme_tarihi && (
                              <p className="text-xs text-muted-foreground">
                                Ödeme Tarihi: {formatDate(ucret.odeme_tarihi)}
                              </p>
                            )}
                          </>
                        )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <UcretDisplayCard ucretler={editData.ucretler || []} />
                  )}
                </CardContent>
              </Card>

              {/* PDF Dosyaları */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700 flex justify-between items-center">
                    <span>PDF Belgeleri ({(opportunity.pdf_dosyalari?.length || 0) + pdfFiles.length})</span>
                    {editMode && (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files) {
                              handlePdfUpload(Array.from(e.target.files));
                            }
                          }}
                          className="hidden"
                          id="pdf-upload-diger"
                        />
                        <label htmlFor="pdf-upload-diger">
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            asChild
                          >
                            <span className="cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              PDF Seç
                            </span>
                          </Button>
                        </label>
                        {pdfFiles.length > 0 && (
                          <Button
                            size="sm"
                            onClick={uploadPdfs}
                            disabled={uploadingPdfs}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {uploadingPdfs ? 'Yükleniyor...' : 'Yükle'}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Yüklenmeyi bekleyen PDF'ler */}
                      {pdfFiles.length > 0 && (
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50">
                          <h4 className="font-semibold text-purple-700 mb-3">Yüklenmeyi Bekleyen Dosyalar</h4>
                          <div className="space-y-2">
                            {pdfFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm font-medium">{file.name}</span>
                                  <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removePdfFile(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Mevcut PDF'ler */}
                      {opportunity.pdf_dosyalari && opportunity.pdf_dosyalari.map((pdf, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-20 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-lg">
                                  {pdf.dosya_adi || `PDF Belgesi ${index + 1}`}
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadPdf(pdf, index)}
                                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    İndir
                                  </Button>
                                  {editMode && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deletePdf(index)}
                                    >
                                      Sil
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Boyut:</span>
                                  <p>{pdf.dosya_boyutu ? 
                                    (pdf.dosya_boyutu / 1024 / 1024).toFixed(2) + ' MB' : 
                                    (pdf.data.length * 3/4 / 1024 / 1024).toFixed(2) + ' MB'
                                  }</p>
                                </div>
                                <div>
                                  <span className="font-medium">Format:</span>
                                  <p>{pdf.contentType}</p>
                                </div>
                                {pdf.yuklenme_tarihi && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Yüklenme:</span>
                                    <p>{formatDate(pdf.yuklenme_tarihi)}</p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewPdf(pdf)}
                                  className="w-full text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Önizleme
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {!opportunity.pdf_dosyalari?.length && pdfFiles.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>Henüz PDF belgesi yüklenmemiş</p>
                          <p className="text-sm">Düzenle modunda "PDF Seç" butonunu kullanarak belge ekleyebilirsiniz</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}