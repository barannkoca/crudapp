import { NextRequest } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

// Controller instance'ı oluştur
const opportunityController = new OpportunityController();

// GET - Müşteriye ait fırsatları getir
export const GET = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return await opportunityController.getOpportunitiesByCustomer(request, { customerId: id });
});

// OPTIONS - CORS için
export async function OPTIONS() {
  return opportunityController['handleOptionsRequest']();
}