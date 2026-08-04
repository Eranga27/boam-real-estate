const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replaceURL = (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace literal string 'http://localhost:5000/api/v1...' 
    // with \`${process.env.NEXT_PUBLIC_API_URL}/api/v1...\`
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');
    
    // Replace inside template literals: `http://localhost:5000/api/v1...`
    // with `${process.env.NEXT_PUBLIC_API_URL}/api/v1...`
    content = content.replace(/http:\/\/localhost:5000/g, '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}');

    // Due to the second replacement, the first one might get messed up if they both apply.
    // Let's refine it.
    
    // reset content
    content = original;

    // 1. Find all 'http://localhost:5000...' and convert them to template strings
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');

    // 2. Find all "http://localhost:5000..." and convert them to template strings
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');

    // 3. Find inside existing template literals `http://localhost:5000...` and replace just the localhost part
    content = content.replace(/`http:\/\/localhost:5000/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
};

walkDir(directoryPath, replaceURL);
