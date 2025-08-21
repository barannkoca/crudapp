"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IDigerFirsati, IslemTuru, FirsatDurumu } from "@/types/Opportunity";
import ListPageTemplate from "@/components/ListPageTemplate";

export default function DigerIslemlerPage() {
  const [opportunities, setOpportunities] = useState<IDigerFirsati[]>([]);
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
      const params = new URLSearchParams({
        islem_turu: IslemTuru.DIGER,
        sort_by: 'olusturma_tarihi',
        sort_order: 'desc'
      });
      
      const response = await fetch(`/api/opportunities?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.data || []);
      } else {
        setError('Diğer işlemler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Diğer işlemler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = searchTerm === "" || 
      opportunity.musteri?.ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.musteri?.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.detaylar?.islem_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.detaylar?.aciklama?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const getIslemDurumColor = (durum?: string) => {
    switch (durum?.toLowerCase()) {
      case 'başvuru':
        return 'bg-blue-100 text-blue-800';
      case 'onay':
        return 'bg-green-100 text-green-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ListPageTemplate
      title="Diğer İşlemler"
      subtitle={`Toplam ${opportunities.length} işlem`}
      totalCount={opportunities.length}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, işlem adı veya açıklama ara..."
      createButtonText="Yeni İşlem"
      createButtonHref="/diger-islemler/create"
      backButtonHref="/dashboard"
      loading={loading}
      error={error}
      searchResultsCount={filteredOpportunities.length}
      emptyStateTitle="İşlem Bulunamadı"
      emptyStateDescription="Henüz diğer işlem oluşturulmamış."
      emptyStateIcon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      }
    >
      {/* Durum Filtresi */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-64 border-purple-200 focus:border-purple-500 focus:ring-purple-500">
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
            <TableRow className="bg-purple-50">
              <TableHead className="font-semibold text-purple-700">Fotoğraf</TableHead>
              <TableHead className="font-semibold text-purple-700">Müşteri</TableHead>
              <TableHead className="font-semibold text-purple-700">İşlem Adı</TableHead>
              <TableHead className="font-semibold text-purple-700">Açıklama</TableHead>
              <TableHead className="font-semibold text-purple-700">Başlama Tarihi</TableHead>
              <TableHead className="font-semibold text-purple-700">Bitiş Tarihi</TableHead>
              <TableHead className="font-semibold text-purple-700">İşlem Durumu</TableHead>
              <TableHead className="font-semibold text-purple-700">Oluşturma</TableHead>
              <TableHead className="font-semibold text-purple-700">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity, index) => (
              <motion.tr
                key={opportunity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-purple-50 transition-colors duration-200"
              >
                <TableCell>
                  {opportunity.musteri?.photo && opportunity.musteri.photo.data ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-purple-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {opportunity.musteri?.ad} {opportunity.musteri?.soyad}
                </TableCell>
                <TableCell className="font-medium text-purple-700">
                  {opportunity.detaylar?.islem_adi || '-'}
                </TableCell>
                <TableCell className="max-w-48 truncate">
                  {opportunity.detaylar?.aciklama || '-'}
                </TableCell>
                <TableCell>
                  {opportunity.detaylar?.baslama_tarihi ? formatDate(opportunity.detaylar.baslama_tarihi) : '-'}
                </TableCell>
                <TableCell>
                  {opportunity.detaylar?.bitis_tarihi ? formatDate(opportunity.detaylar.bitis_tarihi) : '-'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getIslemDurumColor(opportunity.detaylar?.islem_durumu)}`}
                  >
                    {opportunity.detaylar?.islem_durumu || 'Belirsiz'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {opportunity.olusturma_tarihi ? formatDate(opportunity.olusturma_tarihi) : '-'}
                </TableCell>
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