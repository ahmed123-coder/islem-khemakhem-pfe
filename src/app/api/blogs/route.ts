import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
