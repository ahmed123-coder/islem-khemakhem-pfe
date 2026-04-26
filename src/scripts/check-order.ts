import { prisma } from './src/lib/prisma';

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: 'cmoeikgjz0001ueg5sv3wr2rm' },
    include: { consultant: true }
  });
  console.log(JSON.stringify(order, null, 2));
}

main().catch(console.error);
