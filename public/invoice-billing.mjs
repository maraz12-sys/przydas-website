export const BILLING_FIELDS = [
 ['buyerName','Nazwa nabywcy',250,'company'],['buyerNip','NIP nabywcy',18,'company'],
 ['buyerFirstName','Imię nabywcy',100,'person'],['buyerLastName','Nazwisko nabywcy',150,'person'],
 ['buyerStreet','Ulica / miejscowość nabywcy',150,'all'],['buyerBuilding','Numer budynku nabywcy',30,'all'],['buyerUnit','Numer lokalu nabywcy',30,'optional'],['buyerPostalCode','Kod pocztowy nabywcy',6,'all'],['buyerCity','Miejscowość nabywcy',250,'all'],
 ['recipientName','Nazwa odbiorcy JST',250,'jst'],['recipientNip','NIP odbiorcy JST',18,'jst'],['recipientStreet','Ulica / miejscowość odbiorcy JST',150,'jst'],['recipientBuilding','Numer budynku odbiorcy JST',30,'jst'],['recipientUnit','Numer lokalu odbiorcy JST',30,'jstOptional'],['recipientPostalCode','Kod pocztowy odbiorcy JST',6,'jst'],['recipientCity','Miejscowość odbiorcy JST',250,'jst']
];
export const blankBilling=()=>({version:1,buyerType:'company',jst:false,...Object.fromEntries(BILLING_FIELDS.map(([k])=>[k,'']))});
export function normalizeBilling(value){const b=blankBilling();if(!value||typeof value!=='object'||Array.isArray(value))return b;b.buyerType=value.buyerType==='person'?'person':'company';b.jst=b.buyerType==='company'&&value.jst===true;for(const[k]of BILLING_FIELDS)b[k]=String(value[k]??'');return b;}
export const billingVisible=(b,kind)=>kind==='all'||kind==='optional'||kind===b.buyerType||b.jst&&kind.startsWith('jst');
export function cleanBilling(value){const b=normalizeBilling(value);for(const[k,,max,kind]of BILLING_FIELDS){if(!billingVisible(b,kind))b[k]='';else b[k]=b[k].trim().normalize('NFC');if(b[k].length>max)throw Error('Dane do faktury są zbyt długie.');if(/Nip$/.test(k))b[k]=b[k].replace(/^PL/i,'').replace(/[ -]/g,'');}return b;}
export function billingIssue(value){const b=cleanBilling(value);for(const[k,label,,kind]of BILLING_FIELDS){if(!billingVisible(b,kind))continue;const v=b[k];if(!v&&!kind.toLowerCase().includes('optional'))return {field:k,message:'Uzupełnij: '+label+'.'};if(/Nip$/.test(k)&&v){const sum=[6,5,7,2,3,4,5,6,7].reduce((s,n,i)=>s+n*Number(v[i]),0);if(!/^\d{10}$/.test(v)||/^(\d)\1{9}$/.test(v)||sum%11!==Number(v[9]))return {field:k,message:'Sprawdź: '+label+'.'};}if(/PostalCode$/.test(k)&&v&&!/^\d{2}-\d{3}$/.test(v))return {field:k,message:'Sprawdź: '+label+' (00-000).'};if(/[\u0000-\u001f]/.test(v))return {field:k,message:'Sprawdź: '+label+'.'};}return null;}
export function billingError(value){return billingIssue(value)?.message||'';}
export function billingText(value){const b=cleanBilling(value),name=b.buyerType==='person'?[b.buyerFirstName,b.buyerLastName].filter(Boolean).join(' '):b.buyerName;const line=p=>[b[p+'Street'],b[p+'Building']+(b[p+'Unit']?'/'+b[p+'Unit']:'')].filter(Boolean).join(' ');return [name,b.buyerNip?'NIP: '+b.buyerNip:'',line('buyer'),[b.buyerPostalCode,b.buyerCity].filter(Boolean).join(' '),...(b.jst?['Odbiorca JST: '+b.recipientName,'NIP odbiorcy: '+b.recipientNip,line('recipient'),[b.recipientPostalCode,b.recipientCity].filter(Boolean).join(' ')]:[])].filter(Boolean).join('\n');}

// Validate untrusted JSON before normalization; never coerce objects into invoice strings.
export function validateInvoiceBilling(value){
 const object=value&&typeof value==='object'&&!Array.isArray(value);
 const keys=new Set(['version','buyerType','jst',...BILLING_FIELDS.map(([key])=>key)]);
 if(!object||value.version!==1||!['company','person'].includes(value.buyerType)||typeof value.jst!=='boolean'||Object.keys(value).some(key=>!keys.has(key)))throw Error('Nieprawidłowe dane do faktury.');
 for(const[key]of BILLING_FIELDS)if(Object.hasOwn(value,key)&&typeof value[key]!=='string')throw Error('Nieprawidłowe pole danych faktury.');
 const issue=billingIssue(value);if(issue)throw Error(issue.message);
 return cleanBilling(value);
}
