const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // The previous script replaced `${property.price}` with `Rs. ${property.price}`.
    // If there was a literal `$` before it, like `$${property.price}`, it became `Rs. ${property.price}` which is correct.
    // BUT if the original was just `${property.price.toLocaleString()}` (no $ inside the JSX curly braces)
    // Wait, let's look at PropertySearch.tsx diff.
    // The previous line was: `${property.price.toLocaleString()}`
    // Oh! In JSX, text is just text! So it was literally `$ {property.price}` or similar?
    // Let me fix anything that says `Rs. $` to `Rs. `
    content = content.replace(/Rs\.\s*\$/g, 'Rs. ');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
