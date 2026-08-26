import fs from 'node:fs';

const file = 'src/pages/formularz.astro';
let source = fs.readFileSync(file, 'utf8');

const anchor = "      const wideKeys = new Set(['adres','atrakcje','faktura_dane','uwagi']);\n";
const insert = `      const wideKeys = new Set(['adres','atrakcje','faktura_dane','uwagi']);\n      const fieldOrder = [\n        'title',\n        'rodzaj_wydarzenia',\n        'data_wydarzenia',\n        'godzina_rozpoczecia',\n        'godzina_zakonczenia',\n        'adres',\n        'osoba_do_kontaktu',\n        'telefon_kontaktowy',\n        'email_kontaktowy',\n        'typ_klienta',\n        'kontrahent_nazwa',\n        'pakiet',\n        'atrakcje',\n        'liczba_dzieci',\n        'wiek_dzieci',\n        'solenizant',\n        'faktura',\n        'faktura_wymagana',\n        'faktura_nip',\n        'faktura_dane',\n        'sposob_platnosci',\n        'uwagi',\n      ];\n      const fieldOrderIndex = new Map(fieldOrder.map((key,index)=>[key,index]));\n      const orderFields = fields => fields\n        .map((field,index)=>({field,index}))\n        .sort((a,b)=>{\n          const aOrder = fieldOrderIndex.has(a.field.key) ? fieldOrderIndex.get(a.field.key) : (a.field.key === 'uwagi' ? 9999 : 9000 + a.index);\n          const bOrder = fieldOrderIndex.has(b.field.key) ? fieldOrderIndex.get(b.field.key) : (b.field.key === 'uwagi' ? 9999 : 9000 + b.index);\n          return aOrder - bOrder || a.index - b.index;\n        })\n        .map(item=>item.field);\n`;

if (!source.includes('const fieldOrder = [')) {
  if (!source.includes(anchor)) throw new Error('Nie znaleziono kotwicy wideKeys w formularz.astro');
  source = source.replace(anchor, insert);
}

const before = "        const fields=Array.isArray(data.fields)?data.fields:[];\n";
const after = "        const fields=orderFields(Array.isArray(data.fields)?data.fields:[]);\n";
if (source.includes(before)) {
  source = source.replace(before, after);
} else if (!source.includes(after)) {
  throw new Error('Nie znaleziono deklaracji fields w renderForm');
}

fs.writeFileSync(file, source);
console.log('Public reservation form fields reordered.');
