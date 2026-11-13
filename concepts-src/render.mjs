// Renders the concept mockups to images in public/concepts/.
// Run from sites/pagx-studio with the preview server up (`pnpm build && pnpm preview --port 4410`), then `pnpm concepts`.
// Phone shots come from the live pages (/conceptos/architecture/, /conceptos/cumbre/); the generic "before" store is static HTML.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4410'
const src = (f) => pathToFileURL(`concepts-src/${f}`).href
const desktop = { width: 1440, height: 900, scale: 1.25 }
const phone = { width: 390, height: 844, scale: 2.5 }
const jobs = [
  // Architecture: wait out its loader so the hero is clean
  { out: 'architecture-mobile', url: `${BASE}/conceptos/architecture/`, ...phone, wait: 4200 },
  { out: 'cumbre-before', url: src('cumbre-before.html'), ...desktop },
  { out: 'cumbre-mobile', url: `${BASE}/conceptos/cumbre/`, ...phone, wait: 1800, hide: '[data-notice]' },
]

mkdirSync('public/concepts', { recursive: true })
const browser = await chromium.launch()
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.width, height: j.height }, deviceScaleFactor: j.scale })
  await page.goto(j.url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  if (j.wait) await page.waitForTimeout(j.wait)
  if (j.hide) await page.addStyleTag({ content: `${j.hide} { display: none !important; }` })
  await page.screenshot({ path: `public/concepts/${j.out}.jpg`, type: 'jpeg', quality: 80 })
  await page.close()
  console.log('rendered', j.out)
}
await browser.close()
