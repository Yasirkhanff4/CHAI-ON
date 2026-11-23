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

  const canvas = sharp({
    create: {
      width: 640,
      height: 480,
      channels: 3,
      background: CREAM,
    },
  })

  const cup = await sharp(mark)
    .resize({ width: 210, height: 200, fit: 'contain', background: CREAM })
    .png()
    .toBuffer()

  const output = path.join(IMAGES_DIR, 'chayon-placeholder.webp')
  const buffer = await canvas
    .composite([{ input: cup, gravity: 'center' }])
    .webp({ quality: 86, effort: 6 })
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
