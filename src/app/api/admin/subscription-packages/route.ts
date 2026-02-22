import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.subscription_packages.findMany({
      include: {
        subscription_plans: true,
        subscriptions: true,
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pkg = await prisma.subscription_packages.create({
      data: {
        planId: body.planId,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceYearly,
        currency: body.currency ?? 'TND',
        features: body.features,
        maxMessages: body.maxMessages,
        maxMissions: body.maxMissions,
        hasDiagnostic: body.hasDiagnostic ?? true,
      },
    });
    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
