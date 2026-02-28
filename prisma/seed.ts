import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all data (in correct order to avoid foreign key constraints)
  await prisma.message.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.siteContent.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.service.deleteMany({});
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
      bio: 'Expert in financial consulting and investment with 10 years experience',
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
      bio: 'Specialist in digital marketing and branding',
      imageUrl: '/images/consultants/sara.jpg',
      isActive: true,
    },
  });
  console.log('✅ Created consultants:', consultant1.email, consultant2.email);

  // Create services
  const service1 = await prisma.service.create({
    data: {
      title: 'Management de la performance cachée',
      description: 'Identifier les dysfonctionnements invisibles qui freinent la performance et transformer les coûts cachés en valeur durable.',
      price: 500.00,
      durationHours: 4,
      icon: '⭐',
      isActive: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      title: 'Gestion des parcours professionnels',
      description: 'Construire des trajectoires professionnelles alignées avec la stratégie de l\'entreprise.',
      price: 400.00,
      durationHours: 3,
      icon: '👥',
      isActive: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      title: 'Marque employeur',
      description: 'Renforcer l\'attractivité et la fidélisation en créant une expérience collaborateur cohérente et engageante.',
      price: 450.00,
      durationHours: 3,
      icon: '🌟',
      isActive: true,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      title: 'Recrutement stratégique',
      description: 'Sécuriser le choix des talents pour soutenir la croissance et la performance.',
      price: 350.00,
      durationHours: 2,
      icon: '🎯',
      isActive: true,
    },
  });
  console.log('✅ Created services:', 4);

  // Create blogs
  const blogs = await prisma.blog.createMany({
    data: [
      {
        title: '5 Strategies for Business Growth in 2024',
        excerpt: 'Discover proven methods to scale your business effectively',
        content: 'Full article content here...',
        published: true,
      },
      {
        title: 'Digital Transformation: A Complete Guide',
        excerpt: 'Everything you need to know about modernizing your business',
        content: 'Full article content here...',
        published: true,
      },
      {
        title: 'Financial Planning Best Practices',
        excerpt: 'Expert tips for managing your business finances',
        content: 'Full article content here...',
        published: true,
      },
    ],
  });
  console.log('✅ Created blogs:', blogs.count);

  // Create contacts
  const contacts = await prisma.contact.createMany({
    data: [
      {
        name: 'Alice Williams',
        email: 'alice@example.com',
        message: 'Interested in business strategy consulting',
      },
      {
        name: 'Bob Davis',
        email: 'bob@example.com',
        message: 'Need help with digital transformation',
      },
    ],
  });
  console.log('✅ Created contacts:', contacts.count);

  // Create a mission
  const mission1 = await prisma.mission.create({
    data: {
      title: 'Financial Planning Project',
      description: 'Comprehensive financial planning and investment strategy',
      status: 'IN_PROGRESS',
      progress: 45,
      price: 200.00,
      startDate: new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      clientId: client.id,
      consultantId: consultant1.id,
      serviceId: service1.id,
    },
  });
  console.log('✅ Created mission:', mission1.title);

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
          title: "Vision: Votre catalyseur de performance pour un avenir ambitieux et durable.",
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
  console.log('Consultant 1: consultant@consultpro.com / consultant123');
  console.log('Consultant 2: consultant2@consultpro.com / consultant123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
