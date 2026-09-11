import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packages = read('src/components/PackagesSection.astro');
const finalSections = read('src/components/FinalSections.astro');
const trial = read('src/pages/test.astro');

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(packages.includes("monthlyPrice: '59 zł'") && packages.includes("annualPrice: '590 zł'"), 'START price mismatch');
check(packages.includes("monthlyPrice: '149 zł'") && packages.includes("annualPrice: '1 490 zł'"), 'ZESPÓŁ price mismatch');
check(packages.includes("monthlyPrice: '249 zł'") && packages.includes("annualPrice: '2 490 zł'"), 'BIZNES price mismatch');
check(packages.includes('href="/test" data-plan={plan.name}'), 'Package CTA does not lead to /test');
check(!packages.includes('href="#start" data-plan={plan.name}'), 'Old #start package CTA still present');
check(packages.includes("sessionStorage.setItem('przydas_trial_plan'"), 'Selected plan is not persisted');
check(packages.includes("sessionStorage.setItem('przydas_trial_billing'"), 'Selected billing cycle is not persisted');

check(finalSections.includes('class="button final-primary" href="/test"'), 'Final CTA does not lead to /test');
check(!finalSections.includes('W pierwszej fazie sprzedaży konta uruchamiamy ręcznie'), 'Manual trial activation copy still present');
check(!/mailto:[^\"]+bezp/i.test(finalSections), 'Trial still uses a mailto CTA');

check(trial.includes("https://jyzajgbgkqlczjpoxxzt.supabase.co"), 'Trial page points to wrong Supabase project');
check(trial.includes('sb_publishable_'), 'Trial page does not use a publishable Supabase key');
check(!trial.includes('service_role'), 'Trial page must never contain a service-role credential');
check(trial.includes("przydas_selfservice_trial: true"), 'Self-service trial metadata flag missing');
check(trial.includes("legal_acknowledged: true"), 'Legal acknowledgement metadata missing');
check(trial.includes("terms_version: legalVersion"), 'Terms version metadata missing');
check(trial.includes("privacy_version: legalVersion"), 'Privacy version metadata missing');
check(trial.includes('href="/regulamin"'), 'Terms link missing');
check(trial.includes('href="/polityka-prywatnosci"'), 'Privacy link missing');
check(trial.includes('href="/umowa-powierzenia"'), 'Data-processing agreement link missing');
check(trial.includes('/auth/v1/signup'), 'Supabase Auth signup call missing');
check(trial.includes('Bez karty') || trial.includes('bez podawania karty'), 'No-card trial message missing');

if (failures.length) {
  console.error('SUBSCRIPTION READINESS AUDIT FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('SUBSCRIPTION READINESS AUDIT PASSED');
console.log(JSON.stringify({
  plans: ['START', 'ZESPÓŁ', 'BIZNES'],
  trialRoute: '/test',
  selfService: true,
  emailConfirmation: true,
  paymentRequiredForTrial: false,
  p24Connected: false,
}, null, 2));
