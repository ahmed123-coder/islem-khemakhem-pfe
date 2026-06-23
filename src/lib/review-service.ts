import { prisma } from './prisma'

export async function updateConsultantRating(consultantId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      consultantId,
      isPublished: true,
      type: 'CONSULTANT'
    },
    _avg: {
      rating: true
    },
    _count: {
      id: true
    }
  })

  await prisma.consultant.update({
    where: { id: consultantId },
    data: {
      avgRating: stats._avg.rating || 0,
      reviewCount: stats._count.id || 0
    }
  })
}

export async function updateServiceRating(serviceId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      serviceId,
      isPublished: true,
      type: 'SERVICE'
    },
    _avg: {
      rating: true
    },
    _count: {
      id: true
    }
  })

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      avgRating: stats._avg.rating || 0,
      reviewCount: stats._count.id || 0
    }
  })
}
