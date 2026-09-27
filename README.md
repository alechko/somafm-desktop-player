# SomaFM Desktop Player

A small desktop player for [SomaFM](https://somafm.com) radio, built with Tauri and React.

[![](https://img.shields.io/github/downloads/alechko/somafm-desktop-player/latest/total?sort=semver)](https://github.com/alechko/somafm-desktop-player/releases/latest)
[![Test](https://github.com/alechko/somafm-desktop-player/actions/workflows/test.yml/badge.svg)](https://github.com/alechko/somafm-desktop-player/actions/workflows/test.yml)

![SomaFM Desktop Player](/assets/screenshot.png 'SomaFM Desktop Player')

The UI is React with Chakra UI (`src/`), running in [Tauri](https://tauri.app) (`src-tauri/`). Audio is decoded and played natively in Rust, so the player can use its own output device, independent of the system output.

## Requirements

- [Node.js](https://nodejs.org) 22 and [pnpm](https://pnpm.io)
- [Rust](https://rustup.rs) (stable)
- The [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS (Xcode Command Line Tools on macOS)

## Development

```bash
pnpm install
pnpm start
```

`pnpm start` runs the app with hot reload for the UI; changes under `src-tauri/` rebuild and restart it.

```bash
pnpm test   # UI tests
pnpm lint
```

## Building

Build for the OS you're running on:

```bash
pnpm run build
```

Build a universal macOS app (native on both Apple Silicon and Intel), with a DMG:

```bash
pnpm run build:mac
```

Output goes to `src-tauri/target/.../release/bundle/`.

## Releasing

Pushing a `v*` tag builds macOS, Linux and Windows packages on GitHub Actions and attaches them to a GitHub release.

## License

[MIT](https://choosealicense.com/licenses/mit/)
