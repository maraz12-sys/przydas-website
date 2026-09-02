from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


# Packages / pricing
p = Path('src/components/PackagesSection.astro')
s = p.read_text(encoding='utf-8')

replacements = [
    ("monthlyPrice: '199 zł'", "monthlyPrice: '249 zł'", 'business monthly'),
    ("annualPrice: '1 990 zł'", "annualPrice: '2 490 zł'", 'business annual'),
    ("annualMonthly: '165,83 zł'", "annualMonthly: '207,50 zł'", 'business annual monthly'),
    ("annualSaving: '398 zł'", "annualSaving: '498 zł'", 'business saving'),
    ("dailyPrice: 'ok. 6,63 zł dziennie'", "dailyPrice: 'ok. 8,30 zł dziennie'", 'business daily'),
    ("kicker: 'Rozliczenia, kontrola i wzrost'", "kicker: 'Finanse i rozwój pod kontrolą'", 'business kicker'),
    ("effect: 'Mniej ręcznego liczenia = więcej kontroli'", "effect: 'Wypłaty i dane biznesowe bez arkuszy'", 'business effect'),
    ("'Stanowiska, zadania i organizacja pracy zespołu'", "'Stanowiska, zadania i garderoba zespołu'", 'team people bullet'),
    ("'Checklisty, standardy i podstawowe statystyki'", "'Standardy, instrukcje, TODO, linki i podstawowe statystyki'", 'team tools bullet'),
    ("'Magazyn i eksport danych'", "'Nielimitowany magazyn i eksport danych'", 'business warehouse bullet'),
    ('<option value="1990" data-name="BIZNES" selected>BIZNES · 1 990 zł / rok</option>', '<option value="2490" data-name="BIZNES" selected>BIZNES · 2 490 zł / rok</option>', 'roi business price'),
]
for old, new, label in replacements:
    s = replace_once(s, old, new, label)

old_mobile = '''    const featureDetails = section.querySelectorAll('.package-feature-details');
    const mobilePackages = window.matchMedia('(max-width: 640px)');
    const syncPackageDetails = () => {
      featureDetails.forEach((details) => {
        if (mobilePackages.matches) details.removeAttribute('open');
        else details.setAttribute('open', '');
      });
    };
    syncPackageDetails();
    mobilePackages.addEventListener?.('change', syncPackageDetails);

'''
s = replace_once(s, old_mobile, '', 'mobile pricing details')
p.write_text(s, encoding='utf-8')


# Comparison / FAQ
p = Path('src/components/FinalSections.astro')
s = p.read_text(encoding='utf-8')

