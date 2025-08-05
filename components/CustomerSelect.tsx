"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Mail, Phone } from "lucide-react";
import { ICustomer } from "@/types/Customer";
import dynamic from "next/dynamic";

// Lazy load CustomerList komponenti
const CustomerList = dynamic(() => import('./CustomerList').then(mod => ({ default: mod.CustomerList })), {
  loading: () => (
    <div className="p-4 text-center text-gray-500">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
      Yükleniyor...
    </div>
  ),
  ssr: false
});

interface CustomerSelectProps {
  onCustomerSelect: (customer: ICustomer) => void;
  selectedCustomer?: ICustomer;
  label?: string;
}

export interface CustomerSelectRef {
  getSelectedCustomer: () => ICustomer | undefined;
}

export const CustomerSelect = forwardRef<CustomerSelectRef, CustomerSelectProps>(({ 
  onCustomerSelect, 
  selectedCustomer, 
  label = "Müşteri Seç" 
}, ref) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ref method'larını expose et
  useImperativeHandle(ref, () => ({
    getSelectedCustomer: () => selectedCustomer
  }));

  // Müşterileri getir - useCallback ile optimize edildi
  const fetchCustomers = useCallback(async (search: string = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers/select?search=${search}`);
      const result = await response.json();
      
      if (response.ok) {
        console.log('Müşteriler yüklendi:', result.data);
        setCustomers(result.data);
      } else {
        console.error('Müşteriler getirilemedi:', result.message);
      }
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Arama değiştiğinde müşterileri getir - debounce ile optimize edildi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        fetchCustomers(searchTerm);
      }
    }, 500); // Debounce süresini artırdık

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchCustomers]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCustomerSelect = useCallback((customer: ICustomer) => {
    onCustomerSelect(customer);
    setShowDropdown(false);
    setSearchTerm("");
  }, [onCustomerSelect]);

  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={selectedCustomer ? `${selectedCustomer.ad} ${selectedCustomer.soyad}` : "Müşteri ara..."}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="pl-10"
            />
          </div>
          
          {selectedCustomer && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCustomerSelect(selectedCustomer)}
            >
              Seçili
            </Button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <CustomerList
              customers={customers}
              onCustomerSelect={handleCustomerSelect}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Seçili müşteri bilgileri */}
      {selectedCustomer && (
        <Card className="mt-2">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              {selectedCustomer.photo && selectedCustomer.photo.data ? (
                <img
                  src={`data:${selectedCustomer.photo.contentType};base64,${selectedCustomer.photo.data}`}
                  alt={`${selectedCustomer.ad} ${selectedCustomer.soyad}`}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // Fotoğraf yüklenemezse fallback göster
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center ${selectedCustomer.photo && selectedCustomer.photo.data ? 'hidden' : ''}`}>
                <User className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {selectedCustomer.ad} {selectedCustomer.soyad}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedCustomer.eposta && `${selectedCustomer.eposta} • `}
                  {selectedCustomer.telefon_no}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}); 