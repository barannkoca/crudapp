import { NextRequest } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';
import { ErrorHandler } from '@/src/middlewares/error-handler.middleware';

const opportunityController = new OpportunityController();

// POST - PDF dosyalarını yükle
export const POST = ErrorHandler.asyncWrapper(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return await opportunityController.uploadPdfs(request, params);
});

// OPTIONS - CORS için
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
