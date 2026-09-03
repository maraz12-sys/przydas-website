import fs from 'node:fs';

function patch(path, replacements) {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!text.includes(from)) {
      throw new Error(`Expected source not found in ${path}: ${from.slice(0, 120)}`);
    }
    text = text.replace(from, to);
  }
  fs.writeFileSync(path, text);
}

patch('src/pages/index.astro', [
  [
    '<title>Przydaś — system dla firm animacyjnych | mniej chaosu, więcej czasu</title>',
    '<title>Przydaś — system dla firm animacyjnych | rezerwacje, zespół i rozliczenia</title>',
  ],
  [
    '"name": "Przydaś",\n        "url": "https://xn--przyda-8ib.pl/",',
    '"name": "Przydaś",\n        "alternateName": "Przydaś dla firm animacyjnych",\n        "url": "https://xn--przyda-8ib.pl/",',
  ],
]);

patch('src/components/LandingTop.astro', [
  ["title: 'Zbierasz feedback'", "title: 'Zbierasz podsumowanie'"],
  ['<a class="button button-primary" href="#cennik">Sprawdź, ile to kosztuje <span>→</span></a>', '<a class="button button-primary" href="#start">Wypróbuj 30 dni za 0 zł <span>→</span></a>'],
  ['<span>Eventy</span>', '<span>Wydarzenia</span>'],
  ['<span class="today-chip">3 eventy</span>', '<span class="today-chip">3 wydarzenia</span>'],
  ['Przydaś prowadzi zlecenie od pierwszego kontaktu do danych po realizacji.', 'Przydaś prowadzi zlecenie od rezerwacji do danych po realizacji.'],
  ['<span class="eyebrow-text">Event to nie tylko dzień realizacji</span>', '<span class="eyebrow-text">Wydarzenie to nie tylko dzień realizacji</span>'],
  ['<h2>Przed eventem porządek.<br />Po evencie pieniądze i wiedza.</h2>', '<h2>Przed wydarzeniem porządek.<br />Po wydarzeniu rozliczenie i wiedza.</h2>'],
  ['<span class="phase-kicker">PO WYDARZENIU · TU ZACZYNA SIĘ BIZNES</span>', '<span class="phase-kicker">PO WYDARZENIU · ROZLICZENIE I DANE</span>'],
  ['<h3>Event się kończy. Wartość danych dopiero zaczyna rosnąć.</h3>', '<h3>Wydarzenie się kończy. Wartość danych dopiero zaczyna rosnąć.</h3>'],
  ['<h3>Z każdego eventu zostaje coś więcej niż zdjęcia.</h3>', '<h3>Z każdego wydarzenia zostaje coś więcej niż zdjęcia.</h3>'],
  ['<div class="mobile-cta" aria-label="Szybki dostęp do cennika">\n  <span><strong>Przydaś</strong><small>od 59 zł / mies.</small></span>\n  <a href="#cennik">Zobacz pakiety →</a>\n</div>', '<div class="mobile-cta" aria-label="Szybki dostęp do bezpłatnego testu">\n  <span><strong>Przydaś</strong><small>30 dni BIZNES za 0 zł</small></span>\n  <a href="#start">Wypróbuj →</a>\n</div>'],
]);

patch('src/components/ProductShowcase.astro', [
  ['<span class="showcase-step">01 · PRZED I W TRAKCIE EVENTU</span>', '<span class="showcase-step">01 · PRZED I W TRAKCIE WYDARZENIA</span>'],
  ['<h3>Widzisz termin. Otwierasz event. Masz wszystko pod ręką.</h3>', '<h3>Widzisz termin. Otwierasz wydarzenie. Masz wszystko pod ręką.</h3>'],
  ['<strong>Wszystko, czego potrzebujesz, w jednym miejscu.</strong>', '<strong>Najważniejsze obszary codziennej pracy w jednym miejscu.</strong>'],
  ['<span>Od pierwszego kontaktu z klientem po rozliczenie i ponowny kontakt — bez przekopywania kilku narzędzi.</span>', '<span>Od rezerwacji po rozliczenie i ponowny kontakt — bez przekopywania kilku narzędzi.</span>'],
]);

