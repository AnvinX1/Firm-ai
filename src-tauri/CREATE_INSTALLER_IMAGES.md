# Creating Professional NSIS Installer Images

## Required Images

You need to create 2 BMP images for a professional installer:

### 1. Header Image (Banner)
- **File**: `src-tauri/icons/installer-header.bmp`
- **Size**: 150 x 57 pixels
- **Format**: 24-bit BMP
- **Location**: Top of installer window

### 2. Sidebar Image (Welcome/Finish Page)
- **File**: `src-tauri/icons/installer-sidebar.bmp`
- **Size**: 164 x 314 pixels
- **Format**: 24-bit BMP
- **Location**: Left side of welcome and finish pages

---

## Design Guidelines

### Color Scheme (FIRM AI Theme)
- **Primary Red**: `#DC2626` (rgb 220, 38, 38)
- **Black**: `#0A0A0A` (rgb 10, 10, 10)
- **White**: `#FFFFFF` (rgb 255, 255, 255)
- **Gray**: `#737373` (rgb 115, 115, 115)

### Header Image Design
```
[Black gradient background]
  FIRM AI [Logo] | AI-Powered Legal Learning
```

**Specifications:**
- Background: Black to dark gray gradient (horizontal)
- Logo: Your app icon (40x40px) on the left
- Text: "FIRM AI" in white, bold, 18px
- Tagline: "AI-Powered Legal Learning" in gray, 10px
- Subtle red accent line at bottom (2px height)

### Sidebar Image Design
```
┌─────────────────┐
│  [Black bg]     │
│                 │
│   FIRM AI       │
│   [Logo 80x80]  │
│                 │
│   Red accent    │
│   line          │
│                 │
│ "AI-Powered     │
│  Legal Learning"│
│                 │
│  [Subtle legal  │
│   themed icons] │
│                 │
└─────────────────┘
```

**Specifications:**
- Background: Solid black or subtle gradient
- Logo: Centered, 80x80px, with glow effect
- Red accent line: Horizontal, 3px, below logo
- Text: White, centered, modern sans-serif font
- Optional: Subtle legal-themed icons (scales, books) at bottom

---

## Quick Creation Methods

### Method 1: Using Canva (Easiest)
1. Go to [Canva.com](https://canva.com)
2. Create custom size: 150x57px (header) and 164x314px (sidebar)
3. Set background to black (`#0A0A0A`)
4. Add your logo from `src-tauri/icons/icon.png`
5. Add text "FIRM AI" and "AI-Powered Legal Learning"
6. Add red accent line (`#DC2626`)
7. Download as PNG, then convert to BMP

### Method 2: Using Photoshop/GIMP
1. Create new image with exact dimensions
2. Fill background with black
3. Import logo: File → Place → Select `icon.png`
4. Add text layers with specified fonts/colors
5. Add red line using rectangle tool
6. Save As → BMP → 24-bit

### Method 3: Using Figma (Professional)
1. Create frames: 150x57px and 164x314px
2. Design with black background
3. Add logo and text elements
4. Export as PNG @1x
5. Convert PNG to 24-bit BMP using online converter

---

## PNG to BMP Conversion

After creating PNG images, convert to 24-bit BMP:

### Online Converters:
- [Online-Convert.com](https://www.online-convert.com/)
- [Convertio.co](https://convertio.co/png-bmp/)

### Using ImageMagick (Command Line):
```bash
# Install ImageMagick first
magick convert installer-header.png -type truecolor BMP3:installer-header.bmp
magick convert installer-sidebar.png -type truecolor BMP3:installer-sidebar.bmp
```

### Using GIMP:
1. Open PNG in GIMP
2. Image → Mode → RGB (ensure 24-bit)
3. File → Export As → Select BMP
4. Use default BMP options (24-bit)
5. Save to `src-tauri/icons/`

---

## Design Tips

### For Header Image (150x57):
- Keep it simple and clean
- Use high contrast (white text on black)
- Logo should be small (40px height max)
- Text should be readable at small size
- Red accent for visual interest

### For Sidebar Image (164x314):
- Vertical layout, centered elements
- Larger logo (80-100px) for impact
- White text on black is easiest to read
- Add subtle texture or gradient for depth
- Consider adding small icons at bottom
- Leave some empty space (don't overcrowd)

---

## Example Layout Templates

### Header Template (150x57):
```
┌──────────────────────────────────────────────────┐
│ [Logo]  FIRM AI  |  AI-Powered Legal Learning   │
│ 40x40   (white)     (gray, smaller)              │
└──────────────────────────────────────────────────┘
  Black background with red accent line at bottom
```

### Sidebar Template (164x314):
```
┌────────────────┐
│                │  30px
│   [Logo 80px]  │
│                │  20px
│ ═══════════    │  Red line (3px)
│                │  20px
│    FIRM AI     │  White, bold, 24px
│                │  10px
│  AI-Powered    │  Gray, 14px
│Legal Learning  │
│                │
│   ┌─┐  ┌─┐    │  Optional: Small icons
│   └─┘  └─┘    │  at bottom
│                │
└────────────────┘
  Black background
```

---

## Testing Your Images

1. Save BMP files to `src-tauri/icons/`
2. Build installer: `pnpm tauri build`
3. Run the installer to preview
4. Check that images display correctly
5. Adjust and rebuild if needed

---

## Troubleshooting

**Images not showing:**
- Ensure exact dimensions (150x57 and 164x314)
- Verify 24-bit BMP format (not 32-bit or indexed)
- Check file paths in `tauri.conf.json`
- Rebuild after adding images

**Images look distorted:**
- Don't stretch or resize after creation
- Use exact pixel dimensions from the start
- Maintain aspect ratio

**Colors look wrong:**
- Save as RGB, not indexed color
- Use 24-bit depth, not 8-bit or 32-bit
- Check that BMP version is BMP3 (Windows compatible)

---

## Placeholder Images

If you don't have time to create custom images right now, you can:

1. **Remove custom images** from `tauri.conf.json`:
   - Comment out `headerImage` and `sidebarImage` lines
   - Tauri will use default NSIS appearance

2. **Use solid color placeholders**:
   - Create solid black BMPs with exact dimensions
   - Add white "FIRM AI" text in center
   - Replace with professional designs later

---

## Professional Design Services (Optional)

If you want premium installer graphics:
- Fiverr: Search "NSIS installer banner"
- Upwork: Search "software installer design"
- 99designs: Software branding
- Cost: $25-100 for both images

Provide them with:
- Your logo (`icon.png`)
- Color scheme (red/black/white)
- Dimensions (150x57 and 164x314)
- Format requirements (24-bit BMP)

---

## Quick Start (Temporary Solution)

Don't have time for custom graphics? Remove the image lines temporarily:

Edit `src-tauri/tauri.conf.json`:
```json
"nsis": {
  "installerIcon": "icons/icon.ico",
  "installMode": "perUser",
  // "headerImage": "icons/installer-header.bmp",  // Comment out
  // "sidebarImage": "icons/installer-sidebar.bmp",  // Comment out
  "license": "LICENSE.txt"
}
```

The installer will still look professional with the custom text and branding from `installer.nsi`!

---

Need help? The installer script (`installer.nsi`) already has professional:
✅ Custom welcome text
✅ Branded finish page
✅ Red/black color scheme
✅ Professional layout
✅ Company branding

Images are optional but recommended for maximum professionalism! 🎨

