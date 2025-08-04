"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IRecord } from "@/types/Record";
import ListPageTemplate from "@/components/ListPageTemplate";

export default function IkametIzniPage() {
  const [records, setRecords] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/records');
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        setError('Kayıtlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Kayıtlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === "" || 
      record.musteri?.ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.musteri?.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.kayit_numarasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sira_no?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.durum === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'reddedildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <ListPageTemplate
      title="İkamet İzni Kayıtları"
      subtitle="Toplam {count} kayıt"
      totalCount={records.length}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, soyadı veya kayıt numarası ara..."
      createButtonText="Yeni Kayıt"
      createButtonHref="/ikamet-izni/create"
      backButtonHref="/dashboard"
      loading={loading}
      error={error}
      searchResultsCount={filteredRecords.length}
      emptyStateTitle="Kayıt Bulunamadı"
      emptyStateDescription="Henüz ikamet izni kaydı oluşturulmamış."
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
            <SelectItem value="onaylandi">Onaylandı</SelectItem>
            <SelectItem value="reddedildi">Reddedildi</SelectItem>
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
            {filteredRecords.map((record, index) => (
              <motion.tr
                key={record._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-cyan-50 transition-colors duration-200"
              >
                <TableCell className="font-medium">{record.sira_no || '-'}</TableCell>
                <TableCell>
                  {record.musteri?.photo && record.musteri.photo.data ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-200">
                      <img
                        src={`data:${record.musteri.photo.contentType};base64,${record.musteri.photo.data}`}
                        alt={`${record.musteri.ad} ${record.musteri.soyad}`}
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
                <TableCell className="font-medium">{record.kayit_numarasi}</TableCell>
                <TableCell className="font-medium">
                  {record.musteri?.ad} {record.musteri?.soyad}
                </TableCell>
                <TableCell>{record.kayit_tarihi ? formatDate(record.kayit_tarihi) : '-'}</TableCell>
                <TableCell>{record.randevu_tarihi ? formatDate(record.randevu_tarihi) : '-'}</TableCell>
                <TableCell>{record.gecerlilik_tarihi ? formatDate(record.gecerlilik_tarihi) : '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.durum)}`}>
                    {record.durum}
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