patch('src/components/PackagesSection.astro', [
  ["'Stanowiska, zadania i garderoba zespołu',", "'Stanowiska, prywatne TODO i współdzielona wiedza zespołu',"],
  ["'Magazyn do 5 kategorii',", "'Magazyn do 3 kategorii',"],
  ["'Checklisty materiałowe i zakupowe',", "'Zadania zespołu, garderoba i checklisty materiałowe',"],
  ['<span class="eyebrow-text">Każda stała opłata ma się bronić wynikiem</span>', '<span class="eyebrow-text">Każda stała opłata ma dawać konkretną wartość</span>'],
  [
    '<p>Każda nowa firma zaczyna od 30 dni pełnego pakietu BIZNES bez opłat. Przez miesiąc sprawdzasz wszystkie dostępne funkcje, a po okresie próbnym wybierasz START, ZESPÓŁ albo BIZNES. Twoje dane zostają w Przydasiu niezależnie od wybranego pakietu.</p>',
    '<p>Każda nowa firma zaczyna od 30 dni pełnego pakietu BIZNES bez opłat. Przez miesiąc sprawdzasz wszystkie dostępne funkcje, a po okresie próbnym wybierasz START, ZESPÓŁ albo BIZNES. Twoje dane zostają w Przydasiu niezależnie od wybranego pakietu.</p>\n          <p><b>Oferta startowa:</b> pierwsze 10 nowych firm otrzymuje dodatkowe 30 dni, czyli łącznie 60 dni BIZNES za 0 zł.</p>',
  ],
  ['Interesuje mnie {plan.name} <span>→</span>', 'Wypróbuj 30 dni za 0 zł <span>→</span>'],
  ['label.textContent = `Interesuje Cię pakiet ${plan}`;', 'label.textContent = `Po okresie próbnym interesuje Cię pakiet ${plan}`;'],
]);

patch('src/components/FinalSections.astro', [
  ["['Zadania dla członków zespołu', '—', '✓', '✓']", "['Zadania dla członków zespołu', '—', '—', '✓']"],
  ["['Garderoba i informacje pracownicze', '—', '✓', '✓']", "['Garderoba i informacje pracownicze', '—', '—', '✓']"],
  ["['Dostęp do Magazynu', '—', 'Do 5 kategorii', 'Bez limitu']", "['Dostęp do Magazynu', '—', 'Do 3 kategorii', 'Bez limitu']"],
  ["['Potencjalne stałe współprace i imprezy prywatne', '—', '—', '✓']", "['Szanse sprzedażowe: potencjalne stałe współprace i imprezy prywatne', '—', '—', 'W przygotowaniu']"],
  [
    "text: 'Stanowiska, zadania, pełne powiadomienia, ankiety i podstawowe statystyki zdejmują z właściciela codzienne pilnowanie ludzi.',",
    "text: 'Stanowiska, pełne powiadomienia, ankiety, prywatne TODO i podstawowe statystyki zdejmują z właściciela dużą część codziennego pilnowania ludzi.',",
  ],
  ["a: 'Historia klienta nie znika po zakończeniu eventu. W pakiecie BIZNES dochodzą przypomnienia o ponownym kontakcie, dzięki czemu łatwiej odezwać się przed kolejną okazją zamiast liczyć, że klient sam będzie o Tobie pamiętał.',", "a: 'Historia klienta nie znika po zakończeniu wydarzenia. W pakiecie BIZNES dochodzą przypomnienia o ponownym kontakcie, dzięki czemu łatwiej odezwać się przed kolejną okazją zamiast liczyć, że klient sam będzie o Tobie pamiętał.',"],
  ["a: 'Event nie znika po realizacji. W zależności od pakietu jego dane mogą zasilać feedback, rozliczenia, braki, historię klienta, statystyki i zestawienia potrzebne do dalszego prowadzenia firmy.',", "a: 'Dane wydarzenia nie znikają po realizacji. W zależności od pakietu mogą zasilać podsumowanie, rozliczenia, braki, historię klienta, statystyki i zestawienia potrzebne do dalszego prowadzenia firmy.',"],
  ['<h2>Bo ten nie wymaga tłumaczenia, czym jest event animacyjny.</h2>', '<h2>Bo ten nie wymaga tłumaczenia, jak działa firma animacyjna.</h2>'],
  ['<article><span>01</span><div><strong>Wybierasz zakres</strong><p>Zaczynasz od tego, co dziś najbardziej przeszkadza w pracy.</p></div></article>', '<article><span>01</span><div><strong>Zaczynasz od pełnego BIZNES</strong><p>Przez 30 dni testujesz cały dostępny zakres bez opłat, a pakiet wybierasz dopiero później.</p></div></article>'],
  [
    '<span class="final-kicker" data-selected-plan-label>Obecnie: dostęp dla zaproszonych firm.</span>\n      <h2>Publiczny start dla nowych firm jest kolejnym krokiem.</h2>\n      <p>\n        Cennik i zakres są już gotowe, ale nowych kont nie zakładamy jeszcze samodzielnie z tej strony.\n        Na etapie testów dostęp uruchamiamy zaproszonym firmom. Gdy sprzedaż wystartuje, tutaj pojawi się bezpośredni start dla nowego klienta.\n      </p>',
    '<span class="final-kicker" data-selected-plan-label>30 dni BIZNES za 0 zł · pierwsze 10 firm otrzymuje dodatkowe 30 dni.</span>\n      <h2>Sprawdź Przydasia na własnej firmie, zanim zapłacisz.</h2>\n      <p>\n        Na start dostajesz 30 dni pełnego pakietu BIZNES bez opłat. W pierwszej fazie sprzedaży konta uruchamiamy ręcznie, żeby pomóc dobrze ustawić firmę i nie zostawić Cię z kolejnym systemem do samodzielnego rozgryzienia. Napisz do nas — uruchomimy test i pomożemy zacząć.\n      </p>',
  ],
  [
    '<a class="button final-primary" href="https://app.xn--przyda-8ib.pl/">Mam już konto — zaloguj się <span>→</span></a>\n      <a class="button final-secondary" href="#cennik">Wróć do pakietów</a>\n      <small>Pakiety od 59 zł brutto miesięcznie · przy płatności rocznej 2 miesiące gratis.</small>',
    '<a class="button final-primary" href="mailto:sprzedaz@xn--przyda-8ib.pl?subject=Chc%C4%99%20uruchomi%C4%87%20bezp%C5%82atny%20test%20Przydasia">Chcę uruchomić bezpłatny test <span>→</span></a>\n      <a class="button final-secondary" href="https://app.xn--przyda-8ib.pl/">Mam już konto — zaloguj się</a>\n      <small>30 dni BIZNES za 0 zł · pierwsze 10 firm +30 dni · po teście wybierasz pakiet od 59 zł brutto / mies.</small>',
  ],
]);

