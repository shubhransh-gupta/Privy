import { useMemo, useState } from 'react'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  ToolButton,
  CopyButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'

const tool = getToolById('api-generator')!

type Language = 'typescript' | 'swift' | 'kotlin' | 'python' | 'go' | 'java'

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'swift', label: 'Swift' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'java', label: 'Java' },
]

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').replace(/^_/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_')
}

function inferType(value: unknown, lang: Language): string {
  if (value === null) {
    const nullTypes: Record<Language, string> = {
      typescript: 'null',
      swift: 'Any?',
      kotlin: 'Any?',
      python: 'None',
      go: 'interface{}',
      java: 'Object',
    }
    return nullTypes[lang]
  }
  if (typeof value === 'boolean') {
    return lang === 'python' ? 'bool' : lang === 'go' ? 'bool' : 'Boolean'
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      if (lang === 'swift') return 'Int'
      if (lang === 'kotlin') return 'Int'
      if (lang === 'python') return 'int'
      if (lang === 'go') return 'int'
      if (lang === 'java') return 'Integer'
      return 'number'
    }
    if (lang === 'swift') return 'Double'
    if (lang === 'kotlin') return 'Double'
    if (lang === 'python') return 'float'
    if (lang === 'go') return 'float64'
    if (lang === 'java') return 'Double'
    return 'number'
  }
  if (typeof value === 'string') {
    if (lang === 'swift') return 'String'
    if (lang === 'kotlin') return 'String'
    if (lang === 'python') return 'str'
    if (lang === 'go') return 'string'
    if (lang === 'java') return 'String'
    return 'string'
  }
  if (Array.isArray(value)) {
    const itemType = value.length > 0 ? inferType(value[0], lang) : 'any'
    if (lang === 'swift') return `[${itemType}]`
    if (lang === 'kotlin') return `List<${itemType}>`
    if (lang === 'python') return `list[${itemType}]`
    if (lang === 'go') return `[]${itemType}`
    if (lang === 'java') return `List<${itemType}>`
    return `${itemType}[]`
  }
  return 'object'
}

function collectStructs(obj: Record<string, unknown>, name: string, structs: Map<string, Record<string, unknown>>) {
  if (structs.has(name)) return
  structs.set(name, obj)
  for (const [key, val] of Object.entries(obj)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      collectStructs(val as Record<string, unknown>, toPascalCase(key), structs)
    }
    if (Array.isArray(val) && val.length > 0 && val[0] !== null && typeof val[0] === 'object' && !Array.isArray(val[0])) {
      collectStructs(val[0] as Record<string, unknown>, toPascalCase(key.replace(/s$/, '')) || toPascalCase(key), structs)
    }
  }
}

function generateTypeScript(structs: Map<string, Record<string, unknown>>): string {
  const lines: string[] = []
  for (const [name, obj] of structs) {
    lines.push(`export interface ${name} {`)
    for (const [key, val] of Object.entries(obj)) {
      let type = inferType(val, 'typescript')
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) type = toPascalCase(key)
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        type = `${toPascalCase(key.replace(/s$/, '') || key)}[]`
      }
      lines.push(`  ${key}: ${type};`)
    }
    lines.push('}\n')
  }
  return lines.join('\n')
}

function generateSwift(structs: Map<string, Record<string, unknown>>): string {
  const lines: string[] = []
  for (const [name, obj] of structs) {
    lines.push(`struct ${name}: Codable {`)
    for (const [key, val] of Object.entries(obj)) {
      let type = inferType(val, 'swift')
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) type = toPascalCase(key)
      lines.push(`    let ${toCamelCase(key)}: ${type}`)
    }
    lines.push('}\n')
  }
  return lines.join('\n')
}

function generateKotlin(structs: Map<string, Record<string, unknown>>): string {
  const lines: string[] = []
  for (const [name, obj] of structs) {
    lines.push(`data class ${name}(`)
    const props = Object.entries(obj).map(([key, val]) => {
      let type = inferType(val, 'kotlin')
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) type = toPascalCase(key)
      return `    val ${toCamelCase(key)}: ${type}`
    })
    lines.push(props.join(',\n'))
    lines.push(')\n')
  }
  return lines.join('\n')
}

