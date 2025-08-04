import { Customer } from '@/models/Customer';
import { ICustomer, ICustomerCreate, ICustomerUpdate } from '@/types/Customer';

export interface ICustomerRepository {
  findAll(): Promise<ICustomer[]>;
  findById(id: string): Promise<ICustomer | null>;
  create(customer: ICustomerCreate): Promise<ICustomer>;
  update(id: string, customer: ICustomerUpdate): Promise<ICustomer | null>;
  delete(id: string): Promise<boolean>;
}

export class CustomerRepository implements ICustomerRepository {
  async findAll(): Promise<ICustomer[]> {
    try {
      const customers = await Customer.find({}).sort({ createdAt: -1 });
      return customers;
    } catch (error) {
      throw new Error(`Müşteriler getirilemedi: ${error}`);
    }
  }

  async findById(id: string): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findById(id);
      return customer;
    } catch (error) {
      throw new Error(`Müşteri bulunamadı: ${error}`);
    }
  }

  async create(customerData: ICustomerCreate): Promise<ICustomer> {
    try {
      const customer = new Customer(customerData);
      const savedCustomer = await customer.save();
      return savedCustomer;
    } catch (error) {
      throw new Error(`Müşteri oluşturulamadı: ${error}`);
    }
  }

  async update(id: string, customerData: ICustomerUpdate): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findByIdAndUpdate(
        id,
        customerData,
        { new: true, runValidators: true }
      );
      return customer;
    } catch (error) {
      throw new Error(`Müşteri güncellenemedi: ${error}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Customer.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Müşteri silinemedi: ${error}`);
    }
  }
}

export class CustomerService {
  private customerRepository: ICustomerRepository;

  constructor(customerRepository: ICustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async getAllCustomers(): Promise<ICustomer[]> {
    return this.customerRepository.findAll();
  }

  async getCustomerById(id: string): Promise<ICustomer | null> {
    return this.customerRepository.findById(id);
  }

  async createCustomer(customerData: ICustomerCreate): Promise<ICustomer> {
    return this.customerRepository.create(customerData);
  }

  async updateCustomer(id: string, customerData: ICustomerUpdate): Promise<ICustomer | null> {
    return this.customerRepository.update(id, customerData);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customerRepository.delete(id);
  }
} 