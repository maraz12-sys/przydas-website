import fs from 'node:fs';

const replacements = [
  {
    file: 'src/components/LandingTop.astro',
    before: '<div class="preview-label">Plan pracy <span>automatycznie aktualny</span></div>',
    after: '<div class="preview-label">Plan pracy <span>wszystko w jednym miejscu</span></div>',
    label: 'landing plan status',
  },
  {
    file: 'src/components/PackagesSection.astro',
    before: "      'Faktury, magazyn i automatyzacje',",
    after: "      'Magazyn i eksport danych',\n      'Integracje fakturowe — wkrótce dostępne',",
    label: 'business future integration bullet',
  },
  {
    file: 'src/components/FinalSections.astro',
    before: "      ['Faktury, integracja i eksport danych', '—', '—', '✓'],",
    after: "      ['Eksport danych', '—', '—', '✓'],\n      ['Integracje fakturowe', '—', '—', 'Wkrótce'],",
    label: 'invoice integration status',
  },
  {
    file: 'src/components/FinalSections.astro',
    before: "      ['Asystent AI i podwykonawcy', '—', '—', '✓'],",
    after: "      ['Podwykonawcy', '—', '—', '✓'],\n      ['Asystent AI', '—', '—', 'Wkrótce'],",
    label: 'AI status',
  },
  {
    file: 'src/components/FinalSections.astro',
    before: "      ['Własne poziomy dostępu i automatyczne działania', '—', '—', '✓'],",
    after: "      ['Własne poziomy dostępu', '—', '—', '✓'],\n      ['Automatyczne działania', '—', '—', 'Wkrótce'],",
    label: 'automation status',
  },
];

const files = new Map();
for (const item of replacements) {
  if (!files.has(item.file)) files.set(item.file, fs.readFileSync(item.file, 'utf8'));
  let src = files.get(item.file);
  if (src.includes(item.after)) continue;
  if (!src.includes(item.before)) throw new Error(`Missing anchor: ${item.label}`);
  src = src.replace(item.before, item.after);
  files.set(item.file, src);
}

for (const [file, src] of files) fs.writeFileSync(file, src);

const final = fs.readFileSync('src/components/FinalSections.astro', 'utf8');
const packages = fs.readFileSync('src/components/PackagesSection.astro', 'utf8');
const landing = fs.readFileSync('src/components/LandingTop.astro', 'utf8');
if (final.includes('Asystent AI i podwykonawcy')) throw new Error('Combined AI claim still present');
if (final.includes('Faktury, integracja i eksport danych')) throw new Error('Current integration claim still present');
if (final.includes('Własne poziomy dostępu i automatyczne działania')) throw new Error('Current automation claim still present');
if (packages.includes('Faktury, magazyn i automatyzacje')) throw new Error('Current package integration claim still present');
if (landing.includes('automatycznie aktualny')) throw new Error('Unverified automatic-update claim still present');
console.log('Website product claims reconciled with current product state.');
