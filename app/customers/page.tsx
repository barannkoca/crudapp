"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ICustomer } from "@/types/Customer";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ListPageTemplate from "@/components/ListPageTemplate";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      
      if (response.ok) {
        setCustomers(result.data);
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

  const filteredCustomers = customers.filter(customer =>
    customer.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.eposta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telefon_no?.includes(searchTerm) ||
    customer.yabanci_kimlik_no?.includes(searchTerm)
  );

  return (
    <ListPageTemplate
      title="Müşteri Yönetimi"
      subtitle="Toplam {count} müşteri kaydı"
      totalCount={customers.length}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Müşteri adı, soyadı, e-posta, telefon veya kimlik no ile ara..."
      createButtonText="Yeni Müşteri"
      createButtonHref="/customers/create"
      backButtonHref="/dashboard"
      loading={loading}
      searchResultsCount={filteredCustomers.length}
      emptyStateTitle="Müşteri Bulunamadı"
      emptyStateDescription={
        searchTerm 
          ? "Arama kriterlerinize uygun müşteri bulunamadı." 
          : "Henüz müşteri kaydı oluşturulmamış."
      }
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
            {filteredCustomers.map((customer, index) => (
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