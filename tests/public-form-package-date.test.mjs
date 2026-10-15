import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const src=readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
const start=src.indexOf('      const wirePackageDependencies = (form,packages) => {');
const end=src.indexOf('      const wireDatePickerHitbox = form => {',start);
assert.ok(start>=0 && end>start,'Dynamic package binding missing');

class FakeOption {
  constructor(text,value){this.text=text;this.value=value;}
}
const wire=Function('Option',src.slice(start,end)+'\nreturn wirePackageDependencies;')(FakeOption);
const makeForm=()=>{
  const listeners={change:[],input:[]};
  const eventControl={
    value:'',
    addEventListener(type,callback){listeners[type].push(callback);},
    change(value){this.value=value;for(const fn of listeners.change)fn();}
  };
  const packageControl={
    value:'',
    options:[],
    replaceChildren(...nodes){this.options=[...nodes];this.value='';},
    add(node){this.options.push(node);}
  };
  return {
    eventControl,
    packageControl,
    form:{
      querySelector(selector){return selector==='[data-package-select="true"]'?packageControl:null;},
      elements:{namedItem(name){return name==='rodzaj_wydarzenia'?eventControl:null;}}
    }
  };
};

test('client packages follow the configured event type; stale choice is cleared',()=>{
  const {form,eventControl,packageControl}=makeForm();
  wire(form,[
    {value:'u1',label:'Pakiet Urodzinowy',restricted:true,rodzaje_wydarzen_nazwy:['Urodziny']},
    {value:'p1',label:'Pakiet Piknikowy',restricted:true,rodzaje_wydarzen_nazwy:['Piknik']},
    {value:'g1',label:'Pakiet Ogólny',restricted:false,rodzaje_wydarzen_nazwy:[]},
    {value:'hidden',label:'Nieaktywny rodzaj',restricted:true,rodzaje_wydarzen_nazwy:[]},
  ]);
  assert.deepEqual(packageControl.options.map(option=>option.value),['']);
  eventControl.change('URODZINY');
  assert.deepEqual(packageControl.options.map(option=>option.value),['','u1','g1']);
  packageControl.value='u1';
  eventControl.change('Piknik');
  assert.equal(packageControl.value,'');
  assert.deepEqual(packageControl.options.map(option=>option.value),['','p1','g1']);
});

test('native date picker is clickable over the whole input, including mobile',()=>{
  assert.match(src,/::-webkit-calendar-picker-indicator\{position:absolute;inset:0;width:100%;height:100%/);
  assert.match(src,/wireDatePickerHitbox\(form\);/);
  assert.match(src,/typeof input\.showPicker==='function'/);
});

test('package field is a dependent select, never an uncontrolled free-text field',()=>{
  assert.match(src,/if\(field\.key==='pakiet'\) return `<label/);
  assert.match(src,/data-package-select="true"/);
  assert.match(src,/wirePackageDependencies\(form,data\.packages\);/);
});
