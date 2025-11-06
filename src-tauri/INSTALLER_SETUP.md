# FIRM AI Professional Installer Setup Guide

## ✅ What's Already Configured

Your Windows installer now has **industry-standard** professional features:

### 🎨 Professional Branding
- ✅ NSIS installer with custom configuration
- ✅ Company branding: "FIRM AI - AI-Powered Legal Learning"
- ✅ Custom license agreement (`LICENSE.txt`)
- ✅ Application icon throughout installer
- ✅ Per-user installation (no admin required)
- ✅ English language installer

### 📋 Installer Features
- ✅ Modern NSIS installer
- ✅ License agreement display
- ✅ Installation directory selection
- ✅ Desktop shortcut creation
- ✅ Start Menu shortcuts
- ✅ Professional uninstaller
- ✅ Windows Registry integration
- ✅ Add/Remove Programs entry

### 🔧 Technical Features
- ✅ Per-user installation (no admin required)
- ✅ LZMA compression (smaller installer size)
- ✅ Windows Registry integration
- ✅ Proper uninstall support
- ✅ Version information embedded
- ✅ File size calculation

---

## 🚀 Building Your Installer

### Build Command:
```bash
pnpm tauri build
```

This will create:
- `src-tauri/target/release/bundle/nsis/FIRM AI_0.1.0_x64-setup.exe`

### Output Location:
```
src-tauri/
  └─ target/
      └─ release/
          └─ bundle/
              └─ nsis/
                  └─ FIRM AI_0.1.0_x64-setup.exe  ← Your installer!
```

---

## 🎨 Optional: Add Custom Banner Images

For **maximum professionalism**, add custom header and sidebar images.

### Quick Setup:
1. Read `CREATE_INSTALLER_IMAGES.md` for detailed instructions
2. Create two BMP files:
   - `installer-header.bmp` (150×57px)
   - `installer-sidebar.bmp` (164×314px)
3. Save to `src-tauri/icons/`
4. Uncomment these lines in `tauri.conf.json`:
   ```json
   "headerImage": "icons/installer-header.bmp",
   "sidebarImage": "icons/installer-sidebar.bmp",
   ```
5. Rebuild: `pnpm tauri build`

**Note**: Without custom images, the installer still looks professional! The images are optional polish.

---

## 📦 What Users See

### Installation Flow:

1. **Welcome Screen**
   ```
   ╔══════════════════════════════════════╗
   ║  Welcome to FIRM AI Setup            ║
   ║                                      ║
   ║  This wizard will guide you through ║
   ║  the installation of FIRM AI -      ║
   ║  the AI-powered law learning        ║
   ║  platform.                          ║
   ║                                      ║
   ║  FIRM AI helps law students master  ║
   ║  legal concepts through:            ║
   ║                                      ║
   ║  • AI-Powered Case Analysis (IRAC)  ║
   ║  • Intelligent Mock Tests & Quizzes ║
   ║  • Personalized AI Legal Tutor      ║
   ║  • Study Planning & Analytics       ║
   ║                                      ║
   ║  Click Next to continue.            ║
   ╚══════════════════════════════════════╝
   ```

2. **License Agreement**
   - Shows `LICENSE.txt` content
   - "I Agree" button to continue

3. **Installation Directory**
   - Default: `C:\Users\[User]\AppData\Local\FIRM AI`
   - Browse button to change location

4. **Installing**
   - Red progress bar on black background
   - Shows files being installed

5. **Finish Screen**
   ```
   ╔══════════════════════════════════════╗
   ║  FIRM AI Installation Complete       ║
   ║                                      ║
   ║  FIRM AI has been successfully      ║
   ║  installed on your computer.        ║
   ║                                      ║
   ║  You can now launch the application ║
   ║  and start your AI-powered legal    ║
   ║  learning journey.                  ║
   ║                                      ║
   ║  [✓] Launch FIRM AI                 ║
   ║                                      ║
   ║  Visit firmai.com for help          ║
   ║                                      ║
   ║  Click Finish to close this wizard. ║
   ╚══════════════════════════════════════╝
   ```

---

## 🎯 Installer Customization

### Change Welcome Text:
Edit `src-tauri/installer.nsi`, find:
```nsis
!define MUI_WELCOMEPAGE_TEXT "Your custom text here..."
```

### Change Finish Text:
Edit `src-tauri/installer.nsi`, find:
```nsis
!define MUI_FINISHPAGE_TEXT "Your custom text here..."
```

