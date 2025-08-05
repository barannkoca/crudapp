"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ICustomer } from "@/types/Customer";
import { IslemTuru, ParaBirimi, FirsatDurumu } from "@/types/Opportunity";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUploadField } from "@/components/fields/FileUploadField";
import { CustomerSelect } from "@/components/CustomerSelect";
import { Badge } from "@/components/ui/badge";

// Ücret interface'i
interface IUcretForm {
  miktar: number;
  para_birimi: ParaBirimi;
  aciklama: string;
  odeme_tarihi?: string;
  odeme_durumu: 'beklemede' | 'odendi' | 'iptal_edildi';
}

// Açıklama interface'i
interface IAciklamaForm {
  baslik: string;
  icerik: string;
  onem_derecesi: 'dusuk' | 'orta' | 'yuksek';
}

interface CreateOpportunityFormTemplateProps {
  islemTuru: IslemTuru;
  title: string;
  description: string;
  onSubmit: (formData: FormData) => Promise<void>;
  children?: React.ReactNode; // Özel alanlar için
}

export function CreateOpportunityFormTemplate({
  islemTuru,
  title,
  description,
  onSubmit,
  children
}: CreateOpportunityFormTemplateProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | undefined>();
  const [ucretler, setUcretler] = useState<IUcretForm[]>([]);
  const [aciklamalar, setAciklamalar] = useState<IAciklamaForm[]>([]);

  // Ücret ekleme
  const addUcret = () => {
    setUcretler([...ucretler, {
      miktar: 0,
      para_birimi: ParaBirimi.TRY,
      aciklama: '',
      odeme_durumu: 'beklemede'
    }]);
  };

  // Ücret silme
  const removeUcret = (index: number) => {
    setUcretler(ucretler.filter((_, i) => i !== index));
  };

  // Ücret güncelleme
  const updateUcret = (index: number, field: keyof IUcretForm, value: any) => {
    const newUcretler = [...ucretler];
    newUcretler[index] = { ...newUcretler[index], [field]: value };
    setUcretler(newUcretler);
  };

  // Açıklama ekleme
  const addAciklama = () => {
    setAciklamalar([...aciklamalar, {
      baslik: '',
      icerik: '',
      onem_derecesi: 'orta'
    }]);
  };

  // Açıklama silme
  const removeAciklama = (index: number) => {
    setAciklamalar(aciklamalar.filter((_, i) => i !== index));
  };

  // Açıklama güncelleme
  const updateAciklama = (index: number, field: keyof IAciklamaForm, value: any) => {
    const newAciklamalar = [...aciklamalar];
    newAciklamalar[index] = { ...newAciklamalar[index], [field]: value };
    setAciklamalar(newAciklamalar);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      toast.error("Lütfen bir müşteri seçin");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Müşteri ID'sini ekle
      formData.append('musteri_id', selectedCustomer._id || '');
      
      // İşlem türünü ekle
      formData.append('islem_turu', islemTuru);
      
      // Ücretleri ekle
      if (ucretler.length > 0) {
        formData.append('ucretler', JSON.stringify(ucretler));
      }
      
      // Açıklamaları ekle
      if (aciklamalar.length > 0) {
        formData.append('aciklamalar', JSON.stringify(aciklamalar));
      }

      await onSubmit(formData);
      
      toast.success("Fırsat başarıyla oluşturuldu");
      router.push("/dashboard");
    } catch (error) {
      console.error("Fırsat oluşturma hatası:", error);
      toast.error("Fırsat oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-6"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Müşteri Seçimi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    Müşteri Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerSelect
                    onCustomerSelect={setSelectedCustomer}
                    selectedCustomer={selectedCustomer}
                    label={`${title} için Müşteri Seçin`}
                  />
                </CardContent>
              </Card>

              {/* Özel Alanlar */}
              {children}

              {/* Ücretler */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246C8.82 10.776 10 11.334 10 12a1 1 0 102 0c0-.666-1.18-1.224-1.676-1.754C9.398 9.765 9 9.01 9 8c0-.99.398-1.765 1.324-2.246C10.82 5.776 12 5.334 12 5a1 1 0 10-2 0v.092z" clipRule="evenodd" />
                      </svg>
                      Ücretler
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addUcret}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Ücret Ekle
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ucretler.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <p>Henüz ücret eklenmemiş</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ucretler.map((ucret, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Ücret #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUcret(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Miktar
                              </label>
                              <Input
                                type="number"
                                value={ucret.miktar}
                                onChange={(e) => updateUcret(index, 'miktar', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Para Birimi
                              </label>
                              <Select
                                value={ucret.para_birimi}
                                onValueChange={(value) => updateUcret(index, 'para_birimi', value as ParaBirimi)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={ParaBirimi.TRY}>TRY - Türk Lirası</SelectItem>
                                  <SelectItem value={ParaBirimi.USD}>USD - Amerikan Doları</SelectItem>
                                  <SelectItem value={ParaBirimi.EUR}>EUR - Euro</SelectItem>
                                  <SelectItem value={ParaBirimi.GBP}>GBP - İngiliz Sterlini</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ödeme Durumu
                              </label>
                              <Select
                                value={ucret.odeme_durumu}
                                onValueChange={(value) => updateUcret(index, 'odeme_durumu', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beklemede">
                                    <Badge variant="secondary">Beklemede</Badge>
                                  </SelectItem>
                                  <SelectItem value="odendi">
                                    <Badge variant="default" className="bg-green-100 text-green-800">Ödendi</Badge>
                                  </SelectItem>
                                  <SelectItem value="iptal_edildi">
                                    <Badge variant="destructive">İptal Edildi</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Açıklama
                            </label>
                            <Input
                              value={ucret.aciklama}
                              onChange={(e) => updateUcret(index, 'aciklama', e.target.value)}
                              placeholder="Ücret açıklaması..."
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Açıklamalar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Açıklamalar
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAciklama}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Açıklama Ekle
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aciklamalar.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>Henüz açıklama eklenmemiş</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aciklamalar.map((aciklama, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Açıklama #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAciklama(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Başlık
                              </label>
                              <Input
                                value={aciklama.baslik}
                                onChange={(e) => updateAciklama(index, 'baslik', e.target.value)}
                                placeholder="Açıklama başlığı..."
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Önem Derecesi
                              </label>
                              <Select
                                value={aciklama.onem_derecesi}
                                onValueChange={(value) => updateAciklama(index, 'onem_derecesi', value)}
                              >
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              İçerik
                            </label>
                            <Textarea
                              value={aciklama.icerik}
                              onChange={(e) => updateAciklama(index, 'icerik', e.target.value)}
                              placeholder="Açıklama içeriği..."
                              rows={3}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Butonlar */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {isSubmitting ? "Oluşturuluyor..." : "Fırsat Oluştur"}
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