import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { mountTrialWinbackAction } from '../src/lib/trial-winback-action.mjs';
import worker from '../src/prelaunch-worker.js';

const token = 'synthetic_dont_send-token.1234567890123456789';
const endpoint = 'https://example.invalid/functions/v1/trial-winback-links';
const signupSource = fs.readFileSync(new URL('../src/pages/test.astro', import.meta.url), 'utf8');
const expectedCopy = 'Zgadzam się otrzymywać od Przydasia e-mailem informacje o produkcie i oferty, w tym propozycje przedłużenia dostępu. Zgodę mogę wycofać w każdej chwili linkiem w wiadomości.';
const tick = () => new Promise((resolve) => setImmediate(resolve));

function setupAction(action, url, request) {
  const dom = new JSDOM(`
    <main data-action="${action}" data-endpoint="${endpoint}">
      <p role="status" tabindex="-1" data-winback-status></p>
      <button type="button" disabled data-winback-submit>Potwierdź</button>
      <a href="/" hidden data-winback-app>Przejdź do Przydasia</a>
    </main>`, { url });
  const root = dom.window.document.querySelector('main');
  mountTrialWinbackAction(root, dom.window.location, request);
  return {
    dom,
    button: root.querySelector('button'),
    status: root.querySelector('[role="status"]'),
    appLink: root.querySelector('a'),
  };
}

test('registration sends marketing proof only with optional, explicit consent', async () => {
  const formMarkup = signupSource.match(/<form id="trial-form"[\s\S]*?<\/form>/)?.[0];
  const clientScript = signupSource.match(/<script define:vars=\{\{[^\n]+ is:inline>\s*([\s\S]*?)<\/script>/)?.[1];
  const version = signupSource.match(/const marketingConsentVersion = '([^']+)'/)?.[1];
  assert.ok(formMarkup && clientScript);
  assert.equal(version, 'pl-email-v1-20261126');

  for (const checked of [false, true]) {
    const dom = new JSDOM(formMarkup + '<div data-success hidden></div>', {
      url: 'https://example.invalid/test/',
      runScripts: 'outside-only',
    });

    try {
      const { window } = dom;
      const calls = [];
      Object.assign(window, {
        supabaseUrl: 'https://example.invalid',
        supabasePublishableKey: 'synthetic-public-key',
        termsVersion: 'test-terms',
        privacyVersion: 'test-privacy',
        dpaVersion: 'test-dpa',
        marketingConsentVersion: version,
        fetch: async (url, options) => {
          calls.push([url, JSON.parse(options.body)]);
          return Response.json({});
        },
      });
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.eval(clientScript);

      const form = window.document.querySelector('#trial-form');
      const consent = form.elements.marketing_email;
      assert.equal(consent.required, false);
      assert.equal(consent.defaultChecked, false);
      assert.equal(consent.checked, false);
      assert.equal(consent.labels[0].querySelector('.consent-copy').textContent.trim(), expectedCopy);
      consent.checked = checked;

      const values = {
        first_name: 'Konto',
        last_name: 'Testowe',
        company_name: 'Firma testowa',
        email: 'trial@example.invalid',
        password: 'synthetic-password',
        password_repeat: 'synthetic-password',
      };
      for (const [name, value] of Object.entries(values)) form.elements[name].value = value;

      form.dispatchEvent(new window.Event('submit', { cancelable: true }));
      await tick();
      assert.equal(calls.length, 0);

      form.elements.legal.checked = true;
      form.dispatchEvent(new window.Event('submit', { cancelable: true }));
      await tick();
      assert.equal(calls.length, 1);
      const [[url, { data }]] = calls;
      assert.equal(url, 'https://example.invalid/auth/v1/signup');
      assert.equal(data.legal_acknowledged, true);
      assert.equal(form.hidden, true);
      if (checked) {
        assert.equal(data.marketing_email_opt_in, true);
        assert.equal(data.marketing_email_consent_version, version);
      } else {
        assert.equal(Object.hasOwn(data, 'marketing_email_opt_in'), false);
        assert.equal(Object.hasOwn(data, 'marketing_email_consent_version'), false);
      }
    } finally {
      dom.window.close();
    }
  }
});

test('links only make a single POST after explicit confirmation', async () => {
  for (const [action, route, result] of [
    ['activate', 'powrot', { ok: true, status: 'activated', ends_at: '2027-01-15T00:00:00.000Z' }],
    ['activate', 'powrot', { ok: true, status: 'already_active' }],
    ['unsubscribe', 'wypisz', { ok: true, status: 'unsubscribed' }],
  ]) {
    const calls = [];
    let complete;
    const request = (...args) => {
      calls.push(args);
      return new Promise((resolve) => { complete = resolve; });
    };
    const { dom, button, status, appLink } = setupAction(action, `https://example.invalid/${route}/#t=${token}`, request);

    try {
      assert.equal(button.disabled, false);
      assert.equal(calls.length, 0);
      assert.equal(status.textContent, '');
      button.click();
      button.click();
      assert.equal(button.disabled, true);
      assert.equal(status.dataset.kind, 'pending');
      assert.equal(calls.length, 1);
      const [[url, options]] = calls;
      assert.equal(url, endpoint);
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.referrerPolicy, 'no-referrer');
      assert.equal(options.redirect, 'error');
      assert.deepEqual(JSON.parse(options.body), { action, token });
      complete(Response.json(result));

      await tick();
      assert.equal(status.dataset.kind, 'success');
      assert.equal(button.hidden, true);
      assert.equal(appLink.hidden, action === 'unsubscribe');
      assert.equal(dom.window.document.activeElement, status);
      if (result.ends_at) assert.match(status.textContent, /15 stycznia 2027/);
      assert.doesNotMatch(status.textContent, /synthetic_dont_send/);
    } finally {
      dom.window.close();
    }
  }
});

