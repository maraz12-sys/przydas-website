# Animilandia — niezależny landing urodzinowy

Landing działa jako mała wtyczka na istniejącym WordPressie Animilandii w cyber_Folks. Nie wymaga ChatGPT Sites, konta ChatGPT dla odwiedzających, Cloudflare D1 ani logowania przez OpenAI. Zapytania są przechowywane w bazie WordPressa i dostępne dla administratora w menu **Urodziny**.

## Jednorazowe uruchomienie

1. WordPress → Wtyczki → Dodaj wtyczkę → Wyślij wtyczkę na serwer. Wgraj `Animilandia_Urodziny_1.0.0.zip` i aktywuj.
2. Od razu działa adres `https://animilandia.pl/urodziny-z-animatorem/`.
3. W cyber_Folks ustaw subdomenę `urodziny.animilandia.pl` tak, aby jej katalog dokumentów wskazywał na **ten sam katalog instalacji WordPressa**, co animilandia.pl. Włącz SSL dla subdomeny. Nie instaluj drugiego WordPressa.
4. Zamiast wcześniejszego CNAME do Sites użyj wskazania na serwer cyber_Folks, zgodnego z konfiguracją usługi. Potwierdź DNS i HTTPS przed przełączeniem reklamy.
5. Wyślij jedno oznaczone zapytanie testowe; sprawdź zapis w panelu i realne doręczenie wiadomości e-mail.

Wtyczka nie zmienia istniejącej podstrony `/urodziny/`, motywu ani podstawowej strony głównej. Obsługuje tylko `/urodziny-z-animatorem/` i główny adres subdomeny `urodziny.animilandia.pl`.

## Aktualizacje z czatu

Kod: wydzielona gałąź `animilandia-urodziny` w publicznym repozytorium `maraz12-sys/przydas-website`. Gałąź jest osobnym drzewem plików landingu; produkcyjna gałąź Przydasia nie jest zmieniana. Po edycji i testach publikowany jest manifest `release.json`, który wskazuje konkretny, niezmienny commit źródeł.

Wtyczka sprawdza manifest co 5 minut za pomocą WP-Cron i aktualizuje wyłącznie siebie standardowym mechanizmem aktualizacji wtyczek WordPressa. WP-Cron zależy od ruchu na stronie; przy małym ruchu lub wyłączonym WP-Cron aktualizacja nastąpi później. Docelowo można uruchamiać WP-Cron z harmonogramu hostingu.

W **Urodziny → Ustawienia i aktualizacje** można wyłączyć automatyczne aktualizacje, zmienić odbiorcę powiadomień i sprawdzić ostatni status. Jeżeli WordPress blokuje modyfikacje plików lub wymaga FTP, aktualizacja zostaje wstrzymana i panel pokazuje przyczynę. Działanie aktualizacji trzeba potwierdzić na realnym hostingu przed traktowaniem wdrożenia jako zakończonego.

## Dane i poczta

Domyślny odbiorca: `animilandia@gmail.com`. Wysyłka korzysta z `wp_mail()` i ustawień poczty istniejącego WordPressa. Status `accepted` oznacza przyjęcie wiadomości przez mechanizm wysyłkowy, nie potwierdzone doręczenie. Zgłoszenie jest zapisywane przed wysyłką, więc błąd poczty nie usuwa zgłoszenia.

Prywatne tabele z prefiksem WordPressa: `al_birthday_inquiries`, `al_birthday_limits`. Panel i eksport CSV wymagają uprawnień administratora; formularz ma walidację serwera, podpisane tokeny, limit zapytań, honeypot i ochronę przed duplikatami. Dane nie są wysyłane do ChatGPT. Zdjęcia i ilustracje pakietów korzystają z istniejących mediów na animilandia.pl. Czcionki są ładowane z Google Fonts, jak w obecnej identyfikacji; można je lokalnie dołączyć w kolejnej wersji.

## Pliki do prostych zmian

- `animilandia-urodziny/packages.json`: nazwy, ceny, czas, opisy, ilustracje i atrakcje wszystkich pakietów.
- `animilandia-urodziny/template.html`: treści i układ strony.
- `animilandia-urodziny/assets/landing.css`: wygląd i wersja mobilna.
- `animilandia-urodziny/assets/landing.js`: interakcje i formularz.
- `animilandia-urodziny/includes/`: zapis, powiadomienia, panel i aktualizacje.

## Wydanie i kontrola

1. Zwiększ wersję w nagłówku wtyczki i stałej `VERSION` w pliku głównym.
2. Uruchom testy i kontrole składni PHP oraz JavaScript.
3. Utwórz commit kodu na gałęzi landingu.
4. Dopiero po testach zapisz `release.json` z wersją oraz dokładnym SHA tego commita.
5. Utwórz oddzielny commit manifestu. Manifest nie może wskazywać gałęzi, dowolnego URL ani innego repozytorium.

Do powrotu do poprzedniego zachowania przygotuj nowe wydanie z poprzednim kodem i wyższą wersją. Wtyczka nie wykonuje automatycznych downgrade'ów.

Instalator ZIP: `python3 tools/build_zip.py`. Testy: `php tests/core.php` oraz `node --check animilandia-urodziny/assets/landing.js`. Pliki PHP sprawdź także poleceniem `php -l`.