new_comparison = r'''const comparisonSections = [
  {
    title: 'Kalendarz i rezerwacje',
    rows: [
      ['Widok kalendarza dzień / tydzień / miesiąc', '✓', '✓', '✓'],
      ['Dodawanie, edycja i duplikowanie rezerwacji', '✓', '✓', '✓'],
      ['Dyspozycyjność, przypisania i potwierdzanie udziału', '✓', '✓', '✓'],
      ['Dni kluczowe', '—', '✓', '✓'],
      ['Osoba odpowiedzialna za wydarzenie', '—', '✓', '✓'],
      ['Ankieta po wydarzeniu', '—', '✓', '✓'],
      ['Checklisty materiałowe i zakupowe przy wydarzeniu', '—', '—', '✓'],
    ],
  },
  {
    title: 'Powiadomienia i braki',
    rows: [
      ['Powiadomienia o przypisaniu i odrzuceniu udziału', '✓', '✓', '✓'],
      ['Pełny system powiadomień', '—', '✓', '✓'],
      ['Braki w danych rezerwacji', '✓', '✓', '✓'],
      ['Braki dotyczące obsady zespołu', '—', '✓', '✓'],
      ['Braki materiałowe i rozliczeniowe', '—', '—', '✓'],
    ],
  },
  {
    title: 'Zespół i organizacja pracy',
    rows: [
      ['Tworzenie i zarządzanie zespołem', '✓', '✓', '✓'],
      ['Zbiorczy widok zespołu', '✓', '✓', '✓'],
      ['Stanowiska i przypisywanie stanowisk', '—', '✓', '✓'],
      ['Zadania dla członków zespołu', '—', '✓', '✓'],
      ['Garderoba i informacje pracownicze', '—', '✓', '✓'],
      ['Rozliczenia pracowników i naliczanie wypłat', '—', '—', '✓'],
    ],
  },
  {
    title: 'Przydasie — wiedza i narzędzia',
    rows: [
      ['Notatnik', '✓', '✓', '✓'],
      ['Współdzielone notatki', '—', '✓', '✓'],
      ['Standardy, instrukcje, TODO i przydatne linki', '—', '✓', '✓'],
      ['Checklisty', '—', '—', '✓'],
      ['Generator formułek', '—', '—', '✓'],
      ['Podwykonawcy', '—', '—', '✓'],
      ['Asystent AI', '—', '—', 'W przygotowaniu'],
    ],
  },
  {
    title: 'Magazyn',
    rows: [
      ['Dostęp do Magazynu', '—', 'Do 3 kategorii', 'Bez limitu'],
    ],
  },
  {
    title: 'Rozliczenia i finanse',
    rows: [
      ['Podstawowy panel: liczba i wartość rezerwacji, kwoty do zapłaty', '✓', '✓', '✓'],
      ['Pełna lista rezerwacji i dostosowanie tabeli', '—', '✓', '✓'],
      ['Oznaczanie faktur', '—', '✓', '✓'],
      ['Rozliczenia pracowników według własnych stawek', '—', '—', '✓'],
      ['Gotówka, wypłaty i historia rozliczeń pracowników', '—', '—', '✓'],
      ['Eksport danych do Excela', '—', '—', '✓'],
      ['Integracja z programem fakturowym', '—', '—', 'W przygotowaniu'],
    ],
  },
  {
    title: 'Statystyki i klienci',
    rows: [
      ['Zbiorczy widok i podsumowanie miesięczne', '—', '✓', '✓'],
      ['Analiza ankiet po wydarzeniach', '—', '✓', '✓'],
      ['Przypomnienia o ponownym kontakcie z klientami', '—', '—', '✓'],
      ['Potencjalne stałe współprace i imprezy prywatne', '—', '—', '✓'],
      ['Analiza wydarzeń, źródeł, typów i wartości klientów', '—', '—', '✓'],
    ],
  },
  {
    title: 'Dane organizacji',
    rows: [
      ['Liczba obsługiwanych firm', '1', 'Do 3', 'Bez limitu'],
      ['Pliki organizacji', '—', '✓', '✓'],
      ['Kopia danych', '—', '✓', '✓'],
      ['Automatyczne przypomnienie o kopii co 30 dni', '—', '—', '✓'],
    ],
  },
  {
    title: 'Ustawienia',
    rows: [
      ['Preferencje użytkownika', '✓', '✓', '✓'],
      ['Konfiguracja formularza rezerwacji', 'Częściowa', 'Pełna', 'Pełna'],
      ['Wymagania profilowe pracowników', '—', '✓', '✓'],
      ['Włączanie i wyłączanie ankiet', '—', '✓', '✓'],
      ['Zarządzanie uprawnieniami ról', '—', '✓', '✓'],
      ['Sterowanie progami priorytetów Braków', '—', '✓', '✓'],
    ],
  },
];

const comparisonOutcomes = [
  {
    plan: 'START',
    price: '59 zł / mies.',
    label: 'Gdy najbardziej boli chaos',
    text: 'Rezerwacje, dane klienta i podstawowa organizacja przestają być porozrzucane po kalendarzu, wiadomościach i notatkach.',
  },
  {
    plan: 'ZESPÓŁ',
    price: '149 zł / mies.',
    label: 'Gdy najbardziej boli brak czasu',
    text: 'Stanowiska, zadania, pełne powiadomienia, ankiety i podstawowe statystyki zdejmują z właściciela codzienne pilnowanie ludzi.',
  },
  {
    plan: 'BIZNES',
    price: '249 zł / mies.',
    label: 'Gdy chcesz automatyzować finanse i rozwój',
    text: 'Przydaś nalicza wynagrodzenia pracowników według Twoich stawek, porządkuje wypłaty i gotówkę oraz dokłada narzędzia do analizy i powrotów klientów.',
  },
];'''

pattern = re.compile(r"const comparisonSections = \[.*?\];\n\nconst comparisonOutcomes = \[.*?\];", re.S)
s, count = pattern.subn(new_comparison, s, count=1)
if count != 1:
    raise SystemExit(f'comparison constants: expected 1 replacement, found {count}')

