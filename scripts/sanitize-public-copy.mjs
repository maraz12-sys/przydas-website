import fs from 'node:fs';

const replacements = {
  'src/components/LandingTop.astro': [
    ['Nie kolejny CRM „dla każdego”.', 'Jeden system do codziennej pracy firmy animacyjnej.'],
    ['Jedno źródło prawdy', 'Wszystko w jednym miejscu'],
  ],

  'src/components/FinalSections.astro': [
    ["['Backup', '—', '✓', '✓']", "['Kopie zapasowe', '—', '✓', '✓']"],
    ["['Zaawansowane uprawnienia i automatyzacje', '—', '—', '✓']", "['Własne poziomy dostępu i automatyczne działania', '—', '—', '✓']"],
    ['Nie jest to uniwersalny CRM z podmienionymi nazwami. Funkcje wynikają z procesu firmy animacyjnej i eventowej.', 'Nie jest to uniwersalny system z podmienionymi nazwami. Funkcje wynikają z codziennej pracy firmy animacyjnej i eventowej.'],
    ['Przydaś działa jako aplikacja webowa i PWA, więc może być pod ręką również podczas realizacji.', 'Przydaś działa na komputerze i telefonie. Na telefonie możesz dodać go do ekranu głównego i otwierać jak zwykłą aplikację.'],
    ['Dane rozdzielone per organizacja', 'Dane każdej firmy są oddzielone'],
    ['Dostęp do informacji jest rozdzielany według organizacji, użytkownika i jego roli w systemie.', 'Każda osoba widzi tylko informacje, do których ma dostęp w swojej firmie.'],
    ['Tak. Interfejs działa na komputerach i urządzeniach mobilnych, a Przydaś może być instalowany jako PWA.', 'Tak. Przydaś działa na komputerze i telefonie. Na telefonie możesz dodać go do ekranu głównego i otwierać jak zwykłą aplikację.'],
    ['Tak. Przydaś korzysta z modelu organizacji i ról użytkowników. Dostęp do informacji jest kontrolowany na podstawie organizacji oraz uprawnień konta.', 'Tak. Każda firma ma własną przestrzeń, a użytkownik widzi tylko informacje, do których ma nadany dostęp.'],
    ['Wyższy pakiet zawiera funkcje pakietów niższych. Zakres funkcji może zmieniać się wraz z kolejnymi wersjami Przydasia.', 'Wyższy pakiet zawiera funkcje pakietów niższych. Aktualny zakres zawsze znajdziesz w tabeli powyżej.'],
  ],

  'src/components/ProductShowcase.astro': [
    ['Prawdziwy system. Prawdziwy interfejs.', 'Przydaś w codziennej pracy'],
    ['Bez makiet i marketingowych atrap. Poniżej są prawdziwe ekrany aplikacji na danych testowych —', 'Poniżej zobaczysz, jak w jednym miejscu łączą się najważniejsze obszary firmy —'],
    ['Prawdziwy ekran aplikacji · dane testowe', 'Kalendarz i szczegóły rezerwacji'],
    ['Prawdziwe moduły Rozliczenie i Statystyki · dane testowe', 'Rozliczenia i statystyki'],
    ['To nie wizualizacja przyszłego produktu.', 'Wszystko, czego potrzebujesz, w jednym miejscu.'],
    ['To aktualny interfejs Przydasia, pokazany na bezpiecznych danych demonstracyjnych.', 'Od pierwszego kontaktu z klientem po rozliczenie i ponowny kontakt — bez przekopywania kilku narzędzi.'],
    ['alt="Prawdziwy ekran Przydasia: kalendarz oraz szczegóły rezerwacji Piknik firmowy GreenTech"', 'alt="Kalendarz Przydasia i szczegóły przykładowej rezerwacji"'],
    ['alt="Prawdziwe ekrany Przydasia: rozliczenia, statystyki i klienci do ponownego kontaktu"', 'alt="Rozliczenia, statystyki i klienci do ponownego kontaktu w Przydasiu"'],
  ],

  'src/components/LegalFooter.astro': [
    ["['Cookies i storage', '/cookies']", "['Cookies i pamięć urządzenia', '/cookies']"],
    ['Pokazujemy faktyczny model: izolację organizacji, szyfrowanie transmisji, kontrolę dostępu, ochronę kont i prywatne Storage.', 'Pokazujemy konkretnie, jak oddzielamy dane firm, chronimy połączenie, konta i dostęp do plików.'],
    ['Regulamin, zasady prywatności, cookies i dokumentacja infrastruktury są dostępne bez logowania.', 'Regulamin, zasady prywatności, informacje o cookies i bezpieczeństwie są dostępne bez logowania.'],
    ['Tak. Przydaś wykorzystuje organizacje, role i reguły dostępu po stronie bazy. Nie polegamy wyłącznie na tym, co jest ukryte w interfejsie.', 'Tak. Dane każdej firmy są oddzielone, a użytkownik widzi tylko informacje, do których ma nadany dostęp.'],
    ['Główny projekt Supabase działa w europejskim regionie eu-central-1.', 'Podstawowe dane Przydasia są przechowywane w europejskim centrum danych.'],
    ['Backup bazy i kopie plików traktujemy jako odrębne obszary. Zakres retencji i odtwarzania wynika z konfiguracji środowiska produkcyjnego oraz dokumentacji operacyjnej.', 'Kopie danych i kopie plików są zabezpieczane osobno, tak aby jedna forma kopii nie była jedynym zabezpieczeniem.'],
    ['<a href="/cookies">Cookies i storage</a>', '<a href="/cookies">Cookies i pamięć urządzenia</a>'],
    ['<span>Dokumentacja prawna v1.0 · 26.08.2026</span>', '<span>Dokumenty prawne i informacje o prywatności</span>'],
  ],

  'src/pages/bezpieczenstwo.astro': [
    ['description="Jak Przydaś podchodzi do izolacji organizacji, szyfrowania, dostępu, kopii zapasowych i ochrony kont."', 'description="Jak Przydaś chroni konta, dane firm, pliki i dostęp do informacji."'],
    ['Podstawowe dane aplikacyjne są przechowywane w zarządzanym środowisku Supabase w regionie europejskim <strong>eu-central-1</strong>. Przydaś nie opiera działania na jednym komputerze ani lokalnym pliku.', 'Podstawowe dane Przydasia są przechowywane w europejskim centrum danych. Nie opieramy działania systemu na jednym komputerze ani lokalnym pliku.'],
    ['Dane organizacji są logicznie rozdzielane. Dostęp ograniczamy na poziomie bazy danych i aplikacji według organizacji, użytkownika, roli i uprawnień. Nie polegamy wyłącznie na ukrywaniu przycisków we frontendzie.', 'Dane każdej firmy są oddzielone. Użytkownik widzi tylko informacje, do których ma nadany dostęp — niezależnie od tego, co jest widoczne na ekranie.'],
    ['RLS i organizacja', 'Oddzielenie danych firm'],
    ['Polityki bazy ograniczają rekordy do właściwego kontekstu organizacji i użytkownika.', 'Dane jednej firmy nie są udostępniane użytkownikom innych firm.'],
    ['Komunikacja z backendem odbywa się po szyfrowanym HTTPS/TLS. Pliki użytkowników są przechowywane w prywatnych zasobach Storage, a dostęp jest kontrolowany politykami i krótkotrwałymi mechanizmami dostępu zamiast publicznych linków.', 'Połączenie z Przydasiem jest szyfrowane. Pliki są przechowywane prywatnie i mogą je otwierać tylko osoby z odpowiednim dostępem.'],
    ['Dane są utrzymywane w zarządzanym środowisku backendowym, a zakres kopii zapasowych i retencji wynika z konfiguracji środowiska produkcyjnego oraz polityk operacyjnych. Backup bazy danych i kopie plików są traktowane jako odrębne obszary, ponieważ kopia bazy nie zastępuje kopii obiektów Storage.', 'Dane i pliki są objęte osobnymi mechanizmami kopii zapasowych. Dzięki temu kopia samych danych nie jest traktowana jako zastępstwo kopii plików.'],
    ['Szczegóły techniczne dotyczące harmonogramów, retencji i procedur odtwarzania są elementem dokumentacji operacyjnej i nie są publikowane na stronie sprzedażowej.', 'Sposób wykonywania i odtwarzania kopii jest regularnie weryfikowany wraz z pozostałymi zabezpieczeniami usługi.'],
    ['PESEL, KRK, pełne dokumenty tożsamości i dane szczególnych kategorii nie powinny trafiać do zwykłego modułu plików. Dla dokumentacji wymagającej podwyższonej ochrony Przydaś wykorzystuje osobny „Sejf dokumentów” z prywatnym Storage, odrębnymi uprawnieniami, krótkotrwałymi linkami i audytem dostępu.', 'PESEL, KRK, pełne dokumenty tożsamości i inne szczególnie wrażliwe informacje nie powinny trafiać do zwykłych plików. Dla dokumentów wymagających większej ochrony Przydaś wykorzystuje osobny „Sejf dokumentów” z ograniczonym dostępem i historią otwarć.'],
    ['Dostęp serwisowy jest ograniczany do uzasadnionych sytuacji i zasady najmniejszych uprawnień. Nie deklarujemy, że technicznie „nikt nigdy nie może zobaczyć danych”; właściwym celem jest dostęp kontrolowany, uzasadniony i audytowany.', 'Dostęp administracyjny jest ograniczony do uzasadnionych sytuacji i tylko do niezbędnego zakresu. Każdy taki dostęp powinien być kontrolowany i możliwy do sprawdzenia.'],
  ],

  'src/pages/cookies.astro': [
    ['title="Cookies i storage"', 'title="Cookies i pamięć urządzenia"'],
    ['eyebrow="Technologie urządzenia końcowego"', 'eyebrow="Prywatność w przeglądarce"'],
    ['Przez „cookies i storage” rozumiemy pliki cookies oraz podobne mechanizmy przeglądarki, takie jak localStorage lub sessionStorage, używane do utrzymania działania strony, aplikacji, sesji i ustawień bezpieczeństwa.', 'Ta polityka opisuje pliki cookies i inne dane zapisywane przez przeglądarkę, potrzebne m.in. do logowania, bezpieczeństwa i zapamiętania ustawień.'],
    ['ochrony ruchu, zapobiegania nadużyciom i zapewnienia bezpieczeństwa infrastruktury.', 'ochrony usługi przed nadużyciami.'],
    ['<div class="callout"><strong>Stan obecny strony sprzedażowej</strong><p>Nie uruchamiamy obecnie własnych opcjonalnych skryptów analitycznych ani marketingowych wymagających zgody. Jeżeli takie narzędzia zostaną dodane, nie będą uruchamiane przed uzyskaniem wymaganej zgody.</p></div>', '<div class="callout"><strong>Analityka i marketing</strong><p>Obecnie nie używamy opcjonalnych narzędzi analitycznych ani marketingowych wymagających zgody. Jeżeli takie narzędzia zostaną włączone, poprosimy o zgodę przed ich uruchomieniem.</p></div>'],
    ['Infrastruktura bezpieczeństwa lub dostawca sieci może stosować własne techniczne mechanizmy ochronne, gdy są niezbędne do obsługi ruchu lub przeciwdziałania nadużyciom.', 'Usługi odpowiedzialne za bezpieczeństwo i dostarczanie strony mogą korzystać z niezbędnych zabezpieczeń chroniących przed nadużyciami.'],
    ['Aplikacja może używać pamięci przeglądarki m.in. do mechanizmów sesji i bezpieczeństwa urządzenia. Dane biznesowe Organizacji nie są traktowane jako „preferencja cookies” i są przechowywane w systemie backendowym zgodnie z zasadami opisanymi w Polityce prywatności.', 'Aplikacja może zapisywać w przeglądarce informacje potrzebne do logowania i bezpieczeństwa urządzenia. Dane firmy są przechowywane w Przydasiu zgodnie z zasadami opisanymi w Polityce prywatności.'],
    ['bez stosowania dark patterns.', 'bez utrudniania późniejszej zmiany decyzji.'],
    ['Pytania dotyczące cookies, storage i prywatności', 'Pytania dotyczące cookies i prywatności'],
  ],

  'src/pages/kontakt.astro': [
    ['Pakiety, wdrożenie, demo i pytania przed rozpoczęciem.', 'Pakiety, rozpoczęcie korzystania i pytania przed zakupem.'],
    ['<a href="/cookies">Cookies i storage</a>', '<a href="/cookies">Cookies i pamięć urządzenia</a>'],
  ],

  'src/pages/podprocesorzy.astro': [
    ['Aktualny model infrastruktury', 'Z jakich usług korzystamy'],
    ['Backend, PostgreSQL, uwierzytelnianie, Storage i funkcje serwerowe. Projekt działa w europejskim regionie eu-central-1.', 'Przechowywanie danych, logowanie, pliki i obsługa działania aplikacji. Dane są przechowywane w regionie europejskim.'],
    ['Warstwa aplikacji webowej i dostarczanie interfejsu Przydasia.', 'Wyświetlanie i działanie aplikacji Przydaś.'],
    ['DNS, ochrona ruchu, SSL/TLS i dostarczanie strony marketingowej.', 'Ochrona i szybkie dostarczanie strony internetowej.'],
    ['Wiadomości techniczne, np. zaproszenia i komunikacja systemowa, w zakresie skonfigurowanym w aplikacji.', 'Wysyłanie wiadomości e-mail, np. zaproszeń i innych wiadomości z Przydasia.'],
  ],

  'src/pages/polityka-prywatnosci.astro': [
    ['hosting/backend, frontend, DNS i ochronę ruchu, pocztę transakcyjną', 'przechowywanie danych i plików, działanie aplikacji, ochronę strony i ruchu sieciowego, wysyłkę wiadomości e-mail'],
    ['<h2>10. Cookies i localStorage</h2>', '<h2>10. Cookies i pamięć urządzenia</h2>'],
    ['Polityka cookies i storage', 'Polityka cookies i pamięci urządzenia'],
    ['logów technicznych', 'zapisów dotyczących działania i bezpieczeństwa'],
  ],

  'src/pages/regulamin.astro': [
    ['description="Zasady korzystania z Przydasia jako usługi SaaS świadczonej drogą elektroniczną."', 'description="Zasady korzystania z Przydasia i świadczenia usługi drogą elektroniczną."'],
    ['oprogramowanie SaaS dostępne przez przeglądarkę lub aplikację webową', 'oprogramowanie dostępne przez przeglądarkę lub aplikację'],
    ['Usługa może być rozwijana, a interfejs i funkcje mogą się zmieniać', 'Usługa może być rozwijana, a wygląd i funkcje mogą się zmieniać'],
    ['<h2>§ 7. Dostępność, utrzymanie i zmiany techniczne</h2>', '<h2>§ 7. Dostępność, utrzymanie i zmiany usługi</h2>'],
    ['Kod, interfejs, nazwa, dokumentacja i elementy Przydasia', 'Kod, wygląd, nazwa, dokumentacja i elementy Przydasia'],
    ['masowe kopiowanie interfejsu', 'masowe kopiowanie wyglądu i działania aplikacji'],
  ],
};

let changedFiles = 0;
let changedPhrases = 0;

for (const [file, changes] of Object.entries(replacements)) {
  let source = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [before, after] of changes) {
    if (!source.includes(before)) {
      console.warn(`Pominięto nieaktualny wzorzec w ${file}: ${before}`);
      continue;
    }
    source = source.split(before).join(after);
    changed = true;
    changedPhrases += 1;
  }

  if (changed) {
    fs.writeFileSync(file, source);
    changedFiles += 1;
  }
}

console.log(`Public copy cleaned: ${changedPhrases} zmian w ${changedFiles} plikach.`);
