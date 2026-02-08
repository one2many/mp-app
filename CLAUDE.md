# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediPines Mobile Companion App - A Tauri v2 application for Android that scans QR codes and fetches/displays medical session results from MediPines servers.

**Important**: This app currently only works on Android (not iOS, desktop, or web).

## Development Commands

```bash
# Install dependencies (use pnpm, not npm)
pnpm install

# Run Android development build (requires Android Studio with emulator or device)
pnpm tauri android dev

# Build for production
pnpm tauri android build

# Type check
pnpm build   # runs tsc && vite build
```

## Architecture

### Frontend (TypeScript/Vanilla JS)
- `src/main.ts` - Main application logic: barcode scanning, HTTP requests to MediPines API, result display
- `src/styles.css` - Application styles including scanner overlay and results grid
- `index.html` - Welcome/scan page
- `results.html` - Results display page with 4x2 metrics grid and clinical decision support table

### Backend (Rust/Tauri)
- `src-tauri/src/lib.rs` - Tauri app initialization with plugins (http, process, opener, barcode-scanner)
- `src-tauri/src/main.rs` - Entry point
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri configuration (app settings, build commands, window config)
- `src-tauri/capabilities/mobile.json` - Mobile-specific permissions (barcode scanner, HTTP to *.medipines.com)

### Tauri Plugins Used
- `@tauri-apps/plugin-barcode-scanner` - QR code scanning
- `@tauri-apps/plugin-http` - HTTP requests (restricted to medipines.com domains on mobile)
- `@tauri-apps/plugin-opener` - URL/file opening

### Key Flow
1. User taps "Scan Barcode" button
2. App requests camera permissions and opens scanner
3. QR code is scanned; URL is modified (`/sherpa` → `/result`)
4. HTTP GET request fetches JSON data from MediPines API
5. Results displayed as key-value list in `#scan-result` element

## Configuration

- Vite dev server runs on port 1420
- Tauri dev URL: `http://localhost:1420`
- Mobile HTTP permissions restricted to `https://*.medipines.com`
