import { Opportunity } from '@/models/Opportunity';
import { BaseRepository } from './base.repository';
import { OpportunityFilterDto, IslemTuruDto } from '../dto/opportunity.dto';
import { FilterQuery } from 'mongoose';

import { Document } from 'mongoose';

interface IOpportunityDoc extends Document {
  musteri: any;
  islem_turu: string;
  durum: string;
  olusturma_tarihi: Date;
  guncelleme_tarihi: Date;
  sira_no?: number;
  [key: string]: any;
}

export class OpportunityRepository extends BaseRepository<IOpportunityDoc> {
  constructor() {
    super(Opportunity as any);
  }

  // Filtreleme ile fırsatları getir
  async findByFilters(
    filters: OpportunityFilterDto, 
    pagination?: { page: number; limit: number }
  ): Promise<{ data: IOpportunityDoc[], total: number }> {
    const filter: FilterQuery<IOpportunityDoc> = {};

    if (filters.islem_turu) filter.islem_turu = filters.islem_turu;
    if (filters.durum) filter.durum = filters.durum;
    if (filters.musteri_id) filter.musteri = filters.musteri_id;
    
    // Detaylar içinde arama (isveren, kayit_numarasi, islem_adi vb.)
    if (filters.search) {
      filter.$or = [
        { 'detaylar.isveren': { $regex: filters.search, $options: 'i' } },
        { 'detaylar.kayit_numarasi': { $regex: filters.search, $options: 'i' } },
        { 'detaylar.islem_adi': { $regex: filters.search, $options: 'i' } },
        { 'detaylar.pozisyon': { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Tarih aralığı filtresi
    if (filters.date_from || filters.date_to) {
      filter.olusturma_tarihi = {};
      if (filters.date_from) filter.olusturma_tarihi.$gte = filters.date_from;
      if (filters.date_to) filter.olusturma_tarihi.$lte = filters.date_to;
    }

    // Ödeme durumu filtresi
    if (filters.payment_status) {
      filter['ucretler.odeme_durumu'] = filters.payment_status;
    }

    // Dinamik sıralama - varsayılan olarak oluşturma tarihine göre azalan
    const sortField = filters.sort_by || 'olusturma_tarihi';
    const sortOrder = filters.sort_order === 'asc' ? 1 : -1;
    const sortObject = { [sortField]: sortOrder };

    return this.findAll(
      filter, 
      pagination, 
      'musteri', 
      sortObject
    );
  }

  // Müşteriye ait fırsatları getir
  async findByCustomer(
    customerId: string, 
    pagination?: { page: number; limit: number }
  ): Promise<{ data: IOpportunityDoc[], total: number }> {
    return this.findAll(
      { musteri: customerId }, 
      pagination, 
      'musteri', 
      { olusturma_tarihi: -1 }
    );
  }

  // findBySiraNo metodu kaldırıldı - Tarih bazlı sıralama kullanılacak

  // Sıra numarası metodları kaldırıldı - Tarih bazlı sıralama kullanılacak

  // Fırsat istatistikleri
  async getStats(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    byType: { [key: string]: number };
    monthly: { month: string; count: number }[];
    recentlyAdded: number;
  }> {
    const [
      total,
      statusStats,
      typeStats,
      monthlyStats,
      recentCount
    ] = await Promise.all([
      this.count(),
      this.aggregate([
        { $group: { _id: '$durum', count: { $sum: 1 } } }
      ]),
      this.aggregate([
        { $group: { _id: '$islem_turu', count: { $sum: 1 } } }
      ]),
      this.aggregate([
        {
          $match: {
            olusturma_tarihi: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$olusturma_tarihi' },
              month: { $month: '$olusturma_tarihi' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      this.count({
        olusturma_tarihi: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const byStatus: { [key: string]: number } = {};
    statusStats.forEach((stat: any) => {
      byStatus[stat._id] = stat.count;
    });

    const byType: { [key: string]: number } = {};
    typeStats.forEach((stat: any) => {
      byType[stat._id] = stat.count;
    });

    const monthly = monthlyStats.map((stat: any) => ({
      month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
      count: stat.count
    }));

    return {
      total,
      byStatus,
      byType,
      monthly,
      recentlyAdded: recentCount
    };
  }

  // Son aktiviteler
  async getRecentActivities(): Promise<any[]> {
    const activities = await this.aggregate([
      { $sort: { guncelleme_tarihi: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: 'musteri',
          foreignField: '_id',
          as: 'musteri'
        }
      },
      { $unwind: { path: '$musteri', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          type: '$islem_turu',
          status: '$durum',
          customerName: {
            $concat: [
              { $ifNull: ['$musteri.ad', ''] },
              ' ',
              { $ifNull: ['$musteri.soyad', ''] }
            ]
          },
          createdAt: '$olusturma_tarihi',
          updatedAt: '$guncelleme_tarihi'
        }
      }
    ]);

    return activities;
  }

  // Ödeme durumu istatistikleri
  async getPaymentStats(): Promise<{
    totalRevenue: number;
    pendingPayments: number;
    paidAmount: number;
    cancelledAmount: number;
    byType: { [key: string]: { total: number; paid: number; pending: number } };
  }> {
    const paymentStats = await this.aggregate([
      { $unwind: { path: '$ucretler', preserveNullAndEmptyArrays: false } },
      { $match: { 'ucretler.miktar': { $exists: true, $ne: null, $gt: 0 } } },
      {
        $group: {
          _id: {
            islem_turu: '$islem_turu',
            odeme_durumu: '$ucretler.odeme_durumu'
          },
          totalAmount: { $sum: '$ucretler.miktar' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalRevenue = 0;
    let pendingPayments = 0;
    let paidAmount = 0;
    let cancelledAmount = 0;
    const byType: { [key: string]: { total: number; paid: number; pending: number } } = {};

    paymentStats.forEach((stat: any) => {
      const islemTuru = stat._id.islem_turu;
      const odemeDurumu = stat._id.odeme_durumu;
      const amount = stat.totalAmount || 0;

      if (!byType[islemTuru]) {
        byType[islemTuru] = { total: 0, paid: 0, pending: 0 };
      }

      byType[islemTuru].total += amount;

      switch (odemeDurumu) {
        case 'odendi':
          paidAmount += amount;
          byType[islemTuru].paid += amount;
          break;
        case 'beklemede':
          pendingPayments += amount;
          byType[islemTuru].pending += amount;
          break;
        case 'iptal_edildi':
          cancelledAmount += amount;
          break;
      }

      totalRevenue += amount;
    });

    return {
      totalRevenue,
      pendingPayments,
      paidAmount,
      cancelledAmount,
      byType
    };
  }
}