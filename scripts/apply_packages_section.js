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

const importLine = "import PackagesSection from '../components/PackagesSection.astro';";
if (!source.includes(importLine)) {
  const frontmatterEnd = '\n---\n\n<!doctype html>';
  if (!source.includes(frontmatterEnd)) throw new Error('frontmatter end not found');
  source = source.replace(frontmatterEnd, `\n${importLine}\n---\n\n<!doctype html>`);
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

const packagesTag = '      <PackagesSection />';
if (!source.includes(packagesTag)) {
  const marker = '      <section class="draft-next" id="start">';
  if (!source.includes(marker)) throw new Error('draft section marker not found');
  source = source.replace(marker, `${packagesTag}\n\n${marker}`);
  changed = true;
}

const hiddenCennik = '      <div id="cennik" hidden></div>\n';
if (source.includes(hiddenCennik)) {
  source = source.replace(hiddenCennik, '');
  changed = true;
}

replaceOnce(
  '<span class="eyebrow-text">Kolejny etap</span>\n            <h2>Teraz pokażemy, co dokładnie dostajesz.</h2>\n            <p>Następna sekcja rozpisze pakiety START, ZESPÓŁ i BIZNES oraz przygotuje miejsce pod finalny cennik.</p>',
  '<span class="eyebrow-text">Kolejny etap</span>\n            <h2>Teraz dopinamy ofertę.</h2>\n            <p>Kolejna iteracja doda ceny, pełne porównanie funkcji, FAQ i finalne CTA do rozpoczęcia korzystania z Przydasia.</p>',
  'draft-next-copy',
);

if (changed) {
  fs.writeFileSync(filePath, source, 'utf8');
  console.log('OK: packages section applied to homepage before Astro build');
} else {
  console.log('OK: packages section already applied');
}
