import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all data
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
      phone: '+216 20 123 456',
      role: 'CLIENT',
    },
  });
  console.log('✅ Created client user:', client.email);

  // Create consultants (all same rate since client pays service price)
  const consultant1 = await prisma.consultant.create({
    data: {
      email: 'consultant@consultpro.com',
      password: hashedConsultantPassword,
      name: 'أحمد محمد',
      specialty: 'استشارات مالية',
      hourlyRate: 100.00, // Same rate for all
      bio: 'خبير في الاستشارات المالية والاستثمار مع خبرة 10 سنوات',
      imageUrl: '/images/consultants/ahmed.jpg',
      isActive: true,
    },
  });
  
  const consultant2 = await prisma.consultant.create({
    data: {
      email: 'consultant2@consultpro.com',
      password: hashedConsultantPassword,
      name: 'سارة أحمد',
      specialty: 'استشارات تسويقية',
      hourlyRate: 100.00, // Same rate for all
      bio: 'متخصصة في التسويق الرقمي والعلامات التجارية',
      imageUrl: '/images/consultants/sara.jpg',
      isActive: true,
    },
  });

  const consultant3 = await prisma.consultant.create({
    data: {
      email: 'consultant3@consultpro.com',
      password: hashedConsultantPassword,
      name: 'عمر حسن',
      specialty: 'استشارات تقنية',
      hourlyRate: 100.00, // Same rate for all
      bio: 'خبير في التكنولوجيا والتحول الرقمي',
      imageUrl: '/images/consultants/omar.jpg',
      isActive: true,
    },
  });
  console.log('✅ Created consultants:', consultant1.email, consultant2.email, consultant3.email);

  // Create services
  const service1 = await prisma.service.create({
    data: {
      title: 'استشارة مالية شخصية',
      description: 'جلسة استشارية شخصية لتحليل الوضع المالي ووضع خطة استثمارية',
      price: 200.00,
      durationHours: 2,
      icon: '💰',
      isActive: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      title: 'تحليل السوق والمنافسين',
      description: 'دراسة شاملة للسوق والمنافسين مع توصيات استراتيجية',
      price: 350.00,
      durationHours: 3,
      icon: '📊',
      isActive: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      title: 'استشارة تقنية متخصصة',
      description: 'استشارة تقنية لحلول الأعمال والتحول الرقمي',
      price: 300.00,
      durationHours: 2,
      icon: '💻',
      isActive: true,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      title: 'خطة تسويقية متكاملة',
      description: 'وضع خطة تسويقية شاملة للمشاريع الناشئة',
      price: 450.00,
      durationHours: 4,
      icon: '📈',
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
  console.log('Consultant 1: consultant@consultpro.com / consultant123');
  console.log('Consultant 2: consultant2@consultpro.com / consultant123');
  console.log('Consultant 3: consultant3@consultpro.com / consultant123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
