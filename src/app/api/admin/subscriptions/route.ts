import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const subscriptions = await prisma.subscriptions.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription_packages: {
          include: { subscription_plans: true },
        },
        missions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subscription = await prisma.subscriptions.create({
      data: {
        userId: body.userId,
        packageId: body.packageId,
        billingCycle: body.billingCycle,
        status: body.status,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        currentPeriodStart: new Date(body.currentPeriodStart || body.startDate),
        currentPeriodEnd: new Date(body.currentPeriodEnd || body.endDate),
        autoRenew: body.autoRenew ?? true,
      },
    });
    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
