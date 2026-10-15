<?php
namespace Animilandia\Birthday;
if (!defined('ABSPATH')) exit;

final class Plugin {
    public static function boot() {
        add_action('plugins_loaded', array(__CLASS__, 'maybe_install'));
        add_action('rest_api_init', array(__CLASS__, 'routes'));
        add_action('template_redirect', array(__CLASS__, 'render'), 0);
        add_filter('redirect_canonical', array(__CLASS__, 'canonical'), 10, 2);
        add_action('admin_menu', array(__CLASS__, 'menu'));
        add_action('admin_post_animilandia_birthday_export', array(__CLASS__, 'export'));
        add_action('admin_post_animilandia_birthday_settings', array(__CLASS__, 'save_settings'));
    }
    public static function activate() {
        self::install();
        if (get_option('al_birthday_auto_updates', null) === null) add_option('al_birthday_auto_updates', '1', '', false);
        Updater::schedule();
    }
    public static function maybe_install() { if (get_option('al_birthday_schema') !== '1') self::install(); }
    public static function table() { global $wpdb; return $wpdb->prefix . 'al_birthday_inquiries'; }
    public static function rate_table() { global $wpdb; return $wpdb->prefix . 'al_birthday_limits'; }
    public static function install() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $collate = $wpdb->get_charset_collate(); $table = self::table(); $limits = self::rate_table();
        dbDelta("CREATE TABLE $table (
            id varchar(36) NOT NULL,
            name varchar(200) NOT NULL,
            phone varchar(30) NOT NULL,
            email varchar(254) NOT NULL,
            event_date date NOT NULL,
            city varchar(160) NOT NULL,
            package_id varchar(40) NOT NULL,
            children_count smallint unsigned DEFAULT NULL,
            children_age varchar(100) NOT NULL DEFAULT '',
            notes text NOT NULL,
            attribution text NOT NULL,
            notification varchar(16) NOT NULL DEFAULT 'pending',
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY created_at (created_at)
        ) $collate;");
        dbDelta("CREATE TABLE $limits (
            rate_key varchar(64) NOT NULL,
            request_count int unsigned NOT NULL DEFAULT 1,
            expires_at bigint unsigned NOT NULL,
            PRIMARY KEY  (rate_key),
            KEY expires_at (expires_at)
        ) $collate;");
        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table))) === $table && $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($limits))) === $limits) update_option('al_birthday_schema', '1', false);
    }
    public static function packages() {
        static $packages = null;
        if ($packages === null) $packages = json_decode(file_get_contents(DIR . '/packages.json'), true) ?: array();
        return $packages;
    }
    public static function package_name($id) { foreach (self::packages() as $p) if ($p['id'] === $id) return $p['name']; return 'Pomoc w wyborze pakietu'; }
    public static function response($data, $status = 200) { return new \WP_REST_Response($data, $status, array('Cache-Control' => 'no-store')); }
    public static function routes() {
        register_rest_route('animilandia-birthday/v1', '/token', array('methods' => 'GET', 'callback' => function() { return self::response(array('token' => Core::token(wp_salt('nonce')))); }, 'permission_callback' => '__return_true'));
        register_rest_route('animilandia-birthday/v1', '/inquiries', array('methods' => 'POST', 'callback' => array(__CLASS__, 'submit'), 'permission_callback' => '__return_true'));
    }
    public static function request_origin_ok($request) {
        $origin = $request->get_header('origin');
        if (!$origin || !filter_var($origin, FILTER_VALIDATE_URL)) return false;
        $parsed = wp_parse_url($origin);
        if (!isset($parsed['scheme'], $parsed['host']) || !in_array($parsed['scheme'], array('https','http'), true)) return false;
        $hosts = array(strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST)), 'urodziny.animilandia.pl');
        return in_array(strtolower($parsed['host']), $hosts, true) && (!isset($parsed['port']) || in_array((int) $parsed['port'], array(80,443), true));
    }
    public static function submit($request) {
        global $wpdb;
        if (!self::request_origin_ok($request)) return self::response(array('error' => 'Odśwież stronę i spróbuj ponownie.'), 403);
        if (strpos((string) $request->get_header('content-type'), 'application/json') === false) return self::response(array('error' => 'Nieprawidłowy formularz.'), 415);
        if (strlen($request->get_body()) > 12000) return self::response(array('error' => 'Wiadomość jest za długa.'), 413);
        $input = $request->get_json_params();
        $checked = Core::validate($input, array_column(self::packages(), 'id'));
        if ($checked['errors']) return self::response(array('error' => 'Sprawdź zaznaczone pola.', 'fields' => $checked['errors']), 400);
        $lead = $checked['data'];
        if (!Core::verify($lead['token'], wp_salt('nonce'))) return self::response(array('error' => 'Odśwież stronę i wyślij zapytanie ponownie.'), 403);
        $table = self::table();
        if ($wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE id = %s", $lead['id']))) return self::response(array('ok' => true, 'id' => $lead['id']));
        $now = time(); $rate_table = self::rate_table();
        // REMOTE_ADDR is supplied by the server; untrusted forwarded headers are not used.
        $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown';
        $rate_key = hash_hmac('sha256', $ip . '.' . floor($now / 3600), wp_salt('nonce'));
        $rate_written = $wpdb->query($wpdb->prepare("INSERT INTO $rate_table (rate_key, request_count, expires_at) VALUES (%s,1,%d) ON DUPLICATE KEY UPDATE request_count = request_count + 1", $rate_key, $now + 3600));
        if ($rate_written === false) return self::response(array('error' => 'Nie udało się zapisać zapytania. Zadzwoń: 731 350 127.'), 503);
        if ((int) $wpdb->get_var($wpdb->prepare("SELECT request_count FROM $rate_table WHERE rate_key = %s", $rate_key)) > 8) return self::response(array('error' => 'Wysłano już kilka zapytań. Spróbuj później lub zadzwoń: 731 350 127.'), 429);
        $wpdb->query($wpdb->prepare("DELETE FROM $rate_table WHERE expires_at < %d LIMIT 1000", $now));
        $saved = $wpdb->insert($table, array('id' => $lead['id'], 'name' => $lead['name'], 'phone' => $lead['phone'], 'email' => $lead['email'], 'event_date' => $lead['eventDate'], 'city' => $lead['city'], 'package_id' => $lead['packageId'], 'children_count' => $lead['childrenCount'], 'children_age' => $lead['childrenAge'], 'notes' => $lead['notes'], 'attribution' => wp_json_encode($lead['attribution']), 'notification' => 'pending', 'created_at' => gmdate('Y-m-d H:i:s')));
        if ($saved === false) {
            if ($wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE id = %s", $lead['id']))) return self::response(array('ok' => true, 'id' => $lead['id']));
            return self::response(array('error' => 'Nie udało się zapisać zapytania. Spróbuj ponownie lub zadzwoń: 731 350 127.'), 503);
        }
        $notification = self::notify($lead) ? 'accepted' : 'failed';
        $wpdb->update($table, array('notification' => $notification), array('id' => $lead['id']));
        return self::response(array('ok' => true, 'id' => $lead['id']), 201);
    }
    public static function notify($lead) {
        $recipient = get_option('al_birthday_email', 'animilandia@gmail.com');
        if (!is_email($recipient)) $recipient = 'animilandia@gmail.com';
        $lines = array('Nowe zapytanie urodzinowe — Animilandia', '', 'Imię: ' . $lead['name'], 'Telefon: ' . $lead['phone'], 'E-mail: ' . $lead['email'], 'Termin: ' . $lead['eventDate'], 'Miejscowość: ' . $lead['city'], 'Pakiet: ' . self::package_name($lead['packageId']), 'Liczba dzieci: ' . ($lead['childrenCount'] === null ? 'nie podano' : $lead['childrenCount']), 'Wiek dzieci: ' . $lead['childrenAge'], '', 'Uwagi:', $lead['notes'], '', 'Panel zgłoszeń: ' . admin_url('admin.php?page=animilandia-urodziny'));
        try { return wp_mail($recipient, 'Zapytanie o urodziny — ' . $lead['eventDate'], implode("\n", $lines), array('Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $lead['email'])); }
        catch (\Throwable $exception) { return false; }
    }
    public static function is_landing() {
        $host = isset($_SERVER['HTTP_HOST']) ? strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'])) : '';
        $path = isset($_SERVER['REQUEST_URI']) ? wp_parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) : '/';
        if (isset($_GET['rest_route']) || strpos((string) $path, '/wp-json/') === 0 || is_admin()) return false;
        return ($host === 'urodziny.animilandia.pl' && in_array($path, array('/','/index.php'), true)) || rtrim((string) $path, '/') === '/urodziny-z-animatorem';
    }
    public static function canonical($url, $requested) { return self::is_landing() ? false : $url; }
    public static function asset_url() { return rtrim(plugins_url('assets', FILE), '/'); }
    public static function card($p) {
        $e = 'esc_html'; $html = '<article class="package-card package-' . esc_attr($p['color']) . '"><div class="package-visual"><img src="' . esc_url($p['image']) . '" width="768" height="768" loading="lazy" alt="Ilustracja pakietu ' . esc_attr($p['name']) . '"><span class="duration">' . (int) $p['hours'] . ' godziny</span></div><div class="package-content"><p class="package-eyebrow">' . $e($p['eyebrow']) . '</p><h3>' . $e($p['name']) . '</h3><p class="package-description">' . $e($p['description']) . '</p><div class="price"><strong>' . number_format((int) $p['price'], 0, ',', ' ') . '<small> zł</small></strong><span>/ do 12 dzieci</span></div><ul>';
        foreach ($p['features'] as $feature) $html .= '<li><span style="color:#cc3b85" aria-hidden="true">✓</span><span>' . $e($feature) . '</span></li>';
        $html .= '</ul><button type="button" data-package-id="' . esc_attr($p['id']) . '" class="button ' . ($p['id'] === 'vip' ? 'button-pink' : 'button-outline') . '">Wybieram ten pakiet<span aria-hidden="true">↗</span></button></div></article>';
        return $html;
    }
    public static function render() {
        if (!self::is_landing()) return;
        status_header(200); nocache_headers(); header('Content-Type: text/html; charset=UTF-8');
        header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: strict-origin-when-cross-origin');
        $packages = self::packages(); $first = ''; $more = ''; $options = '<option value="pomoc">Pomóżcie mi wybrać</option>';
        foreach ($packages as $i => $p) { if ($i < 3) $first .= self::card($p); else $more .= self::card($p); $options .= '<option value="' . esc_attr($p['id']) . '">' . esc_html($p['name'] . ' — ' . $p['price'] . ' zł / ' . $p['hours'] . ' godz.') . '</option>'; }
        $asset = self::asset_url();
        $body = strtr(file_get_contents(DIR . '/template.html'), array('{{PACKAGES_PRIMARY}}' => $first, '{{PACKAGES_EXTRA}}' => $more, '{{PACKAGE_OPTIONS}}' => $options, '{{MIN_PRICE}}' => number_format(min(array_column($packages, 'price')), 0, ',', ' '), '{{ASSET_URL}}' => esc_url($asset), '{{YEAR}}' => gmdate('Y')));
        $config = array('tokenUrl' => './index.php?rest_route=/animilandia-birthday/v1/token', 'submitUrl' => './index.php?rest_route=/animilandia-birthday/v1/inquiries', 'packages' => $packages, 'today' => (new \DateTimeImmutable('now', new \DateTimeZone('Europe/Warsaw')))->format('Y-m-d'));
        // Absolute same-origin endpoints also work from the fallback path.
        $config['tokenUrl'] = '/index.php?rest_route=/animilandia-birthday/v1/token'; $config['submitUrl'] = '/index.php?rest_route=/animilandia-birthday/v1/inquiries';
        $title = 'Urodziny z animatorem | Animilandia — Bydgoszcz i okolice';
        echo '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . esc_html($title) . '</title><meta name="description" content="Urodziny pełne zabawy w Twoim domu, ogrodzie lub wybranym miejscu. Poznaj pakiety Animilandii od 600 zł i zapytaj o termin."><meta property="og:type" content="website"><meta property="og:title" content="' . esc_attr($title) . '"><meta property="og:image" content="https://animilandia.pl/wp-content/uploads/2025/06/urodziny-baner-scaled.jpg"><link rel="icon" href="https://animilandia.pl/wp-content/uploads/2026/04/cropped-Animilandia-png-1-scaled-e1776638201192-1.png"><link rel="stylesheet" href="' . esc_url($asset . '/landing.css?v=' . VERSION) . '"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atma:wght@500;600;700&amp;family=Nunito+Sans:wght@400;600;700;800;900&amp;display=swap"></head><body>' . $body . '<noscript><p style="padding:25px;text-align:center">Aby wysłać formularz, włącz JavaScript lub zadzwoń: <a href="tel:+48731350127">731 350 127</a>.</p></noscript><script>window.AnimilandiaBirthday=' . wp_json_encode($config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ';</script><script src="' . esc_url($asset . '/landing.js?v=' . VERSION) . '" defer></script></body></html>';
        exit;
    }
    public static function menu() { add_menu_page('Zapytania urodzinowe', 'Urodziny', 'manage_options', 'animilandia-urodziny', array(__CLASS__, 'admin'), 'dashicons-buddicons-activity', 28); }
    public static function admin() {
        if (!current_user_can('manage_options')) wp_die('Brak dostępu.', '', array('response' => 403));
        global $wpdb; $table = self::table(); $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC LIMIT 100", ARRAY_A);
        echo '<div class="wrap"><h1>Animilandia — zapytania urodzinowe</h1><p><a class="button" href="' . esc_url(home_url('/urodziny-z-animatorem/')) . '" target="_blank" rel="noopener">Otwórz landing</a> <a class="button" href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=animilandia_birthday_export'), 'al_birthday_export')) . '">Pobierz CSV</a></p>';
        echo '<details style="background:#fff;padding:16px;margin-bottom:20px"><summary style="cursor:pointer">Ustawienia i aktualizacje — wersja ' . esc_html(VERSION) . '</summary><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="animilandia_birthday_settings">'; wp_nonce_field('al_birthday_settings');
        echo '<p><label>E-mail do powiadomień <input type="email" required name="notification_email" value="' . esc_attr(get_option('al_birthday_email', 'animilandia@gmail.com')) . '"></label></p><p><label><input type="checkbox" name="auto_updates" value="1" ' . checked(get_option('al_birthday_auto_updates', '1'), '1', false) . '> Pobieraj zatwierdzone aktualizacje z GitHuba automatycznie</label></p><p>Ostatnia kontrola: ' . esc_html(get_option('al_birthday_update_status', 'Jeszcze nie sprawdzano.')) . '</p>'; submit_button('Zapisz ustawienia i sprawdź aktualizację'); echo '</form></details>';
        if (!$rows) echo '<p>Nie ma jeszcze zgłoszeń. Pojawią się tutaj po wysłaniu formularza.</p>';
        foreach ($rows as $r) {
            echo '<article style="background:#fff;border:1px solid #ddd;padding:20px;margin:0 0 15px;border-radius:8px"><h2 style="margin-top:0">' . esc_html($r['name']) . '</h2><p><strong>' . esc_html($r['event_date'] . ' · ' . $r['city'] . ' · ' . self::package_name($r['package_id'])) . '</strong></p><p><a href="tel:' . esc_attr(preg_replace('/[^+\d]/', '', $r['phone'])) . '">' . esc_html($r['phone']) . '</a> · <a href="mailto:' . esc_attr($r['email']) . '">' . esc_html($r['email']) . '</a></p><p>Liczba dzieci: ' . esc_html($r['children_count'] === null ? 'nie podano' : $r['children_count']) . ' · Wiek: ' . esc_html($r['children_age']) . '</p><p style="white-space:pre-wrap">' . esc_html($r['notes']) . '</p><small>Wysłano: ' . esc_html($r['created_at']) . ' UTC · Powiadomienie: ' . esc_html($r['notification'] === 'accepted' ? 'przyjęte przez system pocztowy' : 'sprawdź zgłoszenie w panelu') . '</small></article>';
        }
        echo '<p>Pokazujemy 100 najnowszych zgłoszeń. Zgłoszenia są zapisane przed próbą powiadomienia e-mail. Przyjęcie wiadomości przez system pocztowy nie potwierdza jej doręczenia.</p></div>';
    }
    public static function save_settings() {
        if (!current_user_can('manage_options')) wp_die('Brak dostępu.', '', array('response' => 403));
        check_admin_referer('al_birthday_settings');
        $email = sanitize_email(wp_unslash(isset($_POST['notification_email']) ? $_POST['notification_email'] : ''));
        if (is_email($email)) update_option('al_birthday_email', $email, false);
        update_option('al_birthday_auto_updates', isset($_POST['auto_updates']) ? '1' : '0', false);
        wp_schedule_single_event(time() + 5, 'al_birthday_check_update_now');
        wp_safe_redirect(admin_url('admin.php?page=animilandia-urodziny')); exit;
    }
    public static function export() {
        if (!current_user_can('manage_options')) wp_die('Brak dostępu.', '', array('response' => 403));
        check_admin_referer('al_birthday_export');
        global $wpdb; $table = self::table(); $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC LIMIT 10000", ARRAY_A);
        nocache_headers(); header('Content-Type: text/csv; charset=UTF-8'); header('Content-Disposition: attachment; filename="Animilandia_zapytania_urodzinowe.csv"'); header('X-Content-Type-Options: nosniff'); echo "\xEF\xBB\xBF";
        echo implode(';', array_map(array(Core::class, 'csv'), array('Wysłano UTC','Imię','Telefon','E-mail','Termin','Miejscowość','Pakiet','Liczba dzieci','Wiek','Uwagi','Źródło','Powiadomienie'))) . "\r\n";
        foreach ($rows as $r) echo implode(';', array_map(array(Core::class, 'csv'), array($r['created_at'],$r['name'],$r['phone'],$r['email'],$r['event_date'],$r['city'],self::package_name($r['package_id']),$r['children_count'],$r['children_age'],$r['notes'],$r['attribution'],$r['notification']))) . "\r\n";
        exit;
    }
}
