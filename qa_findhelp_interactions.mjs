import { chromium, devices } from 'playwright';

const appUrl = 'http://127.0.0.1:4173/find-help';

async function logDesktop() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const errors = [];
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));

  await page.goto(appUrl, { waitUntil: 'networkidle' });
  console.log('INITIAL URL', page.url());
  console.log('HAS 505', await page.locator('text=505 results').count());
  console.log('INITIAL DUPLICATE BARNS', await page.locator('text=Barnardo\'s').count());

  await page.getByRole('textbox').fill('Cornwall Mind');
  await page.waitForTimeout(700);
  console.log('SEARCH MIND COUNT', await page.locator('text=Cornwall Mind').count());
  await page.screenshot({ path: 'C:/Users/pilli/OneDrive/Desktop/Business Planning - Documents/06 - Inspiring Carers/01 - APP BUILD/Inspiring carers/qa_search_mind.png', fullPage: true });
  console.log('AT MAP COORD', JSON.stringify(await page.evaluate(() => {
    const el = document.elementFromPoint(1265, 841);
    return el ? { tag: el.tagName, text: (el.textContent || '').trim(), className: el.className, html: el.outerHTML } : null;
  })));
  await page.evaluate(() => {
    const segmented = Array.from(document.querySelectorAll('div')).find((el) => (el.textContent || '').trim().toLowerCase() === 'listmap');
    const buttons = segmented ? segmented.querySelectorAll('button') : null;
    buttons?.[1]?.click();
  });
  await page.waitForTimeout(2000);
  console.log('MAP URL', page.url());
  console.log('FIT BUTTON COUNT', await page.locator('text=Fit results').count());
  await page.screenshot({ path: 'C:/Users/pilli/OneDrive/Desktop/Business Planning - Documents/06 - Inspiring Carers/01 - APP BUILD/Inspiring carers/qa_map.png', fullPage: true });

  await page.evaluate(() => {
    const segmented = Array.from(document.querySelectorAll('div')).find((el) => (el.textContent || '').trim().toLowerCase() === 'listmap');
    const buttons = segmented ? segmented.querySelectorAll('button') : null;
    buttons?.[0]?.click();
  });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /^View/ }).first().click();
  await page.waitForLoadState('networkidle');
  console.log('DETAIL URL', page.url());
  console.log('DETAIL BODY START');
  console.log((await page.locator('body').innerText()).slice(0, 3000));
  await page.screenshot({ path: 'C:/Users/pilli/OneDrive/Desktop/Business Planning - Documents/06 - Inspiring Carers/01 - APP BUILD/Inspiring carers/qa_detail.png', fullPage: true });

  console.log('ERRORS');
  console.log(errors.join('\n') || 'NONE');
  await browser.close();
}

async function logMobile() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ...devices['iPhone 13'] });
  const errors = [];
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));

  await page.goto(appUrl, { waitUntil: 'networkidle' });
  console.log('MOBILE BODY START');
  console.log((await page.locator('body').innerText()).slice(0, 4000));
  await page.screenshot({ path: 'C:/Users/pilli/OneDrive/Desktop/Business Planning - Documents/06 - Inspiring Carers/01 - APP BUILD/Inspiring carers/qa_mobile.png', fullPage: true });
  console.log('MOBILE ERRORS');
  console.log(errors.join('\n') || 'NONE');
  await browser.close();
}

await logDesktop();
await logMobile();
