<?php
require_once __DIR__ . '/../animilandia-urodziny/includes/core.php';
use Animilandia\Birthday\Core;
function ok($condition, $name) { if (!$condition) { fwrite(STDERR, 'FAIL ' . $name . "\n"); exit(1); } echo 'PASS ' . $name . "\n"; }
$now = 1000000000000; $secret = 'test-key-not-used-in-production';
$token = Core::token($secret, $now - 3000, 'test');
ok(Core::verify($token, $secret, $now), 'valid signed token');
ok(!Core::verify($token . 'x', $secret, $now), 'tampered token rejected');
ok(!Core::verify($token, 'other-key', $now), 'wrong key rejected');
ok(!Core::verify(Core::token($secret, $now, 'test'), $secret, $now), 'too-fast form rejected');
ok(!Core::verify(Core::token($secret, $now - 7200001, 'test'), $secret, $now), 'expired form rejected');
ok(!Core::verify('not.a.valid.token', $secret, $now), 'invalid token structure rejected');
$base = array('id'=>'e5df7420-df1f-4d46-a0c3-39703de73d5a','name'=>'Anna','phone'=>'+48 600 123 456','email'=>'anna@example.com','eventDate'=>'2026-11-20','city'=>'Bydgoszcz','packageId'=>'vip','childrenCount'=>12,'childrenAge'=>'5–7','notes'=>'Test','contactAccepted'=>true,'website'=>'','token'=>$token,'attribution'=>array('utm_source'=>'facebook'));
$ids = array('vip','tradycyjny');
ok(!Core::validate($base,$ids,'2026-10-15')['errors'], 'valid inquiry');
$cases = array('bad UUID'=>array('id'=>'not-an-id'),'short name'=>array('name'=>'A'),'bad phone'=>array('phone'=>'123'),'bad email'=>array('email'=>'invalid'),'header injection'=>array('email'=>"a@example.com\r\nBcc:b@example.com"),'past date'=>array('eventDate'=>'2026-10-14'),'impossible date'=>array('eventDate'=>'2027-02-30'),'distant date'=>array('eventDate'=>'2031-01-01'),'missing city'=>array('city'=>''),'unknown package'=>array('packageId'=>'anything'),'no contact request'=>array('contactAccepted'=>false),'bot field'=>array('website'=>'spam'),'negative child count'=>array('childrenCount'=>-1),'fractional child count'=>array('childrenCount'=>1.2),'too many children'=>array('childrenCount'=>101),'large notes'=>array('notes'=>str_repeat('a',1001)));
foreach($cases as $name=>$changes) ok((bool) Core::validate(array_merge($base,$changes),$ids,'2026-10-15')['errors'],$name);
ok(!Core::validate(array_merge($base,array('childrenCount'=>null,'packageId'=>'pomoc')),$ids,'2026-10-15')['errors'], 'optional children count and package advice');
$clean = Core::validate(array_merge($base,array('name'=>'<script>bad</script>Anna','attribution'=>array('utm_source'=>'facebook','unapproved'=>'removed'))),$ids,'2026-10-15');
ok(strpos($clean['data']['name'],'<') === false, 'markup stripped from contact name');
ok(!isset($clean['data']['attribution']['unapproved']), 'only allowed attribution keys stored');
ok(Core::csv('=1+1') === '"\'=1+1"', 'CSV formula escaped');
ok(Core::csv('A"B') === '"A""B"', 'CSV quotes escaped');
ok(Core::release(array('version'=>'1.2.3','source_commit'=>str_repeat('a',40))), 'immutable release accepted');
ok(!Core::release(array('version'=>'../x','source_commit'=>'main')), 'arbitrary release rejected');
ok(!Core::release(array('version'=>'1.2.3','source_commit'=>'https://other.test/payload.zip')), 'arbitrary download URL rejected');
echo "All core behavior checks passed. No messages sent.\n";
