"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  User,
  Calendar,
  MoreVertical,
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Hash,
  Filter,
  X,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISLEMLER } from "@/schemas/userRecordSchema";
import { ILLER } from "@/schemas/userRecordSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { FilterService } from "@/services/FilterService";
import { Record } from "@/types/Record";
import { PaginationService } from "@/services/PaginationService";
import { Pagination } from "@/components/ui/pagination";
import { PaginationState } from "@/types/Pagination";

interface Filters {
  basvuruTuru: string;
  il: string;
  durum: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  adSoyad: string;
  kayitNo: string;
}

export default function RecordsTable() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isDateDialogOpen, setDateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [gecerlilikTarihi, setGecerlilikTarihi] = useState<string>("");
  const [randevuTarihi, setRandevuTarihi] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    basvuruTuru: "",
    il: "",
    durum: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    adSoyad: "",
    kayitNo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filters, paginationState.currentPage]);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/records");
      if (!response.ok) {
        throw new Error("Kayıtlar getirilirken bir hata oluştu");
      }
      const data: Record[] = await response.json();

      // Kayıtları sıra numarasına göre sıralama
      const sortedData = data.sort((a, b) => {
        if (a.sira_no === undefined && b.sira_no === undefined) return 0;
        if (a.sira_no === undefined) return 1;
        if (b.sira_no === undefined) return -1;
        return a.sira_no - b.sira_no;
      });

      setRecords(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filterService = new FilterService(filters);
    const filtered = filterService.applyFilters(records);
    
    // Sayfalama işlemi
    const paginationService = new PaginationService({
      currentPage: paginationState.currentPage,
      pageSize: paginationState.pageSize
    });

    const paginatedRecords = paginationService.paginate(filtered);
    const newPaginationState = paginationService.getPaginationState(filtered.length);

    setFilteredRecords(paginatedRecords);
    setPaginationState(newPaginationState);
  };

  const resetFilters = () => {
    setFilters({
      basvuruTuru: "",
      il: "",
      durum: "",
      baslangicTarihi: "",
      bitisTarihi: "",
      adSoyad: "",
      kayitNo: "",
    });
  };

  const handleStatusUpdate = async (recordId: string, newStatus: 'onaylandi' | 'reddedildi') => {
    try {
      setIsUpdating(true);
      
      // Onaylama işlemi için geçerlilik tarihi gerekli
      if (newStatus === 'onaylandi') {
        if (!gecerlilikTarihi) {
          toast.error("Onaylama için geçerlilik tarihi gereklidir");
          return;
        }
      }

      const response = await fetch(`/api/records/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          durum: newStatus,
          gecerlilik_tarihi: newStatus === 'onaylandi' ? gecerlilikTarihi : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Durum güncellenirken bir hata oluştu');
      }

      // Kayıtları yeniden yükle
      await fetchRecords();
      
      // Başarı mesajı göster
      toast.success(newStatus === 'onaylandi' ? 'Kayıt onaylandı' : 'Kayıt reddedildi');
      
      // Dialog'u kapat
      setIsApprovalDialogOpen(false);
      setGecerlilikTarihi("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const DateUpdate = async (recordId: string, newStatus: 'onaylandi' | 'reddedildi') => {
    try {
      setIsUpdating(true);
      
      // Onaylama işlemi için geçerlilik tarihi gerekli
      if (newStatus === 'onaylandi') {
        if (!randevuTarihi) {
          toast.error("Randevu tarihi gereklidir");
          return;
        }
      }

      const response = await fetch(`/api/records/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          randevu_tarihi: randevuTarihi 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Durum güncellenirken bir hata oluştu');
      }

      // Kayıtları yeniden yükle
      await fetchRecords();
      
      // Başarı mesajı göster
      toast.success(newStatus === 'onaylandi' ? 'Kayıt onaylandı' : 'Kayıt reddedildi');
      
      // Dialog'u kapat
      setDateDialogOpen(false);
      setRandevuTarihi("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const openPhotoDialog = (record: Record) => {
    setSelectedRecord(record);
    setIsPhotoDialogOpen(true);
  };

  const openApprovalDialog = (record: Record) => {
    setSelectedRecord(record);
    setIsApprovalDialogOpen(true);
  };

  const enterDateDialog = (record: Record) => {
    setSelectedRecord(record);
    setDateDialogOpen(true);
  };

  const downloadPDF = async (recordId: string) => {
    try {
      const response = await fetch(`/api/records/${recordId}/pdf`);
      if (!response.ok) {
        throw new Error("PDF indirilirken bir hata oluştu");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kayit-${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("PDF başarıyla indirildi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF indirilirken bir hata oluştu");
    }
  };

  const viewPDF = async (recordId: string) => {
    try {
      const response = await fetch(`/api/records/${recordId}?viewPdf=true`);
      if (!response.ok) {
        throw new Error('PDF görüntülenirken bir hata oluştu');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('PDF görüntülenirken bir hata oluştu');
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kayıt silinirken bir hata oluştu');
      }

      toast.success('Kayıt başarıyla silindi');
      fetchRecords(); // Kayıtları yeniden yükle
    } catch (error) {
      toast.error('Kayıt silinirken bir hata oluştu');
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationState(prev => ({ ...prev, currentPage: page }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Henüz kayıt bulunmuyor.</p>
      </div>
    );
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, ''); // Sadece rakamları al
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/); // 5xx xxx-xx-xx formatı için eşleştir
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}-${match[4]}`; // Formatı uygula
    }
    return phoneNumber; // Eğer formatlanamazsa orijinal numarayı döndür
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
          </Button>
          {Object.values(filters).some(Boolean) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Filtreleri Temizle
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Toplam {filteredRecords.length} kayıt gösteriliyor
        </p>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Başvuru Türü</Label>
              <Select
                value={filters.basvuruTuru}
                onValueChange={(value) =>
                  setFilters({ ...filters, basvuruTuru: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {ISLEMLER.map((islem) => (
                    <SelectItem key={islem} value={islem}>
                      {islem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>İl</Label>
              <Select
                value={filters.il}
                onValueChange={(value) =>
                  setFilters({ ...filters, il: value === "all" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {ILLER.map((il) => (
                    <SelectItem key={il} value={il}>
                      {il}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={filters.durum}
                onValueChange={(value) =>
                  setFilters({ ...filters, durum: value === "all" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="beklemede">Beklemede</SelectItem>
                  <SelectItem value="onaylandi">Onaylandı</SelectItem>
                  <SelectItem value="reddedildi">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={filters.baslangicTarihi}
                onChange={(e) =>
                  setFilters({ ...filters, baslangicTarihi: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={filters.bitisTarihi}
                onChange={(e) =>
                  setFilters({ ...filters, bitisTarihi: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Ad Soyad ile ara..."
                  value={filters.adSoyad}
                  onChange={(e) =>
                    setFilters({ ...filters, adSoyad: e.target.value })
                  }
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kayıt No</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Kayıt no ile ara..."
                  value={filters.kayitNo}
                  onChange={(e) =>
                    setFilters({ ...filters, kayitNo: e.target.value })
                  }
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold w-20 text-center">Sıra No</TableHead>
              <TableHead className="font-semibold w-20 text-center">Fotoğraf</TableHead>
              <TableHead className="font-semibold w-32 text-center">Kayıt No</TableHead>
              <TableHead className="font-semibold w-40 text-center">Yabancı Kimlik No</TableHead>
              <TableHead className="font-semibold w-48 text-center">Ad Soyad</TableHead>
              <TableHead className="font-semibold w-40 text-center">Telefon No</TableHead>
              <TableHead className="font-semibold w-32 text-center">Kayıt Tarihi</TableHead>
              <TableHead className="font-semibold w-32 text-center">Randevu Tarihi</TableHead>
              <TableHead className="font-semibold w-32 text-center">Geçerlilik Tarihi</TableHead>
              <TableHead className="font-semibold w-32 text-center">Durum</TableHead>
              <TableHead className="font-semibold w-32 text-center">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record._id} className="hover:bg-gray-50/50">
                <TableCell className="w-20">{record.sira_no || "-"}</TableCell>
                <TableCell className="w-20">
                  {record.photo?.data ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-10 w-10 rounded-full overflow-hidden"
                      onClick={() => openPhotoDialog(record)}
                    >
                      <Image 
                        src={`data:${record.photo.contentType};base64,${record.photo.data}`}
                        alt={`${record.adi} ${record.soyadi}`}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </Button>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="w-32 font-medium">{record.kayit_numarasi}</TableCell>
                <TableCell className="w-40">{record.yabanci_kimlik_no || "-"}</TableCell>
                <TableCell className="w-48">{`${record.adi} ${record.soyadi}`}</TableCell>
                <TableCell className="w-40">{record.telefon_no ? formatPhoneNumber(record.telefon_no) : "-"}</TableCell>
                <TableCell className="w-32">{format(new Date(record.kayit_tarihi), "dd.MM.yyyy", {
                    locale: tr,
                  })}
                </TableCell>
                <TableCell className="w-32">
                  {record.randevu_tarihi ? (
                    format(new Date(record.randevu_tarihi), "dd.MM.yyyy", {
                      locale: tr,
                    })
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="w-32">
                  {record.gecerlilik_tarihi ? (
                    format(new Date(record.gecerlilik_tarihi), "dd.MM.yyyy", {
                      locale: tr,
                    })
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="w-32">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.durum === "onaylandi"
                        ? "bg-green-100 text-green-800"
                        : record.durum === "reddedildi"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {record.durum === "onaylandi"
                      ? "Onaylandı"
                      : record.durum === "reddedildi"
                      ? "Reddedildi"
                      : "Beklemede"}
                  </span>
                </TableCell>
                <TableCell className="w-32">
                  <div className="flex space-x-2">
                    {record.durum === "beklemede" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                            onClick={() => openApprovalDialog(record)}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Onayla
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleStatusUpdate(record._id, 'reddedildi')}
                            disabled={isUpdating}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reddet
                          </DropdownMenuItem>                         
                          <DropdownMenuSeparator />
                          {!record.randevu_tarihi && (
                              <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => enterDateDialog(record)}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Randevu Tarihi Gir
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => viewPDF(record._id)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            PDF Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => downloadPDF(record._id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF İndir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteRecord(record._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Kaydı Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {!record.randevu_tarihi && (
                              <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => enterDateDialog(record)}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Randevu Tarihi Gir
                            </DropdownMenuItem>
                            
                          )}
                          {record.kayit_pdf && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => viewPDF(record._id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF Görüntüle
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => downloadPDF(record._id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF İndir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteRecord(record._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Kaydı Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination 
        state={paginationState}
        onPageChange={handlePageChange}
      />

      {/* Fotoğraf ve Detay Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? `${selectedRecord.adi} ${selectedRecord.soyadi}` : 'Kayıt Detayı'}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              {selectedRecord.photo?.data ? (
                <div className="relative w-full h-64">
                  <Image 
                    src={`data:${selectedRecord.photo.contentType};base64,${selectedRecord.photo.data}`}
                    alt={`${selectedRecord.adi} ${selectedRecord.soyadi}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <User className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-500">Fotoğraf bulunamadı</p>
                </div>
              )}
              
              {selectedRecord.kayit_pdf && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => downloadPDF(selectedRecord._id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF İndir
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Onay Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kayıt Onaylama</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              <span className="font-medium">{selectedRecord?.adi} {selectedRecord?.soyadi}</span> isimli kaydı onaylamak üzeresiniz.
            </p>
            <div className="space-y-2">
              <Label htmlFor="gecerlilik-tarihi">Geçerlilik Tarihi</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="gecerlilik-tarihi"
                  type="date"
                  value={gecerlilikTarihi}
                  onChange={(e) => setGecerlilikTarihi(e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApprovalDialogOpen(false)}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button 
              onClick={() => selectedRecord && handleStatusUpdate(selectedRecord._id, 'onaylandi')}
              disabled={isUpdating || !gecerlilikTarihi}
            >
              {isUpdating ? "Onaylanıyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Randevu Tarihi Dialog */}
      <Dialog open={isDateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Randevu Tarihi Ekle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              <span className="font-medium">{selectedRecord?.adi} {selectedRecord?.soyadi}</span> isimli kayda randevu tarihi eklemek üzeresiniz.
            </p>
            <div className="space-y-2">
              <Label htmlFor="gecerlilik-tarihi">Randevu Tarihi</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="gecerlilik-tarihi"
                  type="date"
                  value={randevuTarihi}
                  onChange={(e) => setRandevuTarihi(e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDateDialogOpen(false)}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button 
              onClick={() => selectedRecord && DateUpdate(selectedRecord._id, 'onaylandi')}
              disabled={isUpdating || !randevuTarihi}
            >
              {isUpdating ? "Onaylanıyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 