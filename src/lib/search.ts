import type { ToolDefinition } from './toolRegistry'
import { TOOLS } from './toolRegistry'

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function scoreTool(tool: ToolDefinition, query: string): number {
  const q = normalize(query)
  if (!q) return 0

  const terms = q.split(' ')
  let score = 0

  const name = normalize(tool.name)
  const desc = normalize(tool.description)
  const keywords = tool.keywords.map(normalize)

  if (name.includes(q)) score += 100
  if (desc.includes(q)) score += 50

  for (const term of terms) {
    if (name.includes(term)) score += 30
    if (desc.includes(term)) score += 15
    for (const kw of keywords) {
      if (kw.includes(term)) score += 25
      if (kw === q) score += 80
    }
  }

  // Natural language mappings
  const mappings: Record<string, string[]> = {
    'make pdf smaller': ['pdf-compress'],
    'remove photo location': ['exif-viewer', 'metadata-remover'],
    'calculate home loan': ['emi-calculator'],
    'turn yaml into json': ['yaml-json'],
    'hide sensitive text': ['image-redactor'],
    'compress pdf': ['pdf-compress'],
    'decode jwt': ['jwt-decoder'],
    'resize image': ['image-resizer'],
    'calculate emi': ['emi-calculator'],
    'format json': ['json-formatter'],
    'merge pdf': ['pdf-merge'],
    'clean csv': ['csv-cleaner'],
  }

  for (const [phrase, ids] of Object.entries(mappings)) {
    if (q.includes(phrase) || phrase.includes(q)) {
      if (ids.includes(tool.id)) score += 200
    }
  }

  return score
}

export function searchTools(query: string, limit = 20): ToolDefinition[] {
  if (!query.trim()) return TOOLS.slice(0, limit)

  return TOOLS
    .map((tool) => ({ tool, score: scoreTool(tool, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ tool }) => tool)
}

export function searchToolsByCategory(category: string): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category)
}
