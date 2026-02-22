import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all data
  await prisma.consultantService.deleteMany({});
  await prisma.packageService.deleteMany({});
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

  // Create consultants
  const consultant1 = await prisma.consultant.create({
    data: {
      email: 'consultant@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Consultant Expert',
      specialty: 'Business Strategy',
    },
  });
  
  const consultant2 = await prisma.consultant.create({
    data: {
      email: 'consultant2@consultpro.com',
      password: hashedConsultantPassword,
      name: 'Marie Dupont',
      specialty: 'Digital Transformation',
    },
  });
  console.log('✅ Created consultants:', consultant1.email, consultant2.email);

  // Create services
  const service1 = await prisma.service.create({
    data: {
      title: 'Business Strategy',
      description: 'Develop comprehensive strategies to drive growth and competitive advantage',
      icon: '📊',
    },
  });

  const service2 = await prisma.service.create({
    data: {
      title: 'Digital Transformation',
      description: 'Modernize operations with cutting-edge technology solutions',
      icon: '💻',
    },
  });

  const service3 = await prisma.service.create({
    data: {
      title: 'Financial Advisory',
      description: 'Expert guidance on financial planning and investment strategies',
      icon: '💰',
    },
  });
  console.log('✅ Created services:', 3);

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
  const essentialPackage = await prisma.subscription_packages.create({
    data: {
      planId: essentialPlan.id,
      priceMonthly: 99.000,
      priceYearly: 990.000,
      currency: 'TND',
      features: JSON.stringify(['50 messages', '1 mission', 'Basic diagnostic']),
      maxMessages: 50,
      maxMissions: 1,
      hasDiagnostic: true,
    },
  });

  const proPackage = await prisma.subscription_packages.create({
    data: {
      planId: proPlan.id,
      priceMonthly: 199.000,
      priceYearly: 1990.000,
      currency: 'TND',
      features: JSON.stringify(['200 messages', '5 missions', 'Advanced diagnostic', 'Priority support']),
      maxMessages: 200,
      maxMissions: 5,
      hasDiagnostic: true,
    },
  });

  const premiumPackage = await prisma.subscription_packages.create({
    data: {
      planId: premiumPlan.id,
      priceMonthly: 399.000,
      priceYearly: 3990.000,
      currency: 'TND',
      features: JSON.stringify(['Unlimited messages', 'Unlimited missions', 'Full diagnostic', '24/7 support', 'Dedicated consultant']),
      maxMessages: null,
      maxMissions: null,
      hasDiagnostic: true,
    },
  });
  console.log('✅ Created subscription packages');

  // Link services to packages
  await prisma.packageService.createMany({
    data: [
      { packageId: essentialPackage.id, serviceId: service1.id },
      { packageId: proPackage.id, serviceId: service1.id },
      { packageId: proPackage.id, serviceId: service2.id },
      { packageId: premiumPackage.id, serviceId: service1.id },
      { packageId: premiumPackage.id, serviceId: service2.id },
      { packageId: premiumPackage.id, serviceId: service3.id },
    ],
  });
  console.log('✅ Linked services to packages');

  // Link consultants to services
  await prisma.consultantService.createMany({
    data: [
      { consultantId: consultant1.id, serviceId: service1.id },
      { consultantId: consultant1.id, serviceId: service3.id },
      { consultantId: consultant2.id, serviceId: service2.id },
    ],
  });
  console.log('✅ Linked consultants to services');

  // Create subscriptions for client
  const activeSubscription = await prisma.subscriptions.create({
    data: {
      userId: client.id,
      packageId: proPackage.id,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
    },
  });
  console.log('✅ Created active subscription for client');

  // Create missions
  const mission1 = await prisma.mission.create({
    data: {
      title: 'Digital Transformation Strategy',
      description: 'Develop a comprehensive digital transformation roadmap for the company',
      status: 'ACTIVE',
      progress: 45,
      clientId: client.id,
      consultantId: consultant1.id,
      subscriptionId: activeSubscription.id,
      messageCount: 12,
    },
  });

  const mission2 = await prisma.mission.create({
    data: {
      title: 'Business Process Optimization',
      description: 'Analyze and optimize core business processes to improve efficiency',
      status: 'ACTIVE',
      progress: 70,
      clientId: client.id,
      consultantId: consultant2.id,
      subscriptionId: activeSubscription.id,
      messageCount: 25,
    },
  });

  const mission3 = await prisma.mission.create({
    data: {
      title: 'Market Expansion Analysis',
      description: 'Research and analyze potential new markets for expansion',
      status: 'PENDING',
      progress: 0,
      clientId: client.id,
      consultantId: consultant1.id,
      subscriptionId: activeSubscription.id,
      messageCount: 0,
    },
  });

  const mission4 = await prisma.mission.create({
    data: {
      title: 'Financial Restructuring',
      description: 'Complete financial audit and restructuring plan',
      status: 'COMPLETED',
      progress: 100,
      clientId: client.id,
      consultantId: consultant2.id,
      subscriptionId: activeSubscription.id,
      messageCount: 48,
    },
  });
  console.log('✅ Created missions:', 4);

  // Create messages for missions
  await prisma.message.createMany({
    data: [
      {
        content: 'Hello, I would like to discuss the digital transformation strategy.',
        senderId: client.id,
        missionId: mission1.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'Of course! Let me share some initial insights on your current digital infrastructure.',
        senderId: client.id,
        missionId: mission1.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000),
      },
      {
        content: 'I have reviewed your business processes. Here are my recommendations.',
        senderId: client.id,
        missionId: mission2.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'Thank you for the detailed analysis. When can we schedule a follow-up meeting?',
        senderId: client.id,
        missionId: mission2.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'The financial restructuring has been completed successfully.',
        senderId: client.id,
        missionId: mission4.id,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created messages for missions');

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

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@consultpro.com / admin123');
  console.log('Client: client@consultpro.com / client123');
  console.log('Consultant: consultant@consultpro.com / consultant123');
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
