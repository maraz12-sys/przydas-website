import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packages = read('src/components/PackagesSection.astro');
const finalSections = read('src/components/FinalSections.astro');
const trial = read('src/pages/test.astro');
const privacy = read('src/pages/polityka-prywatnosci.astro');
const providers = read('src/pages/podprocesorzy.astro');
const terms = read('src/pages/regulamin.astro');
const security = read('src/pages/bezpieczenstwo.astro');
const contact = read('src/pages/kontakt.astro');
const paymentInfo = read('src/pages/platnosci.astro');

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
const splitLegalVersions =
  trial.includes("terms_version: termsVersion") &&
  trial.includes("privacy_version: privacyVersion") &&
  trial.includes("dpa_version: dpaVersion");
check(splitLegalVersions, 'Legal document version metadata missing');
check(trial.includes("const termsVersion = '2026-10-01.1'"), 'Terms version constant mismatch');
check(trial.includes("const privacyVersion = '2.1'"), 'Privacy version constant mismatch');
check(trial.includes("const dpaVersion = '2026-09-04.1'"), 'DPA version constant mismatch');
check(trial.includes('href="/regulamin"'), 'Terms link missing');
check(trial.includes('href="/polityka-prywatnosci"'), 'Privacy link missing');
check(trial.includes('href="/umowa-powierzenia"'), 'Data-processing agreement link missing');
check(trial.includes('/auth/v1/signup'), 'Supabase Auth signup call missing');
check(trial.includes('Bez karty') || trial.includes('bez podawania karty'), 'No-card trial message missing');
check(privacy.includes('PayU S.A.') && privacy.includes('odrębny administrator'), 'Privacy policy does not disclose PayU role');
check(privacy.includes('nie otrzymuje pełnego numeru karty') && privacy.includes('CVV/CVC'), 'Privacy policy does not explain card data handling');
check(providers.includes('PayU S.A.') && providers.includes('odrębny administrator'), 'Provider page does not disclose PayU role');
check(terms.includes('PayU S.A.') && terms.includes('czas nieokreślony') && terms.includes('Plan i płatności'), 'Terms do not describe PayU recurring subscription');
check(security.includes('Secure Form') && security.includes('CVV/CVC'), 'Security page does not explain PayU card handling');
check(terms.includes('+48 791 910 817') && contact.includes('+48 791 910 817'), 'PayU contact phone missing');
check(terms.includes('nie później niż w ciągu 1 dnia roboczego'), 'PayU fulfilment time missing from terms');
check(terms.includes('14 dni') && terms.includes('ul. Boczna 23, 86-031 Osielsko'), 'Withdrawal/contact address incomplete');
check(terms.includes('nie udziela odrębnej gwarancji handlowej'), 'Warranty/after-sales statement missing');
check(paymentInfo.includes('START') && paymentInfo.includes('ZESPÓŁ') && paymentInfo.includes('BIZNES'), 'Payment information page does not list plans');
check(paymentInfo.includes('Plan i płatności') && paymentInfo.includes('Zamawiam i płacę'), 'Payment information page does not explain the checkout path');
check(paymentInfo.includes('nie ma kosztów wysyłki ani dostawy'), 'Payment information page does not explain delivery/shipping costs');
check(paymentInfo.includes('Wymagania techniczne') && paymentInfo.includes('JavaScript'), 'Digital service technical requirements missing');

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
  payuSelected: true,
  payuConnected: false,
}, null, 2));
