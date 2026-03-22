import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      client: true,
      consultant: true
    }
  })
  console.log('Orders found:', orders.map(o => ({
    id: o.id,
    client: o.client.email,
    consultant: o.consultant?.email,
    status: o.status
  })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
