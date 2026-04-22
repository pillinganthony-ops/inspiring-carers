import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto('http://127.0.0.1:4173/find-help', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:/Users/pilli/OneDrive/Desktop/Business Planning - Documents/06 - Inspiring Carers/01 - APP BUILD/Inspiring carers/findhelp_probe.png', fullPage: true });
const text = await page.locator('body').innerText();
console.log(text.slice(0, 12000));
await browser.close();
