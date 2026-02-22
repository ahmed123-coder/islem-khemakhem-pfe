import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { consultantId, serviceId } = await req.json();

    const consultantService = await prisma.consultantService.create({
      data: { consultantId, serviceId }
    });

    return NextResponse.json(consultantService);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get('consultantId');
    const serviceId = searchParams.get('serviceId');

    await prisma.consultantService.deleteMany({
      where: { consultantId: consultantId!, serviceId: serviceId! }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
