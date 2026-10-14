import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('npm 10 clean-install lock contains the native runtime dependency records', () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  for (const name of ['@emnapi/core', '@emnapi/runtime']) {
    const entry = lock.packages[`node_modules/${name}`];
    assert.ok(entry, `Missing package-lock entry for ${name}`);
    assert.equal(entry.version, '1.11.3');
    assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\/);
    assert.match(entry.integrity, /^sha512-/);
    assert.equal(entry.optional, true);
  }
  assert.equal(lock.packages[''].dependencies.astro, '7.3.2');
});
