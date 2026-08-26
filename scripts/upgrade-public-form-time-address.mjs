import fs from 'node:fs';

const formPath = 'src/pages/formularz.astro';
const auditPath = '.github/workflows/visual-audit.yml';
let src = fs.readFileSync(formPath, 'utf8');
let audit = fs.readFileSync(auditPath, 'utf8');

function replaceOnce(text, before, after, label) {
  if (text.includes(after)) return text;
  if (!text.includes(before)) throw new Error(`Missing anchor: ${label}`);
  return text.replace(before, after);
}

src = replaceOnce(
  src,
  "      .field>span{display:flex;align-items:center;gap:5px;color:#34453c;font-size:12px;font-weight:780}\n",
  "      .field>span{display:flex;align-items:center;gap:5px;color:#34453c;font-size:12px;font-weight:780}\n      .field-hint{margin-top:-1px;color:#7b8a82;font-size:10px;line-height:1.5}\n",
  'field hint css',
);

src = replaceOnce(
  src,
  "        adres:'Miejscowość, ulica i numer',\n",
  "        adres:'Miejscowość, ulica, numer i kod pocztowy',\n",
  'address placeholder',
);

src = replaceOnce(
  src,
  "      const wideKeys = new Set(['adres','atrakcje','faktura_dane','uwagi']);\n",
  "      const fieldLabels = { title:'Nazwa wydarzenia' };\n      const fieldHints = { adres:'Podaj dokładny adres z kodem pocztowym. Jeżeli dojazd jest niestandardowy, opisz to w uwagach na dole formularza.' };\n      const wideKeys = new Set(['adres','atrakcje','faktura_dane','uwagi']);\n      const timeSlotKeys = new Set(['godzina_start','godzina_end']);\n      const timeOptions = Array.from({length:48},(_,index)=>{const total=index*30;const h=String(Math.floor(total/60)).padStart(2,'0');const m=String(total%60).padStart(2,'0');return `${h}:${m}`;});\n      const plusTwoHours = value => { const match=/^(\\d{2}):(\\d{2})$/.exec(String(value||'')); if(!match)return ''; const total=(Number(match[1])*60+Number(match[2])+120)%(24*60); return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`; };\n",
  'field labels and half-hour options',
);

src = replaceOnce(
  src,
  "        const key=esc(field.key),label=esc(field.label||field.key),required=field.required===true?' required':'',mark=field.required===true?' <em>*</em>':'';\n",
  "        const key=esc(field.key),label=esc(fieldLabels[field.key]||field.label||field.key),required=field.required===true?' required':'',mark=field.required===true?' <em>*</em>':'';\n",
  'title label override',
);

src = replaceOnce(
  src,
  "        const placeholder=placeholders[field.key]?` placeholder=\"${esc(placeholders[field.key])}\"`:'';\n",
  "        const placeholder=placeholders[field.key]?` placeholder=\"${esc(placeholders[field.key])}\"`:'';\n        const hint=fieldHints[field.key]?`<small class=\"field-hint\">${esc(fieldHints[field.key])}</small>`:'';\n",
  'field hint renderer',
);

src = replaceOnce(
  src,
  "        if(field.type==='textarea') return `<label class=\"field${wide}${dependentClass}\"${dependentAttrs}><span>${label}${mark}</span><textarea name=\"${key}\"${required}${placeholder}></textarea></label>`;\n        const allowed=['date','time','email','tel','number','text']; const type=allowed.includes(field.type)?field.type:'text';\n        return `<label class=\"field${wide}${dependentClass}\"${dependentAttrs}><span>${label}${mark}</span><input type=\"${type}\" name=\"${key}\"${required}${placeholder}${type==='email'?' autocomplete=\"email\"':''}${type==='tel'?' autocomplete=\"tel\"':''}></label>`;\n",
  "        if(field.type==='textarea') return `<label class=\"field${wide}${dependentClass}\"${dependentAttrs}><span>${label}${mark}</span><textarea name=\"${key}\"${required}${placeholder}></textarea>${hint}</label>`;\n        if(timeSlotKeys.has(field.key)) return `<label class=\"field${wide}${dependentClass}\"${dependentAttrs}><span>${label}${mark}</span><select name=\"${key}\"${required}><option value=\"\">Wybierz godzinę</option>${timeOptions.map(value=>`<option value=\"${value}\">${value}</option>`).join('')}</select>${hint}</label>`;\n        const allowed=['date','email','tel','number','text']; const type=allowed.includes(field.type)?field.type:'text';\n        return `<label class=\"field${wide}${dependentClass}\"${dependentAttrs}><span>${label}${mark}</span><input type=\"${type}\" name=\"${key}\"${required}${placeholder}${type==='email'?' autocomplete=\"email\"':''}${type==='tel'?' autocomplete=\"tel\"':''}>${hint}</label>`;\n",
  'half-hour select renderer',
);

