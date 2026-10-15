<?php
namespace Animilandia\Birthday;
if (!defined('ABSPATH')) exit;

/** Targeted updater: only this plugin, only an immutable commit in the owner's repository. */
final class Updater {
    const MANIFEST = 'https://raw.githubusercontent.com/maraz12-sys/przydas-website/animilandia-urodziny/release.json';
    const ARCHIVE_PREFIX = 'https://github.com/maraz12-sys/przydas-website/archive/';
    private static $expected_version = '';
    public static function boot() {
        add_filter('cron_schedules', array(__CLASS__, 'interval'));
        add_action('init', array(__CLASS__, 'schedule'));
        add_action('al_birthday_check_update', array(__CLASS__, 'check'));
        add_action('al_birthday_check_update_now', array(__CLASS__, 'check'));
        add_filter('upgrader_source_selection', array(__CLASS__, 'source'), 10, 4);
    }
    public static function interval($schedules) { $schedules['al_birthday_five_minutes'] = array('interval' => 300, 'display' => 'Aktualizacje Animilandii co 5 minut'); return $schedules; }
    public static function schedule() { if (!wp_next_scheduled('al_birthday_check_update')) wp_schedule_event(time() + 120, 'al_birthday_five_minutes', 'al_birthday_check_update'); }
    public static function deactivate() { wp_clear_scheduled_hook('al_birthday_check_update'); wp_clear_scheduled_hook('al_birthday_check_update_now'); }
    public static function status($message) { update_option('al_birthday_update_status', gmdate('Y-m-d H:i') . ' UTC — ' . $message, false); }
    public static function source($source, $remote_source, $upgrader, $extra) {
        if (is_wp_error($source)) return $source;
        if (self::$expected_version === '' || empty($extra['plugin']) || $extra['plugin'] !== plugin_basename(FILE)) return $source;
        $candidate = trailingslashit($source) . 'animilandia-urodziny/';
        if (!is_file($candidate . 'animilandia-urodziny.php')) return new \WP_Error('al_update_package', 'Paczka nie zawiera wtyczki Animilandii.');
        $header = get_file_data($candidate . 'animilandia-urodziny.php', array('Version' => 'Version', 'Name' => 'Plugin Name'));
        if ($header['Version'] !== self::$expected_version || $header['Name'] !== 'Animilandia — Urodziny') return new \WP_Error('al_update_version', 'Wersja paczki nie zgadza się z wydaniem.');
        foreach (array('includes/core.php','includes/plugin.php','includes/updater.php','packages.json','template.html','assets/landing.css','assets/landing.js') as $file) {
            if (!is_file($candidate . $file)) return new \WP_Error('al_update_incomplete', 'Niekompletna paczka aktualizacji.');
        }
        return $candidate;
    }
    public static function check() {
        if (get_option('al_birthday_auto_updates', '1') !== '1') return;
        if (!wp_is_file_mod_allowed('automatic_updater')) { self::status('WordPress blokuje automatyczne modyfikacje plików.'); return; }
        $lock = (int) get_option('al_birthday_update_lock', 0);
        if ($lock && $lock > time() - 600) return;
        if ($lock) delete_option('al_birthday_update_lock');
        if (!add_option('al_birthday_update_lock', time(), '', false)) return;
        try {
            $response = wp_safe_remote_get(self::MANIFEST, array('timeout' => 12, 'redirection' => 2, 'limit_response_size' => 12000, 'headers' => array('Accept' => 'application/json', 'Cache-Control' => 'no-cache')));
            if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) { self::status('Nie udało się sprawdzić GitHuba; obecna wersja działa dalej.'); return; }
            $manifest = json_decode(wp_remote_retrieve_body($response), true);
            if (!Core::release($manifest)) { self::status('Nieprawidłowy manifest wydania; aktualizacja pominięta.'); return; }
            if (!version_compare($manifest['version'], VERSION, '>')) { self::status('Aktualna wersja ' . VERSION . '.'); return; }
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
            require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
            if (get_filesystem_method(array(), WP_PLUGIN_DIR) !== 'direct') { self::status('Hosting wymaga dostępu do plików — automatyczna aktualizacja wstrzymana.'); return; }
            $package = self::ARCHIVE_PREFIX . $manifest['source_commit'] . '.zip';
            self::$expected_version = $manifest['version'];
            // Only a single known plugin is upgraded. No arbitrary package URL is accepted.
            $skin = new \Automatic_Upgrader_Skin();
            $upgrader = new \Plugin_Upgrader($skin);
            $updates = get_site_transient('update_plugins');
            if (!is_object($updates)) $updates = new \stdClass();
            if (!isset($updates->response) || !is_array($updates->response)) $updates->response = array();
            $updates->response[plugin_basename(FILE)] = (object) array('slug' => 'animilandia-urodziny', 'plugin' => plugin_basename(FILE), 'new_version' => $manifest['version'], 'package' => $package, 'url' => 'https://animilandia.pl/');
            set_site_transient('update_plugins', $updates);
            // Core's targeted plugin upgrade handles package checks and its recovery flow.
            $result = $upgrader->upgrade(plugin_basename(FILE), array('clear_update_cache' => true));
            if ($result !== true) { self::status('Aktualizacja nie powiodła się; sprawdź panel WordPressa.'); return; }
            wp_clean_plugins_cache(true);
            self::status('Zainstalowano wersję ' . $manifest['version'] . '.');
        } catch (\Throwable $exception) { self::status('Aktualizacja przerwana; sprawdź panel WordPressa.'); }
        finally { self::$expected_version = ''; delete_option('al_birthday_update_lock'); }
    }
}
