# Contributing to LocalTools

Thank you for considering contributing! LocalTools is designed to make adding new tools as easy as possible.

## Quick Start

```bash
git clone https://github.com/shubhranshgupta/Privy.git
cd Privy
npm install
npm run dev
```

## Adding a New Tool

1. **Create your tool component** in `src/tools/<category>/YourTool.tsx`:

```tsx
import { ToolLayout, ToolButton } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'

const tool = getToolById('your-tool-id')!

export default function YourTool() {
  return (
    <ToolLayout tool={tool}>
      {/* Your tool UI here */}
    </ToolLayout>
  )
}
```

2. **Register in `src/lib/toolRegistry.ts`**:

```typescript
{
  id: 'your-tool-id',
  name: 'Your Tool',
  category: 'developer', // documents | images | developer | india | privacy | business
  description: 'Short description of what it does',
  icon: '🔧',
  route: '/tools/your-tool',
  local: true, // false if it requires external services
  keywords: ['search', 'terms', 'natural language'],
  component: () => import('../tools/developer/YourTool'),
}
```

3. **Test locally** — your tool automatically appears in search, categories, and command palette.

## Guidelines

- **Privacy first**: All file processing must happen in the browser. Never upload user data.
- **Honest limitations**: If a feature can't be done locally, say so clearly.
- **Use existing components**: `ToolLayout`, `FileDropzone`, `ToolButton`, `StatBox`, etc.
- **Lazy load heavy libraries**: Import pdf-lib, pdfjs-dist, etc. only inside your tool.
- **Match the design**: Dark UI, zinc/indigo palette, glass cards.

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b add-my-tool`)
3. Commit your changes
4. Push and open a PR

## Reporting Issues

> **Have a tiny annoying task you want solved?**
> Open an issue describing the tool you'd like to see.

Include:
- What the tool should do
- Example input/output
- Whether it can run entirely in the browser

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- Minimal dependencies — prefer browser APIs
