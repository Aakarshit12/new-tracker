// Script to copy all necessary files to the .next directory for Netlify deployment
const fs = require('fs');
const path = require('path');

// Create .next directory if it doesn't exist
if (!fs.existsSync('.next')) {
  fs.mkdirSync('.next', { recursive: true });
  console.log('Created .next directory');
}

// Function to copy a file
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Copied: ${source} -> ${destination}`);
}

// Function to copy directory contents recursively
function copyDir(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  // Copy each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next') {
        copyDir(sourcePath, destPath);
      }
    } else {
      copyFile(sourcePath, destPath);
    }
  }
}

// Copy all files from current directory to .next
copyDir('.', '.next');

console.log('All files copied to .next directory for Netlify deployment');
