import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pkg = await prisma.subscription_packages.findUnique({
      where: { id: params.id },
      include: {
        subscription_plans: true,
        subscriptions: true,
      },
    });
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const pkg = await prisma.subscription_packages.update({
      where: { id: params.id },
      data: {
        planId: body.planId,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceYearly,
        currency: body.currency,
        features: body.features,
        maxMessages: body.maxMessages,
        maxMissions: body.maxMissions,
        hasDiagnostic: body.hasDiagnostic,
      },
    });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.subscription_packages.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Package deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
