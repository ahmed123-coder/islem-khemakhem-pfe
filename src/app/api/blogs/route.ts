import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
