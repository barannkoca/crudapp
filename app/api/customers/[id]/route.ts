import { NextRequest } from 'next/server';
import { CustomerController } from '@/src/controllers/customer.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

// Controller instance'ı oluştur
const customerController = new CustomerController();

// GET - Tekil müşteri getir
export const GET = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return await customerController.getCustomerById(request, { id });
});

// PUT - Müşteri güncelle
export const PUT = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return await customerController.updateCustomer(request, { id });
});

// DELETE - Müşteri sil
export const DELETE = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return await customerController.deleteCustomer(request, { id });
});

// OPTIONS - CORS için
export async function OPTIONS() {
  return customerController['handleOptionsRequest']();
}