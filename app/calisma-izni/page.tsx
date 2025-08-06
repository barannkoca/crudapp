"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ICalismaIzniFirsati, IslemTuru, FirsatDurumu } from "@/types/Opportunity";
import ListPageTemplate from "@/components/ListPageTemplate";

export default function CalismaIzniPage() {
  const [opportunities, setOpportunities] = useState<ICalismaIzniFirsati[]>([]);
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
        islem_turu: IslemTuru.CALISMA_IZNI,
        sort_by: 'olusturma_tarihi',
        sort_order: 'desc'
      });
      
      const response = await fetch(`/api/opportunities?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.data || []);
      } else {
        setError('Çalışma izni fırsatları yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Çalışma izni fırsatları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = searchTerm === "" || 
      opportunity.musteri?.ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.musteri?.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.detaylar?.isveren?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.detaylar?.pozisyon?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <ListPageTemplate
      title="Çalışma İzni Fırsatları"
      subtitle={`Toplam ${opportunities.length} fırsat`}
      totalCount={opportunities.length}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, işveren veya pozisyon ara..."
      createButtonText="Yeni Çalışma İzni"
      createButtonHref="/calisma-izni/create"
      backButtonHref="/dashboard"
      loading={loading}
      error={error}
      searchResultsCount={filteredOpportunities.length}
      emptyStateTitle="Çalışma İzni Fırsatı Bulunamadı"
      emptyStateDescription="Henüz çalışma izni fırsatı oluşturulmamış."
      emptyStateIcon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      }
    >
      {/* Durum Filtresi */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-64 border-green-200 focus:border-green-500 focus:ring-green-500">
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
            <TableRow className="bg-green-50">
              <TableHead className="font-semibold text-green-700">Fotoğraf</TableHead>
              <TableHead className="font-semibold text-green-700">Müşteri</TableHead>
              <TableHead className="font-semibold text-green-700">İşveren</TableHead>
              <TableHead className="font-semibold text-green-700">Pozisyon</TableHead>
              <TableHead className="font-semibold text-green-700">Maaş</TableHead>
              <TableHead className="font-semibold text-green-700">Çalışma Saati</TableHead>
              <TableHead className="font-semibold text-green-700">Sözleşme</TableHead>
              <TableHead className="font-semibold text-green-700">Tarih</TableHead>
              <TableHead className="font-semibold text-green-700">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity, index) => (
              <motion.tr
                key={opportunity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-green-50 transition-colors duration-200"
              >
                <TableCell>
                  {opportunity.musteri?.photo && opportunity.musteri.photo.data ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-200">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-2 border-green-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {opportunity.musteri?.ad} {opportunity.musteri?.soyad}
                </TableCell>
                <TableCell className="font-medium">{opportunity.detaylar?.isveren || '-'}</TableCell>
                <TableCell>{opportunity.detaylar?.pozisyon || '-'}</TableCell>
                <TableCell className="font-medium text-green-600">
                  {opportunity.detaylar?.maas ? formatCurrency(opportunity.detaylar.maas) : '-'}
                </TableCell>
                <TableCell>
                  {opportunity.detaylar?.calisma_saati ? `${opportunity.detaylar.calisma_saati} saat/hafta` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {opportunity.detaylar?.sozlesme_turu || '-'}
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