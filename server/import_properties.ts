import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

async function main() {
  const txtPath = path.join(__dirname, '../detailstoadd.txt');
  const content = fs.readFileSync(txtPath, 'utf8');

  // Find admin user
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('No admin user found. Creating a default admin...');
    admin = await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: 'admin@boam.com',
        password: 'hashedpassword', // Dummy password
        role: 'ADMIN',
        isEmailVerified: true,
      }
    });
  }

  const entries = content.split(/\n\n+/).map(e => e.trim()).filter(e => e);

  for (const entry of entries) {
    const lines = entry.split('\n');
    let location = 'Unknown';
    let description = '';
    let priceStr = '0';
    let contactPhone = '';
    let picturesLine = '';
    let addressLine = '';

    for (const line of lines) {
      if (line.match(/^\d+\.\s*Location\s*-\s*(.*)/i)) {
        location = line.match(/^\d+\.\s*Location\s*-\s*(.*)/i)?.[1]?.trim() || '';
      } else if (line.match(/^Description\s*-\s*(.*)/i)) {
        description = line.match(/^Description\s*-\s*(.*)/i)?.[1]?.trim() || '';
      } else if (line.match(/^Price\s*-\s*(.*)/i)) {
        priceStr = line.match(/^Price\s*-\s*(.*)/i)?.[1]?.trim() || '';
      } else if (line.match(/^Contact\s*-\s*(.*)/i)) {
        contactPhone = line.match(/^Contact\s*-\s*(.*)/i)?.[1]?.trim() || '';
      } else if (line.match(/^Pictures\s*-\s*(.*)/i)) {
        picturesLine = line.match(/^Pictures\s*-\s*(.*)/i)?.[1]?.trim() || '';
      } else if (line.match(/^Address\s*-\s*(.*)/i) || line.match(/^Address:\s*(.*)/i)) {
        addressLine = (line.match(/^Address\s*-\s*(.*)/i) || line.match(/^Address:\s*(.*)/i))?.[1]?.trim() || '';
      }
    }

    // Try to parse price
    let price = 0;
    const millionsMatch = priceStr.toLowerCase().match(/([\d.]+)\s*(million|mn|lakhs|lakh)/i);
    if (millionsMatch) {
      let num = parseFloat(millionsMatch[1]);
      if (millionsMatch[2].includes('million') || millionsMatch[2].includes('mn')) {
        price = num * 1000000;
      } else if (millionsMatch[2].includes('lakh')) {
        price = num * 100000;
      }
    } else {
      // remove commas and non-digits to see if there is a flat number
      const digits = priceStr.replace(/,/g, '').match(/(\d+)/);
      if (digits) {
        price = parseFloat(digits[1]);
      }
    }

    // Estimate propertyType
    let propertyType = 'House';
    if (description.toLowerCase().includes('land') || description.toLowerCase().includes('perch')) {
      propertyType = 'Land';
    }

    // Images
    const imageNames = picturesLine.split(',').map(p => p.trim()).filter(p => p !== 'None' && p !== '');
    const finalImages: string[] = [];

    // Process and compress images if they exist
    for (const imgName of imageNames) {
      const sourceImgPath = path.join(__dirname, '../images', imgName);
      if (fs.existsSync(sourceImgPath)) {
        // We will copy and compress them to the uploads folder
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const compressedName = `property-${Date.now()}-${imgName}`;
        const destImgPath = path.join(uploadDir, compressedName);

        // Compress
        try {
          await sharp(sourceImgPath)
            .resize({ width: 1280, withoutEnlargement: true }) // Resize width to 1280 max
            .jpeg({ quality: 80 }) // Compress as JPEG
            .toFile(destImgPath);
          finalImages.push(compressedName);
          console.log(`Processed image: ${compressedName}`);
        } catch (e) {
          console.error(`Failed to process image ${imgName}`, e);
        }
      }
    }

    const title = `${propertyType} in ${location}`;
    const address = addressLine || location;
    const city = location;
    const district = location; // Or parse from city

    console.log(`Adding: ${title}`);

    await prisma.property.create({
      data: {
        title: title,
        description: description + (priceStr ? `\n\nPrice Details: ${priceStr}` : ''),
        propertyType: propertyType,
        saleOrRent: 'Sale',
        price: price,
        address: address,
        district: district,
        city: city,
        contactPhone: contactPhone,
        contactEmail: admin.email, // fallback
        images: finalImages,
        status: 'PUBLISHED', // Automatically publish since it's from admin
        userId: admin.id,
      },
    });
  }

  console.log('Import complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
