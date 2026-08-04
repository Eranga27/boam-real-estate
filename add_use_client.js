const fs = require('fs');
const path = require('path');

const targets = [
  'src/components/home/Hero.tsx',
  'src/components/home/FeaturedProperties.tsx',
  'src/components/home/StatsStrip.tsx',
  'src/components/home/WhyChooseUs.tsx',
  'src/components/home/HowItWorks.tsx',
  'src/components/home/PopularLocations.tsx',
  'src/components/home/CtaBanner.tsx',
  'src/components/property/PropertyCard.tsx',
  'src/components/detail/Gallery.tsx',
  'src/components/detail/InquirySidebar.tsx',
  'src/components/brand/Logo.tsx',
  'src/components/search/FilterBar.tsx',
];

const base = 'f:/boam-realestate';
const directive = "'use client';\n";

for (const rel of targets) {
  const full = path.join(base, rel);
  if (!fs.existsSync(full)) { console.log('SKIP (not found):', rel); continue; }
  let content = fs.readFileSync(full, 'utf-8');
  if (!content.startsWith(directive)) {
    content = directive + content;
    fs.writeFileSync(full, content);
    console.log('Added use client:', rel);
  } else {
    console.log('Already has use client:', rel);
  }
}
