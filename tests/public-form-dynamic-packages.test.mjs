import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const src=readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
const extract=(begin,end)=>{
  const a=src.indexOf(begin),b=src.indexOf(end,a+begin.length);
  assert.ok(a>=0&&b>a,'Missing source contract: '+begin);
  return src.slice(a,b);
};
const dom={
  createElement(tag){
    assert.equal(tag,'option');
    return {value:'',textContent:''};
  },
};
const setupPackage=Function('document',
  extract('      const wirePackageDependencies = (form,fields) => {','      // Open the native date picker')+
  '\nreturn wirePackageDependencies;')(dom);

test('available packages follow selected event and clear stale values',()=>{
  const events={};
  const type={value:'',addEventListener:(name,callback)=>{events[name]=callback;}};
  const packageSelect={
    tagName:'SELECT',value:'',disabled:false,options:[],
    replaceChildren(){this.options=[];this.value='';},
    appendChild(value){this.options.push(value);}
  };
  const form={elements:{namedItem:key=>key==='rodzaj_wydarzenia'?type:key==='pakiet'?packageSelect:null}};
  const fields=[{key:'pakiet',options:['Standard','Bal','Wesele'],optionsByEvent:{Urodziny:['Standard','Bal'],Wesele:['Wesele']}}];
  setupPackage(form,fields);
  assert.equal(packageSelect.disabled,true,'No event: package picker must be blocked');
  type.value='Urodziny';
  events.change();
  assert.deepEqual(packageSelect.options.slice(1).map(option=>option.value),['Standard','Bal']);
  assert.equal(packageSelect.disabled,false);
  packageSelect.value='Bal';
  type.value='Wesele';
  events.change();
  assert.deepEqual(packageSelect.options.slice(1).map(option=>option.value),['Wesele']);
  assert.equal(packageSelect.value,'','Stale package cannot survive event change');
});

test('clicking the full date input requests native picker',()=>{
  const listeners={};
  const setDatePicker=Function('document',
    extract('      const wireDatePickers = form => {','      const wireInvoiceDependencies = form => {')+
    '\nreturn wireDatePickers;')(dom);
  setDatePicker({addEventListener:(name,fn)=>{listeners[name]=fn;}});
  let count=0;
  const input={disabled:false,readOnly:false,showPicker(){count++;}};
  listeners.click({target:{closest:selector=>selector==='input[type="date"]'?input:null}});
  assert.equal(count,1);
});
