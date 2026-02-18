import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all data
  await prisma.message.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.subscriptions.deleteMany({});
  await prisma.subscription_packages.deleteMany({});
  await prisma.subscription_plans.deleteMany({});
  await prisma.consultant.deleteMany({});
  await prisma.siteContent.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.service.deleteMany({});
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

  // Create consultant
  const consultant = await prisma.consultant.create({
    data: {
      email: 'consultant@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Consultant Expert',
      specialty: 'Business Strategy',
    },
  });
  console.log('✅ Created consultant:', consultant.email);

  // Create services
  const services = await prisma.service.createMany({
    data: [
      {
        title: 'Business Strategy',
        description: 'Develop comprehensive strategies to drive growth and competitive advantage',
        icon: '📊',
      },
      {
        title: 'Digital Transformation',
        description: 'Modernize operations with cutting-edge technology solutions',
        icon: '💻',
      },
      {
        title: 'Financial Advisory',
        description: 'Expert guidance on financial planning and investment strategies',
        icon: '💰',
      },
    ],
  });
  console.log('✅ Created services:', services.count);

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

  // Create subscription plans
  const essentialPlan = await prisma.subscription_plans.create({
    data: {
      name: 'Essential',
      nameAr: 'أساسي',
      planType: 'ESSENTIAL',
      description: 'Perfect for small businesses',
      active: true,
    },
  });

  const proPlan = await prisma.subscription_plans.create({
    data: {
      name: 'Pro',
      nameAr: 'محترف',
      planType: 'PRO',
      description: 'For growing companies',
      active: true,
    },
  });

  const premiumPlan = await prisma.subscription_plans.create({
    data: {
      name: 'Premium',
      nameAr: 'متميز',
      planType: 'PREMIUM',
      description: 'Enterprise solution',
      active: true,
    },
  });
  console.log('✅ Created subscription plans');

  // Create subscription packages
  await prisma.subscription_packages.createMany({
    data: [
      {
        planId: essentialPlan.id,
        priceMonthly: 99.000,
        priceYearly: 990.000,
        currency: 'TND',
        features: JSON.stringify(['50 messages', '1 mission', 'Basic diagnostic']),
        maxMessages: 50,
        maxMissions: 1,
        hasDiagnostic: true,
      },
      {
        planId: proPlan.id,
        priceMonthly: 199.000,
        priceYearly: 1990.000,
        currency: 'TND',
        features: JSON.stringify(['200 messages', '5 missions', 'Advanced diagnostic', 'Priority support']),
        maxMessages: 200,
        maxMissions: 5,
        hasDiagnostic: true,
      },
      {
        planId: premiumPlan.id,
        priceMonthly: 399.000,
        priceYearly: 3990.000,
        currency: 'TND',
        features: JSON.stringify(['Unlimited messages', 'Unlimited missions', 'Full diagnostic', '24/7 support', 'Dedicated consultant']),
        maxMessages: null,
        maxMissions: null,
        hasDiagnostic: true,
      },
    ],
  });
  console.log('✅ Created subscription packages');

  // Create site content
  const navbar = await prisma.siteContent.create({
    data: {
      key: 'navbar',
      value: {
        logo: 'DSL Conseil',
        links: [
          { label: 'Accueil', href: '/' },
          { label: 'Services', href: '/services' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    },
  });
  console.log('✅ Created navbar content');

  const hero = await prisma.siteContent.create({
    data: {
      key: 'hero',
      value: {
        title: "Transformez votre entreprise avec l'excellence",
        subtitle: 'Conseil en management, RH, qualité et performance. Nous accompagnons les PME vers l\'efficacité et la croissance durable.',
        ctaText: 'Prendre rendez-vous',
        ctaLink: '/prendre-rdv',
      },
    },
  });
  console.log('✅ Created hero content');

  const footer = await prisma.siteContent.create({
    data: {
      key: 'footer',
      value: {
        company: 'DSL Conseil',
        tagline: 'Cabinet de conseil en management, RH, qualité et performance. Nous accompagnons les PME dans leur transformation.',
        email: 'contact@dsl-conseil.com',
        phone: '+33 1 23 45 67 89',
        address: 'Paris, France',
        social: {
          linkedin: 'https://linkedin.com/company/dsl-conseil',
          twitter: 'https://twitter.com/dslconseil',
        },
      },
    },
  });
  console.log('✅ Created footer content');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
