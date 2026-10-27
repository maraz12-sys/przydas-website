import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers} from '../public/invoice-fields.mjs';
const company={nip:'5261040828',name:'Firma GUS',regon:'000331501',street:'Testowa',building:'1',unit:'2',postalCode:'00-001',city:'Warszawa'};
const result=()=>({source:'GUS REGON',nip:company.nip,companies:[{...company}]});
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function setup(lookup){const dom=new JSDOM(`<form><input type="checkbox" name="faktura_wymagana" checked>${renderInvoiceFields()}</form>`);const form=dom.window.document.querySelector('form');wireInvoiceFields(form,lookup);const change=(name,value,event='input')=>{const input=form.elements.namedItem(name);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new dom.window.Event(event,{bubbles:true}));};return {dom,form,change};}
test('GUS fills buyer only after confirmation; it never submits or changes recipient',async()=>{
 let calls=0;const {dom,form,change}=setup(async nip=>{calls++;assert.equal(nip,company.nip);return result()});let submits=0;form.addEventListener('submit',e=>{e.preventDefault();submits++});
 try{change('invoice_buyerNip',company.nip);change('invoice_recipientName','Odbiorca');form.querySelector('[data-gus=buyer] button').click();await tick();assert.equal(form.elements.invoice_buyerName.value,'');assert.equal(calls,1);form.querySelector('[data-gus=buyer] article button').click();assert.equal(form.elements.invoice_buyerName.value,company.name);assert.equal(form.elements.invoice_recipientName.value,'Odbiorca');assert.equal(submits,0);assert.equal(readInvoiceAnswers(form).invoice_billing.buyerName,company.name);}finally{dom.window.close();}
});
test('changing NIP, party type, invoice checkbox or JST drops stale lookup results',async()=>{
 for(const [name,value]of [['invoice_buyerNip','5621808600'],['invoice_buyerType','person'],['faktura_wymagana',false],['invoice_jst',true]]){
  let resolve;const {dom,form,change}=setup(()=>new Promise(r=>{resolve=r}));
  try{change('invoice_buyerNip',company.nip);form.querySelector('[data-gus=buyer] button').click();change(name,value,'change');resolve(result());await tick();assert.equal(form.querySelector('article'),null);assert.equal(form.elements.invoice_buyerName.value,'');assert.equal(form.querySelector('[data-gus=buyer] button').textContent,'Pobierz z GUS');}finally{dom.window.close();}
 }
});
test('JST lookup preserves buyer, escapes provider markup, and cannot apply while submitting',async()=>{
 const {dom,form,change}=setup(async()=>({...result(),companies:[{...company,name:'<img onerror=alert(1)>'}]}));
 try{change('invoice_jst',true,'change');change('invoice_buyerName','Gmina');change('invoice_recipientNip',company.nip);form.querySelector('[data-gus=recipient] button').click();await tick();assert.equal(form.querySelector('img'),null);assert.match(form.querySelector('article').textContent,/<img/);form.setAttribute('aria-busy','true');form.querySelector('article button').click();assert.equal(form.elements.invoice_recipientName.value,'');form.removeAttribute('aria-busy');form.querySelector('article button').click();assert.equal(form.elements.invoice_buyerName.value,'Gmina');assert.equal(form.elements.invoice_recipientName.value,'<img onerror=alert(1)>');}finally{dom.window.close();}
});
test('invalid NIP never calls server; outage and wrong NIP leave all entered fields intact',async()=>{
 for(const failure of ['bad-nip','outage','wrong-response']){
  let calls=0;const {dom,form,change}=setup(async()=>{calls++;if(failure==='outage')throw Error('GUS jest niedostępny');return {...result(),nip:'5621808600'}});
  try{change('invoice_buyerName','Ręczne dane');change('invoice_buyerNip',failure==='bad-nip'?'123':company.nip);form.querySelector('[data-gus=buyer] button').click();await tick();assert.equal(calls,failure==='bad-nip'?0:1);assert.equal(form.querySelector('article'),null);assert.equal(form.elements.invoice_buyerName.value,'Ręczne dane');assert.equal(form.querySelector('[data-gus=buyer] button').disabled,false);assert(form.querySelector('[data-gus-output]').textContent.length>0);}finally{dom.window.close();}
 }
});
