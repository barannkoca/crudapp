"use client";

import React, { memo } from "react";
import { User, Mail, Phone } from "lucide-react";
import { ICustomer } from "@/types/Customer";

interface CustomerListProps {
  customers: ICustomer[];
  onCustomerSelect: (customer: ICustomer) => void;
  isLoading: boolean;
}

const CustomerItem = memo(({ customer, onSelect }: { customer: ICustomer; onSelect: (customer: ICustomer) => void }) => (
  <div
    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
    onClick={() => onSelect(customer)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {customer.photo && customer.photo.data ? (
          <img
            src={`data:${customer.photo.contentType};base64,${customer.photo.data}`}
            alt={`${customer.ad} ${customer.soyad}`}
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fotoğraf yüklenemezse fallback göster
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center ${customer.photo && customer.photo.data ? 'hidden' : ''}`}>
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {customer.ad} {customer.soyad}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {customer.eposta && (
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{customer.eposta}</span>
              </div>
            )}
            {customer.telefon_no && (
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{customer.telefon_no}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
));

CustomerItem.displayName = 'CustomerItem';

export const CustomerList = memo(({ customers, onCustomerSelect, isLoading }: CustomerListProps) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
        Müşteriler yükleniyor...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Müşteri bulunamadı. Arama yapmak için en az 2 karakter yazın.
      </div>
    );
  }

  return (
    <div className="py-2 max-h-60 overflow-y-auto">
      {customers.map((customer) => (
        <CustomerItem
          key={customer._id}
          customer={customer}
          onSelect={onCustomerSelect}
        />
      ))}
    </div>
  );
});

CustomerList.displayName = 'CustomerList'; 