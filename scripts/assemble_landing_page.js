import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const filePath = path.join(root, 'src/pages/index.astro');
let source = fs.readFileSync(filePath, 'utf8');
let changed = false;

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

function replaceOnce(oldText, newText, label) {
  const oldCount = countOccurrences(source, oldText);
  const newCount = countOccurrences(source, newText);

  if (oldCount === 1) {
    source = source.replace(oldText, newText);
    changed = true;
    return;
  }

  if (oldCount === 0 && newCount === 1) return;

  throw new Error(`${label}: expected one old occurrence or one already-applied occurrence; old=${oldCount}, new=${newCount}`);
}

const packageImport = "import PackagesSection from '../components/PackagesSection.astro';";
const finalImport = "import FinalSections from '../components/FinalSections.astro';";
const frontmatterEnd = '\n---\n\n<!doctype html>';

if (!source.includes(packageImport) || !source.includes(finalImport)) {
  if (!source.includes(frontmatterEnd)) throw new Error('frontmatter end not found');
  const imports = [
    source.includes(packageImport) ? '' : packageImport,
    source.includes(finalImport) ? '' : finalImport,
  ].filter(Boolean).join('\n');
  source = source.replace(frontmatterEnd, `\n${imports}\n---\n\n<!doctype html>`);
  changed = true;
}

replaceOnce(
  '<title>Przydaś - ogarnij eventy, zespół i firmę</title>',
  `<title>Przydaś — system dla firm animacyjnych</title>\n    <link rel="canonical" href="https://xn--przyda-8ib.pl/" />\n    <link rel="icon" href="/przydas-mark.svg" type="image/svg+xml" />\n    <meta property="og:type" content="website" />\n    <meta property="og:locale" content="pl_PL" />\n    <meta property="og:title" content="Przydaś — ogarnij eventy, zespół i firmę" />\n    <meta property="og:description" content="Rezerwacje, kalendarz, zespół, dyspozycyjność, braki, rozliczenia i statystyki w jednym systemie dla branży animacyjnej." />\n    <meta property="og:url" content="https://xn--przyda-8ib.pl/" />\n    <meta name="twitter:card" content="summary" />\n    <script type="application/ld+json">\n      {\n        "@context": "https://schema.org",\n        "@type": "SoftwareApplication",\n        "name": "Przydaś",\n        "applicationCategory": "BusinessApplication",\n        "operatingSystem": "Web",\n        "description": "System do zarządzania rezerwacjami, kalendarzem, zespołem, dyspozycyjnością, rozliczeniami i statystykami firm z branży animacyjnej.",\n        "offers": {\n          "@type": "AggregateOffer",\n          "priceCurrency": "PLN",\n          "lowPrice": "59",\n          "highPrice": "199",\n          "offerCount": "3"\n        }\n      }\n    </script>`,
  'seo-head',
);

replaceOnce(
  `          <span class="brand-mark" aria-hidden="true">\n            <svg viewBox="0 0 24 24" fill="none">\n              <path d="M7 5.5h10A2.5 2.5 0 0 1 19.5 8v8A2.5 2.5 0 0 1 17 18.5H7A2.5 2.5 0 0 1 4.5 16V8A2.5 2.5 0 0 1 7 5.5Z" stroke="currentColor" stroke-width="2" />\n              <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />\n            </svg>\n          </span>`,
  `          <span class="brand-mark" aria-hidden="true"><img src="/przydas-mark.svg" alt="" /></span>`,
  'brand-mark',
);

replaceOnce(
  '  .brand-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--green); color: #fff; display: grid; place-items: center; }',
  '  .brand-mark { width: 32px; height: 32px; border-radius: 10px; overflow: hidden; background: transparent; display: grid; place-items: center; box-shadow: 0 8px 18px rgba(20,72,48,.08); }',
  'brand-mark-css',
);

replaceOnce(
  '  .brand-mark svg { width: 19px; height: 19px; }',
  '  .brand-mark img { display: block; width: 32px; height: 32px; }',
  'brand-image-css',
);

replaceOnce(
  '<a class="login-link" href="#">Zaloguj się</a>',
  '<a class="login-link" href="https://app.xn--przyda-8ib.pl/">Zaloguj się</a>',
  'login-link',
);

