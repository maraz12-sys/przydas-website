import {gusNip,gusPartyPatch} from './gus-data.mjs';

export const gusControl=prefix=>`<div class="invoice-gus" data-gus="${prefix}"><button type="button" class="gus-button" data-gus-lookup>Pobierz z GUS</button><div data-gus-output role="status" aria-live="polite"></div></div>`;

export function wireInvoiceGus(form,lookup){
 if(typeof lookup!=='function')return;
 for(const root of form.querySelectorAll('[data-gus]')){
  const prefix=root.dataset.gus,button=root.querySelector('[data-gus-lookup]'),output=root.querySelector('[data-gus-output]');
  const input=key=>form.elements.namedItem('invoice_'+key);
  let sequence=0,loading=false,applied=false;
  const identity=()=>[input(prefix+'Nip')?.value,input('buyerType')?.value,input('jst')?.checked,form.elements.namedItem('faktura_wymagana')?.checked].join(':');
  const enabled=()=>form.getAttribute('aria-busy')!=='true'&&form.elements.namedItem('faktura_wymagana')?.checked===true&&input('buyerType')?.value==='company'&&(prefix==='buyer'||input('jst')?.checked===true)&&!input(prefix+'Nip')?.disabled;
  const sync=()=>{if(!applied){sequence++;loading=false;output.replaceChildren();}syncButton();};
  form.addEventListener('input',sync);form.addEventListener('change',sync);
  button.addEventListener('click',async()=>{
   if(!enabled()||loading)return;
   const request=++sequence,key=identity();loading=true;button.disabled=true;button.textContent='Pobieram z GUS…';output.replaceChildren();
   const current=()=>request===sequence&&key===identity()&&enabled()&&form.isConnected;
   const text=(tag,value,parent=output)=>{const node=form.ownerDocument.createElement(tag);node.textContent=value;parent.append(node);return node;};
   try{
    const nip=gusNip(input(prefix+'Nip').value),result=await lookup(nip);
    if(!current())return;
    if(result?.source!=='GUS REGON'||result.nip!==nip||!Array.isArray(result.companies))throw Error('Nie udało się potwierdzić danych z GUS. Spróbuj ponownie.');
    const rows=result.companies.filter(row=>row?.nip===nip);
    if(!rows.length)text('p','Nie znaleziono danych dla tego NIP-u. Możesz wpisać je ręcznie.');
    else text('p','Sprawdź dane z GUS. „Użyj danych” uzupełni formularz, bez jego wysyłania.');
    for(const row of rows){
     const article=text('article','');text('strong',row.name,article);text('p',`NIP ${row.nip} · REGON ${row.regon}`,article);text('p',`${row.street} ${row.building}${row.unit?'/'+row.unit:''}, ${row.postalCode} ${row.city}`,article);
     if(row.ended)text('p','W GUS widnieje data zakończenia działalności. Sprawdź aktualność danych.',article);
     const use=text('button','Użyj danych',article);use.type='button';use.className='gus-button';
     use.addEventListener('click',()=>{
      if(!current()||loading)return;
      applied=true;
      for(const [key,value]of Object.entries(gusPartyPatch(row,prefix))){const field=input(key);if(field){field.value=value||'';field.dispatchEvent(new form.ownerDocument.defaultView.Event('input',{bubbles:true}));}}
      applied=false;sequence++;output.replaceChildren();text('p','Dane uzupełnione. Sprawdź formularz przed wysłaniem.');syncButton();
     });
    }
   }catch(error){if(current())text('p',error?.message||'GUS jest chwilowo niedostępny. Wpisz dane ręcznie.');}
   finally{if(request===sequence){loading=false;syncButton();}}
  });
  function syncButton(){button.textContent='Pobierz z GUS';button.disabled=!enabled()||!input(prefix+'Nip')?.value?.trim()||loading;}
  sync();
 }
}
