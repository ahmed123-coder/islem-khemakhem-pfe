import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.subscription_plans.findMany({
      include: {
        subscription_packages: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = await prisma.subscription_plans.create({
      data: {
        name: body.name,
        nameAr: body.nameAr,
        planType: body.planType,
        description: body.description,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
