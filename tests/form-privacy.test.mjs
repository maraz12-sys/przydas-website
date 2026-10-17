import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPrivacyNotice,safePrivacyUrl} from '../public/form-privacy.mjs';
test('untrusted organization notice is rendered as escaped plain text',()=>{
 const html=renderPrivacyNotice({controller_name:'<img onerror=alert(1)>',contact_email:'<script>',notice_text:'<script>alert(1)</script>\nNowa linia',information_url:'javascript:alert(1)'},'DEMO');
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('href='));assert.ok(!html.includes('type="checkbox"'));
});
test('optional HTTPS link uses no referrer; credentials and unsafe schemes rejected',()=>{
 for(const url of ['http://example.org','data:text/html,test','https://name:secret@example.org','https://example.org/\nwrong','https://example.org/"onclick=1'])assert.equal(safePrivacyUrl(url),'');
 const html=renderPrivacyNotice({controller_name:'Firma',notice_text:'Informacja',information_url:'https://example.org/privacy?q=1&x=2'});
 assert.match(html,/rel="noopener noreferrer"/);assert.match(html,/q=1&amp;x=2/);
});
test('legacy links clearly distinguish missing organization information from Przydas policy',()=>{
 const html=renderPrivacyNotice(null,'Firma <test>');assert.match(html,/nie zawiera zapisanej informacji/);assert.match(html,/Firma &lt;test&gt;/);assert.ok(!html.includes('zgodny z RODO'));
});
