<?php
require_once __DIR__.'/bootstrap.php';
$_SERVER['HTTP_HOST']='urodziny.animilandia.pl';$_SERVER['REQUEST_URI']='/';
Animilandia\Birthday\Plugin::render();
