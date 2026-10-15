<?php
const ABSPATH = '/nonexistent-wordpress-test/';
const WP_PLUGIN_DIR = '/wordpress/wp-content/plugins';
$GLOBALS['options'] = array(); $GLOBALS['mail_calls'] = 0; $GLOBALS['mail_result'] = true;
function add_action(...$args) {} function add_filter(...$args) {} function register_activation_hook(...$args) {} function register_deactivation_hook(...$args) {}
function wp_salt($type) { return 'isolated-test-wordpress-salt'; }
function home_url($path='') { return 'https://animilandia.pl' . $path; }
function admin_url($path='') { return 'https://animilandia.pl/wp-admin/' . $path; }
function wp_parse_url($url,$component=-1) { return parse_url($url,$component); }
function is_admin() { return false; }
function wp_json_encode($data,$flags=0) { return json_encode($data,$flags); }
function get_option($key,$fallback=false) { return $GLOBALS['options'][$key] ?? $fallback; }
function is_email($email) { return filter_var($email,FILTER_VALIDATE_EMAIL); }
function wp_mail($to,$subject,$body,$headers) { $GLOBALS['mail_calls']++; if (!$GLOBALS['wpdb']->leads) throw new Exception('mail before database'); if ($GLOBALS['mail_result']==='throw') throw new Exception('mail outage'); return $GLOBALS['mail_result']; }
function current_user_can($capability) { return false; }
function wp_die($message,...$rest) { throw new RuntimeException('denied'); }
function esc_html($s) { return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8'); } function esc_attr($s) { return esc_html($s); } function esc_url($s) { return htmlspecialchars($s,ENT_QUOTES,'UTF-8'); }
function plugins_url($path,$file) { return 'https://animilandia.pl/wp-content/plugins/animilandia-urodziny/'.$path; }
function status_header($status) {} function nocache_headers() {}
function plugin_basename($file) { return 'animilandia-urodziny/animilandia-urodziny.php'; }
function trailingslashit($s) { return rtrim($s,'/').'/'; }
function is_wp_error($v) { return $v instanceof WP_Error; }
function get_file_data($file,$keys) { $s=file_get_contents($file); preg_match('/\* Version: ([^\r\n]+)/',$s,$m); return array('Version'=>$m[1]??'','Name'=>'Animilandia — Urodziny'); }
class WP_Error { public $code; function __construct($code,$message){$this->code=$code;} }
class WP_REST_Response { public $data,$status,$headers; function __construct($data,$status=200,$headers=array()){$this->data=$data;$this->status=$status;$this->headers=$headers;} }
class FakeDB {
 public $prefix='wp_'; public $leads=array(); public $limits=array();
 function prepare($sql,...$params){return array($sql,$params);}
 function get_var($query){list($sql,$params)=$query;if(strpos($sql,'SELECT id')!==false)return isset($this->leads[$params[0]])?$params[0]:null;if(strpos($sql,'SELECT request_count')!==false)return $this->limits[$params[0]]??0;return null;}
 function query($query){list($sql,$params)=$query;if(strpos($sql,'INSERT INTO')===0){$this->limits[$params[0]]=($this->limits[$params[0]]??0)+1;}return 1;}
 function insert($table,$data){if(isset($this->leads[$data['id']]))return false;$this->leads[$data['id']]=$data;return 1;}
 function update($table,$data,$where){$this->leads[$where['id']]=array_merge($this->leads[$where['id']],$data);return 1;}
}
$GLOBALS['wpdb']=new FakeDB();
class FakeRequest {
 public $data,$origin,$type;
 function __construct($data,$origin='https://urodziny.animilandia.pl',$type='application/json'){$this->data=$data;$this->origin=$origin;$this->type=$type;}
 function get_header($name){return $name==='origin'?$this->origin:($name==='content-type'?$this->type:'');}
 function get_json_params(){return $this->data;}
 function get_body(){return json_encode($this->data);}
}
require_once __DIR__.'/../animilandia-urodziny/animilandia-urodziny.php';
