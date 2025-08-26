"use client";

import { useState } from "react";
import ListPageTemplate from "@/components/ListPageTemplate";

export default function TestPaginationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Test verisi - 25 kayıt
  const testData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Test Kayıt ${i + 1}`,
    email: `test${i + 1}@example.com`
  }));

  const totalPages = Math.ceil(testData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = testData.slice(startIndex, endIndex);

  return (
    <ListPageTemplate
      title="Pagination Test"
      subtitle="Test sayfası"
      totalCount={testData.length}
      searchTerm=""
      onSearchChange={() => {}}
      searchPlaceholder="Ara..."
      createButtonText="Yeni"
      createButtonHref="/"
      backButtonHref="/"
      loading={false}
      showPagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      emptyStateTitle="Veri Yok"
      emptyStateDescription="Test verisi bulunamadı"
    >
      <div className="space-y-2">
        {paginatedData.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.email}</p>
          </div>
        ))}
      </div>
    </ListPageTemplate>
  );
}
