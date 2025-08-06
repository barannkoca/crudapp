import { NextRequest } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

// Controller instance'ı oluştur
const opportunityController = new OpportunityController();

// GET - Tekil fırsat getir
export const GET = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return await opportunityController.getOpportunityById(request, params);
});

// PUT - Fırsat güncelle
export const PUT = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return await opportunityController.updateOpportunity(request, params);
});

// DELETE - Fırsat sil
export const DELETE = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return await opportunityController.deleteOpportunity(request, params);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  const opportunityController = new OpportunityController();
  return opportunityController['handleOptionsRequest']();
}