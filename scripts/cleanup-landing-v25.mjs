import fs from 'node:fs';

const files = {
  packages: 'src/components/PackagesSection.astro',
  final: 'src/components/FinalSections.astro',
  landing: 'src/components/LandingTop.astro',
  showcase: 'src/components/ProductShowcase.astro',
};

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function mustReplace(content, search, replacement, label) {
  if (!content.includes(search)) throw new Error(`Missing expected block: ${label}`);
  return content.replace(search, replacement);
}

function mustReplaceRegex(content, regex, replacement, label) {
  if (!regex.test(content)) throw new Error(`Missing expected pattern: ${label}`);
  return content.replace(regex, replacement);
}

// Packages: physically remove the ROI calculator, its runtime code and CSS.
let packages = read(files.packages);
packages = mustReplaceRegex(
  packages,
  /\n    <div class="roi-calculator" data-roi-calculator>[\s\S]*?\n    <div class="section-head packages-head"/,
  '\n\n    <div class="section-head packages-head"',
  'ROI calculator markup',
);
packages = mustReplaceRegex(
  packages,
  /\n    const calculator = section\.querySelector\('\[data-roi-calculator\]'\);[\s\S]*?\n    updateRoi\(\);/,
  '',
  'ROI calculator JavaScript',
);
packages = mustReplaceRegex(
  packages,
  /\n  \.roi-calculator \{[\s\S]*?\n  \.roi-disclaimer \{[^\n]*\}\n/,
  '\n',
  'ROI calculator CSS',
);
packages = packages
  .replace('  .packages-section { padding: 104px 0; background: #f5f9f7; }', '  .packages-section { padding: 76px 0; background: #f5f9f7; }')
  .replace('    .roi-fields, .roi-result { grid-template-columns: 1fr; }\n', '')
  .replace('    .packages-section { padding: 72px 0; }', '    .packages-section { padding: 54px 0; }')
  .replace('    .roi-calculator { margin-bottom: 62px; padding: 22px; }\n', '')
  .replace('    .roi-plan-note { border-radius: 12px; line-height: 1.45; }\n', '')
  .replace('    .roi-result strong { font-size: 27px; }\n', '');
write(files.packages, packages);

// Final sections: remove calculator references from FAQ, fix comparison overlap,
// and tighten excessive vertical spacing between major sections.
let final = read(files.final);
final = mustReplace(
  final,
  "    a: 'Jeśli koordynowanie zespołu zabiera Ci realny czas albo ręczne pilnowanie powoduje pomyłki — właśnie z tym trzeba porównać cenę. Przy płatności rocznej pakiet ZESPÓŁ kosztuje efektywnie 124,17 zł brutto miesięcznie. Kalkulator wyżej pozwala dodatkowo odnieść abonament do wartości własnych zleceń.',",
  "    a: 'Jeśli koordynowanie zespołu zabiera Ci realny czas albo ręczne pilnowanie powoduje pomyłki — właśnie z tym trzeba porównać cenę. Przy płatności rocznej pakiet ZESPÓŁ kosztuje efektywnie 124,17 zł brutto miesięcznie.',",
  'FAQ calculator reference',
);
final = mustReplaceRegex(
  final,
  /\n  \{\n    q: 'Czy jeden dodatkowy klient może pokryć abonament\?',\n    a: '[^\n]*',\n  \},/,
  '',
  'FAQ calculator question',
);
final = final
  .replace('  .comparison-section { padding: 112px 0; background: #fff; }', '  .comparison-section { padding: 76px 0; background: #fff; }')
  .replace('  .comparison-table thead th { position: sticky; top: 82px;', '  .comparison-table thead th { position: static; top: auto;')
  .replace('  .trust-section { padding: 108px 0; background: #f6faf8; }', '  .trust-section { padding: 72px 0; background: #f6faf8; }')
  .replace('  .onboarding-section { padding: 94px 0; background: #fff; }', '  .onboarding-section { padding: 64px 0; background: #fff; }')
  .replace('  .faq-section { padding: 108px 0; background: #f7faf8; }', '  .faq-section { padding: 72px 0; background: #f7faf8; }')
  .replace('  .final-cta-section { padding: 96px 0; background: #fff; }', '  .final-cta-section { padding: 64px 0; background: #fff; }')
  .replace('    .comparison-section, .trust-section, .faq-section { padding: 76px 0; }', '    .comparison-section, .trust-section, .faq-section { padding: 54px 0; }')
  .replace('    .onboarding-section, .final-cta-section { padding: 70px 0; }', '    .onboarding-section, .final-cta-section { padding: 50px 0; }')
  .replace('    .comparison-table thead th { position: sticky; top: 0; }', '    .comparison-table thead th { position: static; top: auto; }');
write(files.final, final);

// Earlier landing sections: keep breathing room, but remove oversized gaps.
let landing = read(files.landing);
landing = landing
  .replace('  .problem-section { padding: 100px 0 88px; background: #f7faf8; }', '  .problem-section { padding: 72px 0 64px; background: #f7faf8; }')
  .replace('  .solution-section { padding: 108px 0; background: linear-gradient(135deg, #fff 15%, #f5fbf8 100%); }', '  .solution-section { padding: 72px 0; background: linear-gradient(135deg, #fff 15%, #f5fbf8 100%); }')
  .replace('  .lifecycle-section { padding: 110px 0 114px; background: #101914; color: #f8fbf9; }', '  .lifecycle-section { padding: 76px 0 80px; background: #101914; color: #f8fbf9; }')
  .replace('  .audience-section { padding: 108px 0 104px; background: #fff; }', '  .audience-section { padding: 72px 0; background: #fff; }');
write(files.landing, landing);

// Screenshot showcase had both very large section padding and very large gaps between rows.
let showcase = read(files.showcase);
showcase = showcase
  .replace('    padding: 112px 0 118px;', '    padding: 76px 0 80px;')
  .replace('    margin: 0 auto 72px;', '    margin: 0 auto 52px;')
  .replace('    margin-bottom: 96px;', '    margin-bottom: 68px;')
  .replace('    .showcase-section { padding: 84px 0 90px; }', '    .showcase-section { padding: 64px 0 68px; }')
  .replace('      margin-bottom: 70px;', '      margin-bottom: 52px;')
  .replace('    .showcase-section { padding: 66px 0 72px; }', '    .showcase-section { padding: 52px 0 56px; }')
  .replace('    .showcase-head { margin-bottom: 40px; text-align: left; }', '    .showcase-head { margin-bottom: 32px; text-align: left; }');
write(files.showcase, showcase);

for (const path of Object.values(files)) {
  const text = read(path);
  if (text.includes('data-roi-calculator') || text.includes('Kalkulator wyżej') || text.includes('Czy jeden dodatkowy klient może pokryć abonament?')) {
    throw new Error(`${path}: calculator residue remains`);
  }
}

console.log('OK: landing cleanup applied');
