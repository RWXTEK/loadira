import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'))

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

for (const { name, size } of sizes) {
  await sharp(svgBuffer, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name))
  console.log(`Generated ${name} (${size}x${size})`)
}

// Generate favicon.ico from 32x32 PNG (ICO is just a container for PNGs)
const ico32 = await sharp(svgBuffer, { density: 300 })
  .resize(32, 32)
  .png()
  .toBuffer()

const ico16 = await sharp(svgBuffer, { density: 300 })
  .resize(16, 16)
  .png()
  .toBuffer()

// Build ICO file (simplified - single 32x32 image)
// ICO header: 6 bytes, 1 entry: 16 bytes, then PNG data
function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const headerSize = 6
  const entrySize = 16
  const dirSize = headerSize + count * entrySize

  let offset = dirSize
  const entries = []

  for (const buf of pngBuffers) {
    entries.push({ size: buf.length, offset })
    offset += buf.length
  }

  const ico = Buffer.alloc(offset)

  // ICO header
  ico.writeUInt16LE(0, 0)      // Reserved
  ico.writeUInt16LE(1, 2)      // Type: ICO
  ico.writeUInt16LE(count, 4)  // Count

  const sizes = [16, 32]
  for (let i = 0; i < count; i++) {
    const pos = headerSize + i * entrySize
    const s = sizes[i] >= 256 ? 0 : sizes[i]
    ico.writeUInt8(s, pos)           // Width
    ico.writeUInt8(s, pos + 1)       // Height
    ico.writeUInt8(0, pos + 2)       // Color palette
    ico.writeUInt8(0, pos + 3)       // Reserved
    ico.writeUInt16LE(1, pos + 4)    // Color planes
    ico.writeUInt16LE(32, pos + 6)   // Bits per pixel
    ico.writeUInt32LE(entries[i].size, pos + 8)   // Size of data
    ico.writeUInt32LE(entries[i].offset, pos + 12) // Offset

    pngBuffers[i].copy(ico, entries[i].offset)
  }

  return ico
}

const icoBuffer = buildIco([ico16, ico32])
writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer)
console.log('Generated favicon.ico (16x16 + 32x32)')

console.log('All icons generated!')
