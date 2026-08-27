import fs from 'node:fs';

const formPath = 'src/pages/formularz.astro';
const auditPath = '.github/workflows/visual-audit.yml';
let src = fs.readFileSync(formPath, 'utf8');
let audit = fs.readFileSync(auditPath, 'utf8');

function replaceOnce(text, before, after, label) {
  if (text.includes(after)) return text;
  if (!text.includes(before)) throw new Error(`Missing anchor: ${label}`);
  return text.replace(before, after);
}

src = replaceOnce(
  src,
  '      .process-note small{color:#75847c;font-size:10px;font-weight:700;line-height:1.45}\n',
  '      .process-note .process-warning{grid-column:2;margin-top:5px;padding-top:8px;border-top:1px solid #dcebe3;color:#34483d;font-size:11px;font-weight:850;line-height:1.5}\n',
  'process warning style',
);

src = replaceOnce(
  src,
  "<h1>${esc(data.template_name||'Informacje o wydarzeniu')}</h1><p>${esc(data.description||'Uzupełnij informacje dotyczące wydarzenia. Po wysłaniu trafią bezpośrednio do organizatora.')}</p>",
  "<h1>${esc(data.heading||'Formularz rezerwacyjny')}</h1>",
  'configurable public heading',
);

src = replaceOnce(
  src,
  '<div class="process-note"><strong>Jak wygląda dalszy proces?</strong><span>Uzupełnij i wyślij formularz. Organizator zweryfikuje dane, a po zaakceptowaniu rezerwacji otrzymasz potwierdzenie na podany adres e-mail. Jeśli coś będzie wymagało doprecyzowania, organizator skontaktuje się telefonicznie.</span><small>Wysłanie formularza nie oznacza jeszcze potwierdzenia rezerwacji.</small></div>',
  '<div class="process-note"><strong>Jak wygląda dalszy proces?</strong><span>${esc(data.process_text||\'Uzupełnij i wyślij formularz. Zweryfikujemy dane, a po zaakceptowaniu rezerwacji otrzymasz potwierdzenie na podany adres e-mail. Jeżeli coś będzie wymagało doprecyzowania/uzupełnienia skontaktujemy się z Tobą.\')}</span><div class="process-warning">${esc(data.process_warning||\'Pamiętaj! Wysłanie formularza nie oznacza jeszcze potwierdzenia rezerwacji.\')}</div></div>',
  'configurable process copy',
);

src = replaceOnce(
  src,
  '<div class="form-intro"><div><strong>Informacje o wydarzeniu</strong><span>Uzupełnij pola poniżej i wyślij formularz.</span></div><span class="required-note">* pola wymagane</span></div>',
  '<div class="form-intro"><div><strong>Informacje o wydarzeniu</strong></div><span class="required-note">* pola wymagane</span></div>',
  'remove redundant form intro',
);

audit = replaceOnce(
  audit,
  "            template_name: 'Formularz rezerwacji wydarzenia',\n            description: 'Uzupełnij najważniejsze informacje dotyczące wydarzenia.',\n",
  "            template_name: 'Wewnętrzna nazwa szablonu',\n            heading: 'Uzupełnij dane wydarzenia',\n            process_text: 'Uzupełnij i wyślij formularz. Zweryfikujemy dane, a po zaakceptowaniu rezerwacji otrzymasz potwierdzenie na podany adres e-mail. Jeżeli coś będzie wymagało doprecyzowania/uzupełnienia skontaktujemy się z Tobą.',\n            process_warning: 'Pamiętaj! Wysłanie formularza nie oznacza jeszcze potwierdzenia rezerwacji.',\n",
  'public copy audit fixture',
);

audit = replaceOnce(
  audit,
  "              const processText = document.querySelector('.process-note')?.textContent.replace(/\\s+/g,' ').trim() || '';\n",
  "              const processText = document.querySelector('.process-note')?.textContent.replace(/\\s+/g,' ').trim() || '';\n              const headingText = document.querySelector('.head h1')?.textContent.trim() || '';\n              const headerParagraphs = document.querySelectorAll('.head > p').length;\n              const processWarning = document.querySelector('.process-warning');\n              const processWarningWeight = processWarning ? Number.parseInt(getComputedStyle(processWarning).fontWeight,10) : 0;\n              const introText = document.querySelector('.form-intro')?.textContent.replace(/\\s+/g,' ').trim() || '';\n",
  'public copy audit capture',
);

audit = replaceOnce(
  audit,
  "                processText,\n",
  "                processText,\n                headingText,\n                headerParagraphs,\n                processWarningWeight,\n                introText,\n",
  'public copy audit values',
);

audit = replaceOnce(
  audit,
  "            if (!/po zaakceptowaniu rezerwacji otrzymasz potwierdzenie/i.test(result.processText)) throw new Error(`Brakuje informacji o potwierdzeniu po akceptacji: ${result.processText}`);\n",
  "            if (result.headingText !== 'Uzupełnij dane wydarzenia') throw new Error(`Nagłówek nie pochodzi z konfiguracji szablonu: ${result.headingText}`);\n            if (result.headingText === 'Wewnętrzna nazwa szablonu') throw new Error('Publiczny nagłówek używa wewnętrznej nazwy szablonu.');\n            if (result.headerParagraphs !== 0) throw new Error('Pod publicznym nagłówkiem nadal znajduje się zbędny tekst.');\n            if (/uzupełnij pola poniżej/i.test(result.introText)) throw new Error(`Pozostał zbędny tekst wprowadzenia: ${result.introText}`);\n            if (result.processWarningWeight < 700) throw new Error('Ostrzeżenie o braku potwierdzenia rezerwacji nie jest pogrubione.');\n            if (!/po zaakceptowaniu rezerwacji otrzymasz potwierdzenie/i.test(result.processText)) throw new Error(`Brakuje informacji o potwierdzeniu po akceptacji: ${result.processText}`);\n",
  'public copy assertions',
);

fs.writeFileSync(formPath, src, 'utf8');
fs.writeFileSync(auditPath, audit, 'utf8');
console.log('OK: configurable reservation-form heading and process copy');
