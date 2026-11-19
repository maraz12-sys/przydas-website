import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {JSDOM} from 'jsdom';
import {mountSurvey,surveyCopy} from '../src/lib/customer-surveys/renderer.mjs';
import {applyFormBranding} from '../public/form-logo.mjs';
import worker from '../src/prelaunch-worker.js';

const thanks='Dziękujemy!\nGoogle: https://g.page/r/CS0wW0P06HeUEBM/review\nFacebook: https://www.facebook.com/Animilandia';
const schema={title:'Twoja opinia',intro:'Dziękujemy za współpracę.',thanks,questions:[{id:'feedback',type:'long',label:'Co poprawić?',required:true},{id:'rating',type:'rating',label:'Ocena',required:true,min:1,max:5}]};
const id='22222222-2222-4222-8222-222222222222',revision='11111111-1111-4111-8111-111111111111';
const logo=()=>({version:1,id,revision,url:`https://jyzajgbgkqlczjpoxxzt.supabase.co/storage/v1/object/sign/organizacja-pliki/2443/form-logos-v1/${id}.png?token=synthetic`,expiresAt:new Date(Date.now()+60000).toISOString(),mimeType:'image/png',sizeBytes:68,width:1,height:1,organizationName:'Animilandia'});
const page=fs.readFileSync(new URL('../src/pages/ankieta.astro',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
async function open(data,status=200){
  const dom=new JSDOM(page.slice(page.indexOf('<!doctype html>')),{runScripts:'outside-only',url:'https://xn--przyda-8ib.pl/ankieta/#11111111-1111-4111-8111-111111111111.'+'A'.repeat(43)}),calls=[];
  Object.assign(dom.window,{mountSurvey,surveyCopy,applyFormBranding,AbortSignal,fetch:async(_url,request)=>{const body=JSON.parse(request.body);calls.push(body);return{ok:status===200,json:async()=>body.action==='submit'?{ok:true,submitted:true}:{ok:true,definition:schema,...data}}}});
  const script=stripTypeScriptTypes(page.match(/<script>([\s\S]*?)<\/script>/)[1],{mode:'strip'})
    .replace(/^import .*;$/gm,'')
    .replace("import(/* @vite-ignore */ '/form-logo.mjs')","Promise.resolve({applyFormBranding})");
  dom.window.eval(script);await tick();await tick();return{dom,calls};
}
function checkLinks(doc){const links=[...doc.querySelectorAll('#survey-host a')];assert.equal(links.length,2);assert.deepEqual(links.map(a=>a.href),['https://g.page/r/CS0wW0P06HeUEBM/review','https://www.facebook.com/Animilandia']);for(const a of links){assert.equal(a.target,'_blank');assert.equal(a.rel,'noopener noreferrer');assert.equal(a.referrerPolicy,'no-referrer')}}
test('public survey reuses the form logo before and after completion, including reopening an existing link',async()=>{
  for(const submitted of [false,true]){const {dom,calls}=await open({submitted,thanks,organization_logo:logo()});try{
    const doc=dom.window.document;assert.equal(doc.getElementById('organization-brand').hidden,false);assert.equal(doc.getElementById('platform-brand').hidden,true);assert.equal(doc.getElementById('platform-footer').hidden,false);assert.equal(doc.getElementById('organization-logo').alt,'Logo organizacji Animilandia');assert.equal(dom.window.location.hash,'');
    if(!submitted){const feedback=doc.querySelector('textarea'),rating=doc.querySelector('input[type=number]');feedback.value='Więcej informacji przed wydarzeniem';feedback.dispatchEvent(new dom.window.Event('input'));rating.value='4';rating.dispatchEvent(new dom.window.Event('input'));doc.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();assert.equal(calls.length,2);assert.equal(calls[1].answers.rating,4);assert.match(doc.getElementById('survey-host').textContent,/Dziękujemy za odpowiedź/)}
    checkLinks(doc);assert.equal(doc.getElementById('organization-brand').hidden,false);
  }finally{dom.window.close()}}
});
test('absent, rejected and failed logo retain the form fallback; a failed survey never exposes a logo',async()=>{
  for(const value of [undefined,null,{...logo(),url:'https://other.invalid/logo.png'}]){const {dom}=await open({organization_logo:value});try{assert.equal(dom.window.document.getElementById('platform-brand').hidden,false);assert.ok(dom.window.document.querySelector('form'));assert.equal(dom.window.document.getElementById('organization-logo').hasAttribute('src'),false)}finally{dom.window.close()}}
  const {dom}=await open({organization_logo:logo()});dom.window.document.getElementById('organization-logo').dispatchEvent(new dom.window.Event('error'));assert.equal(dom.window.document.getElementById('platform-brand').hidden,false);dom.window.close();
  const denied=await open({ok:false,message:'Link jest nieważny lub wygasł.',organization_logo:logo()},403);try{assert.match(denied.dom.window.document.body.textContent,/Link jest nieważny/);assert.equal(denied.dom.window.document.getElementById('organization-logo').hasAttribute('src'),false)}finally{denied.dom.window.close()}
});
test('thank-you copy preserves text and punctuation, with no HTML or unsafe URL execution',()=>{
  const dom=new JSDOM();try{const text='<img src=x onerror=alert(1)> javascript:alert(1) data:text/html,test https://user:password@other.invalid/ oraz (https://example.com/path_(one)?a=1&b=2).';const p=surveyCopy(dom.window.document,text);assert.equal(p.textContent,text);assert.equal(p.querySelectorAll('img,script').length,0);assert.equal(p.querySelectorAll('a').length,1);assert.equal(p.querySelector('a').href,'https://example.com/path_(one)?a=1&b=2')}finally{dom.window.close()}
});
test('logo CSP is shared only by the two public form routes; other routes retain their policy',async()=>{
  const policy="default-src 'self'; img-src 'self' data:; frame-ancestors 'none'",env={ASSETS:{fetch:async()=>new Response('asset',{headers:{'Content-Security-Policy':policy}})}};
  for(const route of ['/formularz','/formularz/','/ankieta','/ankieta/']){const response=await worker.fetch(new Request('https://xn--przyda-8ib.pl'+route),env);assert.match(response.headers.get('Content-Security-Policy'),/img-src 'self' data: https:\/\/jyzajgbgkqlczjpoxxzt.supabase.co/)}
  for(const route of ['/','/test/','/ankieta-other/'])assert.equal((await worker.fetch(new Request('https://xn--przyda-8ib.pl'+route),env)).headers.get('Content-Security-Policy'),policy);
});
