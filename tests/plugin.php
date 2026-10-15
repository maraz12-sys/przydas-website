<?php
require_once __DIR__.'/bootstrap.php';
use Animilandia\Birthday\Core;
use Animilandia\Birthday\Plugin;
use Animilandia\Birthday\Updater;
function ok($condition,$name){if(!$condition){fwrite(STDERR,'FAIL '.$name."\n");exit(1);}echo 'PASS '.$name."\n";}
$_SERVER['REMOTE_ADDR']='192.0.2.1';
$base=array('id'=>'e5df7420-df1f-4d46-a0c3-39703de73d5a','name'=>'Test','phone'=>'600123456','email'=>'test@example.com','eventDate'=>(new DateTimeImmutable('+1 month'))->format('Y-m-d'),'city'=>'Bydgoszcz','packageId'=>'vip','childrenCount'=>12,'childrenAge'=>'6','notes'=>'Full note','contactAccepted'=>true,'website'=>'','token'=>Core::token(wp_salt('nonce'),(int)floor(microtime(true)*1000)-3000),'attribution'=>array('utm_source'=>'facebook'));
ok(Plugin::submit(new FakeRequest($base,'https://other.test'))->status===403,'foreign origin rejected');
ok(Plugin::submit(new FakeRequest($base,'https://urodziny.animilandia.pl','text/plain'))->status===415,'wrong content type rejected');
ok(Plugin::submit(new FakeRequest(array()))->status===400,'empty inquiry rejected');
ok(Plugin::submit(new FakeRequest(array_merge($base,array('token'=>str_repeat('bad',20)))))->status===403,'invalid token rejected');
$r=Plugin::submit(new FakeRequest($base));ok($r->status===201 && $r->data['ok'],'valid inquiry accepted');
ok($GLOBALS['wpdb']->leads[$base['id']]['notification']==='accepted','notification status persisted');
ok($GLOBALS['wpdb']->leads[$base['id']]['notes']==='Full note','full note stored independently of email');
$count=$GLOBALS['mail_calls'];ok(Plugin::submit(new FakeRequest($base))->status===200 && $count===$GLOBALS['mail_calls'],'retry does not duplicate email');
$GLOBALS['mail_result']=false;$base['id']='e5df7420-df1f-4d46-a0c3-39703de73d5b';
ok(Plugin::submit(new FakeRequest($base))->status===201 && $GLOBALS['wpdb']->leads[$base['id']]['notification']==='failed','mail failure preserves inquiry');
$GLOBALS['mail_result']='throw';$base['id']='e5df7420-df1f-4d46-a0c3-39703de73d5c';
ok(Plugin::submit(new FakeRequest($base))->status===201 && $GLOBALS['wpdb']->leads[$base['id']]['notification']==='failed','mail exception preserves inquiry');
foreach(array('admin','export','save_settings') as $method){$denied=false;try{Plugin::$method();}catch(RuntimeException $e){$denied=true;}ok($denied,'unauthorized '.$method.' blocked');}
for($i=0;$i<5;$i++){$base['id']=sprintf('e5df7420-df1f-4d46-a0c3-39703de730%02x',$i);ok(Plugin::submit(new FakeRequest($base))->status===201,'inquiry within rate limit '.$i);}
$base['id']='e5df7420-df1f-4d46-a0c3-39703de73d6d';ok(Plugin::submit(new FakeRequest($base))->status===429,'rate limit enforced');
$_SERVER['HTTP_HOST']='urodziny.animilandia.pl';$_SERVER['REQUEST_URI']='/';ok(Plugin::is_landing(),'subdomain root route');
$_SERVER['HTTP_HOST']='animilandia.pl';ok(!Plugin::is_landing(),'main home route unchanged');
$_SERVER['REQUEST_URI']='/urodziny-z-animatorem/';ok(Plugin::is_landing(),'fallback route');
$_SERVER['REQUEST_URI']='/urodziny/';ok(!Plugin::is_landing(),'existing birthday page unchanged');
$_SERVER['HTTP_HOST']='urodziny.animilandia.pl';$_SERVER['REQUEST_URI']='/wp-json/example';ok(!Plugin::is_landing(),'REST routing not intercepted');
$property=new ReflectionProperty(Updater::class,'expected_version');if(PHP_VERSION_ID<80100)$property->setAccessible(true);$property->setValue(null,'1.0.0');
$parent=dirname(__DIR__).'/';$extra=array('plugin'=>'animilandia-urodziny/animilandia-urodziny.php');
ok(Updater::source($parent,'',null,$extra)===$parent.'animilandia-urodziny/','expected plugin source selected');
$property->setValue(null,'1.0.1');ok(is_wp_error(Updater::source($parent,'',null,$extra)),'mismatched source version blocked');
ok(Updater::source('/invalid-source','',null,array('plugin'=>'unrelated/unrelated.php'))==='/invalid-source','updater cannot modify unrelated plugin');
ok(is_wp_error(Updater::source(new WP_Error('other','error'),'',null,$extra)),'existing upgrade error preserved');
echo "All plugin behavior checks passed. No messages sent.\n";
