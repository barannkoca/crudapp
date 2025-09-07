"use client"

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ListPageTemplate from '@/components/ListPageTemplate';
import { formatDate } from '@/lib/utils';
import { DollarSign, Search, Filter, Eye } from 'lucide-react';

interface PendingPayment {
  _id: string;
  musteri: {
    ad: string;
    soyad: string;
    photo?: {
      data: string;
      contentType: string;
    };
  };
  islem_turu: string;
  detaylar: {
    isveren?: string;
    pozisyon?: string;
  };
  ucretler: Array<{
    miktar: number;
    para_birimi: string;
    aciklama: string;
    odeme_durumu: string;
    odeme_tarihi?: string;
  }>;
  durum: string;
  olusturma_tarihi: string;
}

function BekleyenOdemelerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // URL güncelleme fonksiyonu
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
    router.replace(`/bekleyen-odemeler${newURL}`, { scroll: false });
  }, [router, searchParams]);

  // URL parametrelerini takip et
  const [urlParams, setUrlParams] = useState(searchParams.toString());

  useEffect(() => {
    const newUrlParams = searchParams.toString();
    if (newUrlParams !== urlParams) {
      setUrlParams(newUrlParams);
      setSearchTerm(searchParams.get('search') || '');
      setStatusFilter(searchParams.get('status') || 'all');
      setCurrentPage(parseInt(searchParams.get('page') || '1'));
    }
  }, [searchParams, urlParams]);

  const fetchPendingPayments = useCallback(async () => {
    try {
      setSearchLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.set('page', searchParams.get('page') || '1');
      params.set('limit', '10');
      
      if (searchParams.get('search')) {
        params.set('search', searchParams.get('search')!);
      }
      
      if (searchParams.get('status') && searchParams.get('status') !== 'all') {
        params.set('status', searchParams.get('status')!);
      }
      
      // Sadece bekleyen ödemeleri getir
      params.set('payment_status', 'beklemede');
      
      const response = await fetch(`/api/opportunities?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      } else {
        setError('Bekleyen ödemeler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Fetch pending payments error:', error);
      setError('Bekleyen ödemeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const handleRowClick = (payment: PendingPayment) => {
    router.push(`/${payment.islem_turu}/${payment._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'islemde':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'onaylandi':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reddedildi':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'tamamlandi':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'iptal_edildi':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPendingAmount = (ucretler: any[]) => {
    return ucretler
      .filter(u => u.odeme_durumu === 'beklemede')
      .reduce((sum, u) => sum + (u.miktar || 0), 0);
  };

  // Pagination için özel handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  return (
    <ListPageTemplate
      title="Bekleyen Ödemeler"
      subtitle={`Toplam ${totalCount} bekleyen ödeme`}
      totalCount={totalCount}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, işveren veya pozisyon ara..."
      createButtonText=""
      createButtonHref=""
      backButtonHref="/dashboard"
      loading={loading}
      searchLoading={searchLoading}
      error={error}
      searchResultsCount={searchTerm ? pendingPayments.length : totalCount}
      emptyStateTitle="Bekleyen Ödeme Bulunamadı"
      emptyStateDescription={
        searchTerm 
          ? "Arama kriterlerinize uygun bekleyen ödeme bulunamadı." 
          : "Henüz bekleyen ödeme bulunmuyor."
      }
      emptyStateIcon={
        <DollarSign className="h-16 w-16 text-orange-300 mx-auto mb-4" />
      }
      showPagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    >
      {/* Durum Filtresi */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-64 border-orange-200 focus:border-orange-500 focus:ring-orange-500">
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
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-orange-50">
              <TableHead className="font-semibold text-orange-700 w-20">Fotoğraf</TableHead>
              <TableHead className="font-semibold text-orange-700 w-48">Müşteri</TableHead>
              <TableHead className="font-semibold text-orange-700 w-40">İşlem Türü</TableHead>
              <TableHead className="font-semibold text-orange-700 w-48">Detay</TableHead>
              <TableHead className="font-semibold text-orange-700 w-32">Bekleyen Tutar</TableHead>
              <TableHead className="font-semibold text-orange-700 w-32">Oluşturma</TableHead>
              <TableHead className="font-semibold text-orange-700 w-28">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPayments.map((payment, index) => (
              <motion.tr
                key={payment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-orange-50 transition-colors duration-200 cursor-pointer"
                onClick={() => handleRowClick(payment)}
              >
                <TableCell className="w-20">
                  {payment.musteri?.photo && payment.musteri.photo.data ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                      <img
                        src={`data:${payment.musteri.photo.contentType};base64,${payment.musteri.photo.data}`}
                        alt={`${payment.musteri.ad} ${payment.musteri.soyad}`}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border-2 border-orange-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium w-48">
                  {payment.musteri?.ad} {payment.musteri?.soyad}
                </TableCell>
                <TableCell className="w-40">
                  <Badge variant="outline" className="text-xs">
                    {payment.islem_turu === 'calisma_izni' && 'Çalışma İzni'}
                    {payment.islem_turu === 'ikamet_izni' && 'İkamet İzni'}
                    {payment.islem_turu === 'diger' && 'Diğer İşlem'}
                  </Badge>
                </TableCell>
                <TableCell className="w-48">
                  <div className="text-sm">
                    {payment.detaylar?.isveren && (
                      <div className="font-medium">{payment.detaylar.isveren}</div>
                    )}
                    {payment.detaylar?.pozisyon && (
                      <div className="text-gray-600">{payment.detaylar.pozisyon}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-32">
                  <span className="text-lg font-bold text-orange-600">
                    {formatCurrency(getPendingAmount(payment.ucretler))}
                  </span>
                </TableCell>
                <TableCell className="w-32">
                  {payment.olusturma_tarihi ? formatDate(payment.olusturma_tarihi) : '-'}
                </TableCell>
                <TableCell className="w-28">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.durum)}`}>
                    {payment.durum}
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

export default function BekleyenOdemelerPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <BekleyenOdemelerPageContent />
    </Suspense>
  );
}
