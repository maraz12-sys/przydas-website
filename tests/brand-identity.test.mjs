import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home=read('src/pages/index.astro');
const header=read('src/components/LandingTop.astro');
const showcase=read('src/components/ProductShowcase.astro');
const final=read('src/components/FinalSections.astro');
const legalFooter=read('src/components/LegalFooter.astro');
const mark=read('public/przydas-mark.svg');
test('brand uses real site green, same-sized eye and hole in lightweight vector SVG',()=>{
  assert.match(mark,/viewBox=/);
  assert.match(mark,/fill="#087f53"/);
  assert.match(mark,/<circle cx="383" cy="558" r="91"/);
  assert.match(mark,/M861 558A91 91/);
  assert.doesNotMatch(mark,/linearGradient|#02bf75/i);
});
test('every visible logo placement uses the shared mark, and the brand label includes a dot',()=>{
  assert.match(header,/<span>Przydaś\.<\/span>/);
  assert.match(legalFooter,/<strong>Przydaś\.<\/strong>/);
  assert.match(showcase,/showcase-proof-icon"><img src="\/przydas-mark\.svg"/);
  assert.match(home,/<title>Przydaś\. -/);
  assert.match(home,/'?name"?: "Przydaś\."/);
  assert.equal(final.includes('<footer class="site-footer">'),false);
  assert.equal(home.includes('.site-footer { display: none'),false);
});
test('decorators are restricted to three sections, decorative and mobile-safe',()=>{
  const sections=[header,showcase,final];
  for(const section of sections){ assert.match(section,/aria-hidden="true"/); assert.match(section,/brand-(rays|wave|spark)|brand-rays|brand-wave|brand-spark/); }
  for(const [file,marker] of [['ornament-rays.svg','stroke="#087f53"'],['ornament-wave.svg','stroke="#9ce0be"'],['ornament-spark.svg','fill="#087f53"']]) {
    const asset=read('public/'+file);assert.match(asset,/<svg/);assert.ok(asset.includes(marker));
  }
  assert.match(header,/@media \(max-width: 920px\)/);
  assert.match(showcase,/@media \(max-width: 920px\)/);
  assert.match(final,/@media \(max-width: 760px\)/);
});
