import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { PaginationParams, FilterParams } from '../dto/base.dto';

// Base Repository sınıfı - tüm CRUD operasyonları için
export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  // Tekil kayıt getir
  async findById(id: string, populate?: string | string[]): Promise<T | null> {
    let query = this.model.findById(id);
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }
    return query.exec();
  }

  // Tüm kayıtları getir (pagination ile)
  async findAll(
    filter: FilterQuery<T> = {}, 
    pagination?: PaginationParams,
    populate?: string | string[],
    sort?: any
  ): Promise<{ data: T[], total: number }> {
    let query = this.model.find(filter);
    
    // Populate
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }

    // Sort
    if (sort) {
      query = query.sort(sort);
    } else {
      query = query.sort({ createdAt: -1 }); // Default sıralama
    }

    // Pagination
    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      query = query.skip(skip).limit(pagination.limit);
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter)
    ]);

    return { data, total };
  }

  // Tek kayıt getir (filter ile)
  async findOne(filter: FilterQuery<T>, populate?: string | string[]): Promise<T | null> {
    let query = this.model.findOne(filter);
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }
    return query.exec();
  }

  // Yeni kayıt oluştur
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  // Kayıt güncelle
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id, 
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();
  }

  // Kayıt sil
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  // Birden fazla kayıt sil
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount || 0;
  }

  // Kayıt sayısı
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  // Kayıt var mı kontrolü
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  // Bulk operations
  async bulkCreate(data: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(data) as unknown as Promise<T[]>;
  }

  async bulkUpdate(operations: any[]): Promise<any> {
    return this.model.bulkWrite(operations);
  }

  // Aggregate operations
  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }
}