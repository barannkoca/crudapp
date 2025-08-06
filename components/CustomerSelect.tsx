"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, User, Check } from "lucide-react";
import { ICustomer } from "@/types/Customer";

interface CustomerSelectProps {
  onCustomerSelect: (customer: ICustomer) => void;
  selectedCustomer?: ICustomer;
  placeholder?: string;
}

export function CustomerSelect({ 
  onCustomerSelect, 
  selectedCustomer, 
  placeholder = "Müşteri seçin..." 
}: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch customers
  const fetchCustomers = async (search: string = "") => {
    try {
      setLoading(true);
      const url = search.length >= 2 
        ? `/api/customers?search=${encodeURIComponent(search)}&limit=50`
        : `/api/customers?limit=50`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        fetchCustomers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer: ICustomer) => {
    onCustomerSelect(customer);
    setIsOpen(false);
    setSearchTerm("");
  };

  const displayText = selectedCustomer 
    ? `${selectedCustomer.ad} ${selectedCustomer.soyad}`
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-lg 
          flex items-center justify-between text-left
          hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${selectedCustomer ? 'text-gray-900' : 'text-gray-500'}
        `}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {selectedCustomer && selectedCustomer.photo?.data ? (
            <img
              src={`data:${selectedCustomer.photo.contentType};base64,${selectedCustomer.photo.data}`}
              alt={displayText}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="truncate text-base font-medium">{displayText}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full min-w-[500px] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-base text-gray-500">Müşteriler aranıyor...</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-6 text-center text-base text-gray-500">
                {searchTerm.length >= 2 ? 'Müşteri bulunamadı' : 'Arama yapmak için en az 2 karakter yazın'}
              </div>
            ) : (
              customers.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => handleSelect(customer)}
                  className="w-full px-4 py-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    {customer.photo?.data ? (
                      <img
                        src={`data:${customer.photo.contentType};base64,${customer.photo.data}`}
                        alt={`${customer.ad} ${customer.soyad}`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    )}

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-gray-900 truncate">
                        {customer.ad} {customer.soyad}
                      </div>
                      <div className="text-sm text-gray-600 truncate mt-1">
                        {customer.telefon_no && (
                          <span className="inline-flex items-center mr-4">
                            📞 {customer.telefon_no}
                          </span>
                        )}
                        {customer.eposta && (
                          <span className="inline-flex items-center">
                            ✉️ {customer.eposta}
                          </span>
                        )}
                      </div>
                      {customer.uyrugu && (
                        <div className="text-xs text-gray-500 mt-1">
                          🌍 {customer.uyrugu}
                        </div>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {selectedCustomer?._id === customer._id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {customers.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <div className="text-sm text-gray-600 text-center font-medium">
                {customers.length} müşteri gösteriliyor
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}