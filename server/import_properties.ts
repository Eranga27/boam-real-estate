import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const USE_CLOUDINARY =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name';

const BACKEND_URL = process.env.BACKEND_URL || 'https://boam-real-estate.onrender.com';

const prisma = new PrismaClient();

async function uploadImage(localPath: string): Promise<string | null> {
  if (USE_CLOUDINARY) {
    try {
      const res = await cloudinary.uploader.upload(localPath, {
        folder: 'boam-properties',
        resource_type: 'image',
      });
      return res.secure_url;
    } catch (e) {
      console.error('Cloudinary upload failed, falling back to local URL', e);
    }
  }
  // Fallback: store as relative path /uploads/filename
  const filename = path.basename(localPath);
  return `/uploads/${filename}`;
}

async function main() {
  const txtPath = path.join(__dirname, '../detailstoadd.txt');
  const content = fs.readFileSync(txtPath, 'utf8');

  // Find or create admin user
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log('No admin found. Creating default admin...');
    admin = await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: 'admin@boam.com',
        password: 'hashedpassword',
        role: 'ADMIN',
        isEmailVerified: true,
      },
    });
  }

  // ─── Parse the text file line-by-line ───────────────────────────────────────
  const lines = content.split(/\r?\n/);
  const properties: any[] = [];
  let cur: any = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const headerMatch = line.match(/^(\d+)\.\s*Location\s*-\s*(.*)/i);
    if (headerMatch) {
      if (cur) properties.push(cur);
      cur = {
        num: parseInt(headerMatch[1]),
        location: headerMatch[2].trim(),
        description: '',
        priceStr: '0',
        contactPhone: '+94 777 80 1470', // default
        picturesLine: '',
        addressLine: '',
      };
      continue;
    }

    if (!cur) continue;

    if (/^Description\s*-\s*/i.test(line)) {
      cur.description = line.replace(/^Description\s*-\s*/i, '').trim();
    } else if (/^Price\s*-\s*/i.test(line)) {
      cur.priceStr = line.replace(/^Price\s*-\s*/i, '').trim();
    } else if (/^Contact\s*-\s*/i.test(line)) {
      cur.contactPhone = line.replace(/^Contact\s*-\s*/i, '').trim();
    } else if (/^Pictures\s*-\s*/i.test(line)) {
      cur.picturesLine = line.replace(/^Pictures\s*-\s*/i, '').trim();
    } else if (/^Address\s*[-:]\s*/i.test(line)) {
      cur.addressLine = line.replace(/^Address\s*[-:]\s*/i, '').trim();
    }
    // Skip Property Details lines, Location sub-lines, Google Maps links etc.
  }
  if (cur) properties.push(cur);

  console.log(`Parsed ${properties.length} properties from text file.`);

  // ─── Clean old imports for this admin ───────────────────────────────────────
  console.log('Cleaning old imported properties…');
  await prisma.property.deleteMany({ where: { userId: admin.id } });

  // ─── Import each property ────────────────────────────────────────────────────
  for (const p of properties) {
    // Parse price — handles "Rs. 2.5 million", "Rs. 15 lakhs", "Rs. 210,000,000"
    let price = 0;
    const s = p.priceStr.toLowerCase();
    const mnMatch = s.match(/([\d.]+)\s*(?:million|mn)/);
    const lakhMatch = s.match(/([\d.]+)\s*(?:lakh|lakhs)/);
    const flatMatch = p.priceStr.replace(/,/g, '').match(/(\d+)/);

    if (mnMatch) {
      price = parseFloat(mnMatch[1]) * 1_000_000;
    } else if (lakhMatch) {
      price = parseFloat(lakhMatch[1]) * 100_000;
    } else if (flatMatch) {
      price = parseFloat(flatMatch[1]);
    }

    // Property type
    const descLower = p.description.toLowerCase();
    const propertyType =
      descLower.includes('land') ||
      descLower.includes('perch') ||
      descLower.includes('acre') ||
      descLower.includes('bare')
        ? 'Land'
        : 'House';

    // Images
    const imageNames = p.picturesLine
      .split(',')
      .map((n: string) => n.trim())
      .filter((n: string) => n && n.toLowerCase() !== 'none');

    const finalImages: string[] = [];

    for (const imgName of imageNames) {
      const sourceImg = path.join(__dirname, '../images', imgName);
      if (!fs.existsSync(sourceImg)) {
        console.warn(`  Image not found: ${imgName}`);
        continue;
      }

      // Compress to temp file
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const compressed = `property-${Date.now()}-${imgName}`;
      const dest = path.join(uploadDir, compressed);

      try {
        await sharp(sourceImg)
          .resize({ width: 1280, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(dest);

        const url = await uploadImage(dest);
        if (url) {
          finalImages.push(url);
          console.log(`  ✓ ${imgName} → ${USE_CLOUDINARY ? 'Cloudinary' : 'local URL'}`);
        }
      } catch (e) {
        console.error(`  Failed to process ${imgName}:`, e);
      }
    }

    const title = `${propertyType} in ${p.location}`;
    const address = p.addressLine || p.location;
    const negotiable = p.priceStr.toLowerCase().includes('negotiable');

    console.log(`Adding (#${p.num}): ${title} — Rs. ${price.toLocaleString()}`);

    await prisma.property.create({
      data: {
        title,
        description: p.description,
        propertyType,
        saleOrRent: 'Sale',
        price,
        negotiable,
        address,
        district: p.location,
        city: p.location,
        contactPhone: p.contactPhone,
        contactEmail: admin.email,
        images: finalImages,
        status: 'PUBLISHED',
        userId: admin.id,
      },
    });
  }

  console.log('\n✅ Import complete!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
