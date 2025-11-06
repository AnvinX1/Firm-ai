# Tauri Desktop Application Setup

This guide will help you set up and build FIRM AI as a desktop application using Tauri.

## Prerequisites

1. **Rust** - Install from https://rustup.rs/
   ```bash
   # Verify installation
   rustc --version
   cargo --version
   ```

2. **System Dependencies:**

   **Windows:**
   - Microsoft C++ Build Tools
   - WebView2 (usually pre-installed on Windows 10/11)

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libxdo-dev \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

## Installation

1. **Install Tauri dependencies:**
   ```bash
   pnpm install
   ```

2. **Install Rust dependencies (first time only):**
   ```bash
   cd src-tauri
   cargo build
   cd ..
   ```

## Development

Run the app in development mode:
```bash
pnpm tauri:dev
```

This will:
- Start the Next.js dev server on port 3000
- Launch the Tauri desktop window
- Enable hot-reload for both frontend and backend changes

## Building

Build the desktop application:
```bash
pnpm tauri:build
```

The built application will be in `src-tauri/target/release/`:
- **Windows:** `firm-ai.exe` and installer in `bundle/msi/`
- **macOS:** `FIRM AI.app` in `bundle/macos/`
- **Linux:** `firm-ai` binary and `.deb`/`.AppImage` in `bundle/`

## Project Structure

```
FIRMai/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   └── main.rs     # Rust entry point
│   ├── Cargo.toml      # Rust dependencies
│   ├── tauri.conf.json # Tauri configuration
│   └── icons/          # App icons
├── app/                # Next.js frontend
├── components/         # React components
└── package.json        # Node.js dependencies
```

## Configuration

### Window Settings
Edit `src-tauri/tauri.conf.json` to customize:
- Window size and behavior
- App identifier
- Bundle settings

### Rust Backend
Add custom Rust commands in `src-tauri/src/main.rs`:
```rust
#[tauri::command]
fn my_custom_command() -> String {
    "Hello from Rust!".to_string()
}
```

Then register it:
```rust
.invoke_handler(tauri::generate_handler![my_custom_command])
```

### Frontend Integration
Use Tauri APIs in your React components:
```typescript
import { invoke } from '@tauri-apps/api/core'

const result = await invoke('my_custom_command')
```

## Troubleshooting

1. **Rust not found:**
   - Install Rust from https://rustup.rs/
   - Restart your terminal

2. **Build errors:**
   - Ensure all system dependencies are installed
   - Try `cargo clean` in `src-tauri/` directory

3. **Port already in use:**
   - Change the port in `tauri.conf.json` or kill the process using port 3000

4. **Icons missing:**
   - Generate icons using `pnpm tauri icon path/to/icon.png`
   - Or manually add icon files to `src-tauri/icons/`

## Next Steps

1. Generate app icons (see `src-tauri/icons/README.md`)
2. Customize window appearance in `tauri.conf.json`
3. Add Rust backend commands for desktop-specific features
4. Test the application on target platforms
5. Build and distribute the desktop app

