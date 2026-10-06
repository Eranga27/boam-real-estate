import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@boamrealtors.lk';
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'BOAM System Admin';

  // No default password: a value in the source code is a value anyone with the repo knows
  if (!password || password.length < 12) {
    throw new Error('Set ADMIN_PASSWORD (at least 12 characters) before seeding the admin account.');
  }

  console.log(`⏳ Seeding admin account: ${email}...`);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      fullName,
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ Admin account created/updated successfully!`);
  console.log(`   ID:       ${admin.id}`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Role:     ${admin.role}`);
  console.log(`\n🔑 You can now log in at /admin/login with ADMIN_EMAIL and ADMIN_PASSWORD.`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
