import { readFileSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')
const self = import.meta.filename
const extensions = new Set(['.astro', '.json', '.js', '.jsx', '.md', '.mdx', '.ts', '.tsx'])

function productionFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (path === self || entry.name === '__tests__' || entry.name === '__mocks__' || entry.name.endsWith('.test.ts')) return []
    return entry.isDirectory() ? productionFiles(path) : extensions.has(extname(path)) ? [path] : []
  })
}

const banned = [
  /Bahasa Global|nativeName:\s*['"]Global|(?:di|berbasis di|seluruh|bisnis|UMKM|klien|hosting) Global|Global, Jawa Tengah/i,
  /rating[^\n]{0,20}4\.9\/5|(?:clients|projects|(?:Rp\s*)?\d+(?:\s*-\s*\d+)?)[^\n]{0,20}(?:120\+|250\+)|98%[^\n]{0,20}(?:rating|satisfaction)/i,
  /service (?:HP|phone).*laptop|service HP laptop/i,
  /jasa-pembuatan-website-global|jasa-website-global\.svg/i,
  /garansi 30 hari|free (?:domain|hosting|maintenance)|hosting Global/i,
  /(?:hemat|penghematan) \d+(?:-\d+)?%|(?:uptime|response time|priority response)[^\n]{0,30}\d+(?:\.\d+)?(?:%| menit| jam)/i,
]

describe('public content claims', () => {
  it('contains no critical placeholders or unsupported claims', () => {
    const content = productionFiles(sourceRoot).map((file) => readFileSync(file, 'utf8')).join('\n')
    for (const claim of banned) expect(content).not.toMatch(claim)
  })
})
