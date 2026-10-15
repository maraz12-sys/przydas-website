<?php
/** Pure validation and token helpers, independent of hosting and accounts. */
namespace Animilandia\Birthday;

final class Core {
    public static function length($value) { return preg_match_all('/./us', $value, $unused) ?: 0; }
    public static function text($value) { return is_string($value) ? trim(strip_tags($value)) : ''; }
    public static function token($secret, $issued = null, $uuid = null) {
        $issued = $issued === null ? (int) floor(microtime(true) * 1000) : $issued;
        $payload = $issued . '.' . ($uuid ?: bin2hex(random_bytes(16)));
        return $payload . '.' . hash_hmac('sha256', $payload, $secret);
    }
    public static function verify($token, $secret, $now = null) {
        if (!is_string($token) || strlen($token) > 400) return false;
        $parts = explode('.', $token);
        if (count($parts) !== 3 || !ctype_digit($parts[0])) return false;
        $age = ($now === null ? (int) floor(microtime(true) * 1000) : $now) - (int) $parts[0];
        return $age >= 1200 && $age <= 7200000 && hash_equals(hash_hmac('sha256', $parts[0] . '.' . $parts[1], $secret), $parts[2]);
    }
    public static function validate($input, $package_ids, $today = null) {
        $today = $today ?: (new \DateTimeImmutable('now', new \DateTimeZone('Europe/Warsaw')))->format('Y-m-d');
        $input = is_array($input) ? $input : array();
        $errors = array(); $data = array();
        foreach (array('id','name','phone','email','eventDate','city','packageId','childrenAge','notes','website','token') as $key) {
            $data[$key] = self::text(isset($input[$key]) ? $input[$key] : '');
        }
        if (!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i', $data['id'])) $errors['id'] = array('Odśwież formularz.');
        if (self::length($data['name']) < 2 || self::length($data['name']) > 100) $errors['name'] = array('Podaj imię (2–100 znaków).');
        $digits = preg_replace('/\D/', '', $data['phone']);
        if (!preg_match('/^[+()\d\s.\-]+$/', $data['phone']) || strlen($digits) < 9 || strlen($digits) > 15 || strlen($data['phone']) > 30) $errors['phone'] = array('Podaj poprawny numer telefonu.');
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL) || strlen($data['email']) > 254 || preg_match('/[\r\n]/', $data['email'])) $errors['email'] = array('Podaj poprawny adres e-mail.');
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $data['eventDate'], new \DateTimeZone('Europe/Warsaw'));
        if (!$date || $date->format('Y-m-d') !== $data['eventDate'] || $data['eventDate'] < $today || (int) substr($data['eventDate'], 0, 4) > (int) substr($today, 0, 4) + 3) $errors['eventDate'] = array('Wybierz dzisiejszy lub przyszły termin przyjęcia.');
        if (self::length($data['city']) < 2 || self::length($data['city']) > 80) $errors['city'] = array('Podaj miejscowość (2–80 znaków).');
        if ($data['packageId'] !== 'pomoc' && !in_array($data['packageId'], $package_ids, true)) $errors['packageId'] = array('Wybierz pakiet.');
        $data['childrenCount'] = isset($input['childrenCount']) ? $input['childrenCount'] : null;
        if ($data['childrenCount'] !== null && (!is_int($data['childrenCount']) || $data['childrenCount'] < 1 || $data['childrenCount'] > 100)) $errors['childrenCount'] = array('Podaj liczbę dzieci od 1 do 100.');
        if (self::length($data['childrenAge']) > 50) $errors['childrenAge'] = array('Wpisz maksymalnie 50 znaków.');
        if (self::length($data['notes']) > 1000) $errors['notes'] = array('Wiadomość może mieć maksymalnie 1000 znaków.');
        if (!isset($input['contactAccepted']) || $input['contactAccepted'] !== true) $errors['contactAccepted'] = array('Potwierdź prośbę o kontakt.');
        if ($data['website'] !== '') $errors['website'] = array('Nieprawidłowy formularz.');
        if (strlen($data['token']) < 20 || strlen($data['token']) > 400) $errors['token'] = array('Odśwież formularz.');
        $data['attribution'] = array();
        if (isset($input['attribution']) && is_array($input['attribution'])) {
            foreach (array('utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer') as $key) {
                if (isset($input['attribution'][$key])) {
                    $value = self::text($input['attribution'][$key]);
                    if (self::length($value) <= 200) $data['attribution'][$key] = $value;
                }
            }
        }
        return array('data' => $data, 'errors' => $errors);
    }
    public static function csv($value) {
        $value = $value === null ? '' : (string) $value;
        if (preg_match('/^\s*[=+@\-\t\r\n]/', $value)) $value = "'" . $value;
        return '"' . str_replace('"', '""', $value) . '"';
    }
    public static function release($manifest) {
        if (!is_array($manifest) || !isset($manifest['version'], $manifest['source_commit']) || !is_string($manifest['version']) || !is_string($manifest['source_commit'])) return false;
        return preg_match('/^\d+\.\d+\.\d+$/', $manifest['version']) && preg_match('/^[a-f0-9]{40}$/', $manifest['source_commit']);
    }
}
