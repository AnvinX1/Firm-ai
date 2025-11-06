# FIRM AI - Desktop Application

This is the desktop version of FIRM AI, built with Tauri (Rust + Next.js).

## Quick Start

### Prerequisites

1. **Install Rust:**
   ```bash
   # Visit https://rustup.rs/ or run:
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Node.js dependencies:**
   ```bash
   pnpm install
   ```

### Development

Run the app in development mode:
```bash
pnpm tauri:dev
```

This will:
- Start the Next.js dev server
- Launch the Tauri desktop window
- Enable hot-reload

### Building

Build the desktop application:
```bash
pnpm tauri:build
```

Outputs will be in `src-tauri/target/release/bundle/`:
- **Windows:** `.msi` installer
- **macOS:** `.app` bundle and `.dmg`
- **Linux:** `.deb`, `.AppImage`, or `.rpm`

## Project Structure

```
FIRMai/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs        # Rust entry point with Tauri commands
│   ├── Cargo.toml         # Rust dependencies
│   ├── tauri.conf.json    # Tauri configuration
│   ├── capabilities/      # Permission capabilities
│   └── icons/             # App icons
├── app/                   # Next.js frontend
├── components/            # React components
└── package.json           # Node.js dependencies
```

## Features

- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Small bundle size (~10-20MB)
- ✅ Native performance
- ✅ Secure by default
- ✅ File system access
- ✅ HTTP requests
- ✅ Dialog windows

## Customization

### Window Settings
Edit `src-tauri/tauri.conf.json` to customize window size, title, and behavior.

### Rust Commands
Add custom Rust functions in `src-tauri/src/main.rs`:

```rust
#[tauri::command]
fn my_function() -> String {
    "Hello from Rust!".to_string()
}
```

Then call from TypeScript:
```typescript
import { invoke } from '@tauri-apps/api/core'
const result = await invoke('my_function')
```

### Icons
Generate icons using:
```bash
pnpm tauri icon path/to/your-icon.png
```

Or manually add icon files to `src-tauri/icons/`.

## Troubleshooting

See `TAURI_SETUP.md` for detailed troubleshooting guide.

## License

MIT

