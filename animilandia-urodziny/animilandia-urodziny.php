<?php
/**
 * Plugin Name: Animilandia — Urodziny
 * Description: Niezależny landing, zapytania urodzinowe i aktualizacje z GitHuba.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Animilandia
 * Update URI: https://github.com/maraz12-sys/przydas-website/tree/animilandia-urodziny
 * License: GPL-2.0-or-later
 */
namespace Animilandia\Birthday;
if (!defined('ABSPATH')) exit;
const VERSION = '1.0.0';
const FILE = __FILE__;
const DIR = __DIR__;
require_once DIR . '/includes/core.php';
require_once DIR . '/includes/plugin.php';
require_once DIR . '/includes/updater.php';
Plugin::boot();
Updater::boot();
register_activation_hook(FILE, array(Plugin::class, 'activate'));
register_deactivation_hook(FILE, array(Updater::class, 'deactivate'));
