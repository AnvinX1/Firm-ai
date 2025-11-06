# NSIS Installer Configuration - Important Notes

## ⚠️ Tauri NSIS Limitations

After testing, we discovered that **Tauri's NSIS configuration has limited customization options** in `tauri.conf.json`.

### What We Tried (But Doesn't Work)

The following NSIS configuration fields are **NOT supported** by Tauri:
- ❌ `installerIcon` - Custom installer icon
- ❌ `installMode` - Installation mode (perUser/both)
- ❌ `languages` - Custom languages
- ❌ `displayLanguageSelector` - Language selector
- ❌ `compression` - Compression algorithm
- ❌ `template` - Custom NSIS template
- ❌ `headerImage` - Custom header banner
- ❌ `sidebarImage` - Custom sidebar image
- ❌ `license` - Custom license file path

### What Tauri Uses Instead

Tauri uses its **own built-in NSIS template** with sensible defaults:
- ✅ Automatically uses your app icon from `bundle.icon`
- ✅ Creates desktop and Start Menu shortcuts
- ✅ Registers in Windows Add/Remove Programs
- ✅ Includes uninstaller
- ✅ Per-user installation by default
- ✅ Professional installer appearance

### Current Configuration

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

**Note**: The empty `windows` section is kept for **code signing configuration** in the future.

---

## 📝 Custom Files Created (For Reference Only)

### Files That Won't Be Used By Tauri:

1. **`installer.nsi`** - Custom NSIS script
   - Shows what a fully customized NSIS installer could look like
   - **Not used** by Tauri (Tauri has its own template)
   - Kept for reference if you ever need standalone NSIS

2. **`LICENSE.txt`** - License agreement
   - **Not used** by Tauri NSIS installer
   - Can be shown in your app's UI instead
   - Or include in documentation

3. **`CREATE_INSTALLER_IMAGES.md`** - Banner image guide
   - **Not applicable** to Tauri
   - Useful if you use standalone NSIS

---

## ✅ What Your Installer DOES Have

Even without custom NSIS configuration, your Tauri installer is **still professional**:

### Professional Features:
- ✅ **Company Name**: "FIRM AI" (from `productName`)
- ✅ **Description**: "AI-Powered Law Learning Platform" (from `shortDescription`)
- ✅ **App Icon**: Throughout installer (from `bundle.icon`)
- ✅ **Desktop Shortcut**: Automatically created
- ✅ **Start Menu Entry**: "FIRM AI"
- ✅ **Uninstaller**: Professional removal
- ✅ **Registry Integration**: Proper Windows integration
- ✅ **Version Info**: Embedded in executable

### Installer Output:
- **Location**: `src-tauri/target/release/bundle/nsis/`
- **File**: `FIRM AI_0.1.0_x64-setup.exe`
- **Size**: ~50-100 MB (compressed)

---

## 🔐 Code Signing (When Ready)

When you get a code signing certificate, update this configuration:

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT_HERE",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

This will:
- ✅ Remove "Unknown Publisher" warnings
- ✅ Skip Windows SmartScreen warnings
- ✅ Build user trust

---

## 🎯 Bottom Line

**Your installer is production-ready as-is!**

While we can't customize the NSIS template like we wanted, Tauri's default installer:
- ✅ Looks professional
- ✅ Uses your branding (name, icon, description)
- ✅ Creates proper shortcuts
- ✅ Installs and uninstalls cleanly
- ✅ Integrates with Windows properly

The only thing missing is **code signing**, which is the **most important** trust factor anyway (not custom installer colors).

---

## 📚 For Future Reference

If you ever need a **fully customized** installer:
1. Use **standalone NSIS** (outside of Tauri)
2. Reference the `installer.nsi` file I created
3. Manually package your app with NSIS
4. Use the banner images guide

But for 99% of apps, **Tauri's default installer is perfect**! 🚀

---

**Documentation Status**: Updated to reflect Tauri limitations  
**Build Status**: ✅ Working  
**Next Step**: Get code signing certificate for maximum trust