patch('src/components/LegalFooter.astro', [
  [
    "['Co w przypadku utraty hasła lub podejrzanego logowania?', 'System korzysta z kontroli nowych urządzeń i dodatkowej weryfikacji kodem. Incydenty można zgłaszać bezpośrednio na dedykowany adres bezpieczeństwa.'],",
    "['Co w przypadku utraty hasła lub podejrzanego logowania?', 'Przydaś obsługuje zaufane urządzenia i dodatkową weryfikację kodem w obszarach, które tego wymagają. Po resecie hasła wcześniejsze zaufanie do urządzeń i sesji jest unieważniane. Incydenty można zgłaszać na dedykowany adres bezpieczeństwa.'],",
  ],
  [
    "['Jak podchodzimy do kopii zapasowych?', 'Kopie danych i kopie plików są zabezpieczane osobno, tak aby jedna forma kopii nie była jedynym zabezpieczeniem.'],",
    "['Jak podchodzimy do kopii zapasowych?', 'Kopia danych organizacji jest oddzielona od plików przechowywanych w prywatnej przestrzeni plików. Zakres eksportu opisujemy wprost, żeby kopii danych nie traktować jako kopii wszystkich plików.'],",
  ],
]);

patch('src/pages/bezpieczenstwo.astro', [
  [
    '<p>Poza polityką haseł Przydaś korzysta z kontroli nowych urządzeń i dodatkowej weryfikacji kodem. Dla wybranych operacji o podwyższonym ryzyku system może wymagać ponownego potwierdzenia tożsamości.</p>',
    '<p>Przydaś obsługuje zaufane urządzenia i dodatkową weryfikację kodem w obszarach, które tego wymagają. Dla wybranych operacji o podwyższonym ryzyku system może wymagać ponownego potwierdzenia tożsamości, a reset hasła unieważnia wcześniejsze zaufane sesje i urządzenia.</p>',
  ],
  [
    '<p>Dane i pliki są objęte osobnymi mechanizmami kopii zapasowych. Dzięki temu kopia samych danych nie jest traktowana jako zastępstwo kopii plików.</p>\n  <p>Sposób wykonywania i odtwarzania kopii jest regularnie weryfikowany wraz z pozostałymi zabezpieczeniami usługi.</p>',
    '<p>Kopię danych organizacji można pobrać osobno. Pliki przechowywane w prywatnej przestrzeni plików nie są częścią tego eksportu, dlatego kopii danych nie należy traktować jako kopii wszystkich plików.</p>\n  <p>Mechanizmy eksportu, retencji i dostępu do plików są weryfikowane oddzielnie od pozostałych zabezpieczeń usługi.</p>',
  ],
]);

patch('src/pages/polityka-prywatnosci.astro', [
  [
    'Dane właściciela konta, użytkownika, rozliczeń, wsparcia, bezpieczeństwa, zapisów dotyczących działania i bezpieczeństwa i zgód.',
    'Dane właściciela konta, użytkownika, rozliczeń, wsparcia, bezpieczeństwa, zapisów dotyczących działania usługi oraz zgód.',
  ],
]);

patch('src/layouts/LegalLayout.astro', [
  ['<span>System dla branży animacyjnej i eventowej</span>', '<span>System dla firm animacyjnych</span>'],
  ['<a href="/cookies">Cookies i storage</a>', '<a href="/cookies">Cookies i pamięć urządzenia</a>'],
]);

console.log('Sales and language audit fixes applied.');
