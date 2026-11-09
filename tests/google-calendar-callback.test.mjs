import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {JSDOM} from 'jsdom';

const page=fs.readFileSync(new URL('../src/pages/google-kalendarz.astro',import.meta.url),'utf8');
const script=stripTypeScriptTypes(page.match(/<script>([\s\S]*?)<\/script>/)[1],{mode:'strip'});
function open(query){
 const dom=new JSDOM(page.slice(page.indexOf('<!doctype html>')),{runScripts:'outside-only',url:'https://xn--przyda-8ib.pl/google-kalendarz/?'+query+'#PRIVATE_FRAGMENT'});
 let closes=0;dom.window.close=()=>{closes++;};
 dom.window.eval(script);
 return {dom,doc:dom.window.document,closes:()=>closes};
}
const cases=[['connected','Kalendarz połączony','success'],['cancelled','Połączenie anulowane','warning'],['error','Nie udało się','error'],['reconciliation','Sprawdź utworzenie kalendarza','warning']];

test('actual Google landing renders four fixed outcomes and the correct safe employee/owner return',()=>{
 for(const employee of [false,true])for(const [status,title,tone]of cases){
  const f=open('status='+status+(employee?'&audience=employee':''));
  assert.ok(f.doc.getElementById('title').textContent.startsWith(title));
  const message=f.doc.getElementById('message');assert.equal(message.dataset.tone,tone);assert.notEqual(message.textContent,'');
  assert.equal(f.doc.getElementById('return').href,'https://app.xn--przyda-8ib.pl/'+(employee?'moj-profil/':'ustawienia/'));
  assert.equal(f.doc.getElementById('return-help').hidden,!employee);assert.equal(f.closes(),0);
  assert.equal(f.dom.window.location.search,'');assert.equal(f.dom.window.location.hash,'');
  assert.equal(f.doc.querySelector('meta[name="referrer"]').content,'no-referrer');
  assert.match(f.doc.querySelector('meta[name="viewport"]').content,/width=device-width/);
  assert.equal(f.doc.querySelectorAll('a').length,1);
 }
});
test('reconciliation retains no-retry no-duplicate and no-delete instructions for both audiences',()=>{
 for(const employee of [false,true]){
  const f=open('status=reconciliation'+(employee?'&audience=employee':'')),text=f.doc.getElementById('message').textContent;
  assert.match(text,/Wstrzymaliśmy kolejne próby/);assert.match(text,/nie utworzyć duplikatu/);
  assert.match(text,/Nie usuwaj kalendarzy/);assert.match(text,/skontaktuj się z pomocą/);
  assert.match(text,/Rezerwacje w Przydasiu pozostają bez zmian/);assert.doesNotMatch(text,/spróbuj ponownie/);
 }
});
test('unknown or hostile enums and URL parameters never become HTML, return URLs or visible secrets',()=>{
 for(const employee of [false,true])for(const status of ['constructor','__proto__','toString','https://evil.test/PRIVATE','<img src=x onerror=alert(1)>']){
  const f=open('status='+encodeURIComponent(status)+(employee?'&audience=employee':'&audience=https://evil.test/PRIVATE')+'&code=PRIVATE_CODE&state=PRIVATE_STATE&access_token=PRIVATE_TOKEN&next=https://evil.test/PRIVATE');
  assert.equal(f.doc.getElementById('title').textContent,'Połączenie z Kalendarzem Google');
  assert.doesNotMatch(f.doc.querySelector('main').textContent,/PRIVATE|evil\.test|onerror|constructor|__proto__/);
  assert.equal(f.doc.querySelectorAll('img').length,0);
  assert.equal(f.doc.getElementById('return').href,'https://app.xn--przyda-8ib.pl/'+(employee?'moj-profil/':'ustawienia/'));
  assert.equal(f.dom.window.location.href,'https://xn--przyda-8ib.pl/google-kalendarz/');
 }
});
test('employee close has a visible system-X/Safari/HomeScreen fallback and calls close only on explicit click',()=>{
 const f=open('status=connected&audience=employee');
 assert.match(f.doc.getElementById('return-help').textContent,/systemowego X/);
 assert.match(f.doc.getElementById('return-help').textContent,/Gotowe/);
 assert.match(f.doc.getElementById('return-help').textContent,/Safari/);
 assert.match(f.doc.getElementById('return-help').textContent,/ikony na ekranie początkowym/);
 assert.equal(f.closes(),0);f.doc.getElementById('close').click();assert.equal(f.closes(),1);
 assert.match(f.doc.getElementById('message').textContent,/Mojego profilu/);
});
test('landing status styles keep separate red errors yellow information and green success in both schemes',()=>{
 const doc=open('status=error').doc,css=[...doc.styleSheets].flatMap(sheet=>[...sheet.cssRules]);
 const base=css.find(rule=>rule.selectorText==='#message'),success=css.find(rule=>rule.selectorText==='#message[data-tone="success"]'),error=css.find(rule=>rule.selectorText==='#message[data-tone="error"]');
 assert.equal(base.style.color,'#715000');assert.equal(success.style.color,'#146331');assert.equal(error.style.color,'#a32129');
 const dark=css.filter(rule=>rule.conditionText==='(prefers-color-scheme:dark)').flatMap(rule=>[...rule.cssRules]);
 assert.equal(dark.find(rule=>rule.selectorText==='#message').style.color,'#f5d878');
 assert.equal(dark.find(rule=>rule.selectorText==='#message[data-tone="success"]').style.color,'#a1e2b3');
 assert.equal(dark.find(rule=>rule.selectorText==='#message[data-tone="error"]').style.color,'#ffb5bb');
});
