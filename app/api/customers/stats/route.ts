import { NextRequest } from 'next/server';
import { CustomerController } from '@/src/controllers/customer.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

// Controller instance'ı oluştur
const customerController = new CustomerController();

// GET - Müşteri istatistikleri
export const GET = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  return await customerController.getCustomerStats(request);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  const customerController = new CustomerController();
  return customerController['handleOptionsRequest']();
}

