import {BILLING_FIELDS,blankBilling,billingVisible,billingIssue,cleanBilling,billingText} from './invoice-billing.mjs';
import {gusControl,wireInvoiceGus} from './invoice-gus.mjs';

const invoiceEscape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
export function renderInvoiceFields(){
 const inputs=fields=>fields.map(([key,label,max,kind])=>`<label class="field" data-billing-kind="${kind}"><span>${invoiceEscape(label)}${kind.toLowerCase().includes('optional')?'':' <em>*</em>'}</span><input data-billing-field="${key}" name="invoice_${key}" maxlength="${max}"${key.endsWith('PostalCode')?' placeholder="00-000"':''}${key.endsWith('Nip')?' inputmode="numeric"':''} aria-describedby="invoice-error"></label>`).join('');
 return `<fieldset class="invoice-fields" id="invoice-fields" hidden disabled><legend>Dane do faktury</legend><label class="field"><span>Nabywca</span><select name="invoice_buyerType"><option value="company">Firma / JST</option><option value="person">Osoba prywatna</option></select></label><div class="invoice-grid">${inputs(BILLING_FIELDS.filter(([key])=>key.startsWith('buyer')))}</div><div data-billing-kind="company">${gusControl("buyer")}</div><label class="field check" data-billing-kind="company"><input type="checkbox" name="invoice_jst"><span>JST - osobny odbiorca (np. szkoła)</span></label><div class="invoice-recipient" data-billing-kind="jst"><p>Nabywca: np. gmina. Odbiorca: jednostka, dla której wykonano usługę.</p><div class="invoice-grid">${inputs(BILLING_FIELDS.filter(([key])=>key.startsWith('recipient')))}</div>${gusControl("recipient")}</div><p id="invoice-error" class="error" role="alert" hidden></p></fieldset>`;
}
function readBilling(form){
 const b=blankBilling();
 b.buyerType=form.elements.namedItem('invoice_buyerType')?.value||'company';
 b.jst=b.buyerType==='company'&&form.elements.namedItem('invoice_jst')?.checked===true;
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
