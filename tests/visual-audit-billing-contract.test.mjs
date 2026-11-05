import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {renderInvoiceFields,wireInvoiceFields,readInvoiceAnswers} from '../public/invoice-fields.mjs';
const workflow=readFileSync(new URL('../.github/workflows/visual-audit.yml',import.meta.url),'utf8');
const billingKeys=JSON.parse(workflow.match(/const billingKeys=(\[[^\n]+\]);/)[1].replaceAll("'",'"'));
const recipientLabels=JSON.parse(workflow.match(/const recipientLabels = (\[[^\n]+\]);/)[1].replaceAll("'",'"'));
const expectedSource=workflow.match(/expected=(\{version:1,[^\n]+?\});assert\.deepEqual/)[1];
const expected=Function('kind','values','billingKeys','return '+expectedSource);
const address={buyerStreet:'Testowa',buyerBuilding:'1',buyerUnit:'2',buyerPostalCode:'00-001',buyerCity:'Warszawa'};
for(const kind of ['person','company','jst'])test('Visual Audit fixture matches actual public invoice payload: '+kind,()=>{
 const dom=new JSDOM('<form><input type="checkbox" name="faktura_wymagana" checked>'+renderInvoiceFields()+'</form>'),form=dom.window.document.querySelector('form');
 try{
  wireInvoiceFields(form,()=>{throw Error('Unexpected GUS request')});
  const values=kind==='person'?{buyerFirstName:'Jan',buyerLastName:'Testowy',...address}:{buyerName:'TEST Firma',buyerNip:'5261040828',...address};
  if(kind==='jst')Object.assign(values,{recipientName:'TEST Szkoła',recipientNip:'5621808600',recipientStreet:'Szkolna',recipientBuilding:'2',recipientUnit:'',recipientPostalCode:'00-002',recipientCity:'Warszawa'});
  const change=(key,value)=>{const input=form.elements.namedItem('invoice_'+key);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));};
  change('buyerType',kind==='person'?'person':'company');change('jst',kind==='jst');for(const [key,value]of Object.entries(values))change(key,value);
  assert.deepEqual(readInvoiceAnswers(form).invoice_billing,expected(kind,values,billingKeys));
  if(kind==='jst'){const labels=[...form.querySelector('.invoice-recipient').querySelectorAll('label.field')].filter(label=>!label.hidden).map(label=>label.querySelector('span').textContent.replace('*','').trim());assert.deepEqual(labels,recipientLabels);}
 }finally{dom.window.close();}
});
