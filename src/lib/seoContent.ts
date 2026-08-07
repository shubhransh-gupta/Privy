import type { ToolDefinition } from './toolRegistry'
import type { ToolSeoContent } from './seo'

const CUSTOM_SEO: Partial<Record<string, Partial<ToolSeoContent>>> = {
  'json-formatter': {
    title: 'JSON Formatter Online Free — Beautify, Validate & Minify JSON',
    h1: 'JSON Formatter Online — Free, Fast & 100% Private',
    description:
      'Free JSON formatter online — beautify, validate, minify & pretty print JSON instantly. No upload, no signup. Best private JSON formatter that runs in your browser. Format JSON online free.',
    keywords: [
      'json formatter',
      'json formatter online',
      'json formatter online free',
      'format json',
      'format json online',
      'json beautifier',
      'json beautifier online',
      'json validator',
      'json validator online',
      'pretty print json',
      'json pretty print',
      'json viewer',
      'json viewer online',
      'free json formatter',
      'best json formatter',
      'json formatter no upload',
      'online json formatter',
      'json format online',
      'beautify json',
      'minify json online',
    ],
    about:
      'Privy JSON Formatter is the best free online JSON formatter for developers who care about privacy. Format, beautify, validate, minify, and explore JSON data instantly — all inside your browser. Unlike jsonformatter.org or other cloud tools, your JSON is never uploaded to any server. Whether you are debugging API responses, cleaning messy config files, validating payloads, or preparing JSON for production — Privy handles it all locally with zero data leaks.',
    extraSections: [
      {
        heading: 'Why use Privy JSON Formatter over other online formatters?',
        body:
          'Most online JSON formatters upload your data to their servers. Privy is different — it is a privacy-first JSON formatter that processes everything locally using JavaScript in your browser tab. That means sensitive API keys, user data, and proprietary configs stay on your device. Privy also works offline as a PWA, supports tree view exploration, key sorting, search, and flattening — features that match or exceed paid alternatives.',
      },
      {
        heading: 'JSON Formatter use cases',
        body:
          'Use our JSON formatter to pretty print minified API responses, validate JSON syntax before deployment, compare formatted vs minified output, sort object keys alphabetically for consistent diffs, explore deeply nested JSON with tree view, and debug malformed JSON with precise error messages. Perfect for frontend developers, backend engineers, DevOps teams, and data analysts.',
      },
      {
        heading: 'How to format JSON online',
        body:
          'Simply paste your raw JSON into the editor or drag-drop a .json file. Select pretty print to beautify with indentation, or minify to compress for production. Use validate mode to check syntax, tree view to navigate structures, and sort keys for normalized output. Copy or download the result in one click.',
      },
    ],
    howItWorks: [
      'Paste JSON or drop a .json file — no upload required.',
      'Choose: pretty print, minify, validate, tree view, sort keys, or flatten.',
      'See instant results with syntax highlighting and error line numbers.',
      'Copy formatted JSON or download as a .json file.',
    ],
    features: [
      'Pretty print / beautify JSON with custom indentation',
      'Minify JSON for production use',
      'Validate JSON syntax with detailed error messages',
      'Interactive tree view for nested objects',
      'Sort object keys alphabetically',
      'Search within large JSON documents',
      'Flatten nested JSON structures',
      '100% browser-local — zero server uploads',
      'Works offline as a Progressive Web App',
      'Free forever, no account required',
    ],
    faqs: [
      { q: 'What is the best free JSON formatter online?', a: 'Privy JSON Formatter is a top-rated free JSON formatter that runs entirely in your browser. No uploads, no limits, no account — just paste and format.' },
      { q: 'Is this JSON formatter free?', a: 'Yes, 100% free with unlimited usage. No premium tier, no signup.' },
      { q: 'Is my JSON data uploaded to a server?', a: 'Never. All formatting, validation, and processing happens locally in your browser. Your data never leaves your device.' },
      { q: 'Can I format large JSON files?', a: 'Yes, Privy handles multi-MB JSON files within browser memory limits. Performance depends on your device.' },
      { q: 'Does it work on mobile?', a: 'Yes. Privy JSON Formatter is fully responsive and works on phones, tablets, and desktops.' },
      { q: 'Can I use it offline?', a: 'Yes. Install Privy as a PWA and format JSON without an internet connection.' },
      { q: 'How is this different from jsonformatter.org?', a: 'Privy processes JSON locally without uploading. jsonformatter.org and similar sites send your data to their servers.' },
    ],
    relatedTools: [
      { name: 'JSON Diff Tool', path: '/tools/diff', description: 'Compare two JSON files side by side' },
      { name: 'JWT Decoder', path: '/tools/jwt-decoder', description: 'Decode JSON Web Tokens locally' },
      { name: 'YAML to JSON', path: '/tools/yaml-json', description: 'Convert YAML to JSON and back' },
      { name: 'API Generator', path: '/tools/api-generator', description: 'Generate types from JSON' },
    ],
  },
  'diff-tool': {
    title: 'JSON Diff Online Free — JSON Differ & Compare Tool',
    h1: 'JSON Diff Tool — Compare & Find Differences in JSON',
    description:
      'Free JSON diff tool online — compare two JSON files side by side. JSON differ with added, removed & changed highlighting. No upload. Best online JSON comparison tool that runs locally in your browser.',
    keywords: [
      'json diff',
      'json differ',
      'json diff online',
      'json diff tool',
      'compare json',
      'compare json online',
      'json comparison',
      'json comparison tool',
      'json difference',
      'json difference checker',
      'diff json online',
      'json diff viewer',
      'text diff online',
      'json diff free',
      'online json diff',
      'json file compare',
      'json diff checker',
    ],
    about:
      'Privy JSON Diff is a free online JSON differ that compares two JSON documents or text files side by side with clear visual highlighting. See exactly what was added, removed, or changed — green for additions, red for removals, yellow for modifications. Unlike cloud-based diff tools, your data never leaves your browser. Essential for code reviews, API version comparisons, config file auditing, and debugging JSON changes.',
    extraSections: [
      {
        heading: 'JSON Differ — Compare JSON files instantly',
        body:
          'Need to compare two JSON files? Privy JSON Diff (JSON differ) shows line-by-line and structural differences between any two JSON documents. Paste both JSON objects, or switch to text diff mode for raw comparison. Perfect for finding what changed between API versions, environment configs, or database exports.',
      },
      {
        heading: 'Why use Privy for JSON comparison?',
        body:
          'Most JSON diff tools require uploading files to a server. Privy compares JSON entirely in your browser — keeping sensitive configs and API data private. Get instant side-by-side comparison with color-coded highlights, support for both JSON-aware and plain text diff, and zero account requirements.',
      },
    ],
    howItWorks: [
      'Paste JSON A in the left panel and JSON B in the right panel.',
      'Switch between JSON diff and text diff modes.',
      'See added (green), removed (red), and changed (yellow) highlights.',
      'Review differences and copy either version.',
    ],
    features: [
      'Side-by-side JSON comparison',
      'Color-coded diff: added, removed, changed',
      'JSON-aware and plain text diff modes',
      'Works with large JSON documents',
      '100% local — no file uploads',
      'Free, no account required',
      'Works offline as PWA',
    ],
    faqs: [
      { q: 'What is a JSON differ?', a: 'A JSON differ (JSON diff tool) compares two JSON documents and highlights differences — added keys, removed keys, and changed values. Privy does this entirely in your browser.' },
      { q: 'Is this JSON diff tool free?', a: 'Yes, completely free with unlimited comparisons.' },
      { q: 'Are my JSON files uploaded?', a: 'No. Comparison happens locally in your browser. Your data never reaches any server.' },
      { q: 'Can I compare non-JSON text?', a: 'Yes. Switch to text diff mode to compare any text content.' },
      { q: 'How is this different from jsondiff.com?', a: 'Privy runs locally without uploading your JSON. Your sensitive data stays on your device.' },
    ],
    relatedTools: [
      { name: 'JSON Formatter', path: '/tools/json', description: 'Format and beautify JSON online' },
      { name: 'YAML to JSON', path: '/tools/yaml-json', description: 'Convert between YAML and JSON' },
      { name: 'JWT Decoder', path: '/tools/jwt-decoder', description: 'Decode JWT tokens locally' },
    ],
  },
  'jwt-decoder': {
    title: 'JWT Decoder Online — Decode JSON Web Tokens Locally',
    description:
      'Decode JWT tokens online for free. View header and payload instantly. Runs in your browser — tokens are never sent to a server. Check expiration dates.',
    keywords: ['jwt decoder', 'decode jwt', 'jwt parser', 'json web token decoder', 'jwt debugger online', 'jwt decode online free'],
    about:
      'Privy JWT Decoder lets you inspect JSON Web Token headers and payloads instantly without uploading your token to any server. Essential for developers debugging authentication flows, checking token expiration, or inspecting OAuth claims.',
    howItWorks: [
      'Paste your JWT token into the input field.',
      'View decoded header and payload in formatted JSON.',
      'Check expiration status and issued-at timestamps.',
      'Copy individual sections as needed.',
    ],
    features: [
      'Decode header and payload',
      'Expiration status indicator',
      'Formatted JSON output',
      'Works with any JWT format',
      '100% client-side processing',
    ],
    faqs: [
      { q: 'Does this verify JWT signatures?', a: 'No. This tool decodes tokens for inspection only. Signature verification requires the secret key and is not performed.' },
      { q: 'Is it safe to paste my JWT here?', a: 'Your token is processed locally in your browser and never sent to any server. However, avoid sharing tokens publicly.' },
    ],
    relatedTools: [
      { name: 'JSON Formatter', path: '/tools/json', description: 'Format decoded JWT payload' },
      { name: 'Base64 Decoder', path: '/tools/base64', description: 'Decode Base64 strings' },
    ],
  },
  'pdf-merge': {
    title: 'Merge PDF Files Online Free — Combine PDFs Locally',
    description: 'Merge multiple PDF files into one document online for free. No upload required — combine PDFs locally in your browser. Drag to reorder pages.',
    keywords: ['merge pdf', 'combine pdf online', 'pdf merger free', 'join pdf files', 'merge pdf without upload'],
  },
  'pdf-compress': {
    title: 'Compress PDF Online Free — Reduce PDF Size Locally',
    description: 'Compress PDF files online for free without uploading. Reduce PDF file size locally in your browser. See before/after size comparison.',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor online', 'make pdf smaller', 'shrink pdf free'],
  },
  'emi-calculator': {
    title: 'EMI Calculator India — Home Loan EMI Calculator Free',
    description: 'Calculate home loan EMI, total interest and payment breakdown for India. Free online EMI calculator with principal vs interest chart. No signup.',
    keywords: ['emi calculator', 'home loan emi calculator', 'emi calculator india', 'loan emi calculator', 'calculate emi online'],
  },
  'gst-calculator': {
    title: 'GST Calculator India — Add/Remove GST Online Free',
    description: 'Free GST calculator for India. Add or remove GST at 5%, 12%, 18%, 28% rates. Calculate GST amount and total instantly.',
    keywords: ['gst calculator', 'gst calculator india', 'add gst calculator', 'remove gst', 'gst calculation online'],
  },
  'image-compressor': {
    title: 'Compress Images Online Free — Reduce Image Size Locally',
    description: 'Compress JPG, PNG, WebP images online for free. No upload — reduce image file size locally in your browser. Adjust quality and format.',
    keywords: ['compress image', 'image compressor online', 'reduce image size', 'compress jpg online', 'optimize image free'],
  },
  'yaml-json': {
    title: 'YAML to JSON Converter Online — Free & Private',
    description: 'Convert YAML to JSON and JSON to YAML online for free. Validates both formats. Runs locally in your browser — no data uploaded.',
    keywords: ['yaml to json', 'json to yaml', 'yaml converter', 'yaml json converter online', 'convert yaml to json'],
    relatedTools: [
      { name: 'JSON Formatter', path: '/tools/json', description: 'Format converted JSON output' },
      { name: 'JSON Diff', path: '/tools/diff', description: 'Compare JSON versions' },
    ],
  },
  'exif-viewer': {
    title: 'EXIF Viewer Online — View Photo Metadata Free',
    description: 'View EXIF metadata from photos online. See camera, GPS, date, and lens info. Detects location data. Runs locally — photos never uploaded.',
    keywords: ['exif viewer', 'photo metadata viewer', 'exif data viewer online', 'view image exif', 'gps photo location'],
  },
}

