import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all users
  await prisma.user.deleteMany({});
  console.log('✅ Deleted all users');

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

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

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: 'user@consultpro.com',
      password: hashedUserPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });
  console.log('✅ Created regular user:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
