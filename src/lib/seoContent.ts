import type { ToolDefinition } from './toolRegistry'
import type { ToolSeoContent } from './seo'

const CUSTOM_SEO: Partial<Record<string, Partial<ToolSeoContent>>> = {
  'json-formatter': {
    title: 'JSON Formatter & Validator Online — Free, Private, No Upload',
    description:
      'Format, validate, minify and beautify JSON online for free. Runs 100% in your browser — your data never leaves your device. Pretty print, tree view, sort keys.',
    keywords: [
      'json formatter',
      'json formatter online',
      'format json',
      'json beautifier',
      'json validator',
      'pretty print json',
      'json viewer online',
      'free json formatter',
    ],
    about:
      'Privy JSON Formatter is a free online tool to format, validate, minify, and explore JSON data instantly. Unlike cloud-based formatters, every operation happens locally in your browser — your JSON never gets uploaded to any server. Perfect for developers debugging API responses, cleaning config files, or validating payloads before deployment.',
    howItWorks: [
      'Paste your JSON or drop a .json file into the editor.',
      'Choose format mode: pretty print, minify, validate, sort keys, or tree view.',
      'Fix validation errors with clear line-level feedback.',
      'Copy or download the formatted output instantly.',
    ],
    features: [
      'Pretty print and minify JSON',
      'Validate syntax with error messages',
      'Tree view explorer',
      'Sort object keys alphabetically',
      'Search within large JSON files',
      'Flatten nested structures',
    ],
    faqs: [
      {
        q: 'Is this JSON formatter free?',
        a: 'Yes, completely free with no account required.',
      },
      {
        q: 'Is my JSON data uploaded to a server?',
        a: 'No. All processing happens locally in your browser. Your data never leaves your device.',
      },
      {
        q: 'Can I format large JSON files?',
        a: 'Yes, within browser memory limits (typically several MB). Very large files may be slower.',
      },
      {
        q: 'Does it work offline?',
        a: 'Yes. Install Privy as a PWA and use the JSON formatter without an internet connection.',
      },
    ],
  },
  'jwt-decoder': {
    title: 'JWT Decoder Online — Decode JSON Web Tokens Locally',
    description:
      'Decode JWT tokens online for free. View header and payload instantly. Runs in your browser — tokens are never sent to a server. Check expiration dates.',
    keywords: ['jwt decoder', 'decode jwt', 'jwt parser', 'json web token decoder', 'jwt debugger online'],
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
      {
        q: 'Does this verify JWT signatures?',
        a: 'No. This tool decodes tokens for inspection only. Signature verification requires the secret key and is not performed.',
      },
      {
        q: 'Is it safe to paste my JWT here?',
        a: 'Your token is processed locally in your browser and never sent to any server. However, avoid sharing tokens publicly.',
      },
    ],
  },
  'pdf-merge': {
    title: 'Merge PDF Files Online Free — Combine PDFs Locally',
    description:
      'Merge multiple PDF files into one document online for free. No upload required — combine PDFs locally in your browser. Drag to reorder pages.',
    keywords: ['merge pdf', 'combine pdf online', 'pdf merger free', 'join pdf files', 'merge pdf without upload'],
  },
  'pdf-compress': {
    title: 'Compress PDF Online Free — Reduce PDF Size Locally',
    description:
      'Compress PDF files online for free without uploading. Reduce PDF file size locally in your browser. See before/after size comparison.',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor online', 'make pdf smaller', 'shrink pdf free'],
  },
  'emi-calculator': {
    title: 'EMI Calculator India — Home Loan EMI Calculator Free',
    description:
      'Calculate home loan EMI, total interest and payment breakdown for India. Free online EMI calculator with principal vs interest chart. No signup.',
    keywords: ['emi calculator', 'home loan emi calculator', 'emi calculator india', 'loan emi calculator', 'calculate emi online'],
  },
  'gst-calculator': {
    title: 'GST Calculator India — Add/Remove GST Online Free',
    description:
      'Free GST calculator for India. Add or remove GST at 5%, 12%, 18%, 28% rates. Calculate GST amount and total instantly.',
    keywords: ['gst calculator', 'gst calculator india', 'add gst calculator', 'remove gst', 'gst calculation online'],
  },
  'image-compressor': {
    title: 'Compress Images Online Free — Reduce Image Size Locally',
    description:
      'Compress JPG, PNG, WebP images online for free. No upload — reduce image file size locally in your browser. Adjust quality and format.',
    keywords: ['compress image', 'image compressor online', 'reduce image size', 'compress jpg online', 'optimize image free'],
  },
  'yaml-json': {
    title: 'YAML to JSON Converter Online — Free & Private',
    description:
      'Convert YAML to JSON and JSON to YAML online for free. Validates both formats. Runs locally in your browser — no data uploaded.',
    keywords: ['yaml to json', 'json to yaml', 'yaml converter', 'yaml json converter online', 'convert yaml to json'],
  },
  'diff-tool': {
    title: 'JSON Diff Tool Online — Compare JSON & Text Free',
    description:
      'Compare two JSON or text files side by side online. Free diff tool with added/removed/changed highlighting. Runs locally in your browser.',
    keywords: ['json diff', 'text diff online', 'compare json', 'json diff tool', 'diff checker online'],
  },
  'exif-viewer': {
    title: 'EXIF Viewer Online — View Photo Metadata Free',
    description:
      'View EXIF metadata from photos online. See camera, GPS, date, and lens info. Detects location data. Runs locally — photos never uploaded.',
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
      {
        q: `Is ${tool.name} free to use?`,
        a: `Yes, ${tool.name} on Privy is completely free with no limits or account required.`,
      },
      {
        q: 'Are my files uploaded to a server?',
        a: 'No. Privy processes everything locally in your browser. Your files and data never leave your device.',
      },
      {
        q: `Does ${tool.name} work offline?`,
        a: 'Yes. Install Privy as a PWA and use tools offline after your first visit.',
      },
    ],
    limitations: [
      'Browser memory limits apply to very large files.',
      'Processing speed depends on your device.',
    ],
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
