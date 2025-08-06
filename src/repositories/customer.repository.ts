import { Customer } from '@/models/Customer';
import { BaseRepository } from './base.repository';
import { ICustomer } from '@/types/Customer';
import { CustomerFilterDto } from '../dto/customer.dto';
import { FilterQuery, Document } from 'mongoose';

interface ICustomerDoc extends Omit<ICustomer, '_id'>, Document {}

export class CustomerRepository extends BaseRepository<ICustomerDoc> {
  constructor() {
    super(Customer);
  }

  // Müşteri arama (ad, soyad, email, telefon)
  async searchCustomers(
    searchTerm: string,
    pagination?: { page: number; limit: number }
  ): Promise<{ data: ICustomerDoc[], total: number }> {
    const filter: FilterQuery<ICustomerDoc> = {
      $or: [
        { ad: { $regex: searchTerm, $options: 'i' } },
        { soyad: { $regex: searchTerm, $options: 'i' } },
        { eposta: { $regex: searchTerm, $options: 'i' } },
        { telefon_no: { $regex: searchTerm, $options: 'i' } },
        { yabanci_kimlik_no: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    return this.findAll(filter, pagination, undefined, { ad: 1, soyad: 1 });
  }

  // Filtreleme
  async findByFilters(filters: CustomerFilterDto, pagination?: { page: number; limit: number }): Promise<{ data: ICustomerDoc[], total: number }> {
    const filter: FilterQuery<ICustomerDoc> = {};

    // Genel arama
    if (filters.search) {
      filter.$or = [
        { ad: { $regex: filters.search, $options: 'i' } },
        { soyad: { $regex: filters.search, $options: 'i' } },
        { eposta: { $regex: filters.search, $options: 'i' } },
        { telefon_no: { $regex: filters.search, $options: 'i' } },
        { yabanci_kimlik_no: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Diğer filtreler
    if (filters.ad) filter.ad = { $regex: filters.ad, $options: 'i' };
    if (filters.soyad) filter.soyad = { $regex: filters.soyad, $options: 'i' };
    if (filters.yabanci_kimlik_no) filter.yabanci_kimlik_no = filters.yabanci_kimlik_no;
    if (filters.uyrugu) filter.uyrugu = filters.uyrugu;
    if (filters.cinsiyeti) filter.cinsiyeti = filters.cinsiyeti;
    if (filters.telefon_no) filter.telefon_no = { $regex: filters.telefon_no, $options: 'i' };
    if (filters.eposta) filter.eposta = { $regex: filters.eposta, $options: 'i' };

    return this.findAll(filter, pagination, undefined, { ad: 1, soyad: 1 });
  }

  // Kimlik numarası ile müşteri bul
  async findByKimlikNo(kimlikNo: string): Promise<ICustomerDoc | null> {
    return this.findOne({ yabanci_kimlik_no: kimlikNo });
  }

  // Email ile müşteri bul
  async findByEmail(email: string): Promise<ICustomerDoc | null> {
    return this.findOne({ eposta: email });
  }

  // Telefon ile müşteri bul
  async findByPhone(phone: string): Promise<ICustomerDoc | null> {
    return this.findOne({ telefon_no: phone });
  }

  // Select için müşteri listesi (sadece id, ad, soyad)
  async findForSelect(): Promise<Array<{_id: string, ad: string, soyad: string}>> {
    return this.model.find({}, { ad: 1, soyad: 1 })
      .sort({ ad: 1, soyad: 1 })
      .lean()
      .exec() as any;
  }

  // Müşteri istatistikleri
  async getStats(): Promise<{
    total: number;
    byGender: { [key: string]: number };
    byNationality: { [key: string]: number };
    recentlyAdded: number; // Son 30 gün
  }> {
    const [
      total,
      genderStats,
      nationalityStats,
      recentCount
    ] = await Promise.all([
      this.count(),
      this.aggregate([
        { $group: { _id: '$cinsiyeti', count: { $sum: 1 } } }
      ]),
      this.aggregate([
        { $match: { uyrugu: { $exists: true, $ne: null } } },
        { $group: { _id: '$uyrugu', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      this.count({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const byGender: { [key: string]: number } = {};
    genderStats.forEach((stat: any) => {
      byGender[stat._id || 'Belirtilmemiş'] = stat.count;
    });

    const byNationality: { [key: string]: number } = {};
    nationalityStats.forEach((stat: any) => {
      byNationality[stat._id] = stat.count;
    });

    return {
      total,
      byGender,
      byNationality,
      recentlyAdded: recentCount
    };
  }
}