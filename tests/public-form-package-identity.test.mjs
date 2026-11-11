import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {createRequire} from 'node:module';
import {applyFormBranding} from '../public/form-logo.mjs';
import {renderPrivacyNotice} from '../public/form-privacy.mjs';
import {renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers} from '../public/invoice-fields.mjs';
const runtimeRequire=createRequire(import.meta.url);assert.equal(createRequire(runtimeRequire.resolve('jsdom'))('../package.json').version,'26.1.0');
const source=fs.readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8'),script=source.match(/<script type="module" define:vars=\{\{ apiUrl \}\}>([\s\S]*?)<\/script>/)[1].replace(/^\s*import .*;$/gm,''),tick=async()=>{for(let i=0;i<3;i++)await new Promise(setImmediate)};
const choice=(id,event='Urodziny')=>({value:'same',label:'Taki sam pakiet',event_types:[event],restricted:true,...(id===undefined?{}:{pakiet_id:id})});
async function fixture(packageField={package_choices:[choice(31),choice(32)]},{failFirst=false}={}){
 const calls=[],raw=[],data={ok:true,organization_name:'Firma testowa',fields:[{key:'rodzaj_wydarzenia',label:'Rodzaj wydarzenia',type:'select',options:['Urodziny','Piknik'],required:true},{key:'pakiet',label:'Pakiet',type:'select',required:true,...packageField},{key:'kwota',label:'Budżet klienta',type:'number'},{key:'faktura_wymagana',label:'Faktura',type:'checkbox'}]};let first=failFirst;
 const dom=new JSDOM(source.slice(source.indexOf('<!doctype html>')),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://xn--przyda-8ib.pl/formularz/?t=synthetic-public-form-package-token-longer-than-30-characters'});
 Object.assign(dom.window,{applyFormBranding,renderPrivacyNotice,renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers,fetch:async(_url,options)=>{assert.equal(options.method,'POST');assert.equal(typeof options.body,'string','inspect serialized RPC JSON, not cloned proxy');const body=JSON.parse(options.body);calls.push(body);raw.push(options.body);if(body.action==='get')return{ok:true,json:async()=>JSON.parse(JSON.stringify(data))};assert.equal(body.action,'submit');if(first){first=false;return{ok:false,json:async()=>({ok:false,message:'Nie potwierdzono zapisu'})}}return{ok:true,json:async()=>({ok:true})}}});
 dom.window.eval('const apiUrl="https://edge.example.invalid/public-form";\n'+script);await tick();const form=dom.window.document.getElementById('reservation-form');assert.ok(form,dom.window.document.getElementById('card').textContent);
 const change=(name,value)=>{const input=form.elements.namedItem(name);input.value=value;input.dispatchEvent(new dom.window.Event('change',{bubbles:true}))};change('rodzaj_wydarzenia','Urodziny');form.elements.namedItem('kwota').value='1234';
 return{dom,form,calls,raw,change,select:()=>form.elements.namedItem('pakiet'),async submit(){form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();return calls.filter(call=>call.action==='submit').at(-1)},close(){dom.window.close()}};
}
test('actual public form serializes the chosen stable ID for two identical labels/values, preserving selection across re-filter and original customer budget',async()=>{
 const f=await fixture();try{const select=f.select();assert.deepEqual(Array.from(select.options,x=>x.value),['','same','same']);select.selectedIndex=2;assert.equal(select.value,'same');f.form.elements.namedItem('rodzaj_wydarzenia').dispatchEvent(new f.dom.window.Event('input',{bubbles:true}));assert.equal(select.selectedIndex,2);assert.equal(select.selectedOptions[0].textContent,'Taki sam pakiet');const payload=await f.submit();assert.equal(payload.answers.pakiet,'same');assert.equal(payload.answers.pakiet_id,32);assert.equal(payload.answers.kwota,'1234');assert.equal(payload.answers.faktura_wymagana,false);assert.ok(f.form.querySelector('input[name=invoice_buyerNip]'));assert.ok(f.form.querySelector('[data-gus=buyer] button'));assert.equal(f.calls.length,2);
 }finally{f.close()}
});
test('changing event type cannot silently bind another equal-valued package; only the newly chosen option supplies its ID',async()=>{
 const f=await fixture({package_choices:[choice(31,'Urodziny'),choice(32,'Piknik')]});try{f.select().selectedIndex=1;f.change('rodzaj_wydarzenia','Piknik');assert.equal(f.select().value,'');assert.equal(f.select().selectedIndex,0);await f.submit();assert.equal(f.calls.filter(call=>call.action==='submit').length,0);f.select().selectedIndex=1;const payload=await f.submit();assert.equal(payload.answers.rodzaj_wydarzenia,'Piknik');assert.equal(payload.answers.pakiet,'same');assert.equal(payload.answers.pakiet_id,32);
 }finally{f.close()}
});
test('legacy dynamic and generic options never infer IDs from package text or labels',async()=>{
 for(const field of [{package_choices:[{value:'id:31',label:'Pakiet 31',event_types:[],restricted:false}]},{options:['id:31','Pakiet 32']}]){const f=await fixture(field);try{f.select().selectedIndex=1;const payload=await f.submit();assert.equal(payload.answers.pakiet,'id:31');assert.equal(Object.hasOwn(payload.answers,'pakiet_id'),false);assert.equal(payload.answers.kwota,'1234');}finally{f.close()}}
});
test('a cloned DOM option and malformed identity metadata do not invent an ID',async()=>{
 const cloned=await fixture();try{const select=cloned.select(),option=select.options[1].cloneNode(true);select.add(option);select.selectedIndex=3;const payload=await cloned.submit();assert.equal(payload.answers.pakiet,'same');assert.equal(Object.hasOwn(payload.answers,'pakiet_id'),false);}finally{cloned.close()}
 for(const id of [true,'31',0,-1,1.5]){const f=await fixture({package_choices:[choice(id)]});try{f.select().selectedIndex=1;const payload=await f.submit();assert.equal(Object.hasOwn(payload.answers,'pakiet_id'),false,id);}finally{f.close()}}
});
test('a rejected submit preserves the exact package choice and customer amount for explicit retry',async()=>{
 const f=await fixture(undefined,{failFirst:true});try{f.select().selectedIndex=2;const first=await f.submit();assert.equal(first.answers.pakiet_id,32);assert.equal(f.select().selectedIndex,2);assert.equal(f.form.elements.namedItem('kwota').value,'1234');assert.equal(f.form.querySelector('.submit').disabled,false);assert.match(f.dom.window.document.getElementById('form-error').textContent,/Nie potwierdzono/);const second=await f.submit();assert.deepEqual(second,first);assert.equal(f.calls.filter(call=>call.action==='submit').length,2);assert.match(f.form.querySelector('.submit').textContent,/wysłany/);
 }finally{f.close()}
});

test('disabled package control preserves the existing omitted-field contract without leaking its selected metadata',async()=>{
 const f=await fixture();try{f.select().selectedIndex=2;f.select().disabled=true;const payload=await f.submit();assert.equal(Object.hasOwn(payload.answers,'pakiet'),false);assert.equal(Object.hasOwn(payload.answers,'pakiet_id'),false);assert.equal(payload.answers.kwota,'1234');}finally{f.close()}
});
