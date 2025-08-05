"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IIkametIzniFirsati, IslemTuru, FirsatDurumu } from "@/types/Opportunity";
import ListPageTemplate from "@/components/ListPageTemplate";

export default function IkametIzniPage() {
  const [opportunities, setOpportunities] = useState<IIkametIzniFirsati[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/opportunities');
      
      if (response.ok) {
        const data = await response.json();
        
        // Sadece ikamet izni fırsatlarını filtrele ve tip güvenliğini sağla
        const ikametIzniOpportunities = data.filter((opp: any) => 
          opp.islem_turu === IslemTuru.IKAMET_IZNI
        ) as IIkametIzniFirsati[];
        
        setOpportunities(ikametIzniOpportunities);
      } else {
        setError('Fırsatlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Fırsatlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = searchTerm === "" || 
      opportunity.musteri?.ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.musteri?.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.kayit_numarasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.sira_no?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || opportunity.durum === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: FirsatDurumu) => {
    switch (status) {
      case FirsatDurumu.BEKLEMEDE:
        return 'bg-yellow-100 text-yellow-800';
      case FirsatDurumu.ONAYLANDI:
        return 'bg-green-100 text-green-800';
      case FirsatDurumu.REDDEDILDI:
        return 'bg-red-100 text-red-800';
      case FirsatDurumu.ISLEMDE:
        return 'bg-blue-100 text-blue-800';
      case FirsatDurumu.TAMAMLANDI:
        return 'bg-gray-100 text-gray-800';
      case FirsatDurumu.IPTAL_EDILDI:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <ListPageTemplate
      title="İkamet İzni Fırsatları"
      subtitle={`Toplam ${opportunities.length} fırsat`}
      totalCount={opportunities.length}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, soyadı veya kayıt numarası ara..."
      createButtonText="Yeni Fırsat"
      createButtonHref="/ikamet-izni/create"
      backButtonHref="/dashboard"
      loading={loading}
      error={error}
      searchResultsCount={filteredOpportunities.length}
      emptyStateTitle="Fırsat Bulunamadı"
      emptyStateDescription="Henüz ikamet izni fırsatı oluşturulmamış."
      emptyStateIcon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    >
      {/* Durum Filtresi */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-64 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500">
            <SelectValue placeholder="Durum filtresi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="beklemede">Beklemede</SelectItem>
            <SelectItem value="islemde">İşlemde</SelectItem>
            <SelectItem value="onaylandi">Onaylandı</SelectItem>
            <SelectItem value="reddedildi">Reddedildi</SelectItem>
            <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
            <SelectItem value="iptal_edildi">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-cyan-50">
              <TableHead className="font-semibold text-cyan-700">Sıra No</TableHead>
              <TableHead className="font-semibold text-cyan-700">Fotoğraf</TableHead>
              <TableHead className="font-semibold text-cyan-700">Kayıt No</TableHead>
              <TableHead className="font-semibold text-cyan-700">Ad Soyad</TableHead>
              <TableHead className="font-semibold text-cyan-700">Kayıt Tarihi</TableHead>
              <TableHead className="font-semibold text-cyan-700">Randevu Tarihi</TableHead>
              <TableHead className="font-semibold text-cyan-700">Geçerlilik Tarihi</TableHead>
              <TableHead className="font-semibold text-cyan-700">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity, index) => (
              <motion.tr
                key={opportunity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-cyan-50 transition-colors duration-200"
              >
                <TableCell className="font-medium">
                  {opportunity.sira_no ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      #{opportunity.sira_no}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {opportunity.musteri?.photo && opportunity.musteri.photo.data ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-200">
                      <img
                        src={`data:${opportunity.musteri.photo.contentType};base64,${opportunity.musteri.photo.data}`}
                        alt={`${opportunity.musteri.ad} ${opportunity.musteri.soyad}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center border-2 border-cyan-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{opportunity.kayit_numarasi}</TableCell>
                <TableCell className="font-medium">
                  {opportunity.musteri?.ad} {opportunity.musteri?.soyad}
                </TableCell>
                <TableCell>{opportunity.kayit_tarihi ? formatDate(opportunity.kayit_tarihi) : '-'}</TableCell>
                <TableCell>{opportunity.randevu_tarihi ? formatDate(opportunity.randevu_tarihi) : '-'}</TableCell>
                <TableCell>{opportunity.gecerlilik_tarihi ? formatDate(opportunity.gecerlilik_tarihi) : '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.durum)}`}>
                    {opportunity.durum}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </ListPageTemplate>
  );
} 