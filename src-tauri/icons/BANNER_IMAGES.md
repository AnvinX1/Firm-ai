# Installer Banner Images

## Required Images for Professional Installer

Place these two files in this directory for a premium installer look:

### 1. installer-header.bmp
- **Size**: 150 × 57 pixels
- **Format**: 24-bit BMP
- **Purpose**: Displays at top of installer window

### 2. installer-sidebar.bmp
- **Size**: 164 × 314 pixels  
- **Format**: 24-bit BMP
- **Purpose**: Displays on welcome and finish pages

## Quick Create Guide

### Design Specs:
- **Background**: Black (#0A0A0A)
- **Text**: White (#FFFFFF)
- **Accent**: Red (#DC2626)
- **Logo**: Use `icon.png` from this folder

### Easiest Method (Canva):
1. Create 150x57px canvas
2. Black background
3. Add logo (40px height) + "FIRM AI" text
4. Download as PNG, convert to 24-bit BMP
5. Repeat for 164x314px sidebar

### See Full Guide:
- `../CREATE_INSTALLER_IMAGES.md` - Complete instructions
- `../INSTALLER_SETUP.md` - Installer configuration guide

## Note

**Images are optional!** The installer already looks professional without them.
Banner images are the final polish for maximum branding impact.

To add images later:
1. Create the BMP files
2. Place them in this folder
3. Uncomment image lines in `../tauri.conf.json`
4. Rebuild: `pnpm tauri build`

---

Current installer features without images:
✅ Professional text and branding
✅ Custom welcome and finish pages
✅ Red/black color scheme  
✅ License agreement
✅ Desktop shortcuts
✅ Modern UI

With banner images:
✨ Extra visual polish
✨ Company logo throughout
✨ Maximum professionalism

