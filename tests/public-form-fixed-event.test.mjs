import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {applyFormBranding} from '../public/form-logo.mjs';
import {renderPrivacyNotice} from '../public/form-privacy.mjs';
import {renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers} from '../public/invoice-fields.mjs';

const source=fs.readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
const match=source.match(/<script type="module" define:vars=\{\{ apiUrl \}\}>([\s\S]*?)<\/script>/);
assert.ok(match,'actual public form script must be present');
const script=match[1].replace(/^\s*import .*;$/gm,'');
const tick=async()=>{for(let i=0;i<3;i++)await new Promise(setImmediate)};
const eventField=(extra={})=>({key:'rodzaj_wydarzenia',label:'Rodzaj wydarzenia',type:'select',options:['Urodziny','Piknik'],required:true,...extra});

async function fixture(event=eventField(),extraFields=[]){
  const calls=[],data={ok:true,organization_name:'Firma testowa',fields:[event,
    {key:'pakiet',label:'Pakiet',type:'select',required:true,package_choices:[
      {value:'same',label:'Ten sam pakiet',pakiet_id:31,event_types:[event.fixed_value||'Urodziny'],restricted:true},
      {value:'same',label:'Ten sam pakiet',pakiet_id:32,event_types:['Piknik'],restricted:true}]},
    {key:'custom_birthday',label:'Pole dla urodzin',type:'text',custom:true,required:true,rodzaje_wydarzen_ids:[7],rodzaje_wydarzen_nazwy:[event.fixed_value||'Urodziny']},
    {key:'custom_picnic',label:'Pole dla pikniku',type:'text',custom:true,required:true,rodzaje_wydarzen_ids:[8],rodzaje_wydarzen_nazwy:['Piknik']},...extraFields]};
  const dom=new JSDOM(source.slice(source.indexOf('<!doctype html>')),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.invalid/formularz/?t=synthetic-fixed-event-token-longer-than-30-characters'});
  Object.assign(dom.window,{applyFormBranding,renderPrivacyNotice,renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers,fetch:async(url,options)=>{
    assert.equal(url,'https://edge.example.invalid/public-form');
    assert.equal(options.method,'POST');
    assert.equal(options.credentials,'omit');
    assert.equal(options.cache,'no-store');
    const body=JSON.parse(options.body);calls.push(body);
    assert.ok(['get','submit'].includes(body.action),'no unrelated external action');
    return{ok:true,json:async()=>body.action==='get'?JSON.parse(JSON.stringify(data)):{ok:true}};
  }});
  dom.window.eval('const apiUrl="https://edge.example.invalid/public-form";\n'+script);
  await tick();
  const form=dom.window.document.getElementById('reservation-form');
  assert.ok(form,dom.window.document.getElementById('card').textContent);
  return{dom,form,calls,control:name=>form.elements.namedItem(name),change(value){const input=form.elements.namedItem('rodzaj_wydarzenia');input.value=value;input.dispatchEvent(new dom.window.Event('change',{bubbles:true}))},async submit(){form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();return calls.filter(call=>call.action==='submit').at(-1)},close(){dom.window.close()}};
}

function assertCategory(f,key,visible){
  const control=f.control(key);
  assert.equal(control.closest('[data-event-categories]').hidden,!visible);
  assert.equal(control.disabled,!visible);
}

test('explicit fixed event is labelled readonly, initializes dependencies and submits its value with stable package identity',async()=>{
  const f=await fixture(eventField({options:['Urodziny'],fixed_value:'Urodziny',event_type_id:7}));
  try{
    const input=f.control('rodzaj_wydarzenia');
    assert.equal(input.tagName,'INPUT');assert.equal(input.type,'text');assert.equal(input.readOnly,true);assert.equal(input.disabled,false);
    assert.equal(input.value,'Urodziny');assert.equal(input.required,true);assert.match(input.labels[0].textContent,/Rodzaj wydarzenia/);
    input.focus();assert.equal(f.dom.window.document.activeElement,input);
    assert.equal(f.form.querySelector('select[name="rodzaj_wydarzenia"]'),null);
    assertCategory(f,'custom_birthday',true);assertCategory(f,'custom_picnic',false);
    assert.deepEqual(Array.from(f.control('pakiet').options,o=>o.value),['','same']);
    f.control('pakiet').selectedIndex=1;f.control('custom_birthday').value='Dane próbne';
    const payload=await f.submit();
    assert.equal(payload.answers.rodzaj_wydarzenia,'Urodziny');assert.equal(payload.answers.pakiet_id,31);assert.equal(payload.answers.pakiet,'same');
    assert.equal(payload.answers.custom_birthday,'Dane próbne');assert.equal(Object.hasOwn(payload.answers,'custom_picnic'),false);
    assert.deepEqual(f.calls.map(call=>call.action),['get','submit']);
    assert.equal(f.form.querySelector('.submit').textContent,'Formularz wysłany');
  }finally{f.close()}
});

test('explicit fixed value wins over stale select options and is safely escaped as text and submitted intact',async()=>{
  const value='Warsztaty "x" & <img src=x onerror="alert(1)">';
  const f=await fixture(eventField({fixed_value:value,event_type_id:7}));
  try{
    assert.equal(f.control('rodzaj_wydarzenia').value,value);
    assert.equal(f.form.querySelector('img'),null);assert.equal(f.form.querySelector('[onerror]'),null);
    assertCategory(f,'custom_birthday',true);
    f.control('custom_birthday').value='Próbne';f.control('pakiet').selectedIndex=1;
    assert.equal((await f.submit()).answers.rodzaj_wydarzenia,value);
  }finally{f.close()}
});

test('legacy explicit fixed metadata works without event ID; a single generic option never implies a fixed event',async()=>{
  const fixed=await fixture(eventField({fixed_value:'Urodziny',options:['Urodziny']}));
  try{assert.equal(fixed.control('rodzaj_wydarzenia').readOnly,true);assert.equal(fixed.control('rodzaj_wydarzenia').value,'Urodziny')}finally{fixed.close()}
  const generic=await fixture(eventField({options:['Urodziny']}));
  try{assert.equal(generic.control('rodzaj_wydarzenia').tagName,'SELECT');assert.equal(generic.control('rodzaj_wydarzenia').value,'');assert.equal(generic.control('rodzaj_wydarzenia').options.length,2);assertCategory(generic,'custom_birthday',false)}finally{generic.close()}
});

test('generic event selection still switches category fields and equal-valued packages without stale IDs',async()=>{
  const f=await fixture();
  try{
    assert.equal(f.control('rodzaj_wydarzenia').tagName,'SELECT');assertCategory(f,'custom_birthday',false);assertCategory(f,'custom_picnic',false);
    f.change('Urodziny');assertCategory(f,'custom_birthday',true);assertCategory(f,'custom_picnic',false);f.control('pakiet').selectedIndex=1;
    f.change('Piknik');assertCategory(f,'custom_birthday',false);assertCategory(f,'custom_picnic',true);assert.equal(f.control('pakiet').value,'');
    await f.submit();assert.equal(f.calls.filter(call=>call.action==='submit').length,0,'required package and visible category remain validated');
    f.control('pakiet').selectedIndex=1;f.control('custom_picnic').value='Próbne';
    const payload=await f.submit();assert.equal(payload.answers.rodzaj_wydarzenia,'Piknik');assert.equal(payload.answers.pakiet_id,32);
    assert.equal(payload.answers.custom_picnic,'Próbne');assert.equal(Object.hasOwn(payload.answers,'custom_birthday'),false);
  }finally{f.close()}
});

test('empty or malformed fixed markers and fixed metadata on another field do not lock a generic event selector',async()=>{
  for(const fixed_value of ['', '  ', null, false, 7]){
    const f=await fixture(eventField({fixed_value}),[{key:'other',type:'select',options:['Choice'],fixed_value:'Choice'}]);
    try{assert.equal(f.control('rodzaj_wydarzenia').tagName,'SELECT');assert.equal(f.control('rodzaj_wydarzenia').value,'');assert.equal(f.control('other').tagName,'SELECT')}finally{f.close()}
  }
});

test('payment uses the labelled two-option select even for older text-field links',async()=>{
  const fixed=eventField({options:['Urodziny'],fixed_value:'Urodziny',event_type_id:7});
  for(const [type,required,value] of [['text',true,'gotowka'],['select',false,'przelew'],['text',false,'']]){
    const f=await fixture(fixed,[{key:'sposob_platnosci',label:'Sposób płatności',type,required,options:['Inna forma']}]);
    try{
      const payment=f.control('sposob_platnosci');
      assert.equal(payment.tagName,'SELECT');
      assert.match(payment.labels[0].textContent,/Sposób płatności/);
      assert.equal(payment.required,required);
      assert.deepEqual(Array.from(payment.options,o=>o.value),['','gotowka','przelew']);
      f.control('pakiet').selectedIndex=1;f.control('custom_birthday').value='Próbne';
      if(required) assert.equal(await f.submit(),undefined);
      payment.value=value;
      assert.equal((await f.submit()).answers.sposob_platnosci,value);
    }finally{f.close()}
  }
  const omitted=await fixture(fixed);
  try{assert.equal(omitted.control('sposob_platnosci'),null)}finally{omitted.close()}
});
