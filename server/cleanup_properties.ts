import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAndImport() {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@boam.com' }, // This was the dummy admin email
  });

  if (admin) {
    console.log('Cleaning up previously imported properties...');
    await prisma.property.deleteMany({
      where: { userId: admin.id },
    });
    console.log('Cleaned up!');
  } else {
    // If they were using their own admin account, delete all properties for now (safe for this seed)
    // Wait, let's just delete the 'Land in Ekala' which was messed up
    console.log('Deleting the messed up "Land in Ekala" properties');
    await prisma.property.deleteMany({
      where: { title: 'Land in Ekala' },
    });
  }
}

cleanAndImport()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
