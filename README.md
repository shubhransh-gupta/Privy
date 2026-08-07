# LocalTools (Privy)

**Your private toolbox for the web.**

LocalTools is an all-in-one browser-based toolbox for everyday tasks — PDF manipulation, image conversion, JSON formatting, JWT decoding, calculations, encryption, CSV processing, and more.

> **Your files never leave your device.**

Every operation happens locally inside your browser. No uploads. No accounts. No tracking.

**Live demo:** [https://shubhransh-gupta.github.io/Privy/](https://shubhransh-gupta.github.io/Privy/)

## Features

- **36+ tools** across 6 categories: Documents, Images, Developer, India, Privacy, Business
- **100% local processing** — files never leave your browser
- **Command palette** — press `⌘K` / `Ctrl+K` to search tools
- **PWA support** — install and use offline
- **Favorites & recent tools** — stored in localStorage only
- **Universal file drop** — drag files anywhere for smart tool suggestions
- **Dark-first UI** — premium futuristic developer-tool interface

## Categories

| Category | Tools |
|----------|-------|
| 📄 Documents | PDF → Text, Merge, Split, Compress, Image → PDF |
| 🖼 Images | Compress, Resize, Convert, Crop, Redact, Screenshot Cleanup |
| 👨‍💻 Developer | JSON, JWT, Base64, UUID, Unicode, Regex, Diff, YAML↔JSON, API Generator |
| 🇮🇳 India | GST, Bill Split, Rupee Format, Salary, EMI, Age, Date |
| 🔐 Privacy | EXIF Viewer, Metadata Remover, Password, Hash, File Encryption |
| 📊 Business | CSV Cleaner, Invoice Parser, Table Extractor, Duplicate Detector |

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- pdf-lib, pdfjs-dist, js-yaml, exifr, papaparse
- Web Crypto API for encryption and hashing
- PWA via vite-plugin-pwa

## Getting Started

```bash
git clone https://github.com/shubhransh-gupta/Privy.git
cd Privy
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build & Deploy

```bash
npm run build
```

For GitHub Pages:

```bash
GITHUB_PAGES=true npm run build
```

Deployment is automated via GitHub Actions on push to `main`.

## Adding a New Tool

1. Create a folder under `src/tools/<category>/`
2. Add `YourTool.tsx` exporting a default component
3. Register in `src/lib/toolRegistry.ts`:

```typescript
{
  id: 'my-tool',
  name: 'My Tool',
  category: 'developer',
  description: 'Does something useful locally',
  icon: '🔧',
  route: '/tools/my-tool',
  local: true,
  keywords: ['my tool', 'keyword'],
  component: () => import('../tools/developer/MyTool'),
}
```

That's it — the tool appears in search, categories, and command palette automatically.

## Privacy

- No third-party analytics
- No file uploads to any server
- No user accounts
- Favorites/history stored in browser localStorage only
- Encryption uses Web Crypto API (AES-256-GCM + PBKDF2)

See [SECURITY.md](./SECURITY.md) for details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

> **Have a tiny annoying task you want solved?**
> Open an issue or contribute a tool.

## License

MIT — see [LICENSE](./LICENSE)
