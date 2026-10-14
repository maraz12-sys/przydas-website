import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Cloudflare .nvmrc respects minimum supported Node.js version', () => {
  const selected = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const required = String(packageJson.engines.node);
  const match = required.match(/^>=\s*(\d+)\.(\d+)\.(\d+)$/);
  assert.ok(match, 'The Node engine range must have an explicit minimum');
  const [major, minor, patch] = selected.split('.').map(Number);
  const [minMajor, minMinor, minPatch] = match.slice(1).map(Number);
  assert.ok(
    major > minMajor ||
      (major === minMajor && (minor > minMinor ||
        (minor === minMinor && patch >= minPatch))),
    `.nvmrc ${selected} does not satisfy package.json engines.node ${required}`
  );
});
