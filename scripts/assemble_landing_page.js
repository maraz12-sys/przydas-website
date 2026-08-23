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
`      <section class="draft-next" id="start">
        <div class="shell draft-card">
          <div>
            <span class="eyebrow-text">Kolejny etap</span>
            <h2>Teraz pokażemy, co dokładnie dostajesz.</h2>
            <p>Następna sekcja rozpisze pakiety START, ZESPÓŁ i BIZNES oraz przygotuje miejsce pod finalny cennik.</p>
          </div>
          <span class="draft-badge">Draft 0.2</span>
        </div>
      </section>

`,
`      <section class="draft-next" id="start">
        <div class="shell draft-card">
          <div>
            <span class="eyebrow-text">Kolejny etap</span>
            <h2>Teraz dopinamy ofertę.</h2>
            <p>Kolejna iteracja doda ceny, pełne porównanie funkcji, FAQ i finalne CTA do rozpoczęcia korzystania z Przydasia.</p>
          </div>
          <span class="draft-badge">Draft 0.2</span>
        </div>
      </section>

`,
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
