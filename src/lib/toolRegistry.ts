export type ToolCategory =
  | 'documents'
  | 'images'
  | 'developer'
  | 'india'
  | 'privacy'
  | 'business'

export interface ToolDefinition {
  id: string
  name: string
  category: ToolCategory
  description: string
  icon: string
  route: string
  local: boolean
  keywords: string[]
  popular?: boolean
  component: () => Promise<{ default: React.ComponentType }>
}

export const CATEGORY_META: Record<
  ToolCategory,
  { label: string; icon: string; description: string }
> = {
  documents: { label: 'Documents', icon: '📄', description: 'PDF and document tools' },
  images: { label: 'Images', icon: '🖼', description: 'Image processing tools' },
  developer: { label: 'Developer', icon: '👨‍💻', description: 'Developer utilities' },
  india: { label: 'India', icon: '🇮🇳', description: 'India-specific calculators' },
  privacy: { label: 'Privacy', icon: '🔐', description: 'Privacy and security tools' },
  business: { label: 'Business', icon: '📊', description: 'Business utilities' },
}

export const TOOLS: ToolDefinition[] = [
  // Documents
  {
    id: 'pdf-to-text',
    name: 'PDF → Text',
    category: 'documents',
    description: 'Extract text from PDF files locally',
    icon: '📝',
    route: '/tools/pdf-to-text',
    local: true,
    keywords: ['pdf text', 'extract text', 'pdf reader', 'ocr'],
    popular: true,
    component: () => import('../tools/documents/PdfToText'),
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge',
    category: 'documents',
    description: 'Combine multiple PDFs into one',
    icon: '🔗',
    route: '/tools/pdf-merge',
    local: true,
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf combiner'],
    popular: true,
    component: () => import('../tools/documents/PdfMerge'),
  },
  {
    id: 'pdf-split',
    name: 'PDF Split',
    category: 'documents',
    description: 'Split PDF by pages or ranges',
    icon: '✂️',
    route: '/tools/pdf-split',
    local: true,
    keywords: ['split pdf', 'divide pdf', 'separate pages'],
    component: () => import('../tools/documents/PdfSplit'),
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    category: 'documents',
    description: 'Reduce PDF file size',
    icon: '🗜',
    route: '/tools/pdf-compress',
    local: true,
    keywords: ['compress pdf', 'make pdf smaller', 'reduce pdf size', 'shrink pdf'],
    popular: true,
    component: () => import('../tools/documents/PdfCompress'),
  },
  {
    id: 'image-to-pdf',
    name: 'Image → PDF',
    category: 'documents',
    description: 'Convert images to a PDF document',
    icon: '🖼',
    route: '/tools/image-to-pdf',
    local: true,
    keywords: ['image to pdf', 'jpg to pdf', 'photos to pdf', 'convert image pdf'],
    component: () => import('../tools/documents/ImageToPdf'),
  },
  // Images
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    category: 'images',
    description: 'Compress images without uploading',
    icon: '🗜',
    route: '/tools/image-compressor',
    local: true,
    keywords: ['compress image', 'make image smaller', 'reduce image size', 'optimize image'],
    popular: true,
    component: () => import('../tools/images/ImageCompressor'),
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    category: 'images',
    description: 'Resize images to any dimension',
    icon: '📐',
    route: '/tools/image-resizer',
    local: true,
    keywords: ['resize image', 'scale image', 'change dimensions'],
    popular: true,
    component: () => import('../tools/images/ImageResizer'),
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    category: 'images',
    description: 'Convert between PNG, JPEG, WebP, AVIF',
    icon: '🔄',
    route: '/tools/image-converter',
    local: true,
    keywords: ['convert image', 'png to jpg', 'webp converter', 'format convert'],
    component: () => import('../tools/images/ImageConverter'),
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    category: 'images',
    description: 'Crop images with preset ratios',
    icon: '✂',
    route: '/tools/image-cropper',
    local: true,
    keywords: ['crop image', 'trim image', 'cut image'],
    component: () => import('../tools/images/ImageCropper'),
  },
  {
    id: 'image-redactor',
    name: 'Image Redactor',
    category: 'images',
    description: 'Permanently redact sensitive information',
    icon: '🔒',
    route: '/tools/image-redactor',
    local: true,
    keywords: ['redact image', 'hide sensitive text', 'blur text', 'censor screenshot'],
    popular: true,
    component: () => import('../tools/images/ImageRedactor'),
  },
  {
    id: 'screenshot-cleanup',
    name: 'Screenshot Cleanup',
    category: 'images',
    description: 'Auto-crop whitespace from screenshots',
    icon: '🧹',
    route: '/tools/screenshot-cleanup',
    local: true,
    keywords: ['screenshot cleanup', 'crop whitespace', 'trim borders', 'auto crop'],
    component: () => import('../tools/images/ScreenshotCleanup'),
  },
  // Developer
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'developer',
    description: 'Format, validate and explore JSON',
    icon: '{}',
    route: '/tools/json',
    local: true,
    keywords: ['json', 'format json', 'pretty print json', 'validate json', 'json viewer'],
    popular: true,
    component: () => import('../tools/developer/JsonFormatter'),
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'developer',
    description: 'Decode JWT tokens locally',
    icon: '🔑',
    route: '/tools/jwt-decoder',
    local: true,
    keywords: ['jwt', 'decode jwt', 'json web token', 'token decoder'],
    popular: true,
    component: () => import('../tools/developer/JwtDecoder'),
  },
  {
    id: 'base64',
    name: 'Base64',
    category: 'developer',
    description: 'Encode and decode Base64 text',
    icon: '🔤',
    route: '/tools/base64',
    local: true,
    keywords: ['base64', 'encode base64', 'decode base64', 'base64 converter'],
    component: () => import('../tools/developer/Base64Tool'),
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    category: 'developer',
    description: 'Generate UUID v4 and v7 identifiers',
    icon: '🆔',
    route: '/tools/uuid-generator',
    local: true,
    keywords: ['uuid', 'generate uuid', 'guid', 'unique id'],
    component: () => import('../tools/developer/UuidGenerator'),
  },
  {
    id: 'unicode-inspector',
    name: 'Unicode Inspector',
    category: 'developer',
    description: 'Inspect Unicode characters and codepoints',
    icon: '🔍',
    route: '/tools/unicode-inspector',
    local: true,
    keywords: ['unicode', 'codepoint', 'character inspect', 'utf-8'],
    component: () => import('../tools/developer/UnicodeInspector'),
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    category: 'developer',
    description: 'Test regular expressions with live matching',
    icon: '.*',
    route: '/tools/regex-tester',
    local: true,
    keywords: ['regex', 'regular expression', 'pattern match', 'regexp test'],
    component: () => import('../tools/developer/RegexTester'),
  },
  {
    id: 'api-generator',
    name: 'API Generator',
    category: 'developer',
    description: 'Generate types from JSON for multiple languages',
    icon: '⚡',
    route: '/tools/api-generator',
    local: true,
    keywords: ['api generator', 'json to typescript', 'json to swift', 'type generator'],
    component: () => import('../tools/developer/ApiGenerator'),
  },
  {
    id: 'diff-tool',
    name: 'Diff Tool',
    category: 'developer',
    description: 'Compare text and JSON side by side',
    icon: '↔',
    route: '/tools/diff',
    local: true,
    keywords: ['diff', 'compare', 'json diff', 'text diff', 'difference'],
    component: () => import('../tools/developer/DiffTool'),
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    category: 'developer',
    description: 'Convert between YAML and JSON',
    icon: '⇄',
    route: '/tools/yaml-json',
    local: true,
    keywords: ['yaml to json', 'json to yaml', 'turn yaml into json', 'yaml converter'],
    component: () => import('../tools/developer/YamlJson'),
  },
  // India
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    category: 'india',
    description: 'Calculate GST for Indian tax rates',
    icon: '💰',
    route: '/tools/gst-calculator',
    local: true,
    keywords: ['gst', 'gst calculator', 'add gst', 'remove gst', 'india tax'],
    popular: true,
    component: () => import('../tools/india/GstCalculator'),
  },
  {
    id: 'bill-splitter',
    name: 'Bill Splitter',
    category: 'india',
    description: 'Split bills with tip among friends',
    icon: '🧾',
    route: '/tools/bill-splitter',
    local: true,
    keywords: ['bill split', 'split bill', 'tip calculator', 'share bill'],
    component: () => import('../tools/india/BillSplitter'),
  },
  {
    id: 'rupee-formatter',
    name: 'Rupee Formatter',
    category: 'india',
    description: 'Format numbers in Indian numbering system',
    icon: '₹',
    route: '/tools/rupee-formatter',
    local: true,
    keywords: ['rupee format', 'indian number', 'lakh crore', 'indian currency format'],
    component: () => import('../tools/india/RupeeFormatter'),
  },
  {
    id: 'salary-calculator',
    name: 'Salary Calculator',
    category: 'india',
    description: 'Estimate Indian in-hand salary from CTC',
    icon: '💼',
    route: '/tools/salary-calculator',
    local: true,
    keywords: ['salary calculator', 'ctc calculator', 'in hand salary', 'india salary'],
    component: () => import('../tools/india/SalaryCalculator'),
  },
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    category: 'india',
    description: 'Calculate home loan EMI and interest',
    icon: '🏠',
    route: '/tools/emi-calculator',
    local: true,
    keywords: ['emi', 'home loan', 'calculate emi', 'loan calculator', 'mortgage'],
    popular: true,
    component: () => import('../tools/india/EmiCalculator'),
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    category: 'india',
    description: 'Calculate exact age from date of birth',
    icon: '🎂',
    route: '/tools/age-calculator',
    local: true,
    keywords: ['age calculator', 'birthday', 'how old', 'date of birth'],
    component: () => import('../tools/india/AgeCalculator'),
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    category: 'india',
    description: 'Date difference, add/subtract days',
    icon: '📅',
    route: '/tools/date-calculator',
    local: true,
    keywords: ['date calculator', 'date difference', 'add days', 'business days'],
    component: () => import('../tools/india/DateCalculator'),
  },
  // Privacy
  {
    id: 'metadata-remover',
    name: 'Metadata Remover',
    category: 'privacy',
    description: 'Remove metadata from images and files',
    icon: '🧹',
    route: '/tools/metadata-remover',
    local: true,
    keywords: ['remove metadata', 'strip metadata', 'clean metadata', 'privacy'],
    component: () => import('../tools/privacy/MetadataRemover'),
  },
  {
    id: 'exif-viewer',
    name: 'EXIF Viewer',
    category: 'privacy',
    description: 'View EXIF metadata from images',
    icon: '🔎',
    route: '/tools/exif-viewer',
    local: true,
    keywords: ['exif', 'photo metadata', 'gps location', 'camera info', 'remove photo location'],
    popular: true,
    component: () => import('../tools/privacy/ExifViewer'),
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: 'privacy',
    description: 'Generate secure random passwords',
    icon: '🔑',
    route: '/tools/password-generator',
    local: true,
    keywords: ['password generator', 'secure password', 'random password'],
    component: () => import('../tools/privacy/PasswordGenerator'),
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: 'privacy',
    description: 'Generate SHA and MD5 hashes locally',
    icon: '#',
    route: '/tools/hash-generator',
    local: true,
    keywords: ['hash', 'sha256', 'md5', 'checksum', 'file hash'],
    component: () => import('../tools/privacy/HashGenerator'),
  },
  {
    id: 'file-encryption',
    name: 'File Encryption',
    category: 'privacy',
    description: 'Encrypt and decrypt files with AES-256',
    icon: '🔐',
    route: '/tools/file-encryption',
    local: true,
    keywords: ['encrypt file', 'decrypt file', 'file encryption', 'aes encryption'],
    component: () => import('../tools/privacy/FileEncryption'),
  },
  // Business
  {
    id: 'csv-cleaner',
    name: 'CSV Cleaner',
    category: 'business',
    description: 'Clean and normalize CSV data',
    icon: '📊',
    route: '/tools/csv-cleaner',
    local: true,
    keywords: ['csv cleaner', 'clean csv', 'remove duplicates csv', 'csv fix'],
    component: () => import('../tools/business/CsvCleaner'),
  },
  {
    id: 'invoice-parser',
    name: 'Invoice Parser',
    category: 'business',
    description: 'Extract fields from invoice text locally',
    icon: '🧾',
    route: '/tools/invoice-parser',
    local: true,
    keywords: ['invoice parser', 'extract invoice', 'invoice reader'],
    component: () => import('../tools/business/InvoiceParser'),
  },
  {
    id: 'table-extractor',
    name: 'Table Extractor',
    category: 'business',
    description: 'Extract tables to CSV, JSON, Markdown',
    icon: '📋',
    route: '/tools/table-extractor',
    local: true,
    keywords: ['table extract', 'html table', 'markdown table', 'csv extract'],
    component: () => import('../tools/business/TableExtractor'),
  },
  {
    id: 'duplicate-detector',
    name: 'Duplicate Detector',
    category: 'business',
    description: 'Find duplicate files by hash',
    icon: '🔍',
    route: '/tools/duplicate-detector',
    local: true,
    keywords: ['duplicate files', 'find duplicates', 'file hash compare'],
    component: () => import('../tools/business/DuplicateDetector'),
  },
]

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.id === id)
}

export function getToolByRoute(route: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.route === route)
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category)
}

export function getPopularTools(): ToolDefinition[] {
  return TOOLS.filter((t) => t.popular)
}

export function getSuggestedToolsForFile(file: File): ToolDefinition[] {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const type = file.type.toLowerCase()

  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp'].includes(ext)) {
    return TOOLS.filter((t) =>
      ['image-compressor', 'image-resizer', 'image-cropper', 'metadata-remover', 'exif-viewer', 'image-to-pdf', 'image-converter', 'image-redactor'].includes(t.id)
    )
  }
  if (type === 'application/pdf' || ext === 'pdf') {
    return TOOLS.filter((t) =>
      ['pdf-to-text', 'pdf-compress', 'pdf-split', 'pdf-merge'].includes(t.id)
    )
  }
  if (ext === 'csv' || type === 'text/csv') {
    return TOOLS.filter((t) => ['csv-cleaner', 'table-extractor'].includes(t.id))
  }
  if (ext === 'json' || type === 'application/json') {
    return TOOLS.filter((t) => ['json-formatter', 'yaml-json', 'api-generator'].includes(t.id))
  }
  return getPopularTools()
}
