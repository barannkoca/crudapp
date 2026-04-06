import { NextRequest, NextResponse } from 'next/server';
import { OpportunityController } from '@/src/controllers/opportunity.controller';

export const dynamic = 'force-dynamic';

const controller = new OpportunityController();

export async function GET(request: NextRequest) {
    return controller.getExpiringOpportunities(request);
}
