import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all data in dependency order (children before parents)
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.missionFile.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.call.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.serviceTier.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.siteContent.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.consultant.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Deleted all data');

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedClientPassword = await bcrypt.hash('client123', 10);
  const hashedConsultantPassword = await bcrypt.hash('consultant123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@consultpro.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create client user
  const client = await prisma.user.create({
    data: {
      email: 'client@consultpro.com',
      password: hashedClientPassword,
      name: 'Client User',
      role: 'CLIENT',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@consultpro.com',
      password: hashedClientPassword,
      name: 'Client User',
      role: 'CLIENT',
    },
  });
  console.log('✅ Created client user:', client.email);

  // Create consultants
  const consultant1 = await prisma.consultant.create({
    data: {
      email: 'consultant@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Ahmed Mohamed',
      specialty: 'Management de la Performance',
      hourlyRate: 120.00,
      bio: 'Expert en management de la performance avec 15 ans d\'expérience.',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      isActive: true,
    },
  });

  const consultant2 = await prisma.consultant.create({
    data: {
      email: 'consultant2@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Sara Ahmed',
      specialty: 'Ressources Humaines',
      hourlyRate: 110.00,
      bio: 'Spécialiste en développement des talents et recrutement.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      isActive: true,
    },
  });

  const consultant3 = await prisma.consultant.create({
    data: {
      email: 'consultant3@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Jean Dupont',
      specialty: 'Qualité & Processus',
      hourlyRate: 105.00,
      bio: 'Expert en certification ISO et optimisation des processus.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      isActive: true,
    },
  });

  const consultant4 = await prisma.consultant.create({
    data: {
      email: 'consultant4@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Marie Lefebvre',
      specialty: 'Stratégie Digitale',
      hourlyRate: 130.00,
      bio: 'Conseillère en transformation digitale et innovation.',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      isActive: true,
    },
  });
  console.log('✅ Created consultants');

  // Helper to create the 4 packs for each service
  const createPacks = async (serviceId: string) => {
    await prisma.serviceTier.createMany({
      data: [
        { 
          serviceId, 
          tierType: 'BASIC', 
          price: 150, 
          maxMessages: 20, 
          maxCallDuration: 90, 
          description: 'Pack 1 : Séance de découverte (1h30m)',
          sessionsConfig: [
            { label: 'Audit Initial', duration: 90 }
          ]
        },
        { 
          serviceId, 
          tierType: 'STANDARD', 
          price: 300, 
          maxMessages: 50, 
          maxCallDuration: 180, 
          description: 'Pack 2 : Formation (3h)',
          sessionsConfig: [
            { label: 'Formation intensive', duration: 180 }
          ]
        },
        { 
          serviceId, 
          tierType: 'PREMIUM', 
          price: 750, 
          maxMessages: 100, 
          maxCallDuration: 450, 
          canSelectConsultant: true,
          description: 'Pack 3 : Formation + 3 séances (3h + 3x1h30m)',
          sessionsConfig: [
            { label: 'Formation de base', duration: 180 },
            { label: 'Session de Suivi 1', duration: 90 },
            { label: 'Session de Suivi 2', duration: 90 },
            { label: 'Session de Suivi 3', duration: 90 }
          ]
        },
        { 
          serviceId, 
          tierType: 'ULTIMATE', 
          price: 1500, 
          maxMessages: null, 
          maxCallDuration: null, 
          canSelectConsultant: true,
          description: 'Pack 4 : Mise totale du projet',
          sessionsConfig: [
            { label: 'Kick-off Projet', duration: 180 },
            { label: 'Accompagnement Hebdo 1', duration: 120 },
            { label: 'Accompagnement Hebdo 2', duration: 120 },
            { label: 'Accompagnement Hebdo 3', duration: 120 },
            { label: 'Phase de Clôture', duration: 180 }
          ]
        },
      ],
    });
  };

  const service1 = await prisma.service.create({
    data: {
      name: 'Management de la performance cachée',
      description: 'Identifier les dysfonctionnements invisibles qui freinent la performance et transformer les coûts cachés en valeur durable.',
      category: 'Management',
      isActive: true,
      consultants: {
        connect: [{ id: consultant1.id }, { id: consultant2.id }]
      }
    },
  });
  await createPacks(service1.id);

  const service2 = await prisma.service.create({
    data: {
      name: 'Gestion des parcours professionnels',
      description: 'Construire des trajectoires professionnelles alignées avec la stratégie de l\'entreprise.',
      category: 'RH',
      isActive: true,
      consultants: {
        connect: [{ id: consultant3.id }]
      }
    },
  });
  await createPacks(service2.id);

  const service3 = await prisma.service.create({
    data: {
      name: 'Marque employeur',
      description: 'Renforcer l\'attractivité et la fidélisation en créant une expérience collaborateur cohérente et engageante.',
      category: 'RH',
      isActive: true,
      consultants: {
        connect: [{ id: consultant4.id }]
      }
    },
  });
  await createPacks(service3.id);

  const service4 = await prisma.service.create({
    data: {
      name: 'Recrutement stratégique',
      description: 'Sécuriser le choix des talents pour soutenir la croissance et la performance.',
      category: 'RH',
      isActive: true,
    },
  });
  await createPacks(service4.id);

  console.log('✅ Created services with 4-pack system');

  // Create blogs
  await prisma.blog.createMany({
    data: [
      { title: '5 Strategies for Business Growth', excerpt: 'Discover proven methods', content: 'Content...', published: true },
      { title: 'Digital Transformation Guide', excerpt: 'Everything you need to know', content: 'Content...', published: true },
    ],
  });
  console.log('✅ Created blogs');

  // Create contacts
  await prisma.contact.createMany({
    data: [
      { name: 'Alice Williams', email: 'alice@example.com', message: 'Interested in consulting' },
      { name: 'Bob Davis', email: 'bob@example.com', message: 'Need help' },
    ],
  });
  console.log('✅ Created contacts');

  // Create site content
  await prisma.siteContent.createMany({
    data: [
      {
        key: 'logo',
        value: {
          url: '/logo-1772242356501-removebg-preview.png',
        },
      },
      {
        key: 'hero',
        value: {
          title: 'Cabinet de Conseil & Accompagnement',
          subtitle: 'Accédez à un réseau d’experts métier engagés et inspirants afin de favoriser la pérennité de votre entreprise.',
          ctaText: 'Prendre rendez-vous',
          ctaLink: '/login',
          image: '/solutionHero.jpeg',
        },
      },
      {
        key: 'footer',
        value: {
          company: 'DSL Conseil',
          logoUrl: '/logo-1772242356501-removebg-preview.png',
          tagline: 'Cabinet de conseil en management',
          email: 'contact@dsl-conseil.com',
          phone: '+33 1 23 45 67 89',
          address: 'Paris, France',
        },
      },
      {
        key: 'hero-solutions',
        value: {
          title: 'Des expertises au service de votre performance',
          subtitle: 'Quatre domaines d\'intervention complémentaires pour une transformation globale et pérenne de votre entreprise.',
          image: '/solutionHero.jpeg',
        },
      },
      {
        key: 'hero-approches',
        value: {
          title: 'Nos approches',
          subtitle: 'Depuis 2018, nous accompagnons les entreprises dans le renforcement de la réussite de leurs projets, grâce à trois approches complémentaires.',
          image: '/solutionHero.jpeg',
        },
      },
      {
        key: 'hero-contact',
        value: {
          title: 'Parlons de votre projet',
          subtitle: 'Notre équipe vous répond sous 24 heures. Contactez-nous pour transformer vos défis en opportunités de croissance.',
          image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600',
        },
      },
    ],
  });
  console.log('✅ Created site content');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@consultpro.com / admin123');
  console.log('Client: client@consultpro.com / client123');
  console.log('Client2: client2@consultpro.com / client123');
  console.log('Consultant 1: consultant@consultpro.com / consultant123');
  console.log('Consultant 2: consultant2@consultpro.com / consultant123');
  console.log('Consultant 3: consultant3@consultpro.com / consultant123');
  console.log('Consultant 4: consultant4@consultpro.com / consultant123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
