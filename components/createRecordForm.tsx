"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pdfToText } from 'pdf-ts';
import { ICustomer } from "@/types/Customer";
import { IslemTuru } from "@/types/Opportunity";

import {
  userRecordSchema,
  UserRecordFormData,
  ILLER,
  ISLEMLER,
  IKAMET_TURU,
} from "@/schemas/userRecordSchema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/components/fields/FileUploadField";
import { CustomerSelect, CustomerSelectRef } from "@/components/CustomerSelect";
import { TextExtractionService } from "@/services/textExtractionService";
import { FormFillService } from "@/services/formFillService";

export interface CreateRecordFormRef {
  getSelectedCustomer: () => ICustomer | undefined;
  getFormValues: () => any;
}

interface CreateRecordFormProps {
  errors?: {[key: string]: string};
  touched?: {[key: string]: boolean};
  onFieldChange?: (field: string, value: any) => void;
  onFieldBlur?: (field: string) => void;
}

export const CreateRecordForm = forwardRef<CreateRecordFormRef, CreateRecordFormProps>((props, ref) => {
  const { errors = {}, touched = {}, onFieldChange, onFieldBlur } = props;
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | undefined>();
  const customerSelectRef = useRef<CustomerSelectRef>(null);

  const form = useForm<UserRecordFormData>({
    resolver: zodResolver(userRecordSchema),
    defaultValues: {
      kayit_ili: "",
      yapilan_islem: "",
      ikamet_turu: "",
      kayit_tarihi: null,
      kayit_numarasi: "",
      aciklama: "",
      kayit_pdf: undefined,
      gecerlilik_tarihi: null,
      randevu_tarihi: null
    },
  });

  // Ref method'larını expose et
  useImperativeHandle(ref, () => ({
    getSelectedCustomer: () => selectedCustomer,
    getFormValues: () => form.getValues()
  }));

  const extractAndFillForm = (text: string) => {
    const extractionService = new TextExtractionService(text);
    const formFillService = new FormFillService(form);
    
    const extractedData = extractionService.extractData();
    formFillService.fillForm(extractedData);
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Müşteri Seçimi ve PDF Yükleme - Yan Yana */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerSelect
            ref={customerSelectRef}
            selectedCustomer={selectedCustomer}
            onCustomerSelect={setSelectedCustomer}
          />

          <FileUploadField
            form={form}
            fieldName="kayit_pdf"
            label="PDF Dosyası"
            accept="application/pdf"
            onFileSelect={async (file) => {
              try {
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const text = await pdfToText(uint8Array);
                extractAndFillForm(text);
              } catch (error) {
                console.error('PDF işleme hatası:', error);
                toast.error('PDF dosyası işlenirken bir hata oluştu');
              }
            }}
          />
        </div>

        {/* Ana Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="kayit_ili"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Kayıt İli *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFieldChange?.('kayit_ili', value);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ILLER.map((il) => (
                      <SelectItem key={il} value={il}>
                        {il}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {touched.kayit_ili && errors.kayit_ili && (
                  <p className="text-sm text-red-500">{errors.kayit_ili}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yapilan_islem"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Yapılan İşlem *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFieldChange?.('yapilan_islem', value);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="İşlem seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ISLEMLER.map((islem) => (
                      <SelectItem key={islem} value={islem}>
                        {islem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {touched.yapilan_islem && errors.yapilan_islem && (
                  <p className="text-sm text-red-500">{errors.yapilan_islem}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ikamet_turu"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">İkamet Türü *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFieldChange?.('ikamet_turu', value);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="İkamet türü seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {IKAMET_TURU.map((tur) => (
                      <SelectItem key={tur} value={tur}>
                        {tur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {touched.ikamet_turu && errors.ikamet_turu && (
                  <p className="text-sm text-red-500">{errors.ikamet_turu}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kayit_numarasi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Kayıt Numarası</FormLabel>
                <FormControl>
                  <Input placeholder="Kayıt numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kayit_tarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Kayıt Tarihi *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().slice(0, 10) : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      field.onChange(date);
                      onFieldChange?.('kayit_tarihi', date);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      onFieldBlur?.('kayit_tarihi');
                    }}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
                {touched.kayit_tarihi && errors.kayit_tarihi && (
                  <p className="text-sm text-red-500">{errors.kayit_tarihi}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gecerlilik_tarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Geçerlilik Tarihi</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().slice(0, 10) : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      field.onChange(date);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="randevu_tarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Randevu Tarihi</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().slice(0, 10) : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      field.onChange(date);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
});
