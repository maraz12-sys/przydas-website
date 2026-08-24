# Przydaś — website

Landing page systemu Przydaś dla firm animacyjnych.

## Stack

- Astro 7
- statyczny build do `dist/`
- Cloudflare Workers Static Assets
- GitHub Actions do walidacji buildu

## Lokalnie

```bash
npm install
npm run dev
```

Build produkcyjny:

```bash
npm run build
```

## Struktura

- `src/pages/index.astro` — dokument, SEO i składanie strony
- `src/components/LandingTop.astro` — hero, problemy, korzyści, cykl wydarzenia i segmentacja
- `src/components/PackagesSection.astro` — wartość, kalkulator, ceny i pakiety
- `src/components/FinalSections.astro` — porównanie, zaufanie, FAQ i finalne CTA
- `src/pages/404.astro` — własna strona 404
- `public/robots.txt` + `public/sitemap.xml` — indeksowanie domeny produkcyjnej
- `public/_headers` — nagłówki bezpieczeństwa oraz `noindex` dla podglądów `workers.dev`
- `wrangler.jsonc` — routing statycznych assetów i obsługa 404

## Domena

Produkcja: `https://xn--przyda-8ib.pl/` (`przydaś.pl`).

Podgląd `workers.dev` nie powinien trafiać do indeksu wyszukiwarek. Canonical, sitemap i robots wskazują domenę produkcyjną.

## Zasady komunikacji

Strona sprzedaje rezultat, nie liczbę funkcji:

- START — porządek,
- ZESPÓŁ — czas właściciela,
- BIZNES — kontrola wyniku i praca z klientem po realizacji.

Nie publikujemy niezweryfikowanych statystyk ani fikcyjnego social proof. Kalkulator pokazuje wyłącznie porównanie wartości sprzedaży do ceny abonamentu i zawiera wyraźne zastrzeżenie, że nie jest prognozą zysku.

## Release gate

Workflow `.github/workflows/website-ci.yml` przy każdym pushu i pull requeście:

1. wykonuje produkcyjny build Astro,
2. sprawdza wygenerowany `index.html` i `404.html`,
3. pilnuje kluczowych komunikatów sprzedażowych,
4. sprawdza canonical i dane strukturalne,
5. waliduje `robots.txt`, `sitemap.xml` oraz `_headers`.
