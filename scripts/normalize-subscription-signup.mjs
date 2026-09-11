import fs from 'node:fs';

const packagesPath = 'src/components/PackagesSection.astro';
const finalPath = 'src/components/FinalSections.astro';

const update = (path, transform) => {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(path, after, 'utf8');
  return after !== before;
};

const packagesChanged = update(packagesPath, (source) => {
  let out = source;

  out = out.replace(
    'href="#start" data-plan={plan.name}',
    'href="/test" data-plan={plan.name}'
  );

  const planLine = "        const plan = button.getAttribute('data-plan') || '';";
  const persistenceBlock = `${planLine}\n        try {\n          sessionStorage.setItem('przydas_trial_plan', plan);\n          sessionStorage.setItem('przydas_trial_billing', section.getAttribute('data-billing') || 'monthly');\n        } catch {\n          // sessionStorage can be unavailable in strict privacy modes; /test still works without it.\n        }`;

  if (!out.includes('przydas_trial_billing')) {
    if (!out.includes(planLine)) throw new Error('PackagesSection: nie znaleziono miejsca zapisu wybranego planu.');
    out = out.replace(planLine, persistenceBlock);
  }

  if (!out.includes('href="/test" data-plan={plan.name}')) {
    throw new Error('PackagesSection: CTA pakietu nie prowadzi do /test.');
  }
  return out;
});

const finalChanged = update(finalPath, (source) => {
  let out = source;

  const oldCopy = `        Na start dostajesz 30 dni pełnego pakietu BIZNES bez opłat. W pierwszej fazie sprzedaży konta uruchamiamy ręcznie, żeby pomóc dobrze ustawić firmę i nie zostawić Cię z kolejnym systemem do samodzielnego rozgryzienia. Napisz do nas — uruchomimy test i pomożemy zacząć.`;
  const newCopy = `        Na start dostajesz 30 dni pełnego pakietu BIZNES bez opłat. Zakładasz konto samodzielnie, potwierdzasz adres e-mail, a system automatycznie tworzy Twoją firmę i uruchamia test. Nie podajesz karty i sam okres próbny nie uruchamia płatnej subskrypcji.`;
  if (out.includes(oldCopy)) out = out.replace(oldCopy, newCopy);

  out = out.replace(
    'href="mailto:sprzedaz@xn--przyda-8ib.pl?subject=Chc%C4%99%20uruchomi%C4%87%20bezp%C5%82atny%20test%20Przydasia"',
    'href="/test"'
  );

  if (out.includes('W pierwszej fazie sprzedaży konta uruchamiamy ręcznie')) {
    throw new Error('FinalSections: pozostała ręczna ścieżka uruchamiania triala.');
  }
  if (!out.includes('class="button final-primary" href="/test"')) {
    throw new Error('FinalSections: główne CTA triala nie prowadzi do /test.');
  }
  return out;
});

console.log(JSON.stringify({ ok: true, packagesChanged, finalChanged }));