test('query, missing, or ambiguous tokens never enable confirmation', () => {
  for (const url of [
    `https://example.invalid/wypisz/?t=${token}`,
    'https://example.invalid/wypisz/',
    `https://example.invalid/wypisz/#t=${token}&t=${token}`,
  ]) {
    const { dom, button, status } = setupAction('unsubscribe', url, () => assert.fail('Unexpected network request'));
    try {
      button.click();
      assert.equal(button.disabled, true);
      assert.equal(button.hidden, true);
      assert.match(status.textContent, /nieprawidłowy lub wygasł/);
    } finally {
      dom.window.close();
    }
  }
});

test('temporary network errors can be retried and invalid replies never expose server data', async () => {
  let calls = 0;
  const { dom, button, status, appLink } = setupAction('activate', `https://example.invalid/powrot/#t=${token}`, () => {
    calls++;
    if (calls === 1) return Promise.reject(new Error(token));
    if (calls === 2) return Promise.resolve(new Response(null, { status: 503 }));
    return Promise.resolve(Response.json({ ok: true, status: 'unsubscribed', detail: token }));
  });

  try {
    for (let index = 0; index < 2; index++) {
      button.click();
      await tick();
      assert.equal(status.dataset.kind, 'error');
      assert.match(status.textContent, /Spróbuj ponownie/);
      assert.equal(button.disabled, false);
    }
    button.click();
    await tick();
    assert.equal(calls, 3);
    assert.equal(button.hidden, true);
    assert.equal(appLink.hidden, true);
    assert.match(status.textContent, /nieprawidłowy lub wygasł/);
    assert.doesNotMatch(status.textContent, /synthetic_dont_send/);
  } finally {
    dom.window.close();
  }
});

test('the worker returns private headers only for the campaign action routes', async () => {
  const env = {
    ASSETS: {
      fetch: async () => new Response('static page', {
        headers: {
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Content-Security-Policy': "default-src 'self'",
        },
      }),
    },
  };

  for (const path of ['/powrot', '/powrot/', '/wypisz', '/wypisz/']) {
    const response = await worker.fetch(new Request('https://example.invalid' + path), env);
    assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
    assert.equal(response.headers.get('Content-Security-Policy'), "default-src 'self'");
    assert.equal(await response.text(), 'static page');
  }

  const signup = await worker.fetch(new Request('https://example.invalid/test/'), env);
  assert.equal(signup.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.equal(signup.headers.has('X-Robots-Tag'), false);
});