function generatePython(structs: Map<string, Record<string, unknown>>): string {
  const lines: string[] = ['from dataclasses import dataclass', 'from typing import Optional, List, Any', '']
  for (const [name, obj] of structs) {
    lines.push('@dataclass')
    lines.push(`class ${name}:`)
    for (const [key, val] of Object.entries(obj)) {
      let type = inferType(val, 'python')
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) type = toPascalCase(key)
      lines.push(`    ${toSnakeCase(key)}: ${type}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function generateGo(structs: Map<string, Record<string, unknown>>): string {
  const lines: string[] = []
  for (const [name, obj] of structs) {
    lines.push(`type ${name} struct {`)
    for (const [key, val] of Object.entries(obj)) {
      let type = inferType(val, 'go')
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) type = toPascalCase(key)
      lines.push(`    ${toPascalCase(key)} ${type} \`json:"${key}"\``)
    }
    lines.push('}\n')
  }
  return lines.join('\n')
}

function generateJava(structs: Map<string, Record<string, unknown>>): string {
  const lines: string[] = ['import com.fasterxml.jackson.annotation.JsonProperty;', 'import java.util.List;', '']
  for (const [name, obj] of structs) {
    lines.push(`public class ${name} {`)
    for (const [key, val] of Object.entries(obj)) {
      let type = inferType(val, 'java')
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) type = toPascalCase(key)
      const field = toCamelCase(key)
      lines.push(`    @JsonProperty("${key}")`)
      lines.push(`    private ${type} ${field};`)
      lines.push('')
    }
    lines.push('}\n')
  }
  return lines.join('\n')
}

function generateCode(data: unknown, lang: Language, rootName: string): { code: string; error?: string } {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { code: '', error: 'JSON must be a root object (not array or primitive)' }
  }
  const structs = new Map<string, Record<string, unknown>>()
  collectStructs(data as Record<string, unknown>, rootName, structs)

  const generators: Record<Language, (s: Map<string, Record<string, unknown>>) => string> = {
    typescript: generateTypeScript,
    swift: generateSwift,
    kotlin: generateKotlin,
    python: generatePython,
    go: generateGo,
    java: generateJava,
  }
  return { code: generators[lang](structs) }
}

export default function ApiGenerator() {
  const [input, setInput] = useState(`{
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "active": true
  },
  "tags": ["admin", "developer"]
}`)
  const [language, setLanguage] = useState<Language>('typescript')
  const [rootName, setRootName] = useState('Root')

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input)
      return generateCode(parsed, language, rootName || 'Root')
    } catch (e) {
      return { code: '', error: (e as Error).message }
    }
  }, [input, language, rootName])

  const structCount = result.code ? (result.code.match(/^(export interface|struct |data class|class |type |public class)/gm)?.length ?? 0) : 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <ToolButton
              key={l.id}
              variant={language === l.id ? 'primary' : 'secondary'}
              onClick={() => setLanguage(l.id)}
            >
              {l.label}
            </ToolButton>
          ))}
        </div>

        <ToolSection title="Sample JSON">
          <ToolTextarea value={input} onChange={setInput} rows={10} mono placeholder='{"key": "value"}' />
        </ToolSection>

        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-500">Root type name</label>
          <input
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-200 w-40"
          />
        </div>

        {result.error && (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            {result.error}
          </div>
        )}

        {!result.error && result.code && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Language" value={LANGUAGES.find((l) => l.id === language)?.label ?? language} />
              <StatBox label="Types generated" value={structCount} />
            </div>

            <ToolSection title="Generated code">
              <ToolTextarea value={result.code} onChange={() => {}} rows={16} mono />
              <CopyButton text={result.code} label="Copy Code" />
            </ToolSection>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
