/*
 * One-off raster generator: turns the SVG sources in /public into the PNG
 * files browsers and OG previewers need. Run after editing favicon.svg or
 * og-image.svg:
 *
 *   NODE_OPTIONS=--use-system-ca node scripts/generate-icons.mjs
 *
 * Outputs are committed to /public so the site works without a build step.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

const FAVICON_SIZES = [
  { size: 16, name: 'favicon-16.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 96, name: 'favicon-96.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-512-maskable.png', padding: 0.1 },
];

async function renderFavicons() {
  const svg = await readFile(join(PUBLIC, 'favicon.svg'));
  for (const { size, name, padding = 0 } of FAVICON_SIZES) {
    const inner = Math.round(size * (1 - padding * 2));
    const offset = Math.round((size - inner) / 2);
    const rendered = await sharp(svg, { density: 384 })
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: offset,
        bottom: size - inner - offset,
        left: offset,
        right: size - inner - offset,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(join(PUBLIC, name), rendered);
    console.log(`  ✓ ${name} (${size}×${size})`);
  }
}

async function renderOgImage() {
  const svg = await readFile(join(PUBLIC, 'og-image.svg'));
  const rendered = await sharp(svg, { density: 192 })
    .resize(1200, 630, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC, 'og-image.png'), rendered);
  console.log(`  ✓ og-image.png (1200×630)`);
}

console.log('Generating favicons…');
await renderFavicons();
console.log('Generating OG image…');
await renderOgImage();
console.log('Done.');
