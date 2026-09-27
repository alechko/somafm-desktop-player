# SomaFM Desktop Player

SomaFM desktop player is a small project to practice Electron with React.

[![](https://img.shields.io/github/downloads/alechko/somafm-desktop-player/latest/total?sort=semver)](https://github.com/alechko/somafm-desktop-player/releases/latest)
[![](https://img.shields.io/github/workflow/status/alechko/somafm-desktop-player/Build/main)](https://github.com/alechko/somafm-desktop-player/releases/latest)

![SomaFM Desktop Player](/assets/screenshot.png 'SomaFM Desktop Player')

Built based on [Electron + TypeScript + React](https://github.com/diego3g/electron-typescript-react) template with Chakra UI.

## Local Installation

This project uses [pnpm](https://pnpm.io). Install all dependencies with

```bash
pnpm install
```

## Usage

Just run `start` script.

```bash
pnpm start
```

## Packaging

To generate the project package based on the OS you're running on, just run:

```bash
pnpm run package
```

To build a universal macOS app (native on both Apple Silicon and Intel) with DMG and zip:

```bash
pnpm run make:mac
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