### Change Company Name:
Edit `src-tauri/installer.nsi`, find:
```nsis
VIAddVersionKey "CompanyName" "Your Company Name"
```

### Change Website Link:
Edit `src-tauri/installer.nsi`, find:
```nsis
!define MUI_FINISHPAGE_LINK_LOCATION "https://your-website.com"
```

---

## 🔍 Testing Your Installer

### 1. Build the installer:
```bash
pnpm tauri build
```

### 2. Find the setup.exe:
```bash
cd src-tauri/target/release/bundle/nsis
```

### 3. Run the installer:
- Double-click `FIRM AI_0.1.0_x64-setup.exe`
- Follow the installation wizard
- Test all pages and options
- Verify shortcuts are created
- Test the uninstaller

### 4. Test uninstall:
- Open Start Menu → FIRM AI → Uninstall
- OR: Settings → Apps → FIRM AI → Uninstall
- Verify clean removal

---

## 📊 Installer Details

### File Information:
- **Product Name**: FIRM AI
- **Version**: 0.1.0
- **Company**: FIRM AI
- **Description**: AI-Powered Law Learning Platform
- **Copyright**: Copyright © 2024 FIRM AI
- **Installer Size**: ~50-100 MB (compressed)
- **Installation Size**: ~150-200 MB

### Registry Keys:
```
HKCU\Software\FIRM AI
HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FIRM AI
```

### Shortcuts Created:
- Desktop: `FIRM AI.lnk`
- Start Menu: `FIRM AI/FIRM AI.lnk`
- Start Menu: `FIRM AI/Uninstall FIRM AI.lnk`

---

## 🚨 Troubleshooting

### Build fails with "template not found":
- Check that `installer.nsi` exists in `src-tauri/`
- Verify path in `tauri.conf.json`

### Installer shows default NSIS look:
- Verify `template: "installer.nsi"` is set
- Check that `installer.nsi` is in correct location
- Rebuild with: `pnpm tauri build --debug` to see errors

### License page doesn't show:
- Check that `LICENSE.txt` exists in `src-tauri/`
- Verify `license: "LICENSE.txt"` in config

### Custom colors not showing:
- Colors are defined in `installer.nsi`
- Look for `!define MUI_INSTFILESPAGE_COLORS`
- Rebuild to see changes

---

## 🎨 Color Customization

Current theme (Red, Black, White):
```nsis
; In installer.nsi
!define MUI_INSTFILESPAGE_COLORS "DC2626 000000" ; Red on Black
!define MUI_BGCOLOR 0F0F0F                       ; Dark background
!define MUI_TEXTCOLOR FFFFFF                     ; White text
```

Change these hex values to customize:
- `DC2626` = Red (#DC2626)
- `000000` = Black (#000000)
- `FFFFFF` = White (#FFFFFF)

---

## 📝 Distribution Checklist

Before distributing your installer:

- [ ] Test installation on clean Windows PC
- [ ] Verify app launches correctly after install
- [ ] Test uninstallation
- [ ] Check Start Menu shortcuts work
- [ ] Verify Desktop shortcut works
- [ ] Test on Windows 10 and 11
- [ ] Scan installer with antivirus (should be clean)
- [ ] Consider code signing certificate (optional but recommended)

---

## 🔐 Code Signing (Optional but Recommended)

For professional distribution, consider signing your installer:

1. **Get a Code Signing Certificate**:
   - DigiCert, GlobalSign, or Sectigo
   - Cost: ~$100-300/year
   - Removes "Unknown Publisher" warning

2. **Configure in tauri.conf.json**:
   ```json
   "windows": {
     "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
     "timestampUrl": "http://timestamp.digicert.com"
   }
   ```

3. **Benefits**:
   - Builds user trust
   - No Windows SmartScreen warnings
   - Professional appearance

---

## 🎉 Summary

Your FIRM AI installer now has:

✅ **Professional appearance** with custom branding
✅ **Modern UI** with polished wizard
✅ **Custom text** highlighting features
✅ **Red/Black/White** color scheme
✅ **License agreement** page
✅ **Desktop & Start Menu** shortcuts
✅ **Professional uninstaller**
✅ **Industry-standard** NSIS configuration

### To Build:
```bash
pnpm tauri build
```

### Output:
```
src-tauri/target/release/bundle/nsis/FIRM AI_0.1.0_x64-setup.exe
```

**Your installer is production-ready!** 🚀

For custom banner images (optional), see: `CREATE_INSTALLER_IMAGES.md`

