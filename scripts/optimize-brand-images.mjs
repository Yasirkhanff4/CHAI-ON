/**
 * Dev-only brand asset pipeline.
 *
 * Reads the original artwork from brand-source/ (never shipped) and writes
 * small WebP files into public/brand/ plus the menu placeholder into
 * public/images/. Run with `npm run brand:images`.
 */
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'brand-source'
const BRAND_DIR = 'public/brand'
const IMAGES_DIR = 'public/images'
const MAX_WIDTH = 1600
const MAX_BYTES = 200 * 1024
const CREAM = '#F4F2EF'

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

async function encodeUnder(input, output, options = {}) {
  const { maxWidth = MAX_WIDTH, startQuality = 82 } = options
  const source = sharp(input).rotate()
  const meta = await source.metadata()
  const width = meta.width && meta.width > maxWidth ? maxWidth : meta.width

  let best = null
  for (let quality = startQuality; quality >= 40; quality -= 4) {
    const buffer = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer()

    if (!best || buffer.length < best.length) best = buffer
    if (buffer.length <= MAX_BYTES) {
      best = buffer
      break
    }
  }

  if (!best || best.length > MAX_BYTES) {
    throw new Error(`${output} could not be brought under 200 KB`)
  }

  await sharp(best).toFile(output)
  return { output, bytes: best.length, width }
}

/**
 * The source logo sits on a light grey card. Swap that grey for the site cream
 * so the mark can sit on the header and the menu placeholder without a visible
 * square. The white cup stays white because it is further from the background.
 */
