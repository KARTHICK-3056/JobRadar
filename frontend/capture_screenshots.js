import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('../docs/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Desktop Viewport
  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 2 });

  console.log('1. Capturing Desktop Dashboard...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_dashboard.png'), fullPage: false });

  console.log('2. Capturing Desktop Listings...');
  await page.goto('http://127.0.0.1:5173/listings', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_listings.png'), fullPage: false });

  console.log('3. Opening Listing Drawer...');
  await page.waitForSelector('.grid > div.cursor-pointer');
  const card = await page.$('.grid > div.cursor-pointer');
  if (card) {
    await card.click();
    await new Promise((r) => setTimeout(r, 800)); // wait for drawer slide-in animation
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_listings_drawer.png'), fullPage: false });
  }

  console.log('4. Capturing Desktop Review Queue...');
  await page.goto('http://127.0.0.1:5173/review', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_review.png'), fullPage: false });

  console.log('5. Capturing Desktop Tracker...');
  await page.goto('http://127.0.0.1:5173/tracker', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_tracker.png'), fullPage: false });

  console.log('6. Capturing Desktop Sources & Runs...');
  await page.goto('http://127.0.0.1:5173/sources', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_sources.png'), fullPage: false });

  console.log('7. Capturing Desktop Evidence...');
  await page.goto('http://127.0.0.1:5173/evidence', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_evidence.png'), fullPage: false });

  console.log('8. Testing Theme Toggle (Light Mode)...');
  const themeBtn = await page.$('button[aria-label="Toggle visual theme"]');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_light_mode.png'), fullPage: false });
    // Toggle back to dark mode
    await themeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Mobile Viewport (iPhone 14 / modern smartphone: 390x844)
  console.log('9. Capturing Mobile Dashboard...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_dashboard.png'), fullPage: false });

  console.log('10. Capturing Mobile Listings...');
  await page.goto('http://127.0.0.1:5173/listings', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_listings.png'), fullPage: false });

  console.log('11. Capturing Mobile Tracker...');
  await page.goto('http://127.0.0.1:5173/tracker', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_tracker.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
