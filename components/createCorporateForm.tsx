"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  corporateFormSchema,
  CorporateFormData,
} from "@/schemas/corporateSchema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/components/fields/FileUploadField";

export function CreateCorporateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CorporateFormData>({
    resolver: zodResolver(corporateFormSchema),
    defaultValues: {
      name: "",
      logo: null,
    },
  });

  const onSubmit = async (data: CorporateFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", data.name);
      
      if (data.logo instanceof File) {
        formData.append("logo", data.logo);
      }

      const response = await fetch("/api/corporates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Şirket oluşturulurken bir hata oluştu");
      }

      toast.success("Şirket başarıyla oluşturuldu");
      router.push("/dashboard");
    } catch (error) {
      console.error("Şirket oluşturma hatası:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Şirket oluşturulurken bir hata oluştu");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Şirket Oluştur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şirket Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Şirket adını girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şirket Logosu (İsteğe Bağlı)</FormLabel>
                  <FileUploadField
                    form={form}
                    fieldName="logo"
                    label="Logo Yükle"
                    accept="image/*"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Oluşturuluyor..." : "Şirket Oluştur"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
