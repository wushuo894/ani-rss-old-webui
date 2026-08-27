import {access, readFile} from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {createWebUIManifest} from './webui-manifest.mjs'

const distDir = path.resolve(process.argv[2] ?? 'dist')
await access(path.join(distDir, 'index.html'))

const manifestPath = path.join(distDir, 'webui.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const normalized = createWebUIManifest(manifest)

if (JSON.stringify(manifest) !== JSON.stringify(normalized)) {
    throw new Error('dist/webui.json contains unsupported fields or unnormalized values')
}

console.log(`Verified ${manifest.repo} WebUI ${manifest.version} (${manifest.filename})`)
