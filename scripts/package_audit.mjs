import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
for (const v of [{ name: 'mobile', w: 390, h: 844 }, { name: 'desktop', w: 1440, h: 1100 }]) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, locale: 'pl-PL' });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const m = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    trial: document.querySelectorAll('.trial-offer').length,
    groups: document.querySelectorAll('.comparison-group').length,
    openGroups: document.querySelectorAll('.comparison-group[open]').length,
    warehouse: document.body.textContent.includes('Do 5 kategorii'),
    oldWarehouse: document.body.textContent.includes('Do 3 kategorii'),
    trialFaq: document.body.textContent.includes('Jak działa bezpłatny okres próbny?'),
  }));
  console.log(v.name, m);
  if (m.scrollWidth > m.innerWidth + 2) throw new Error(`${v.name}: horizontal overflow ${m.scrollWidth}/${m.innerWidth}`);
  if (m.trial !== 1 || m.groups < 8 || m.openGroups < 1 || !m.warehouse || m.oldWarehouse || !m.trialFaq) {
    throw new Error(`${v.name}: package/trial regression ${JSON.stringify(m)}`);
  }
  await ctx.close();
}
await browser.close();
