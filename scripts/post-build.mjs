// Astro + Cloudflare Pages post-build:
// 1. Copy SSR worker entry, chunks, and middleware to dist/client.
// 2. Rename any asset files that start with '.' (Astro/Vite quirk produces
//    e.g. .Layout.HASH.css). Cloudflare Pages does NOT serve hidden files,
//    so the dot-prefixed asset returns 404 in production and breaks styling.
//    We strip the leading dot and update all references in built JS chunks.
// 3. Clean up the wrangler deploy temp dir.

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const serverDir = path.join(root, 'dist/server')
const clientDir = path.join(root, 'dist/client')
const astroDir = path.join(clientDir, '_astro')

// 1. Copy SSR worker entry / chunks / middleware
fs.copyFileSync(path.join(serverDir, 'entry.mjs'), path.join(clientDir, '_worker.js'))
fs.cpSync(path.join(serverDir, 'chunks'), path.join(clientDir, 'chunks'), { recursive: true })
fs.copyFileSync(
  path.join(serverDir, 'virtual_astro_middleware.mjs'),
  path.join(clientDir, 'virtual_astro_middleware.mjs')
)

// 2. Strip leading dot from asset filenames so Cloudflare Pages serves them
const renames = []
if (fs.existsSync(astroDir)) {
  for (const file of fs.readdirSync(astroDir)) {
    if (!file.startsWith('.')) continue
    const newName = file.replace(/^\.+/, '')
    if (!newName) continue
    fs.renameSync(path.join(astroDir, file), path.join(astroDir, newName))
    renames.push([file, newName])
    console.log(`[post-build] Renamed _astro/${file} → _astro/${newName}`)
  }
}

if (renames.length > 0) {
  // 2b. Walk all JS/MJS files under dist/client and replace references
  const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8')
    let changed = false
    for (const [oldName, newName] of renames) {
      const oldRef = '/_astro/' + oldName
      const newRef = '/_astro/' + newName
      if (content.includes(oldRef)) {
        content = content.split(oldRef).join(newRef)
        changed = true
      }
    }
    if (changed) fs.writeFileSync(filePath, content, 'utf8')
    return changed
  }

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile() && (full.endsWith('.js') || full.endsWith('.mjs'))) {
        if (replaceInFile(full)) {
          console.log(`[post-build] Updated references in ${path.relative(root, full)}`)
        }
      }
    }
  }
  walk(clientDir)
}

// 3. Cleanup
fs.rmSync('.wrangler/deploy', { recursive: true, force: true })

console.log('[post-build] Done.')
