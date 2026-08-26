import fs from 'node:fs';

const replacements = {
  'src/components/LandingTop.astro': [
    [
      'Przydaś powstaje wokół realnego cyklu firmy animacyjnej: rezerwacja → zespół → realizacja → rozliczenie → klient → dane.',
      'Przydaś porządkuje realny cykl firmy animacyjnej: rezerwacja → zespół → realizacja → rozliczenie → klient → dane.',
    ],
  ],
  'src/components/FinalSections.astro': [
    [
      'Przydaś jest budowany wokół tego, co dzieje się naprawdę: klient dzwoni, termin wpada do kalendarza, trzeba zebrać ludzi,',
      'Przydaś działa wokół tego, co dzieje się naprawdę: klient dzwoni, termin wpada do kalendarza, trzeba zebrać ludzi,',
    ],
    [
      'Interfejs jest przygotowywany do pracy na komputerze i urządzeniach mobilnych, a Przydaś może być instalowany jako PWA.',
      'Interfejs działa na komputerach i urządzeniach mobilnych, a Przydaś może być instalowany jako PWA.',
    ],
    [
      'Zakres Przydasia będzie rozwijany wraz z produktem.',
      'Zakres funkcji może zmieniać się wraz z kolejnymi wersjami Przydasia.',
    ],
  ],
};

for (const [file, changes] of Object.entries(replacements)) {
  let source = fs.readFileSync(file, 'utf8');
  for (const [before, after] of changes) {
    if (!source.includes(before)) {
      throw new Error(`Nie znaleziono oczekiwanego tekstu w ${file}: ${before}`);
    }
    source = source.replace(before, after);
  }
  fs.writeFileSync(file, source);
}

console.log('Public copy sanitized.');
