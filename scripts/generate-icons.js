// This script generates static icon files for PWA
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#6366f1"/>
  <path d="M256 128C185.3 128 128 185.3 128 256s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 208c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z" fill="white"/>
  <circle cx="256" cy="256" r="40" fill="white"/>
  <path d="M256 64v64M256 384v64M64 256h64M384 256h64" stroke="white" stroke-width="20" stroke-linecap="round"/>
</svg>`;

// Create placeholder files (you would need a proper SVG to PNG converter in production)
const sizes = [192, 512];
sizes.forEach(size => {
  const filename = path.join(__dirname, '..', 'public', `icon-${size}.png`);
  
  // For now, create a placeholder text file
  // In production, you'd use a library like sharp or canvas to convert SVG to PNG
  fs.writeFileSync(filename, `Placeholder for ${size}x${size} icon - replace with actual PNG`);
  console.log(`Created placeholder: ${filename}`);
});

console.log('Icon placeholders created. Replace with actual PNG files.');