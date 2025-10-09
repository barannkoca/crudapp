"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ICustomer } from "@/types/Customer";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ListPageTemplate from "@/components/ListPageTemplate";

function CustomersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL'den başlangıç değerlerini al
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const initialSearch = searchParams.get('search') || "";

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // URL parametrelerinin değişip değişmediğini kontrol et
  const [urlParams, setUrlParams] = useState({
    page: initialPage,
    search: initialSearch
  });

  // URL'i güncelle
  const updateURL = useCallback((params: { page?: number; search?: string }) => {
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
    
    const newURL = newParams.toString() ? `?${newParams.toString()}` : '';
    router.replace(`/customers${newURL}`, { scroll: false });
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

  // URL parametreleri değiştiğinde state'i güncelle
  useEffect(() => {
    const newPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const newSearch = searchParams.get('search') || "";

    // URL parametreleri değiştiyse state'i güncelle
    if (newPage !== urlParams.page || newSearch !== urlParams.search) {
      setCurrentPage(newPage);
      setSearchTerm(newSearch);
      setDebouncedSearchTerm(newSearch);
      setUrlParams({ page: newPage, search: newSearch });
    }
  }, [searchParams, urlParams]);

  useEffect(() => {
    fetchCustomers();
  }, [searchParams]); // URL parametreleri değiştiğinde fetch yap

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // URL'den güncel değerleri al
      const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
      const urlSearch = searchParams.get('search') || "";
      
      const params = new URLSearchParams({
        page: urlPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (urlSearch) {
        params.append('search', urlSearch);
      }
      
      const response = await fetch(`/api/customers?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setCustomers(result.data);
        setTotalCount(result.total || result.data.length);
        setTotalPages(result.totalPages || Math.ceil((result.total || result.data.length) / itemsPerPage));
      } else {
        toast.error("Müşteriler yüklenemedi");
      }
    } catch (error) {
      console.error('Müşteriler getirme hatası:', error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Müşteri başarıyla silindi");
        fetchCustomers(); // Listeyi yenile
      } else {
        toast.error("Müşteri silinemedi");
      }
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      toast.error("Bir hata oluştu");
    }
  };

  // Client-side filtering artık gerekli değil çünkü server-side search kullanıyoruz
  // const filteredCustomers = customers.filter(customer =>
  //   customer.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   customer.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   customer.eposta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   customer.telefon_no?.includes(searchTerm) ||
  //   customer.yabanci_kimlik_no?.includes(searchTerm)
  // );

  // Arama değiştiğinde sayfa 1'e dön ve URL'i güncelle
  useEffect(() => {
    if (debouncedSearchTerm !== initialSearch) {
      updateURL({ search: debouncedSearchTerm, page: 1 });
    }
  }, [debouncedSearchTerm, updateURL, initialSearch]);

  // Pagination için özel handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  return (
    <ListPageTemplate
      title="Müşteri Yönetimi"
      subtitle="Toplam {count} müşteri kaydı"
      totalCount={totalCount}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, soyadı, e-posta, telefon veya kimlik no ile ara..."
      createButtonText="Yeni Müşteri"
      createButtonHref="/customers/create"
      backButtonHref="/dashboard"
      loading={loading}
      searchLoading={searchLoading}
      searchResultsCount={debouncedSearchTerm ? customers.length : totalCount}
      emptyStateTitle="Müşteri Bulunamadı"
      emptyStateDescription={
        debouncedSearchTerm 
          ? "Arama kriterlerinize uygun müşteri bulunamadı." 
          : "Henüz müşteri kaydı oluşturulmamış."
      }
      showPagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-cyan-50">
              <TableHead className="font-semibold text-cyan-700">Fotoğraf</TableHead>
              <TableHead className="font-semibold text-cyan-700">Ad Soyad</TableHead>
              <TableHead className="font-semibold text-cyan-700">Cinsiyet</TableHead>
              <TableHead className="font-semibold text-cyan-700">Uyruk</TableHead>
              <TableHead className="font-semibold text-cyan-700">Telefon</TableHead>
              <TableHead className="font-semibold text-cyan-700">E-posta</TableHead>
              <TableHead className="font-semibold text-cyan-700">Kimlik No</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <motion.tr
                key={customer._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-cyan-50 transition-colors duration-200 cursor-pointer"
                onClick={() => router.push(`/customers/${customer._id}`)}
              >
                <TableCell>
                  {customer.photo?.data ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-200">
                      <img
                        src={`data:${customer.photo.contentType};base64,${customer.photo.data}`}
                        alt={`${customer.ad} ${customer.soyad}`}
                        className="w-full h-full object-cover"
                      />
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
                  {customer.ad} {customer.soyad}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    {customer.cinsiyeti}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-cyan-600">
                  {customer.uyrugu || '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {customer.telefon_no || '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {customer.eposta || '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {customer.yabanci_kimlik_no || '-'}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </ListPageTemplate>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <CustomersPageContent />
    </Suspense>
  );
} 