function defaultSeo(tool: ToolDefinition): ToolSeoContent {
  const nameLower = tool.name.toLowerCase()
  return {
    title: `${tool.name} Online — Free & Private | No Upload`,
    description: `${tool.description}. Free online ${nameLower} tool that runs 100% in your browser. No uploads, no account, no tracking. Your files stay on your device.`,
    keywords: [
      ...tool.keywords,
      `${nameLower} online`,
      `free ${nameLower}`,
      `${nameLower} no upload`,
      `${nameLower} browser`,
    ],
    about: `Privy ${tool.name} is a free, privacy-first online tool for ${tool.description.toLowerCase()}. Unlike traditional web utilities that upload your files to remote servers, Privy processes everything locally inside your browser using modern Web APIs. Your data never leaves your device — no accounts, no tracking, no cloud processing.`,
    howItWorks: [
      `Open the ${tool.name} tool on Privy.`,
      'Upload a file or paste your data into the input area.',
      'Configure options and process your data instantly.',
      'Copy, download, or continue editing the result.',
    ],
    features: [
      '100% local browser processing',
      'No file uploads to any server',
      'No account or signup required',
      'Works offline after first visit (PWA)',
      'Free and open source',
    ],
    faqs: [
      { q: `Is ${tool.name} free to use?`, a: `Yes, ${tool.name} on Privy is completely free with no limits or account required.` },
      { q: 'Are my files uploaded to a server?', a: 'No. Privy processes everything locally in your browser. Your files and data never leave your device.' },
      { q: `Does ${tool.name} work offline?`, a: 'Yes. Install Privy as a PWA and use tools offline after your first visit.' },
    ],
    limitations: ['Browser memory limits apply to very large files.', 'Processing speed depends on your device.'],
  }
}

