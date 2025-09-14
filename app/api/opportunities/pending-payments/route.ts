import { NextRequest } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';
import { checkAuthAccess, createAuthErrorResponse } from '@/lib/auth-guard';

// Controller instance'ı oluştur
const opportunityController = new OpportunityController();

// GET - Bekleyen ödemeleri listele
export const GET = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  const authCheck = await checkAuthAccess();
  if (!authCheck.allowed) {
    return createAuthErrorResponse(authCheck.error);
  }
  return await opportunityController.getPendingPayments(request);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