replacements = [
    ('BIZNES<br /><span>199 zł / mies.</span>', 'BIZNES<br /><span>249 zł / mies.</span>', 'comparison header price'),
    ("Ceny 59 zł, 149 zł i 199 zł są kwotami brutto", "Ceny 59 zł, 149 zł i 249 zł są kwotami brutto", 'faq monthly prices'),
    ('BIZNES 1 990 zł brutto.', 'BIZNES 2 490 zł brutto.', 'faq annual price'),
    ('START porządkuje podstawy, ZESPÓŁ odzyskuje czas właściciela, a BIZNES dokłada kontrolę nad wynikiem i klientami.', 'START porządkuje podstawy, ZESPÓŁ porządkuje pracę ludzi, a BIZNES automatyzuje rozliczenia i dokłada narzędzia do analizy oraz sprzedaży.', 'comparison intro'),
]
for old, new, label in replacements:
    s = replace_once(s, old, new, label)

# Add a direct value explanation for the premium tier after the existing small-company FAQ.
needle = """  {
    q: 'Czy jeden dodatkowy klient może pokryć abonament?',"""
insert = """  {
    q: 'Co dostaję za 249 zł w pakiecie BIZNES?',
    a: 'BIZNES jest dla firmy, która chce zdjąć z właściciela pracę finansową i wykorzystać dane do dalszej sprzedaży. Obejmuje m.in. naliczanie wynagrodzeń pracowników według własnych stawek, obsługę gotówki i historii wypłat, checklisty materiałowe i zakupowe, zaawansowane statystyki, przypomnienia o powrotach klientów, nielimitowany Magazyn i eksport danych.',
  },
""" + needle
s = replace_once(s, needle, insert, 'business faq insert')
p.write_text(s, encoding='utf-8')


# Landing page language cleanup
p = Path('src/components/LandingTop.astro')
s = p.read_text(encoding='utf-8')
replacements = [
    ('Zamiast składać firmę z Messengera, notatek i arkuszy, budujesz proces, który oszczędza czas, ogranicza straty i pomaga wracać do klientów.', 'Zamiast prowadzić firmę w Messengerze, notatkach i arkuszach, pracujesz w jednym procesie, który oszczędza czas, ogranicza straty i pomaga wracać do klientów.', 'hero language'),
    ('To, co dziś pilnujesz ręcznie, zamieniasz w proces.', 'To, czego dziś pilnujesz ręcznie, zamieniasz w proces.', 'grammar co/czego'),
    ("title: 'Przydaś liczy rozliczenie'", "title: 'Przydaś wylicza wynagrodzenie'", 'after event title'),
    ('Dane z wydarzeń budują statystyki, które pokazują wyniki, źródła zleceń i rentowność.', 'Dane z wydarzeń budują statystyki, które pokazują wartość zleceń, źródła klientów i sezonowość.', 'unsupported profitability wording'),
]
for old, new, label in replacements:
    s = replace_once(s, old, new, label)
p.write_text(s, encoding='utf-8')


# Product showcase language
p = Path('src/components/ProductShowcase.astro')
s = p.read_text(encoding='utf-8')
s = replace_once(s, 'Animator uzupełnia dane po realizacji, a Przydaś liczy wynagrodzenie według Twoich zasad i stawek.', 'Animator uzupełnia dane po realizacji, a Przydaś wylicza wynagrodzenie według Twoich zasad i stawek.', 'showcase settlement language')
s = replace_once(s, 'historia wypłat, płatności i dane potrzebne do kontroli wyniku', 'historia wypłat, płatności i dane potrzebne do kontroli finansów', 'showcase finance language')
p.write_text(s, encoding='utf-8')


# Metadata + mobile comparison labels
p = Path('src/pages/index.astro')
s = p.read_text(encoding='utf-8')
s = replace_once(s, '"highPrice": "199"', '"highPrice": "249"', 'structured data price')
s = replace_once(s, 'grid-template-columns: minmax(0, 1fr) repeat(3, 54px) !important;', 'grid-template-columns: minmax(0, 1fr) repeat(3, 64px) !important;', 'mobile comparison width')
s = replace_once(s, ".comparison-table td:nth-child(2)::before { content: 'S'; }", ".comparison-table td:nth-child(2)::before { content: 'START'; }", 'mobile start label')
s = replace_once(s, ".comparison-table td:nth-child(3)::before { content: 'Z'; }", ".comparison-table td:nth-child(3)::before { content: 'ZESPÓŁ'; }", 'mobile team label')
s = replace_once(s, ".comparison-table td:nth-child(4)::before { content: 'B'; }", ".comparison-table td:nth-child(4)::before { content: 'BIZNES'; }", 'mobile business label')
p.write_text(s, encoding='utf-8')

print('Pricing, package matrix, UI and language patch applied successfully.')