async function replaceLogoBackground(input) {
  const { data, info } = await sharp(input)
    .extract({ left: 235, top: 35, width: 730, height: 700 })
    .resize({ width: 720, height: 690, fit: 'contain', background: CREAM })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const [br, bg, bb] = [data[0], data[1], data[2]]
  const cream = [0xf4, 0xf2, 0xef]

  for (let index = 0; index < data.length; index += info.channels) {
    const distance = Math.max(
      Math.abs(data[index] - br),
      Math.abs(data[index + 1] - bg),
      Math.abs(data[index + 2] - bb),
    )

    if (distance <= 8) {
      data[index] = cream[0]
      data[index + 1] = cream[1]
      data[index + 2] = cream[2]
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer()
}

async function buildLogoMark() {
  const source = path.join(SOURCE_DIR, 'logo.jpeg')
  if (!(await exists(source))) return null

  // The supplied logo also carries the old "Chai & Paratha Co." line. Crop to
  // the cup artwork only so the tagline never reaches the site.
  const cropped = await replaceLogoBackground(source)

  const output = path.join(BRAND_DIR, 'logo.webp')
  const result = await encodeUnder(cropped, output, { maxWidth: 720, startQuality: 88 })
  return { output, ...result }
}

async function buildPlaceholder() {
  const mark = path.join(BRAND_DIR, 'logo.webp')
  if (!(await exists(mark))) return null

  // Lift the cup off its flat cream card so it can sit inside a soft disc
  // instead of floating alone in the middle of a nearly empty image.
  const { data, info } = await sharp(mark)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const [br, bg, bb] = [data[0], data[1], data[2]]

  for (let index = 0; index < data.length; index += info.channels) {
    const distance = Math.max(
      Math.abs(data[index] - br),
      Math.abs(data[index + 1] - bg),
      Math.abs(data[index + 2] - bb),
    )
    if (distance <= 12) data[index + 3] = 0
  }

  const cup = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .resize({ width: 280, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const backdrop = Buffer.from(`
    <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="55%">
          <stop offset="0" stop-color="#FCFAF6"/>
          <stop offset="1" stop-color="#F4F2EF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="640" height="480" fill="#F4F2EF"/>
      <rect width="640" height="480" fill="url(#glow)"/>
      <circle cx="320" cy="196" r="150" fill="#FBF8F2"/>
      <circle cx="320" cy="196" r="150" fill="none" stroke="#E8C9C4" stroke-opacity="0.55" stroke-width="1.5"/>
      <circle cx="320" cy="196" r="168" fill="none" stroke="#5B3A2E" stroke-opacity="0.06" stroke-width="1" stroke-dasharray="2 6"/>
    </svg>
  `)

  const caption = Buffer.from(`
    <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <line x1="306" y1="372" x2="334" y2="372" stroke="#B00000" stroke-width="2" stroke-linecap="round"/>
      <text x="320" y="409" text-anchor="middle" font-family="Arial Narrow, Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="5" fill="#7A0F0F">CHAYON</text>
      <text x="320" y="433" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="8.5" font-weight="600" letter-spacing="2.5" fill="#5B3A2E" fill-opacity="0.55">FRESH TO YOUR OFFICE DESK</text>
    </svg>
  `)

  const output = path.join(IMAGES_DIR, 'chayon-placeholder.webp')
  const buffer = await sharp({
    create: { width: 640, height: 480, channels: 4, background: CREAM },
  })
    .composite([
      { input: backdrop, top: 0, left: 0 },
      { input: cup, top: 58, left: 180 },
      { input: caption, top: 0, left: 0 },
    ])
    .webp({ quality: 88, effort: 6 })
    .toBuffer()

  await sharp(buffer).toFile(output)
  return { output, bytes: buffer.length, width: 640 }
}

/**
 * The supplied poster has the CHAYON logo and a tagline baked into the left
 * side. The site draws its own wordmark, headline and buttons over the hero,
 * so keep only the clean cup-and-rusk photo from the right of the poster and
 * fade it into a cream field on the left.
 */
async function buildHeroBanner() {
  const source = path.join(SOURCE_DIR, 'hero-banner.jpeg')
  if (!(await exists(source))) return null

  const width = 1600
  const height = 600
  const photo = await sharp(source)
    .extract({ left: 900, top: 0, width: 377, height: 473 })
    .resize({ height, fit: 'cover' })
    .toBuffer()
  const photoMeta = await sharp(photo).metadata()
  const photoLeft = width - (photoMeta.width ?? 0)

  const fadeWidth = width * height * 4
  const fade = Buffer.alloc(fadeWidth)
  const cream = [0xf4, 0xf2, 0xef]
  const fadeStart = 0.52
  const fadeEnd = 0.84

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const t = Math.min(1, Math.max(0, (x / width - fadeStart) / (fadeEnd - fadeStart)))
      const index = (y * width + x) * 4
      fade[index] = cream[0]
      fade[index + 1] = cream[1]
      fade[index + 2] = cream[2]
      fade[index + 3] = Math.round(255 * (1 - t))
    }
  }

  const buffer = await sharp({
    create: { width, height, channels: 3, background: CREAM },
  })
    .composite([
      { input: photo, left: photoLeft, top: 0 },
      { input: fade, raw: { width, height, channels: 4 }, left: 0, top: 0 },
    ])
    .webp({ quality: 82, effort: 6 })
    .toBuffer()

  const output = path.join(BRAND_DIR, 'hero-banner.webp')
  await sharp(buffer).toFile(output)
  return { output, bytes: buffer.length, width }
}

/** The offer poster also has its own text; keep the clean tray photo. */
async function buildOfferBanner() {
  const source = path.join(SOURCE_DIR, 'now-serving.jpeg')
  if (!(await exists(source))) return null

  const buffer = await sharp(source)
    .extract({ left: 760, top: 0, width: 840, height: 840 })
    .webp({ quality: 82, effort: 6 })
    .toBuffer()

  const output = path.join(BRAND_DIR, 'now-serving.webp')
  await sharp(buffer).toFile(output)
  return { output, bytes: buffer.length, width: 840 }
}

async function main() {
  await mkdir(BRAND_DIR, { recursive: true })
  await mkdir(IMAGES_DIR, { recursive: true })

  const outputs = []

  const mark = await buildLogoMark()
  if (mark) outputs.push(mark)

  const banner = await buildHeroBanner()
  if (banner) outputs.push(banner)

  const offer = await buildOfferBanner()
  if (offer) outputs.push(offer)

  const placeholder = await buildPlaceholder()
  if (placeholder) outputs.push(placeholder)

  for (const item of outputs) {
    console.log(
      `${path.relative(process.cwd(), item.output)}  ${Math.round(item.bytes / 1024)} KB`,
    )
  }

  if (outputs.length === 0) {
    console.log('No brand source files found. Add them to brand-source/ first.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
