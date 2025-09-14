"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IIkametIzniFirsati, IslemTuru, FirsatDurumu } from "@/types/Opportunity";
import ListPageTemplate from "@/components/ListPageTemplate";
import { formatDate } from '@/lib/utils';

function IkametIzniPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL'den başlangıç değerlerini al
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const initialSearch = searchParams.get('search') || "";
  const initialStatus = searchParams.get('status') || "all";

  const [opportunities, setOpportunities] = useState<IIkametIzniFirsati[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // URL parametrelerinin değişip değişmediğini kontrol et
  const [urlParams, setUrlParams] = useState({
    page: initialPage,
    search: initialSearch,
    status: initialStatus
  });


  // URL'i güncelle
  const updateURL = useCallback((params: { page?: number; search?: string; status?: string }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (params.page !== undefined) {
      if (params.page === 1) {
        newParams.delete('page');
      } else {
        newParams.set('page', params.page.toString());
      }
    }
    
    if (params.search !== undefined) {
      if (params.search === '') {
        newParams.delete('search');
      } else {
        newParams.set('search', params.search);
      }
    }
    
    if (params.status !== undefined) {
      if (params.status === 'all') {
        newParams.delete('status');
      } else {
        newParams.set('status', params.status);
      }
    }
    
    const newURL = newParams.toString() ? `?${newParams.toString()}` : '';
    router.replace(`/ikamet-izni${newURL}`, { scroll: false });
  }, [router, searchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms gecikme

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search loading state
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [searchTerm, debouncedSearchTerm]);


  // Arama değiştiğinde sayfa 1'e dön ve URL'i güncelle
  useEffect(() => {
    if (debouncedSearchTerm !== initialSearch) {
      updateURL({ search: debouncedSearchTerm, page: 1 });
    }
  }, [debouncedSearchTerm, updateURL, initialSearch]);

  // Filtre değiştiğinde sayfa 1'e dön ve URL'i güncelle
  useEffect(() => {
    if (statusFilter !== initialStatus) {
      updateURL({ status: statusFilter, page: 1 });
    }
  }, [statusFilter, updateURL, initialStatus]);

  // URL parametreleri değiştiğinde state'i güncelle
  useEffect(() => {
    const newPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const newSearch = searchParams.get('search') || "";
    const newStatus = searchParams.get('status') || "all";

    // URL parametreleri değiştiyse state'i güncelle
    if (newPage !== urlParams.page || newSearch !== urlParams.search || newStatus !== urlParams.status) {
      setCurrentPage(newPage);
      setSearchTerm(newSearch);
      setDebouncedSearchTerm(newSearch);
      setStatusFilter(newStatus);
      setUrlParams({ page: newPage, search: newSearch, status: newStatus });
    }
  }, [searchParams, urlParams]);

  useEffect(() => {
    fetchOpportunities();
  }, [searchParams]); // URL parametreleri değiştiğinde fetch yap


  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      
      // URL'den güncel değerleri al
      const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
      const urlSearch = searchParams.get('search') || "";
      const urlStatus = searchParams.get('status') || "all";
      
      const params = new URLSearchParams({
        islem_turu: IslemTuru.IKAMET_IZNI,
        sort_by: 'olusturma_tarihi',
        sort_order: 'desc',
        page: urlPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (urlSearch) {
        params.append('search', urlSearch);
      }
      
      if (urlStatus !== 'all') {
        params.append('durum', urlStatus);
      }
      
      const response = await fetch(`/api/opportunities?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        setOpportunities(result.data || []);
        setTotalCount(result.total || result.data.length);
        setTotalPages(result.totalPages || Math.ceil((result.total || result.data.length) / itemsPerPage));
      } else {
        setError('İkamet izni fırsatları yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('İkamet izni fırsatları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtering yapıldığı için client-side filtering kaldırıldı

  // Arama değiştiğinde sayfa 1'e dön - sadece yeni arama yapıldığında
  useEffect(() => {
    // Eğer arama terimi değiştiyse ve bu URL'den gelmiyorsa sayfa 1'e dön
    const urlSearch = searchParams.get('search') || "";
    if (debouncedSearchTerm !== urlSearch && debouncedSearchTerm !== initialSearch) {
      handlePageChange(1);
    }
  }, [debouncedSearchTerm, initialSearch, searchParams]);

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



  const handleRowClick = (opportunity: IIkametIzniFirsati) => {
    console.log('🖱️ İkamet İzni Row clicked!', opportunity);
    console.log('🎯 Navigating to:', `/ikamet-izni/${opportunity._id}`);
    router.push(`/ikamet-izni/${opportunity._id}`);
  };

  // Pagination için özel handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  return (
    <ListPageTemplate
      title="İkamet İzni Fırsatları"
      subtitle={`Toplam {count} fırsat`}
      totalCount={totalCount}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, soyadı veya kayıt numarası ara..."
      createButtonText="Yeni Fırsat"
      createButtonHref="/ikamet-izni/create"
      backButtonHref="/dashboard"
      loading={loading}
      searchLoading={searchLoading}
      error={error}
      searchResultsCount={debouncedSearchTerm ? opportunities.length : totalCount}
      emptyStateTitle="Fırsat Bulunamadı"
      emptyStateDescription={
        debouncedSearchTerm 
          ? "Arama kriterlerinize uygun ikamet izni fırsatı bulunamadı." 
          : "Henüz ikamet izni fırsatı oluşturulmamış."
      }
      emptyStateIcon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      showPagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
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
              <TableHead className="font-semibold text-cyan-700">Fotoğraf</TableHead>
              <TableHead className="font-semibold text-cyan-700">Ad Soyad</TableHead>
              <TableHead className="font-semibold text-cyan-700">Kayıt No</TableHead>
              <TableHead className="font-semibold text-cyan-700">Kayıt Tarihi</TableHead>
              <TableHead className="font-semibold text-cyan-700">Randevu Tarihi</TableHead>
              <TableHead className="font-semibold text-cyan-700">Geçerlilik Tarihi</TableHead>

              <TableHead className="font-semibold text-cyan-700">Durum</TableHead>
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
                onClick={() => handleRowClick(opportunity)}
              >
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
                <TableCell className="font-medium">
                  {opportunity.musteri?.ad} {opportunity.musteri?.soyad}
                </TableCell>
                <TableCell className="font-medium">{opportunity.detaylar?.kayit_numarasi || '-'}</TableCell>
                <TableCell>{opportunity.detaylar?.kayit_tarihi ? formatDate(opportunity.detaylar.kayit_tarihi) : '-'}</TableCell>
                <TableCell>{opportunity.detaylar?.randevu_tarihi ? formatDate(opportunity.detaylar.randevu_tarihi) : '-'}</TableCell>
                <TableCell>{opportunity.detaylar?.gecerlilik_tarihi ? formatDate(opportunity.detaylar.gecerlilik_tarihi) : '-'}</TableCell>
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

export default function IkametIzniPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <IkametIzniPageContent />
    </Suspense>
  );
} 