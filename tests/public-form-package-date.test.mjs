import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
const start=source.indexOf('const wirePackageDependencies = form => {');
const end=source.indexOf('const wireDatePickerAccess = form => {',start);
assert.ok(start>0&&end>start,'event package dependency is installed');
const wire=(new Function('formData','Option',source.slice(start,end)+'return wirePackageDependencies;'))(
  {fields:[{key:'pakiet',package_choices:[
    {value:'A',label:'Pakiet urodzinowy',event_types:['Urodziny']},
    {value:'B',label:'Pakiet piknikowy',event_types:['Piknik']},
    {value:'G',label:'Pakiet ogólny',event_types:[]}
  ]}]},
  class Option {constructor(text,value){this.text=text;this.value=value}}
);
function setup(withEvent=true){
  const listeners={};
  const event=withEvent?{value:'',addEventListener(type,fn){listeners[type]=fn}}:null;
  const select={value:'',options:[],replaceChildren(...items){this.options=[...items];this.value=''},add(item){this.options.push(item)}};
  const form={elements:{namedItem(name){return name==='pakiet'?select:name==='rodzaj_wydarzenia'?event:null}}};
  wire(form);
  return {select,event,change(value){event.value=value;listeners.change()}};
}
test('package dropdown shows only choices for selected event and common packages',()=>{
  const ui=setup();
  assert.deepEqual(ui.select.options.map(x=>x.value),['']);
  ui.change('Urodziny');
  assert.deepEqual(ui.select.options.map(x=>x.value),['','A','G']);
  ui.select.value='A';
  ui.change('Piknik');
  assert.deepEqual(ui.select.options.map(x=>x.value),['','B','G']);
  assert.equal(ui.select.value,'');
  ui.change('Urodziny');
  assert.deepEqual(ui.select.options.map(x=>x.value),['','A','G']);
});
test('forms without event type keep all package choices',()=>{
  assert.deepEqual(setup(false).select.options.map(x=>x.value),['','A','B','G']);
});
test('date picker uses the entire date input and native picker',()=>{
  assert.match(source,/input\[type="date"\]::-webkit-calendar-picker-indicator/);
  assert.match(source,/input\.showPicker\(\)/);
  assert.match(source,/wireDatePickerAccess\(form\)/);
});
