import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = await prisma.subscription_plans.findUnique({
      where: { id: params.id },
      include: { subscription_packages: true },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const plan = await prisma.subscription_plans.update({
      where: { id: params.id },
      data: {
        name: body.name,
        nameAr: body.nameAr,
        planType: body.planType,
        description: body.description,
        active: body.active,
      },
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.subscription_plans.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Plan deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
