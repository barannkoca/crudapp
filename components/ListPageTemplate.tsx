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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-cyan-50 to-white"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-cyan-100">
          {/* Üst Bar */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link 
                    href={backButtonHref}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-cyan-700 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Geri Dön
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {title}
                    </h1>
                    <p className="text-cyan-100">
                      {subtitle.replace('{count}', totalCount.toString())}
                    </p>
                  </div>
                </div>
                <Link href={createButtonHref}>
                  <Button className="bg-white text-cyan-700 hover:bg-cyan-50 border-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {createButtonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Arama */}
          <div className="p-6 border-b border-cyan-100 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              {showSearchResults && (
                <div className="flex items-center space-x-2 text-sm text-cyan-600">
                  <span>{searchResultsCount} sonuç bulundu</span>
                </div>
              )}
            </div>
          </div>

          {/* İçerik */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-800">{error}</span>
                </div>
              </div>
            )}

            {children || (
              <div className="text-center py-12">
                {emptyStateIcon || (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyStateTitle}</h3>
                <p className="text-gray-600">{emptyStateDescription}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 