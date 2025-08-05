"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParaBirimi } from "@/types/Opportunity";
import Link from "next/link";
import { toast } from "sonner";
import { CreateRecordFormRef } from "@/components/createRecordForm";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { CustomerSelect } from "@/components/CustomerSelect";

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

interface OpportunityFormWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (formData: FormData) => Promise<any>;
  isSubmitting?: boolean;
  errors?: {[key: string]: string};
  touched?: {[key: string]: boolean};
}

export default function OpportunityFormWrapper({ 
  title, 
  description, 
  children, 
  onSubmit, 
  isSubmitting = false,
  errors = {},
  touched = {}
}: OpportunityFormWrapperProps) {
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

    try {
      const formData = new FormData();

      // İşlem türünü ekle (ikamet izni)
      formData.append('islem_turu', 'ikamet_izni');

      // Ücretleri ekle
      if (ucretler.length > 0) {
        formData.append('ucretler', JSON.stringify(ucretler));
      }

      // Açıklamaları ekle
      if (aciklamalar.length > 0) {
        formData.append('aciklamalar', JSON.stringify(aciklamalar));
      }

      await onSubmit(formData);
    } catch (error) {
      console.error("Form gönderme hatası:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-6">
        {/* Ana Form Alanı */}
        <div className="flex-1">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {description}
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ana Form İçeriği */}
                {children}

                {/* Ücretler - Geliştirilmiş */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="text-sm font-medium text-gray-700">Ücretler</h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addUcret}
                      className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      + Ücret Ekle
                    </Button>
                  </div>
                  
                  {ucretler.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <p className="text-sm">Henüz ücret eklenmemiş</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ucretler.map((ucret, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Ücret #{index + 1}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUcret(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Miktar</label>
                              <Input
                                type="number"
                                value={ucret.miktar === 0 ? '' : ucret.miktar}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numericValue = value === '' ? 0 : parseFloat(value);
                                  updateUcret(index, 'miktar', numericValue);
                                }}
                                placeholder="0"
                                className="text-sm"
                              />
                              {touched[`ucret_${index}`] && errors[`ucret_${index}`] && (
                                <p className="text-sm text-red-500">{errors[`ucret_${index}`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Para Birimi</label>
                              <Select
                                value={ucret.para_birimi}
                                onValueChange={(value) => updateUcret(index, 'para_birimi', value as ParaBirimi)}
                              >
                                <SelectTrigger className="text-sm">
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
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Ödeme Durumu</label>
                              <Select
                                value={ucret.odeme_durumu}
                                onValueChange={(value) => updateUcret(index, 'odeme_durumu', value)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beklemede">
                                    <Badge variant="secondary" className="text-xs">Beklemede</Badge>
                                  </SelectItem>
                                  <SelectItem value="odendi">
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Ödendi</Badge>
                                  </SelectItem>
                                  <SelectItem value="iptal_edildi">
                                    <Badge variant="destructive" className="text-xs">İptal</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                              <Input
                                value={ucret.aciklama}
                                onChange={(e) => updateUcret(index, 'aciklama', e.target.value)}
                                placeholder="Ücret açıklaması"
                                className="text-sm"
                              />
                              {touched[`ucret_aciklama_${index}`] && errors[`ucret_aciklama_${index}`] && (
                                <p className="text-sm text-red-500">{errors[`ucret_aciklama_${index}`]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Açıklamalar - Geliştirilmiş */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="text-sm font-medium text-gray-700">Açıklamalar</h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAciklama}
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                      + Açıklama Ekle
                    </Button>
                  </div>
                  
                  {aciklamalar.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm">Henüz açıklama eklenmemiş</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aciklamalar.map((aciklama, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Açıklama #{index + 1}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAciklama(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Başlık</label>
                              <Input
                                value={aciklama.baslik}
                                onChange={(e) => updateAciklama(index, 'baslik', e.target.value)}
                                placeholder="Açıklama başlığı"
                                className="text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Önem Derecesi</label>
                              <Select
                                value={aciklama.onem_derecesi}
                                onValueChange={(value) => updateAciklama(index, 'onem_derecesi', value)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dusuk">
                                    <Badge variant="secondary" className="text-xs">Düşük</Badge>
                                  </SelectItem>
                                  <SelectItem value="orta">
                                    <Badge variant="default" className="text-xs">Orta</Badge>
                                  </SelectItem>
                                  <SelectItem value="yuksek">
                                    <Badge variant="destructive" className="text-xs">Yüksek</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Tarih</label>
                              <Input
                                type="date"
                                className="text-sm"
                                value={new Date().toISOString().slice(0, 10)}
                                disabled
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">İçerik</label>
                            <Textarea
                              value={aciklama.icerik}
                              onChange={(e) => updateAciklama(index, 'icerik', e.target.value)}
                              placeholder="Açıklama içeriğini buraya yazın..."
                              className="text-sm"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Butonlar */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Oluşturuluyor...
                      </div>
                    ) : (
                      "Fırsat Oluştur"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => window.history.back()}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-64">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Fırsat Türleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/ikamet-izni/create">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">İkamet İzni</span>
                </div>
              </Link>
              
              <Link href="/calisma-izni/create">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Çalışma İzni</span>
                </div>
              </Link>
              
              <Link href="/diger-islemler/create">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Diğer İşlemler</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 