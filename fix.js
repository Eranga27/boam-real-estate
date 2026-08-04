const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (content.includes('react-router-dom')) {
    // Replace imports
    content = content.replace(/import\s+\{\s*Link([^}]*)\}\s+from\s+['"]react-router-dom['"]/g, "import Link from 'next/link';\nimport { $1 } from 'react-router-dom'");
    content = content.replace(/import\s+\{\s*useNavigate([^}]*)\}\s+from\s+['"]react-router-dom['"]/g, "import { useRouter as useNavigate$1 } from 'next/navigation'");
    content = content.replace(/import\s+\{\s*useLocation([^}]*)\}\s+from\s+['"]react-router-dom['"]/g, "import { usePathname as useLocation$1 } from 'next/navigation'");
    
    // Clean up empty imports
    content = content.replace(/import\s+\{\s*,\s*\}\s+from\s+['"]react-router-dom['"];?/g, '');
    content = content.replace(/import\s+\{\s*\}\s+from\s+['"]react-router-dom['"];?/g, '');
    
    // Replace to= with href=
    content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
    content = content.replace(/<NavLink([^>]+)to=/g, '<Link$1href=');
    content = content.replace(/<\/NavLink>/g, '</Link>');
    
    changed = true;
  }

  if (content.includes('end={')) {
    content = content.replace(/\s+end=\{[^}]+\}/g, '');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk('f:/boam-realestate/src/components');
