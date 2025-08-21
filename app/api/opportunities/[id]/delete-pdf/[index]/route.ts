import { NextRequest } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

const opportunityController = new OpportunityController();

// DELETE - PDF dosyasını sil
export const DELETE = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: { id: string, index: string } }
) => {
  return await opportunityController.deletePdf(request, params);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Allow': 'DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
