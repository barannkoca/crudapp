"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ListPageTemplateProps {
  title: string;
  subtitle: string;
  totalCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  createButtonText: string;
  createButtonHref: string;
  backButtonHref: string;
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  emptyStateIcon?: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  showSearchResults?: boolean;
  searchResultsCount?: number;
}

export default function ListPageTemplate({
  title,
  subtitle,
  totalCount,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  createButtonText,
  createButtonHref,
  backButtonHref,
  loading,
  error,
  children,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  showSearchResults = true,
  searchResultsCount = 0
}: ListPageTemplateProps) {
  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex-1 overflow-auto p-6 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 w-full">
        <div className="flex items-center gap-2">
          <Link 
            href={backButtonHref}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Geri Dön
          </Link>
          <div className="ml-4">
            <h1 className="text-xl font-semibold">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {subtitle.replace('{count}', totalCount.toString())}
            </p>
          </div>
        </div>
        
        <div className="ml-auto">
          <Link href={createButtonHref}>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {createButtonText}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 w-full">
        {/* Arama */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            {showSearchResults && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{searchResultsCount} sonuç bulundu</span>
              </div>
            )}
          </div>
        </div>

        {/* İçerik - Beyaz Container */}
        <div className="w-full">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-destructive">{error}</span>
                  </div>
                </div>
              )}

              {children || (
                <div className="text-center py-12">
                  {emptyStateIcon || (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  <h3 className="text-lg font-medium mb-2">{emptyStateTitle}</h3>
                  <p className="text-muted-foreground">{emptyStateDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 