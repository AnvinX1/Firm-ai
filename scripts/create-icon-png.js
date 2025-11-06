/**
 * Create app icon PNG with F letter and red background
 * Uses sharp to create a 1024x1024 PNG icon
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIcon() {
  const size = 1024;
  const iconDir = path.join(__dirname, '../src-tauri/icons');
  
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  // Create SVG with F letter
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D91717;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#960F0F;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="${size / 2}" y="${size * 0.7}" font-family="Arial, sans-serif" font-size="${size * 0.68}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">F</text>
</svg>`);

  // Convert SVG to PNG
  const outputPath = path.join(iconDir, 'app-icon.png');
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log('✅ Created icon PNG at:', outputPath);
  console.log('📦 Now generating Tauri icons...');
  console.log('Run: pnpm tauri icon src-tauri/icons/app-icon.png');
}

createIcon().catch(console.error);