replaceOnce(
  "bullets: ['Rezerwacje i kalendarz', 'Porządek w danych zlecenia', 'Mniej notatek i wiadomości'],",
  "bullets: ['Rezerwacje i kalendarz', 'Dyspozycyjność i przypisania', 'Podstawowe powiadomienia i braki'],",
  'start-audience-bullets',
);

replaceOnce(
  "text: 'Sama lista wydarzeń już nie wystarcza. Potrzebujesz dyspozycyjności, przypisań, potwierdzeń, zadań i jasnej odpowiedzialności.',\n    bullets: ['Dyspozycyjność zespołu', 'Przypisania i potwierdzenia', 'Zadania, checklisty i braki'],",
  "text: 'Firma rośnie i potrzebujesz więcej kontroli nad przygotowaniem realizacji, zadaniami, odpowiedzialnością i pracą całego zespołu.',\n    bullets: ['Dni kluczowe i osoba odpowiedzialna', 'Zadania i rozliczenia pracowników', 'Ankiety, checklisty i pełne powiadomienia'],",
  'team-audience-copy',
);

replaceOnce(
  "bullets: ['Rozliczenia po wydarzeniu', 'Feedback i kontrola realizacji', 'Statystyki i wiedza o firmie'],",
  "bullets: ['Materiały, zakupy i magazyn', 'Integracje, faktury i eksport danych', 'Zaawansowane statystyki i kontrola firmy'],",
  'business-audience-bullets',
);

replaceOnce(
  '<a class="button button-primary button-small" href="#start">Wypróbuj za darmo <span>→</span></a>',
  '<a class="button button-primary button-small" href="#cennik">Zobacz pakiety <span>→</span></a>',
  'nav-primary-cta',
);

replaceOnce(
  '<a class="button button-primary" href="#start">Wypróbuj za darmo <span>→</span></a>',
  '<a class="button button-primary" href="#cennik">Zobacz pakiety <span>→</span></a>',
  'hero-primary-cta',
);

replaceOnce(
  '            Jeden system od przyjęcia rezerwacji aż po rozliczenie i statystyki.',
  '            Kalendarz, zespół, dyspozycyjność, braki, rozliczenia i statystyki — w jednym miejscu.',
  'hero-proof',
);

const packageTag = '      <PackagesSection />';
const finalTag = '      <FinalSections />';
const draftMarker = '      <section class="draft-next" id="start">';

if (!source.includes(packageTag) || !source.includes(finalTag)) {
  if (!source.includes(draftMarker)) throw new Error('draft section marker not found');
  const tags = [
    source.includes(packageTag) ? '' : packageTag,
    source.includes(finalTag) ? '' : finalTag,
  ].filter(Boolean).join('\n\n');
  source = source.replace(draftMarker, `${tags}\n\n${draftMarker}`);
  changed = true;
}

const draftBlocks = [
`      <section class="draft-next" id="start">\n        <div class="shell draft-card">\n          <div>\n            <span class="eyebrow-text">Kolejny etap</span>\n            <h2>Teraz pokażemy, co dokładnie dostajesz.</h2>\n            <p>Następna sekcja rozpisze pakiety START, ZESPÓŁ i BIZNES oraz przygotuje miejsce pod finalny cennik.</p>\n          </div>\n          <span class="draft-badge">Draft 0.2</span>\n        </div>\n      </section>\n\n`,
`      <section class="draft-next" id="start">\n        <div class="shell draft-card">\n          <div>\n            <span class="eyebrow-text">Kolejny etap</span>\n            <h2>Teraz dopinamy ofertę.</h2>\n            <p>Kolejna iteracja doda ceny, pełne porównanie funkcji, FAQ i finalne CTA do rozpoczęcia korzystania z Przydasia.</p>\n          </div>\n          <span class="draft-badge">Draft 0.2</span>\n        </div>\n      </section>\n\n`,
];

for (const block of draftBlocks) {
  if (source.includes(block)) {
    source = source.replace(block, '');
    changed = true;
  }
}

for (const placeholder of [
  '      <div id="cennik" hidden></div>\n',
  '      <div id="faq" hidden></div>\n',
]) {
  if (source.includes(placeholder)) {
    source = source.replace(placeholder, '');
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(filePath, source, 'utf8');
  console.log('OK: full Przydas landing page assembled before Astro build');
} else {
  console.log('OK: full Przydas landing page already assembled');
}
