import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { packageId, serviceId } = await req.json();

    const packageService = await prisma.packageService.create({
      data: { packageId, serviceId }
    });

    return NextResponse.json(packageService);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    const serviceId = searchParams.get('serviceId');

    await prisma.packageService.deleteMany({
      where: { packageId: packageId!, serviceId: serviceId! }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