export function getToolSeoContent(tool: ToolDefinition): ToolSeoContent {
  const custom = CUSTOM_SEO[tool.id]
  const base = defaultSeo(tool)
  if (!custom) return base
  return {
    ...base,
    ...custom,
    keywords: custom.keywords ?? base.keywords,
    howItWorks: custom.howItWorks ?? base.howItWorks,
    features: custom.features ?? base.features,
    faqs: custom.faqs ?? base.faqs,
    extraSections: custom.extraSections ?? base.extraSections,
    relatedTools: custom.relatedTools ?? base.relatedTools,
  }
}

export function getCategorySeo(category: string, label: string, description: string) {
  return {
    title: `${label} Tools Online — Free & Private`,
    description: `Free online ${label.toLowerCase()} tools — ${description}. Runs locally in your browser. No uploads, no account. PDF, image, developer utilities and more on Privy.`,
    keywords: [
      `${label.toLowerCase()} tools online`,
      `free ${label.toLowerCase()} tools`,
      'online tools no upload',
      'privacy first tools',
      'browser tools free',
    ],
    path: `/category/${category}`,
  }
}

export function getHomeSeoContent() {
  return {
    title: 'Free Online Tools — JSON Formatter, PDF, Image & More',
    description: 'Privy — 36+ free online tools for JSON formatting, PDF merge/compress, image editing, JWT decode, EMI calculator and more. 100% private, runs in your browser. No uploads.',
    keywords: ['online tools free', 'json formatter online', 'pdf tools online', 'image compressor online', 'privacy tools', 'browser tools no upload', 'developer tools online', 'free online utilities'],
    h1: 'Everything useful. Nothing uploaded.',
    about: 'Privy is a free collection of 36+ privacy-first online tools. JSON formatter, JSON diff, PDF merge, image compress, JWT decoder, EMI calculator, GST calculator and more — all running locally in your browser.',
    extraSections: [
      {
        heading: 'Best free online JSON formatter',
        body: 'Format, beautify, validate and minify JSON online for free with Privy JSON Formatter. No upload required — your data stays on your device. Also try our JSON Diff tool to compare JSON files side by side.',
      },
    ],
  }
}
