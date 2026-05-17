const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contents = [
    {
      key: 'hero-solutions',
      value: {
        title: 'Des expertises au service de votre performance',
        subtitle: 'Quatre domaines d\'intervention complémentaires pour une transformation globale et pérenne de votre entreprise.',
      },
    },
    {
      key: 'hero-approches',
      value: {
        title: 'Nos approches',
        subtitle: 'Depuis 2018, nous accompagnons les entreprises dans le renforcement de la réussite de leurs projets, grâce à trois approches complémentaires.',
      },
    },
  ];

  for (const item of contents) {
    await prisma.siteContent.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    });
    console.log(`Upserted ${item.key}`);
  }
}

main().finally(() => prisma.$disconnect());
