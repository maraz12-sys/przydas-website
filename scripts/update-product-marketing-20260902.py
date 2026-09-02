from pathlib import Path


def patch(path, replacements):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    for label, old, new in replacements:
        if old not in s:
            raise SystemExit(f'Missing patch target [{label}] in {path}')
        s = s.replace(old, new, 1)
    p.write_text(s, encoding='utf-8')

patch('src/components/LandingTop.astro', [
    ('capabilities', '''const capabilities = [
  ['Rezerwacje bez szukania', 'Termin, klient, ustalenia, status i szczegóły wydarzenia w jednym miejscu.'],
  ['Zespół bez setek wiadomości', 'Dyspozycyjność, przypisania, potwierdzenia, zadania i odpowiedzialność są widoczne od razu.'],
  ['Braki zanim staną się problemem', 'System przypomina o rzeczach, których nie warto trzymać w głowie.'],
  ['Firma po evencie też pracuje', 'Rozliczenia, feedback, statystyki i historia klienta nie znikają wraz z zakończeniem realizacji.'],
];''', '''const capabilities = [
  ['Rezerwacje bez szukania', 'Termin, klient, ustalenia, status i szczegóły wydarzenia w jednym miejscu.'],
  ['Formularz dla klienta bez przepisywania', 'Wysyłasz link, klient uzupełnia dane, a po Twojej weryfikacji mogą trafić prosto do rezerwacji.'],
  ['Zespół bez setek wiadomości', 'Dyspozycyjność, przypisania, potwierdzenia, zadania i odpowiedzialność są widoczne od razu.'],
  ['Braki zanim staną się problemem', 'System przypomina o rzeczach, których nie warto trzymać w głowie.'],
  ['Koniec ze żmudnym rozliczaniem pracowników', 'Animator uzupełnia dane po realizacji. Przydaś stosuje Twoje stawki, wylicza należność i pilnuje historii wypłat.'],
  ['Powiadomienia, które prowadzą do działania', 'Przypisania, potwierdzenia, braki i rozliczenia trafiają do właściwej osoby zamiast ginąć w kolejnej rozmowie.'],
];'''),
    ('after settlement', '''  {
    no: '05',
    title: 'Zamykasz rozliczenie',
    text: 'Pracownicy, płatności i dane potrzebne do zamknięcia zlecenia nie wiszą tygodniami w pamięci.',
  },''', '''  {
    no: '05',
    title: 'Przydaś liczy rozliczenie',
    text: 'Animator uzupełnia czas, dojazd, przygotowanie, kilometry i pobraną gotówkę. System wylicza należność według Twoich stawek — Ty sprawdzasz i zatwierdzasz.',
  },'''),
    ('team audience', '''    text: 'Dla firmy, w której dyspozycyjność, potwierdzenia, zadania i rozliczenia pracowników zaczynają zabierać realne godziny.',
    result: 'Efekt: mniej wiadomości i mniej ręcznego koordynowania.',''', '''    text: 'Dla firmy, w której dyspozycyjność, potwierdzenia, zadania i codzienna komunikacja zespołu zaczynają zabierać realne godziny.',
    result: 'Efekt: mniej wiadomości i mniej ręcznego koordynowania.','''),
    ('business audience', '''    eyebrow: 'Chcesz zarządzać wynikiem, nie tylko kalendarzem',
    title: 'Pilnuj pieniędzy i klientów',
    text: 'Dla firmy, która chce kontrolować koszty, materiały, wyniki, dane po realizacji i powroty do byłych klientów.',
    result: 'Efekt: decyzje oparte na danych i więcej okazji do ponownej sprzedaży.',''', '''    eyebrow: 'Chcesz przestać ręcznie liczyć wypłaty i pilnować pieniędzy',
    title: 'Rozlicz zespół bez arkuszy',
    text: 'Dla firmy, która chce naliczać rozliczenia pracowników według własnych stawek, kontrolować wypłaty i gotówkę oraz lepiej wykorzystywać dane po realizacji.',
    result: 'Efekt: mniej liczenia po nocach, pełna historia wypłat i lepsza kontrola wyniku.','''),
    ('hero lead', '''      Przydaś łączy rezerwacje, kalendarz, zespół, braki, rozliczenia i dane po realizacji.
      Zamiast pamiętać o wszystkim samemu, budujesz proces, który pomaga oszczędzać czas, ograniczać straty i wracać do klientów.''', '''      Przydaś łączy rezerwacje, formularze dla klientów, kalendarz, zespół, braki, rozliczenia i dane po realizacji.
      Zamiast składać firmę z Messengera, notatek i arkuszy, budujesz proces, który oszczędza czas, ogranicza straty i pomaga wracać do klientów.'''),
    ('problem event wording', "    title: 'Dobry klient znika po evencie',", "    title: 'Dobry klient znika po wydarzeniu',"),
])

