"use client"

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { CustomerSelect } from '@/components/CustomerSelect';
import { ICustomer } from '@/types/Customer';
import { User } from 'lucide-react';

interface CustomerSelectionStepProps {
  onDataChange?: (data: { musteri_id: string; customer: ICustomer | null }) => void;
  formData?: any;
}

export const CustomerSelectionStep: React.FC<CustomerSelectionStepProps> = ({
  onDataChange,
  formData
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);

  useEffect(() => {
    if (formData?.customer) {
      setSelectedCustomer(formData.customer);
    }
  }, [formData]);

  const handleCustomerSelect = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    onDataChange?.({
      musteri_id: customer._id || '',
      customer
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Select */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-2 block">
          Müşteri Seçimi *
        </Label>
        <div className="mt-3">
          <CustomerSelect
            onCustomerSelect={handleCustomerSelect}
            selectedCustomer={selectedCustomer || undefined}
            placeholder="Müşteri seçin veya ara..."
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          İşlem yapılacak müşteriyi seçin veya arayarak bulun.
        </p>
      </div>

      {/* Selected Customer Preview */}
      {selectedCustomer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            {selectedCustomer.photo?.data ? (
              <img
                src={`data:${selectedCustomer.photo.contentType};base64,${selectedCustomer.photo.data}`}
                alt={`${selectedCustomer.ad} ${selectedCustomer.soyad}`}
                className="w-10 h-10 rounded-full object-cover border border-blue-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-blue-900 text-sm">
                {selectedCustomer.ad} {selectedCustomer.soyad}
              </h4>
              <p className="text-xs text-blue-700 truncate">
                {[selectedCustomer.telefon_no, selectedCustomer.eposta].filter(Boolean).join(' • ')}
              </p>
              {selectedCustomer.uyrugu && (
                <p className="text-xs text-blue-600">
                  Uyruk: {selectedCustomer.uyrugu}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};