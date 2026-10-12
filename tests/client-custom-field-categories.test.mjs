import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const src=readFileSync(new URL('../src/pages/formularz.astro',import.meta.url),'utf8');
const begin=src.indexOf('      const renderField = (field,hasInvoiceToggle=false) => {');
const end=src.indexOf('      const wireEventCategoryDependencies = form => {',begin);
assert.ok(begin>=0&&end>begin,'Conditional field renderer missing');
const snippet=src.slice(begin,end);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const renderField=Function('renderRawField','esc',snippet+'\nreturn renderField;')(() => '<label class="field">Label</label>',esc);

test('unrestricted custom field keeps the same HTML structure',()=>{
  assert.equal(renderField({key:'custom_1',custom:true,rodzaje_wydarzen_ids:[]}),'<label class="field">Label</label>');
});
test('inflatable-only custom field starts hidden with safe category metadata',()=>{
  const html=renderField({key:'custom_14',custom:true,rodzaje_wydarzen_ids:[6],rodzaje_wydarzen_nazwy:['Dmuchańce']});
  assert.match(html,/category-filter-wrap/);
  assert.match(html,/data-event-categories="\[&quot;Dmuchańce&quot;\]"/);
  assert.match(html,/ hidden>/);
});
test('dynamic visibility is bound to event type and disables inactive inputs',()=>{
  assert.match(src,/wireEventCategoryDependencies\(form\);/);
  assert.match(src,/eventControl\?\.addEventListener\('change',sync\)/);
  assert.match(src,/wrapper\.hidden=!visible/);
  assert.match(src,/control\.disabled=!visible/);
  assert.match(src,/if\(input\.disabled\)\{if\(invoiceDependentKeys\.has\(field\.key\)\)answers\[field\.key\]='';continue;\}/);
});
