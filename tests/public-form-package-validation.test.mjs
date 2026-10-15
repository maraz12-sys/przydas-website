import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const src=readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
const start=src.indexOf('      const wirePackageDependencies = form => {');
const end=src.indexOf('      const wireDatePickerAccess = form => {',start);
assert.ok(start>=0&&end>start,'package binding missing');
class FakeOption { constructor(text,value){this.text=text;this.value=value;} }
const choices=[
  {value:'u1',label:'Urodziny',event_types:['Urodziny'],restricted:true},
  {value:'p1',label:'Piknik',event_types:['Piknik'],restricted:true},
  {value:'inactive',label:'Nieaktywny typ',event_types:[],restricted:true},
  {value:'general',label:'Uniwersalny',event_types:[],restricted:false},
];
const wire=Function('Option','formData',src.slice(start,end)+'\nreturn wirePackageDependencies;')(FakeOption,{fields:[{key:'pakiet',package_choices:choices}]});
function setup(){
  const events={change:[],input:[]};
  const event={value:'',addEventListener(name,cb){events[name].push(cb);},set(value){this.value=value;for(const cb of events.change)cb();}};
  const select={value:'',options:[],replaceChildren(...nodes){this.options=[...nodes];this.value='';},add(option){this.options.push(option);}};
  const form={elements:{namedItem(key){if(key==='rodzaj_wydarzenia')return event;if(key==='pakiet')return select;return null;}}};
  wire(form);
  return {event,select};
}
test('active event type shows its packages and globally allowed packages only',()=>{
  const {event,select}=setup();
  assert.deepEqual(select.options.map(x=>x.value),['']);
  event.set('URODZINY');
  assert.deepEqual(select.options.map(x=>x.value),['','u1','general']);
  select.value='u1';
  event.set('Piknik');
  assert.deepEqual(select.options.map(x=>x.value),['','p1','general']);
  assert.equal(select.value,'');
});
test('clicking anywhere in date field activates native picker when supported',()=>{
 assert.match(src,/::-webkit-calendar-picker-indicator\{position:absolute;inset:0;width:100%;height:100%/);
 assert.match(src,/wireDatePickerAccess\(form\);/);
});