src = replaceOnce(
  src,
  "      const renderForm = data => {\n",
  "      const wireTimeDefaults = form => {\n        const start=form.elements.namedItem('godzina_start');\n        const end=form.elements.namedItem('godzina_end');\n        if(!start||!end)return;\n        const sync=()=>{ if(!start.value)return; end.value=plusTwoHours(start.value); };\n        start.addEventListener('change',sync);\n      };\n      const renderForm = data => {\n",
  'time defaults wiring function',
);

src = replaceOnce(
  src,
  "        wireInvoiceDependencies(form);\n        form.addEventListener('submit',submitForm);\n",
  "        wireInvoiceDependencies(form);\n        wireTimeDefaults(form);\n        form.addEventListener('submit',submitForm);\n",
  'time defaults activation',
);

audit = replaceOnce(audit, "            'Nazwa / temat wydarzenia',\n", "            'Nazwa wydarzenia',\n", 'audit title label');
audit = replaceOnce(
  audit,
  "              const processText = document.querySelector('.process-note')?.textContent.replace(/\\s+/g,' ').trim() || '';\n",
  "              const processText = document.querySelector('.process-note')?.textContent.replace(/\\s+/g,' ').trim() || '';\n              const addressHint = document.querySelector('input[name=\"adres\"]')?.parentElement?.querySelector('.field-hint')?.textContent.trim() || '';\n              const startSelect = document.querySelector('select[name=\"godzina_start\"]');\n              const endSelect = document.querySelector('select[name=\"godzina_end\"]');\n              const timeValues = startSelect ? Array.from(startSelect.options).map(option=>option.value) : [];\n",
  'audit time/address capture',
);
audit = replaceOnce(
  audit,
  "                processText,\n",
  "                processText,\n                addressHint,\n                timeValues,\n                startTag:startSelect?.tagName||'',\n                endTag:endSelect?.tagName||'',\n",
  'audit captured values',
);
audit = replaceOnce(
  audit,
  "            if (!/nie oznacza jeszcze potwierdzenia rezerwacji/i.test(result.processText)) throw new Error(`Brakuje rozróżnienia formularz/rezerwacja: ${result.processText}`);\n",
  "            if (!/nie oznacza jeszcze potwierdzenia rezerwacji/i.test(result.processText)) throw new Error(`Brakuje rozróżnienia formularz/rezerwacja: ${result.processText}`);\n            if (!/dokładny adres z kodem pocztowym/i.test(result.addressHint) || !/niestandardowy/i.test(result.addressHint)) throw new Error(`Brakuje instrukcji przy adresie: ${result.addressHint}`);\n            if (result.startTag!=='SELECT' || result.endTag!=='SELECT') throw new Error(`Godziny nie są listami wyboru: ${JSON.stringify(result)}`);\n            if (result.timeValues.length!==49 || result.timeValues[1]!=='00:00' || result.timeValues[2]!=='00:30' || result.timeValues.at(-1)!=='23:30') throw new Error(`Lista godzin nie ma interwału 30 minut: ${JSON.stringify(result.timeValues)}`);\n",
  'audit half-hour/address assertions',
);
audit = replaceOnce(
  audit,
  "            await page.locator('input[name=\"godzina_start\"]').fill('15:00');\n            await page.locator('input[name=\"godzina_end\"]').fill('17:00');\n",
  "            await page.locator('select[name=\"godzina_start\"]').selectOption('15:00');\n            const autoEnd=await page.locator('select[name=\"godzina_end\"]').inputValue();\n            if(autoEnd!=='17:00') throw new Error(`Godzina zakończenia nie ustawiła się +2h. Otrzymano: ${autoEnd}`);\n",
  'audit automatic end time',
);

fs.writeFileSync(formPath, src, 'utf8');
fs.writeFileSync(auditPath, audit, 'utf8');
console.log('OK: public form half-hour times, +2h end, address hint and title label');
