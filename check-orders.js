const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      client: true,
      consultant: true
    }
  })
  console.log('Orders found:', JSON.stringify(orders.map(o => ({
    id: o.id,
    client: o.client.email,
    consultant: o.consultant?.email,
    status: o.status
  })), null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
