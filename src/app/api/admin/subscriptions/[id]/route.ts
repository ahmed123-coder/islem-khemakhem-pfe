import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subscription = await prisma.subscriptions.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription_packages: {
          include: { subscription_plans: true },
        },
        missions: true,
      },
    });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const subscription = await prisma.subscriptions.update({
      where: { id: params.id },
      data: {
        status: body.status,
        billingCycle: body.billingCycle,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        currentPeriodStart: body.currentPeriodStart ? new Date(body.currentPeriodStart) : undefined,
        currentPeriodEnd: body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : undefined,
        autoRenew: body.autoRenew,
        cancelledAt: body.cancelledAt ? new Date(body.cancelledAt) : undefined,
        cancelReason: body.cancelReason,
      },
    });
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.subscriptions.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Subscription deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