patch('src/components/ProductShowcase.astro', [
    ('after headline', '''        <h3>Event się kończy. Dane, pieniądze i klient zostają.</h3>
        <p>
          Przydaś nie kończy pracy w dniu imprezy. Pomaga domknąć płatności i faktury, pokazuje wyniki
          oraz wyciąga na wierzch klientów, do których warto wrócić z kolejną ofertą.
        </p>
        <ul>
          <li><span>✓</span> rozliczenia i kwoty do zapłaty bez osobnego arkusza</li>
          <li><span>✓</span> statystyki wartości, sezonowości i źródeł zleceń</li>
          <li><span>✓</span> lista klientów, o których firma nie powinna zapomnieć</li>
        </ul>''', '''        <h3>Koniec ze żmudnym rozliczaniem pracowników.</h3>
        <p>
          Animator uzupełnia dane po realizacji, a Przydaś liczy wynagrodzenie według Twoich zasad i stawek.
          Ty zatwierdzasz — zamiast składać wypłatę z wiadomości, notatek i arkuszy.
        </p>
        <ul>
          <li><span>✓</span> czas pracy, dojazd, przygotowanie, kilometry i gotówka w jednym rozliczeniu</li>
          <li><span>✓</span> należność naliczana według stawek ustawionych przez właściciela</li>
          <li><span>✓</span> historia wypłat, płatności i dane potrzebne do kontroli wyniku</li>
        </ul>'''),
    ('figcaption', '<figcaption>Rozliczenia i statystyki</figcaption>', '<figcaption>Rozliczenia pracowników, płatności i statystyki</figcaption>'),
])

patch('src/components/PackagesSection.astro', [
    ('team package', "      'Stanowiska, zadania i rozliczenia pracowników',", "      'Stanowiska, zadania i organizacja pracy zespołu',"),
    ('business positioning', "    kicker: 'Kontrola i wzrost',\n    effect: 'Kontrola wyników = więcej pieniędzy w kieszeni',", "    kicker: 'Rozliczenia, kontrola i wzrost',\n    effect: 'Mniej ręcznego liczenia = więcej kontroli',"),
    ('business bullets', '''    bullets: [
      'Wszystko z pakietu ZESPÓŁ',
      'Checklisty materiałowe i zakupowe',
      'Przypomnienia o ponownym kontakcie z klientami',
      'Magazyn i eksport danych',
      'Integracje fakturowe — wkrótce dostępne',
      'Zaawansowane statystyki i analityka',
    ],''', '''    bullets: [
      'Wszystko z pakietu ZESPÓŁ',
      'Rozliczenia pracowników naliczane według Twoich stawek',
      'Gotówka, wypłaty i historia rozliczeń pracowników',
      'Checklisty materiałowe i zakupowe',
      'Przypomnienia o ponownym kontakcie z klientami',
      'Magazyn i eksport danych',
      'Integracje fakturowe — wkrótce dostępne',
      'Zaawansowane statystyki i analityka',
    ],'''),
    ('time value', '<p>Mniej szukania ustaleń, wiadomości do zespołu, ręcznych przypomnień i sprawdzania wszystkiego drugi raz.</p>', '<p>Mniej szukania ustaleń, wiadomości do zespołu, ręcznych przypomnień i liczenia wypłat z kilku różnych miejsc.</p>'),
    ('pricing intro', '<p>START daje porządek. ZESPÓŁ odzyskuje czas. BIZNES dokłada kontrolę wyniku i narzędzia do wzrostu.</p>', '<p>START daje porządek. ZESPÓŁ odzyskuje czas. BIZNES dokłada rozliczenia pracowników, kontrolę wyniku i narzędzia do wzrostu.</p>'),
])

