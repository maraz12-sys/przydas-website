import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {logoReadUrl,applyFormBranding} from '../public/form-logo.mjs';
import {renderPrivacyNotice} from '../public/form-privacy.mjs';
import {renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers} from '../public/invoice-fields.mjs';
import worker from '../src/prelaunch-worker.js';
const ID='22222222-2222-4222-8222-222222222222',REV='11111111-1111-4111-8111-111111111111';
const logo=()=>({version:1,id:ID,revision:REV,url:'https://jyzajgbgkqlczjpoxxzt.supabase.co/storage/v1/object/sign/organizacja-pliki/2443/form-logos-v1/'+ID+'.png?token=synthetic',expiresAt:new Date(Date.now()+60000).toISOString(),mimeType:'image/png',sizeBytes:68,width:1,height:1});
const page=fs.readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
async function open(data,{status=200}={}){
 const dom=new JSDOM(page.slice(page.indexOf('<!doctype html>')),{runScripts:'outside-only',url:'https://xn--przyda-8ib.pl/formularz/?t=synthetic-public-form-token-longer-than-30-characters'});
 Object.assign(dom.window,{applyFormBranding,renderPrivacyNotice,renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers,fetch:async()=>({ok:status>=200&&status<300,json:async()=>({ok:true,organization_name:'Firma',fields:[],...data})})});
 const script=page.match(/<script type="module" define:vars=\{\{ apiUrl \}\}>([\s\S]*?)<\/script>/)[1].replace(/^\s*import .*;$/gm,'');
 dom.window.eval("const apiUrl='https://jyzajgbgkqlczjpoxxzt.supabase.co/functions/v1/formularz-rezerwacyjny-publiczny';\n"+script);
 await new Promise(r=>setTimeout(r,0));return dom;
}
test('actual public page renders one organization logo on open and completed forms, with small platform footer',async()=>{
 for(const completed of [false,true]){const dom=await open({organization_logo:logo(),completed});try{const doc=dom.window.document;assert.equal(doc.getElementById('organization-brand').hidden,false,doc.getElementById('card').textContent);assert.equal(doc.getElementById('platform-brand').hidden,true);assert.equal(doc.getElementById('platform-footer').hidden,false);assert.equal(doc.getElementById('organization-logo').getAttribute('referrerpolicy'),'no-referrer');assert.equal(doc.querySelectorAll('#organization-logo').length,1);if(completed)assert.match(doc.getElementById('card').textContent,/już przekazany/)}finally{dom.window.close()}}
});
test('old/missing logo, rejected URL and failed image retain default branding',async()=>{
 for(const value of [undefined,null,{...logo(),url:'https://example.com/logo.png'}]){const dom=await open({organization_logo:value});try{assert.equal(dom.window.document.getElementById('platform-brand').hidden,false);assert.equal(dom.window.document.getElementById('platform-footer').hidden,true)}finally{dom.window.close()}}
 const dom=await open({organization_logo:logo()});try{dom.window.document.getElementById('organization-logo').dispatchEvent(new dom.window.Event('error'));assert.equal(dom.window.document.getElementById('platform-brand').hidden,false);assert.equal(dom.window.document.getElementById('organization-logo').hasAttribute('src'),false)}finally{dom.window.close()}
});
test('logo URL is limited to valid, current purpose-bound project objects and organization',()=>{
 const good=logo();assert.equal(logoReadUrl(good,2443),good.url);
 for(const value of [{...good,url:good.url.replace('/2443/','/7/')},{...good,url:good.url.replace('/form-logos-v1/','/attachments/')},{...good,url:good.url.replace('.png?','.svg?')},{...good,expiresAt:'2000-01-01T00:00:00Z'},{...good,sizeBytes:2097153},{...good,width:4097}])assert.equal(logoReadUrl(value,2443),'');
});
test('Storage image permission is scoped to public form; ordinary routes and the www redirect remain unchanged',async()=>{
 const csp="default-src 'self'; img-src 'self' data:; frame-ancestors 'none'";
 const env={ASSETS:{fetch:async()=>new Response('asset',{headers:{'Content-Security-Policy':csp,'X-Frame-Options':'DENY'}})}};
 const form=await worker.fetch(new Request('https://xn--przyda-8ib.pl/formularz/'),env);assert.equal(form.headers.get('Content-Security-Policy'),csp.replace("img-src 'self' data:","img-src 'self' data: https://jyzajgbgkqlczjpoxxzt.supabase.co"));
 const ordinary=await worker.fetch(new Request('https://xn--przyda-8ib.pl/test/'),env);assert.equal(ordinary.headers.get('Content-Security-Policy'),csp);
 const canonical=await worker.fetch(new Request('https://www.xn--przyda-8ib.pl/formularz/?t=synthetic'),env);assert.equal(canonical.status,308);assert.equal(canonical.headers.get('Location'),'https://xn--przyda-8ib.pl/formularz/?t=synthetic');assert.equal(ordinary.headers.get('X-Frame-Options'),'DENY');assert.equal(form.headers.get('X-Frame-Options'),'DENY');
});

test('denied, expired or revoked public form responses never render a supplied organization logo',async()=>{for(const [status,message]of [[403,'Brak uprawnień do formularza.'],[410,'Link wygasł.'],[200,'Link został unieważniony.']]){const dom=await open({ok:false,message,organization_logo:logo()},{status});try{const doc=dom.window.document;assert.match(doc.getElementById('card').textContent,/Formularz jest niedostępny/);assert.ok(doc.getElementById('card').textContent.includes(message));assert.equal(doc.getElementById('organization-brand').hidden,true);assert.equal(doc.getElementById('organization-logo').hasAttribute('src'),false);assert.equal(doc.getElementById('platform-brand').hidden,false);assert.equal(doc.getElementById('platform-footer').hidden,true);}finally{dom.window.close();}}});

test('prepared logo fit keeps the image contained with a bounded public-form header',async()=>{const dom=await open({organization_logo:logo()});try{const image=dom.window.document.getElementById('organization-logo'),style=dom.window.getComputedStyle(image);assert.equal(style.objectFit,'contain');assert.equal(style.maxHeight,'72px');assert.match(style.maxWidth,/240px/);assert.equal(image.alt,'Logo organizacji Firma');assert.equal(image.getAttribute('referrerpolicy'),'no-referrer');}finally{dom.window.close();}});
