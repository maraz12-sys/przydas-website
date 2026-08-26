import fs from 'node:fs';

const file = 'src/pages/formularz.astro';
let src = fs.readFileSync(file, 'utf8');

function replaceOnce(before, after, label) {
  if (src.includes(after)) return;
  if (!src.includes(before)) throw new Error(`Missing anchor: ${label}`);
  src = src.replace(before, after);
}

replaceOnce(
  "      .check span{font-size:13px!important;font-weight:750!important;color:#34453c}\n",
  "      .check span{font-size:13px!important;font-weight:750!important;color:#34453c}\n      .choice-field{grid-column:1/-1}\n      .choice-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n      .choice-option{min-height:52px;padding:13px 14px;display:flex;align-items:center;gap:11px;border:1px solid #dce8e1;border-radius:13px;background:#f8fbf9;cursor:pointer}\n      .choice-option:hover{border-color:#b8d4c5;background:#f4faf6}\n      .choice-option input{appearance:none!important;width:22px!important;height:22px!important;min-width:22px!important;flex:0 0 22px!important;margin:0!important;padding:0!important;border:1.5px solid #aebeb5!important;border-radius:6px!important;background:#fff!important;display:grid!important;place-items:center!important;cursor:pointer!important;box-shadow:none!important}\n      .choice-option input:checked{border-color:var(--green)!important;background:var(--green)!important}\n      .choice-option input:checked::after{content:\"✓\";color:#fff;font-size:13px;font-weight:900;line-height:1}\n      .choice-option span{color:#34453c;font-size:13px;font-weight:750}\n      @media(max-width:520px){.choice-options{grid-template-columns:1fr}}\n",
  'payment choice styles',
);

replaceOnce(
  "      const timeOptions = Array.from({length:48},(_,index)=>{const total=index*30;const h=String(Math.floor(total/60)).padStart(2,'0');const m=String(total%60).padStart(2,'0');return `${h}:${m}`;});\n",
  "      const timeOptions = Array.from({length:48},(_,index)=>{const total=index*30;const h=String(Math.floor(total/60)).padStart(2,'0');const m=String(total%60).padStart(2,'0');return `${h}:${m}`;});\n      const paymentOptions = [{value:'gotowka',label:'Gotówka'},{value:'przelew',label:'Przelew'}];\n",
  'canonical payment options',
);

replaceOnce(
  "        if(field.type==='checkbox') return `<label class=\"field check${dependentClass}\"${dependentAttrs}><input type=\"checkbox\" name=\"${key}\"><span>${label}${mark}</span></label>`;\n",
  "        if(field.key==='sposob_platnosci') return `<div class=\"field field-wide choice-field\"><span>${label}${mark}</span><div class=\"choice-options\" role=\"radiogroup\" aria-label=\"${label}\">${paymentOptions.map((option,index)=>`<label class=\"choice-option\"><input type=\"radio\" name=\"${key}\" value=\"${option.value}\"${field.required===true&&index===0?' required':''}><span>${option.label}</span></label>`).join('')}</div><small class=\"field-hint\">Wybierz jedną opcję.</small></div>`;\n        if(field.type==='checkbox') return `<label class=\"field check${dependentClass}\"${dependentAttrs}><input type=\"checkbox\" name=\"${key}\"><span>${label}${mark}</span></label>`;\n",
  'payment method renderer',
);

replaceOnce(
  "        <p>Formularz został przekazany organizatorowi. Oczekuj na potwierdzenie rezerwacji.</p>\n        <small>Wysłanie formularza nie oznacza jeszcze potwierdzenia terminu.</small>",
  "        <p>Dziękujemy za przesłanie danych. Oczekuj na potwierdzenie rezerwacji.</p>\n        <small><strong>Pamiętaj!</strong> Wysłanie formularza nie oznacza potwierdzenia rezerwacji — otrzymasz je w osobnym e-mailu po zatwierdzeniu przez nas danych.</small>",
  'client-facing success modal copy',
);

replaceOnce(
  "      successAction.addEventListener('click',()=>showState('Formularz wysłany','Formularz został przekazany organizatorowi. Oczekuj na potwierdzenie rezerwacji.',true));",
  "      successAction.addEventListener('click',()=>showState('Formularz wysłany','Dziękujemy za przesłanie danych. Oczekuj na potwierdzenie rezerwacji. Wysłanie formularza nie oznacza potwierdzenia rezerwacji — otrzymasz je w osobnym e-mailu po zatwierdzeniu przez nas danych.',true));",
  'client-facing success state copy',
);

fs.writeFileSync(file, src, 'utf8');
console.log('OK: payment method uses canonical single-choice controls and success copy is client-facing.');
