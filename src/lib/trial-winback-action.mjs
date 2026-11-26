const messages = {
  invalid: 'Link jest nieprawidłowy lub wygasł. Otwórz najnowszą wiadomość od Przydasia.',
  retry: 'Nie udało się teraz połączyć z Przydasiem. Spróbuj ponownie za chwilę.',
  activated: 'Dodatkowe 30 dni dostępu do Przydasia jest już aktywne.',
  already_active: 'Dodatkowy dostęp do Przydasia jest już aktywny.',
  unsubscribed: 'Zgodę na marketing e-mailowy wycofano.',
};

const validStatuses = {
  activate: ['activated', 'already_active'],
  unsubscribe: ['unsubscribed'],
};

const endDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Warsaw',
});

export function mountTrialWinbackAction(root, pageLocation, request) {
  const button = root.querySelector('[data-winback-submit]');
  const status = root.querySelector('[data-winback-status]');
  const appLink = root.querySelector('[data-winback-app]');
  const { action, endpoint } = root.dataset;

  function showStatus(kind, text) {
    status.dataset.kind = kind;
    status.textContent = text;
  }

  const tokens = new URLSearchParams(pageLocation.hash.slice(1)).getAll('t');
  const token = tokens.length === 1 ? tokens[0] : '';
  if (!/^[A-Za-z0-9._~-]{16,512}$/.test(token)) {
    button.hidden = true;
    showStatus('error', messages.invalid);
    return;
  }

  button.disabled = false;
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    showStatus('pending', 'Sprawdzamy link…');

    try {
      const response = await request(endpoint, {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, token }),
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error('Temporarily unavailable');
      }

      const result = response.ok ? await response.json() : null;
      if (result?.ok !== true || !validStatuses[action].includes(result.status)) {
        button.hidden = true;
        showStatus('error', messages.invalid);
        status.focus();
        return;
      }

      let text = messages[result.status];
      if (action === 'activate') {
        const endsAt = typeof result.ends_at === 'string' ? Date.parse(result.ends_at) : NaN;
        if (Number.isFinite(endsAt)) {
          text += ' Dostęp jest ważny do ' + endDateFormatter.format(endsAt) + '.';
        }
        appLink.hidden = false;
      }

      button.hidden = true;
      showStatus('success', text);
      status.focus();
    } catch {
      showStatus('error', messages.retry);
      button.disabled = false;
    }
  });
}
