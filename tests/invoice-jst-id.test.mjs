import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers} from '../public/invoice-fields.mjs';
import {validateInvoiceBilling} from '../public/invoice-billing.mjs';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const complete={buyerName:'Gmina próbna',buyerNip:'5261040828',buyerStreet:'Testowa',buyerBuilding:'1',buyerPostalCode:'00-001',buyerCity:'Warszawa',recipientName:'Szkoła próbna',recipientStreet:'Szkolna',recipientBuilding:'2',recipientPostalCode:'00-002',recipientCity:'Warszawa'};
function setup(){const dom=new JSDOM('<form><input type="checkbox" name="faktura_wymagana" checked>'+renderInvoiceFields()+'</form>'),form=dom.window.document.querySelector('form');let calls=0;
 wireInvoiceFields(form,async()=>{calls++;throw Error('GUS must not run for IDWew')});
 const change=(key,value,event='input')=>{const input=form.elements.namedItem('invoice_'+key);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new dom.window.Event(event,{bubbles:true}));return input};
 for(const[key,value]of Object.entries(complete))change(key,value);change('jst',true,'change');
 return{dom,form,change,get calls(){return calls}};
}
test('legacy NIP default still submits complete company and JST data',()=>{
 const f=setup();try{assert.equal(f.form.elements.invoice_recipientIdType.value,'nip');f.change('recipientNip','5261040828');const payload=readInvoiceAnswers(f.form).invoice_billing;
 assert.equal(payload.recipientIdType,'nip');assert.equal(payload.recipientNip,'5261040828');assert.equal(payload.recipientIdWew,'');assert.equal(validateInvoiceBilling(payload).recipientName,complete.recipientName);
 const legacy={...payload};delete legacy.recipientIdType;assert.equal(validateInvoiceBilling(legacy).recipientIdType,'nip');
 }finally{f.dom.window.close()}
});
test('IDWew enables only its input, hides and blocks recipient GUS, and submits no inactive NIP',async()=>{
 const f=setup();try{f.change('recipientNip','5261040828');f.change('recipientIdType','idwew','change');const id=f.form.elements.invoice_recipientIdWew,nip=f.form.elements.invoice_recipientNip;
 assert.equal(nip.disabled,true);assert.equal(nip.value,'');assert.equal(id.disabled,false);assert.equal(id.maxLength,16);
 const gus=f.form.querySelector('[data-gus=recipient]');assert.equal(gus.closest('[data-billing-kind]').hidden,true);gus.querySelector('button').click();await tick();assert.equal(f.calls,0);
 f.change('recipientIdWew','5261040828-12345');const payload=readInvoiceAnswers(f.form).invoice_billing;assert.equal(payload.recipientIdType,'idwew');assert.equal(payload.recipientIdWew,'5261040828-12345');assert.equal(payload.recipientNip,'');assert.equal(validateInvoiceBilling(payload).recipientIdWew,'5261040828-12345');
 }finally{f.dom.window.close()}
});
test('public submit rejects empty or malformed active IDWew and keeps all other invoice fields complete',()=>{
 for(const value of ['', '123', '526104082812345', '5261040828-1234', '5261040828-ABCDE']){const f=setup();try{f.change('recipientIdType','idwew','change');const input=f.change('recipientIdWew',value);assert.throws(()=>readInvoiceAnswers(f.form),/IDWew/);assert.equal(input.getAttribute('aria-invalid'),'true');assert.equal(f.form.ownerDocument.activeElement,input)}finally{f.dom.window.close()}}
 const f=setup();try{f.change('recipientIdType','idwew','change');f.change('recipientIdWew','5261040828-12345');f.change('buyerName','');assert.throws(()=>readInvoiceAnswers(f.form),/Nazwa nabywcy/);assert.equal(f.form.elements.invoice_buyerName.getAttribute('aria-invalid'),'true')}finally{f.dom.window.close()}
});
test('switching IDWew back to NIP requires a new active identifier without reusing stale data',()=>{
 const f=setup();try{f.change('recipientIdType','idwew','change');f.change('recipientIdWew','5261040828-12345');f.change('recipientIdType','nip','change');assert.equal(f.form.elements.invoice_recipientIdWew.value,'');assert.equal(f.form.elements.invoice_recipientIdWew.disabled,true);assert.throws(()=>readInvoiceAnswers(f.form),/NIP odbiorcy/);f.change('recipientNip','5261040828');assert.equal(readInvoiceAnswers(f.form).invoice_billing.recipientIdWew,'')}finally{f.dom.window.close()}
});

test('switching recipient identification discards an in-flight NIP lookup without applying stale company data',async()=>{
 const dom=new JSDOM('<form><input type="checkbox" name="faktura_wymagana" checked>'+renderInvoiceFields()+'</form>'),form=dom.window.document.querySelector('form');let finish;
 wireInvoiceFields(form,()=>new Promise(resolve=>finish=resolve));
 const change=(name,value)=>{const input=form.elements.namedItem(name);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new dom.window.Event('change',{bubbles:true}))};
 try{change('invoice_jst',true);change('invoice_recipientNip','5261040828');form.elements.invoice_recipientName.value='Wpisana ręcznie szkoła';form.querySelector('[data-gus=recipient] button').click();assert.equal(typeof finish,'function');change('invoice_recipientIdType','idwew');finish({source:'GUS REGON',nip:'5261040828',companies:[{nip:'5261040828',name:'Nieaktualne dane'}]});await tick();assert.equal(form.querySelector('[data-gus=recipient] article'),null);assert.equal(form.elements.invoice_recipientName.value,'Wpisana ręcznie szkoła');assert.equal(form.elements.invoice_recipientNip.value,'')}finally{dom.window.close()}
});
