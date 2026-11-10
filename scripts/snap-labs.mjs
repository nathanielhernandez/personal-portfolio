import { chromium } from 'playwright';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

// Screenshots each /lab/<slug>/frame into src/content/lab/<slug>/preview-{light,dark}.png.
// Run against a running server: `npm run build && npx astro preview`, then `npm run snap-labs [slug...]`.

const root = path.resolve(import.meta.dirname, '..');
const contentBase = path.join(root, 'src', 'content', 'lab');
const BASE = process.env.SITE_URL ?? 'http://localhost:4321';

const PAD = 40; // breathing room around the [data-preview] element, in CSS px
const RATIO = 16 / 9; // matches .labPreview on /lab

const only = process.argv.slice(2);
const slugs = (await readdir(contentBase, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((s) => !only.length || only.includes(s));

const browser = await chromium.launch();

// The frame has no saved theme in a fresh browser, so it follows the emulated OS scheme
for (const colorScheme of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 3,
    colorScheme,
  });

  for (const slug of slugs) {
    await page.goto(`${BASE}/lab/${slug}/frame`, { waitUntil: 'networkidle' });
    // Only present on `astro dev`; harmless otherwise. Must come after the last goto.
    await page.addStyleTag({
      content: 'astro-dev-toolbar { display: none !important; }',
    });
    await page.waitForTimeout(500); // let client:only React mount and settle

    const target = page.locator('[data-preview]').first();
    const box = (await target.count()) ? await target.boundingBox() : null;

    // Crop to the component, grown to 16:9; fall back to the whole viewport
    let clip;
    if (box) {
      let w = box.width + PAD * 2;
      let h = box.height + PAD * 2;
      if (w / h < RATIO) w = h * RATIO;
      else h = w / RATIO;
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      clip = {
        x: Math.max(0, cx - w / 2),
        y: Math.max(0, cy - h / 2),
        width: w,
        height: h,
      };
    } else {
      console.warn(
        `  ! ${slug}: no [data-preview] element, capturing full frame`,
      );
    }

    const out = path.join(contentBase, slug, `preview-${colorScheme}.png`);
    await page.screenshot({ path: out, clip });
    console.log(`✓ ${path.relative(root, out)}`);
  }

  await page.close();
}

await browser.close();
