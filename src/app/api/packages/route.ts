import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');

    if (packageId) {
      const packageWithServices = await prisma.subscription_packages.findUnique({
        where: { id: packageId },
        include: {
          subscription_plans: true,
          services: {
            include: {
              service: {
                include: {
                  consultants: {
                    include: {
                      consultant: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                          specialty: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      return NextResponse.json(packageWithServices);
    }

    const packages = await prisma.subscription_packages.findMany({
      include: {
        subscription_plans: true,
        services: {
          include: {
            service: {
              include: {
                consultants: {
                  include: {
                    consultant: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        specialty: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
