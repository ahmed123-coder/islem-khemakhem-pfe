import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all data
  await prisma.notification.deleteMany({});
  await prisma.missionFile.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.call.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.serviceTier.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.siteContent.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.blog.deleteMany({});
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
  console.log('✅ Created client user:', client.email);

  // Create consultants
  const consultant1 = await prisma.consultant.create({
    data: {
      email: 'consultant@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Ahmed Mohamed',
      specialty: 'Financial Consulting',
      hourlyRate: 100.00,
      bio: 'Expert in financial consulting and investment with 10 years experience.',
      imageUrl: '/images/consultants/ahmed.jpg',
      isActive: true,
    },
  });
  
  const consultant2 = await prisma.consultant.create({
    data: {
      email: 'consultant2@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Sara Ahmed',
      specialty: 'Marketing Consulting',
      hourlyRate: 100.00,
      bio: 'Specialist in digital marketing',
      imageUrl: '/images/consultants/sara.jpg',
      isActive: true,
    },
  });
  console.log('✅ Created consultants');

  // Create services with tiers
  const service1 = await prisma.service.create({
    data: {
      name: 'Management de la performance cachée',
      description: 'Identifier les dysfonctionnements invisibles qui freinent la performance et transformer les coûts cachés en valeur durable.',
      category: 'Management',
      isActive: true,
    },
  });

  await prisma.serviceTier.createMany({
    data: [
      { serviceId: service1.id, tierType: 'BASIC', price: 300, maxMessages: 50, maxCallDuration: 60, description: 'Basic tier' },
      { serviceId: service1.id, tierType: 'STANDARD', price: 500, maxMessages: 150, maxCallDuration: 180, canSelectConsultant: true, description: 'Standard tier' },
      { serviceId: service1.id, tierType: 'PREMIUM', price: 800, maxMessages: null, maxCallDuration: null, canSelectConsultant: true, description: 'Premium tier' },
    ],
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Gestion des parcours professionnels',
      description: 'Construire des trajectoires professionnelles alignées avec la stratégie de l\'entreprise.',
      category: 'RH',
      isActive: true,
    },
  });

  await prisma.serviceTier.createMany({
    data: [
      { serviceId: service2.id, tierType: 'BASIC', price: 250, maxMessages: 40, maxCallDuration: 45, description: 'Basic tier' },
      { serviceId: service2.id, tierType: 'STANDARD', price: 400, maxMessages: 120, maxCallDuration: 150, canSelectConsultant: true, description: 'Standard tier' },
      { serviceId: service2.id, tierType: 'PREMIUM', price: 650, maxMessages: null, maxCallDuration: null, canSelectConsultant: true, description: 'Premium tier' },
    ],
  });

  const service3 = await prisma.service.create({
    data: {
      name: 'Marque employeur',
      description: 'Renforcer l\'attractivité et la fidélisation en créant une expérience collaborateur cohérente et engageante.',
      category: 'RH',
      isActive: true,
    },
  });

  await prisma.serviceTier.createMany({
    data: [
      { serviceId: service3.id, tierType: 'BASIC', price: 300, maxMessages: 50, maxCallDuration: 60, description: 'Basic tier' },
      { serviceId: service3.id, tierType: 'STANDARD', price: 450, maxMessages: 130, maxCallDuration: 150, canSelectConsultant: true, description: 'Standard tier' },
      { serviceId: service3.id, tierType: 'PREMIUM', price: 700, maxMessages: null, maxCallDuration: null, canSelectConsultant: true, description: 'Premium tier' },
    ],
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Recrutement stratégique',
      description: 'Sécuriser le choix des talents pour soutenir la croissance et la performance.',
      category: 'RH',
      isActive: true,
    },
  });

  await prisma.serviceTier.createMany({
    data: [
      { serviceId: service4.id, tierType: 'BASIC', price: 200, maxMessages: 30, maxCallDuration: 45, description: 'Basic tier' },
      { serviceId: service4.id, tierType: 'STANDARD', price: 350, maxMessages: 100, maxCallDuration: 120, canSelectConsultant: true, description: 'Standard tier' },
      { serviceId: service4.id, tierType: 'PREMIUM', price: 550, maxMessages: null, maxCallDuration: null, canSelectConsultant: true, description: 'Premium tier' },
    ],
  });

  console.log('✅ Created services with tiers');

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
        key: 'navbar',
        value: {
          logo: 'DSL Conseil',
          logoUrl: '/logo.jpeg',
          links: [
            { label: 'Accueil', href: '/' },
            { label: 'Services', href: '/services' },
            { label: 'Blog', href: '/blog' },
            { label: 'Contact', href: '/contact' },
          ],
        },
      },
      {
        key: 'hero',
        value: {
          title: 'Vision: Votre catalyseur de performance pour un avenir ambitieux et durable.',
          subtitle: 'Conseil en management, RH, qualité et performance.',
          ctaText: 'Prendre rendez-vous',
          ctaLink: '/login',
        },
      },
      {
        key: 'footer',
        value: {
          company: 'DSL Conseil',
          logoUrl: '/logo.jpeg',
          tagline: 'Cabinet de conseil en management',
          email: 'contact@dsl-conseil.com',
          phone: '+33 1 23 45 67 89',
          address: 'Paris, France',
        },
      },
    ],
  });
  console.log('✅ Created site content');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@consultpro.com / admin123');
  console.log('Client: client@consultpro.com / client123');
  console.log('Consultant: consultant@consultpro.com / consultant123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
