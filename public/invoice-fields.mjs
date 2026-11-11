import {BILLING_FIELDS,blankBilling,billingVisible,billingIssue,cleanBilling,billingText} from './invoice-billing.mjs';
import {gusControl,wireInvoiceGus} from './invoice-gus.mjs';

const invoiceEscape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
export function renderInvoiceFields(){
 const inputs=fields=>fields.map(([key,label,max,kind])=>{
  const caption=invoiceEscape(label)+(kind.toLowerCase().includes('optional')?'':' <em>*</em>');
  const input='<input '+(key==='buyerNip'?'id="invoice-buyer-nip" ':'')+'data-billing-field="'+key+'" name="invoice_'+key+'" maxlength="'+max+'"'+(key.endsWith('PostalCode')?' placeholder="00-000"':'')+(key.endsWith('Nip')?' inputmode="numeric"':'')+' aria-describedby="invoice-error">';
  if(key!=='buyerNip')return '<label class="field" data-billing-kind="'+kind+'"><span>'+caption+'</span>'+input+'</label>';
  return '<div class="invoice-gus invoice-buyer-gus" data-gus="buyer" data-billing-kind="company"><div class="field invoice-buyer-nip"><label for="invoice-buyer-nip"><span>'+caption+'</span></label><div class="invoice-nip-row">'+input+'<button type="button" class="gus-button" data-gus-lookup>Pobierz z GUS</button></div></div><div data-gus-output role="status" aria-live="polite"></div></div>';
 }).join('');
 return `<fieldset class="invoice-fields" id="invoice-fields" hidden disabled><legend>Dane do faktury</legend><label class="field"><span>Nabywca</span><select name="invoice_buyerType"><option value="company">Firma / JST</option><option value="person">Osoba prywatna</option></select></label><div class="invoice-grid">${inputs(BILLING_FIELDS.filter(([key])=>key.startsWith('buyer')))}</div><label class="field check" data-billing-kind="company"><input type="checkbox" name="invoice_jst"><span>JST - osobny odbiorca (np. szkoła)</span></label><div class="invoice-recipient" data-billing-kind="jst"><label class="field"><span>Identyfikator odbiorcy</span><select name="invoice_recipientIdType"><option value="nip">NIP</option><option value="idwew">IDWew nadany w KSeF</option></select></label><p>Nabywca: np. gmina. Odbiorca: jednostka, dla której wykonano usługę.</p><div class="invoice-grid">${inputs(BILLING_FIELDS.filter(([key])=>key.startsWith('recipient')))}</div><div data-billing-kind="jstNip">${gusControl("recipient")}</div></div><p id="invoice-error" class="error" role="alert" hidden></p></fieldset>`;
}
function readBilling(form){
 const b=blankBilling();
 b.buyerType=form.elements.namedItem('invoice_buyerType')?.value||'company';
 b.jst=b.buyerType==='company'&&form.elements.namedItem('invoice_jst')?.checked===true;
 b.recipientIdType=form.elements.namedItem('invoice_recipientIdType')?.value||'nip';
 for(const[key]of BILLING_FIELDS)b[key]=form.elements.namedItem('invoice_'+key)?.value||'';
 return b;
}
export function wireInvoiceFields(form,lookup){
 const box=form.querySelector('#invoice-fields');
 if(!box)return;
 const toggle=form.elements.namedItem('faktura_wymagana');
 const sync=()=>{
  const enabled=toggle?.checked===true,b=readBilling(form);
  box.hidden=!enabled;box.disabled=!enabled;
  for(const wrapper of box.querySelectorAll('[data-billing-kind]')){
   const visible=billingVisible(b,wrapper.dataset.billingKind);wrapper.hidden=!visible;
   for(const input of wrapper.querySelectorAll('input,select'))input.disabled=!enabled||!visible;
  }
  // Nested recipient fields must also stay disabled when the whole section is hidden.
  for(const input of box.querySelectorAll('[data-billing-field]')){
   const spec=BILLING_FIELDS.find(([key])=>key===input.dataset.billingField);
   input.disabled=!enabled||!billingVisible(b,spec[3]);
  }
 };
 const clearError=()=>{const error=box.querySelector('#invoice-error');error.hidden=true;error.textContent='';for(const input of box.querySelectorAll('[aria-invalid]'))input.removeAttribute('aria-invalid')};
 toggle?.addEventListener('change',()=>{sync();clearError()});
 form.elements.namedItem('invoice_buyerType')?.addEventListener('change',sync);
 form.elements.namedItem('invoice_jst')?.addEventListener('change',sync);
 form.elements.namedItem('invoice_recipientIdType')?.addEventListener('change',()=>{const inactive=readBilling(form).recipientIdType==='idwew'?'recipientNip':'recipientIdWew';const control=form.elements.namedItem('invoice_'+inactive);if(control)control.value='';sync();clearError()});
 box.addEventListener('input',clearError);
 sync();
 wireInvoiceGus(form,lookup);
}
export function readInvoiceAnswers(form){
 const box=form.querySelector('#invoice-fields');if(!box)return {};
 if(!form.elements.namedItem('faktura_wymagana')?.checked)return {invoice_billing:null,faktura_nip:'',faktura_dane:''};
 const billing=readBilling(form),issue=billingIssue(billing);
 if(issue){
  const error=box.querySelector('#invoice-error');error.textContent=issue.message;error.hidden=false;
  const input=form.elements.namedItem('invoice_'+issue.field);input?.setAttribute('aria-invalid','true');input?.scrollIntoView?.({block:'center'});input?.focus();
  throw Error(issue.message);
 }
 const clean=cleanBilling(billing);
 return {invoice_billing:clean,faktura_nip:clean.buyerNip,faktura_dane:billingText(clean)};
}
