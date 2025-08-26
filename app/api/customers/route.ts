import { NextRequest } from 'next/server';
import { CustomerController } from '@/src/controllers/customer.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';
import { checkAuthAccess, createAuthErrorResponse } from '@/lib/auth-guard';

// Controller instance'ı oluştur
const customerController = new CustomerController();

// GET - Müşteri listesi
export const GET = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  const authCheck = await checkAuthAccess();
  if (!authCheck.allowed) {
    return createAuthErrorResponse(authCheck.error);
  }
  return await customerController.getCustomers(request);
});

// POST - Yeni müşteri oluştur
export const POST = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  const authCheck = await checkAuthAccess();
  if (!authCheck.allowed) {
    return createAuthErrorResponse(authCheck.error);
  }
  return await customerController.createCustomer(request);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  return customerController['handleOptionsRequest']();
}