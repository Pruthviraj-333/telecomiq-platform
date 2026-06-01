const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const srcDir = path.join(__dirname, 'dist', 'frontend', 'browser');
const destDir = path.join(__dirname, 'dist', 'frontend');

if (fs.existsSync(srcDir)) {
  console.log(`Copying build files from ${srcDir} to ${destDir}...`);
  fs.readdirSync(srcDir).forEach((childItemName) => {
    copyRecursiveSync(path.join(srcDir, childItemName), path.join(destDir, childItemName));
  });
  console.log('Postbuild copy completed successfully!');
} else {
  console.warn(`Source directory not found: ${srcDir}`);
}
