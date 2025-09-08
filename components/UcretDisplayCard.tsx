"use client"

import React from 'react';
import { formatDate } from '@/lib/utils';

interface UcretDisplayCardProps {
  ucretler: Array<{
    miktar: number;
    para_birimi: string;
    aciklama?: string;
    odeme_tarihi?: string | Date;
    odeme_durumu: string;
  }>;
}

export const UcretDisplayCard: React.FC<UcretDisplayCardProps> = ({ ucretler }) => {
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Ücretleri kategorilere ayır ve sırala
  const toplamUcret = ucretler.filter(u => u.odeme_durumu === 'toplam_ucret');
  const alinanUcret = ucretler.filter(u => u.odeme_durumu === 'alinan_ucret');
  const giderler = ucretler.filter(u => u.odeme_durumu === 'gider');

  // Toplam hesaplamalar
  const toplamMiktar = toplamUcret.reduce((sum, u) => sum + (u.miktar || 0), 0);
  const alinanMiktar = alinanUcret.reduce((sum, u) => sum + (u.miktar || 0), 0);
  const giderMiktar = giderler.reduce((sum, u) => sum + (u.miktar || 0), 0);
  const kalanMiktar = toplamMiktar - alinanMiktar - giderMiktar;

  if (!ucretler || ucretler.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Henüz ücret bilgisi eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Toplam Ücret */}
      {toplamMiktar > 0 && (
        <div>
          <div className="text-xs text-blue-600 mb-1">Toplam Ücret</div>
          <div className="text-lg font-bold text-blue-800">
            {formatCurrency(toplamMiktar)}
          </div>
        </div>
      )}

      {/* Giderler */}
      {giderMiktar > 0 && (
        <div>
          <div className="text-xs text-red-600 mb-1">Giderler</div>
          {giderler.map((gider, index) => (
            <div key={index} className="text-red-700 ml-2">
              <span className="font-medium">
                -{formatCurrency(gider.miktar, gider.para_birimi)}
              </span>
              {gider.aciklama && <span className="ml-2">{gider.aciklama}</span>}
              {gider.odeme_tarihi && (
                <span className="ml-2 text-xs text-red-500">
                  {formatDate(gider.odeme_tarihi)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ödenenler */}
      {alinanMiktar > 0 && (
        <div>
          <div className="text-xs text-green-600 mb-1">Ödenenler</div>
          {alinanUcret.map((odeme, index) => (
            <div key={index} className="text-green-700 ml-2">
              <span className="font-medium">
                -{formatCurrency(odeme.miktar, odeme.para_birimi)}
              </span>
              {odeme.aciklama && <span className="ml-2">{odeme.aciklama}</span>}
              {odeme.odeme_tarihi && (
                <span className="ml-2 text-xs text-green-500">
                  {formatDate(odeme.odeme_tarihi)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alacak Tutar */}
      {kalanMiktar > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-orange-700 font-bold">
            Alacak Tutar: {formatCurrency(kalanMiktar)}
          </div>
        </div>
      )}
    </div>
  );
};
