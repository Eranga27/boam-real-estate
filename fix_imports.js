const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  const replacements = [
    { from: /\.\.\/\.\.\/utils/g, to: '@/lib' },
    { from: /\.\.\/utils/g, to: '@/lib' },
    { from: /\.\.\/\.\.\/data/g, to: '@/data' },
    { from: /\.\.\/\.\.\/types/g, to: '@/types' },
    { from: /\.\.\/\.\.\/components/g, to: '@/components' }
  ];

  for (const rep of replacements) {
    if (content.match(rep.from)) {
      content = content.replace(rep.from, rep.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed imports:', filePath);
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
