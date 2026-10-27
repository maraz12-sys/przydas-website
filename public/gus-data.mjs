export function gusPreviewAvailable(){try{const host=(globalThis.wwLib?.getFrontWindow?.()||globalThis.window)?.location?.hostname;return ['przydas-editor.weweb.io','editor.weweb.io','app.xn--przyda-8ib.pl','przydas-production.weweb.io'].includes(host);}catch{return false;}}
export function gusNip(value){const s=String(value||'').trim().replace(/^PL\s*/i,'').replace(/[\s-]/g,'');if(!/^\d{10}$/.test(s)||/^(\d)\1{9}$/.test(s)||[6,5,7,2,3,4,5,6,7].reduce((a,w,i)=>a+w*Number(s[i]),0)%11!==Number(s[9]))throw Error('Wpisz poprawny, 10-cyfrowy polski NIP.');return s;}
export function gusPartyPatch(p,prefix){return {[prefix+'Nip']:p.nip,[prefix+'Name']:p.name,[prefix+'Street']:p.street,[prefix+'Building']:p.building,[prefix+'Unit']:p.unit,[prefix+'PostalCode']:p.postalCode,[prefix+'City']:p.city};}
export function gusCompanyPatch(p){return {nip:p.nip,nazwa:p.name,regon:p.regon,ulica:[p.street,[p.building,p.unit].filter(Boolean).join('/')].filter(Boolean).join(' '),kod_pocztowy:p.postalCode,miasto:p.city,kraj:'Polska'};}
export async function gusLookup(client,organizationId,scope,nip){
 if(!client?.functions||!organizationId)throw Error('Zaloguj się ponownie i wybierz organizację.');
 const r=await client.functions.invoke('company-registry-preview',{body:{action:'lookup',organization_id:organizationId,scope,nip:gusNip(nip)}});
 if(r.error){let code='';try{code=(await r.error.context?.json())?.code||'';}catch{}
  const messages={GUS_NOT_CONFIGURED:'Pobieranie z GUS czeka na jednorazową aktywację w Przydasiu. Na razie wpisz dane ręcznie.',GUS_NIP_INVALID:'Wpisz poprawny, 10-cyfrowy polski NIP.',GUS_FORBIDDEN:'Nie masz uprawnień do pobierania danych firmy w tej organizacji.',GUS_SESSION_REQUIRED:'Zaloguj się ponownie i potwierdź urządzenie.',GUS_RATE_LIMIT:'Za dużo wyszukiwań. Spróbuj ponownie za minutę.'};
  throw Error(messages[code]||'Nie udało się pobrać danych z GUS. Spróbuj ponownie lub wpisz je ręcznie.');
 }
 if(r.data?.source!=='GUS REGON'||r.data.nip!==gusNip(nip)||!Array.isArray(r.data.companies))throw Error('Nie udało się potwierdzić danych z GUS. Wpisz je ręcznie.');
 return r.data.companies.filter(p=>p.nip===gusNip(nip));
}
