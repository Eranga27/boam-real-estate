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

    // Replace literal $ followed by interpolation
    content = content.replace(/\$?\$\{(.*?\.price.*?)\}/g, 'Rs. ${$1}');
    
    // Replace Price ($)
    content = content.replace(/Price \(\$\)/g, 'Price (Rs.)');
    content = content.replace(/Down Payment \(\$\)/g, 'Down Payment (Rs.)');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