patch('src/components/FinalSections.astro', [
    ('employee settlements plan', "      ['Rozliczenia pracowników', '—', '✓', '✓'],", "      ['Rozliczenia pracowników i naliczanie wypłat', '—', '—', '✓'],"),
    ('finance cash row', "      ['Podstawowy panel rozliczeń', '✓', '✓', '✓'],", "      ['Podstawowy panel rozliczeń', '✓', '✓', '✓'],\n      ['Gotówka i historia wypłat pracowników', '—', '—', '✓'],"),
    ('team outcome', "    text: 'Właściciel przestaje być ręcznym centrum dyspozycyjności, potwierdzeń, zadań i rozliczeń pracowników.',", "    text: 'Właściciel przestaje być ręcznym centrum dyspozycyjności, potwierdzeń, zadań i codziennej komunikacji zespołu.',"),
    ('business outcome', '''    label: 'Gdy chcesz pilnować wyniku',
    text: 'Do operacji dochodzą pieniądze, materiały, zaawansowane dane oraz praca nad powrotami klientów i kolejną sprzedażą.',''', '''    label: 'Gdy chcesz przestać liczyć wszystko ręcznie',
    text: 'Przydaś nalicza rozliczenia pracowników według Twoich stawek, porządkuje wypłaty i gotówkę, a do tego dokłada materiały, zaawansowane dane i pracę nad powrotami klientów.','''),
    ('faq settlement', '''const faq = [
  {
    q: 'Czy 149 zł miesięcznie ma sens dla małej firmy?',''', '''const faq = [
  {
    q: 'Czy Przydaś naprawdę liczy wypłaty pracowników?',
    a: 'Tak — w pakiecie BIZNES. Animator uzupełnia dane po realizacji, np. czas pracy, dojazd, przygotowanie, kilometry lub pobraną gotówkę, zależnie od ustawień firmy. Właściciel ustala zasady i stawki, a Przydaś wylicza należność, porządkuje miesiąc, gotówkę i historię wypłat. Ty sprawdzasz i zatwierdzasz zamiast składać rozliczenie z wiadomości i arkuszy.',
  },
  {
    q: 'Czy 149 zł miesięcznie ma sens dla małej firmy?','''),
])

patch('src/pages/index.astro', [
    ('meta description', 'content="Przydaś pomaga firmom animacyjnym oszczędzać czas, porządkować rezerwacje i zespół, ograniczać braki, rozliczać eventy i wracać do klientów."', 'content="Przydaś porządkuje rezerwacje i zespół, pilnuje braków, pomaga zbierać dane od klientów i automatyzuje rozliczenia pracowników w firmach animacyjnych."'),
    ('og description', 'content="Rezerwacje, zespół, braki, rozliczenia, statystyki i historia klientów w jednym systemie stworzonym dla branży animacyjnej."', 'content="Rezerwacje, formularze dla klientów, zespół, braki, rozliczenia pracowników, statystyki i historia klientów w jednym systemie dla branży animacyjnej."'),
    ('schema description', '"description": "System dla firm animacyjnych do zarządzania rezerwacjami, kalendarzem, zespołem, dyspozycyjnością, brakami, rozliczeniami, statystykami i historią klientów.",', '"description": "System dla firm animacyjnych do zarządzania rezerwacjami, formularzami dla klientów, zespołem, dyspozycyjnością, brakami, rozliczeniami pracowników, statystykami i historią klientów.",'),
    ('feature list', '''          "Powiadomienia i braki",
          "Rozliczenia",
          "Statystyki",''', '''          "Powiadomienia i braki",
          "Formularze rezerwacyjne dla klientów",
          "Rozliczenia pracowników i wypłaty",
          "Statystyki",'''),
])
