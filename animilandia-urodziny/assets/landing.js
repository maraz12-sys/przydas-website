(() => {
  'use strict';
  const config = window.AnimilandiaBirthday;
  if (!config) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const form = $('.form-card form');
  if (!form) return;
  const packageSelect = $('[name="packageId"]', form);
  const submitButton = $('[type="submit"]', form);
  const tokenState = { value: '', problem: '', busy: false };
  const requestId = crypto.randomUUID();
  const arrow = '<span aria-hidden="true">↗</span>';
  const fineprint = $('.form-fineprint', form);
  const banner = document.createElement('div'); banner.className = 'form-error'; banner.hidden = true; banner.setAttribute('role', 'alert'); submitButton.before(banner);
  const fieldError = (name, text) => {
    const control = form.elements.namedItem(name);
    if (!control) return;
    control.setAttribute('aria-invalid', 'true');
    const hint = document.createElement('span'); hint.className = 'field-error'; hint.id = 'error-' + name; hint.textContent = text;
    control.setAttribute('aria-describedby', hint.id);
    (control.closest('.field') || control.parentElement).append(hint);
  };
  const error = (message) => { banner.textContent = message; banner.hidden = !message; };
  const price = (value) => new Intl.NumberFormat('pl-PL').format(value);
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  let summary;
  function choose(id, scroll) {
    packageSelect.value = id;
    const p = config.packages.find(item => item.id === id);
    if (!summary) { summary = document.createElement('div'); summary.className = 'selected-summary'; $('.form-grid', form).after(summary); }
    summary.hidden = !p;
    if (p) { summary.replaceChildren(); const strong = document.createElement('strong'); strong.textContent = p.name; summary.append(strong, document.createTextNode(' · ' + p.hours + ' godz. · ' + price(p.price) + ' zł + dojazd')); }
    if (scroll) $('#formularz').scrollIntoView({ behavior: motion(), block: 'start' });
  }
  document.querySelectorAll('[data-package-id]').forEach(button => button.addEventListener('click', () => choose(button.dataset.packageId, true)));
  $('.help-link').addEventListener('click', () => choose('pomoc', true));
  packageSelect.addEventListener('change', () => choose(packageSelect.value, false));
  const more = $('[aria-controls="pozostale-pakiety"]');
  more.addEventListener('click', () => { const panel = $('#pozostale-pakiety'); panel.hidden = !panel.hidden; more.setAttribute('aria-expanded', String(!panel.hidden)); more.textContent = panel.hidden ? 'Odkryj 5 kolejnych pakietów ↓' : 'Zwiń dodatkowe pakiety ↑'; });
  const menu = $('.menu-toggle');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu'); $('.nav').classList.toggle('nav-open', open); });
  $('.nav').querySelectorAll('a').forEach(link => link.addEventListener('click', () => { $('.nav').classList.remove('nav-open'); menu.setAttribute('aria-expanded', 'false'); }));
  const extra = $('.extra-fields-toggle');
  function expandExtras(open) { const panel = $('#dodatkowe-informacje'); panel.hidden = !open; extra.setAttribute('aria-expanded', String(open)); extra.replaceChildren(document.createTextNode(open ? 'Zwiń dodatkowe informacje' : '+ Chcę podać więcej szczegółów')); const small = document.createElement('small'); small.textContent = 'opcjonalnie'; extra.append(small); }
  extra.addEventListener('click', () => expandExtras(extra.getAttribute('aria-expanded') !== 'true'));
  const dateInput = $('[name="eventDate"]', form); dateInput.min = config.today; dateInput.max = (Number(config.today.slice(0,4)) + 3) + '-12-31';
  form.addEventListener('invalid', (event) => { if ($('#dodatkowe-informacje').contains(event.target)) expandExtras(true); }, true);
  async function token() {
    try {
      const response = await fetch(config.tokenUrl, { cache: 'no-store', credentials: 'omit' }); const data = await response.json();
      if (!response.ok || typeof data.token !== 'string') throw new Error('token');
      tokenState.value = data.token; tokenState.problem = ''; if (!tokenState.busy) submitButton.disabled = false;
      if (banner.dataset.token === 'true') { error(''); delete banner.dataset.token; }
    } catch { tokenState.problem = 'Nie udało się połączyć z formularzem. Odśwież stronę lub zadzwoń: 731 350 127.'; error(tokenState.problem); banner.dataset.token = 'true'; }
  }
  token(); setInterval(token, 30 * 60 * 1000);
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); if (tokenState.busy || !tokenState.value) return;
    error(''); form.querySelectorAll('.field-error').forEach(node => node.remove()); form.querySelectorAll('[aria-invalid]').forEach(node => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
    const fields = new FormData(form); const get = name => String(fields.get(name) || '');
    const attribution = {}; const params = new URLSearchParams(location.search);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key => { const value = params.get(key); if (value) attribution[key] = value.slice(0,200); });
    if (document.referrer) { try { attribution.referrer = new URL(document.referrer).hostname.slice(0,200); } catch {} }
    const payload = { id: requestId, name: get('name'), phone: get('phone'), email: get('email'), eventDate: get('eventDate'), city: get('city'), packageId: packageSelect.value, childrenCount: get('childrenCount') ? Number(get('childrenCount')) : null, childrenAge: get('childrenAge'), notes: get('notes'), website: get('website'), contactAccepted: fields.get('contactAccepted') === 'on', token: tokenState.value, attribution };
    tokenState.busy = true; submitButton.disabled = true; submitButton.textContent = 'Wysyłanie zapytania…';
    try {
      const response = await fetch(config.submitUrl, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        error(data.error || data.message || 'Nie udało się wysłać zapytania. Spróbuj ponownie.');
        Object.entries(data.fields || {}).forEach(([name, messages]) => fieldError(name, messages[0]));
        if ((data.fields || {}).childrenCount || (data.fields || {}).notes) expandExtras(true);
        const invalid = $('[aria-invalid="true"]', form); if (invalid) invalid.focus();
        if (response.status === 403) await token();
      } else {
        const card = $('.form-card');
        card.innerHTML = '<div class="success-state" role="status" tabindex="-1"><span class="success-icon" aria-hidden="true">✓</span><p class="eyebrow">Pierwszy krok za nami!</p><h3>Dziękujemy<br>za zapytanie!</h3><p>Twoje zgłoszenie zostało zapisane. Skontaktujemy się z Tobą, aby potwierdzić dostępność terminu i ustalić szczegóły urodzin.</p><p class="small-text">Wysłanie zapytania nie potwierdza jeszcze rezerwacji.</p><a href="tel:+48731350127" class="button button-pink">731 350 127</a></div>';
        $('.success-state', card).focus({preventScroll:true}); $('#formularz').scrollIntoView({behavior:motion(),block:'start'});
        window.dispatchEvent(new CustomEvent('animilandia:inquiry', { detail: { packageId: payload.packageId } }));
      }
    } catch { error('Przerwano połączenie. Spróbuj ponownie — wpisane dane są zachowane.'); }
    finally { tokenState.busy = false; submitButton.disabled = false; submitButton.innerHTML = 'Zapytaj o dostępność' + arrow; }
  });
})();
