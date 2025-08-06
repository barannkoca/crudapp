import { NextRequest } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

// Controller instance'ı oluştur
const opportunityController = new OpportunityController();

// GET - Fırsat istatistikleri
export const GET = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  return await opportunityController.getOpportunityStats(request);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  const opportunityController = new OpportunityController();
  return opportunityController['handleOptionsRequest']();
}