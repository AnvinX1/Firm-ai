/**
 * Create app icon with F letter and red background
 * This script creates a 1024x1024 PNG icon for Tauri
 */

const fs = require('fs');
const path = require('path');

// For Node.js, we'll use a simple approach with a canvas library if available
// Otherwise, we'll create an SVG and convert it, or use a simple method

// Primary color: hsl(350, 89%, 46%) = rgb(217, 23, 23)
// Darker red: rgb(150, 15, 15)

const createIconSVG = () => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D91717;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#960F0F;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#grad)"/>
  <text x="512" y="720" font-family="Arial, sans-serif" font-size="700" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">F</text>
</svg>`;
  
  return svg;
};

// Create the icon directory if it doesn't exist
const iconDir = path.join(__dirname, '../src-tauri/icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Write SVG file
const svgPath = path.join(iconDir, 'app-icon.svg');
fs.writeFileSync(svgPath, createIconSVG());

console.log('Created SVG icon at:', svgPath);
console.log('Note: You need to convert this SVG to PNG using:');
console.log('1. Use an online converter (e.g., https://convertio.co/svg-png/)');
console.log('2. Or use ImageMagick: magick convert app-icon.svg -resize 1024x1024 app-icon.png');
console.log('3. Or use Inkscape: inkscape app-icon.svg --export-filename=app-icon.png --export-width=1024');
console.log('');
console.log('Then run: pnpm tauri icon src-tauri/icons/app-icon.png');


