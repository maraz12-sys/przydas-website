import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function versionParts(value) {
  assert.match(value, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, 'The Node pin must be an exact version');
  const parts = value.split('.').map(Number);
  assert.ok(parts.every(Number.isSafeInteger), 'The Node version components must be safe integers');
  return parts;
}

function assertCloudflareRuntime(selected, required, authoritative) {
  const match = required.match(/^>=\s*(\d+\.\d+\.\d+)\s+<(0|[1-9]\d*)$/);
  assert.ok(match, 'The Node engine range must have an explicit minimum and an exclusive major upper bound');
  const [major, minor, patch] = versionParts(selected);
  const [minMajor, minMinor, minPatch] = versionParts(match[1]);
  const upperMajor = Number(match[2]);
  assert.equal(minMajor, 24, 'The engine minimum must remain on the supported Node 24 LTS train');
  assert.equal(upperMajor, 25, 'The engine range must exclude other Node major versions');
  assert.ok(
    major > minMajor ||
      (major === minMajor && (minor > minMinor ||
        (minor === minMinor && patch >= minPatch))),
    `.nvmrc ${selected} does not satisfy package.json engines.node ${required}`
  );
  assert.ok(major < upperMajor, `.nvmrc ${selected} reaches the excluded Node major ${upperMajor}`);
  versionParts(authoritative);
  assert.equal(selected, authoritative, '.nvmrc must match the authoritative .node-version pin');
}

test('Cloudflare .nvmrc respects minimum supported Node.js version', () => {
  const selected = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
  const authoritative = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim();
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assertCloudflareRuntime(selected, String(packageJson.engines.node), authoritative);
});

test('the bounded Node 24 range accepts its minimum and a compatible later patch', () => {
  assert.doesNotThrow(() => assertCloudflareRuntime('24.22.2', '>=24.22.2 <25', '24.22.2'));
  assert.doesNotThrow(() => assertCloudflareRuntime('24.22.3', '>=24.22.2 <25', '24.22.3'));
});

test('the bounded Node range rejects stale, unsupported and mismatched Cloudflare pins', () => {
  for (const selected of ['24.22.1', '24.19.0', '23.11.0', '25.0.0', '26.0.0']) {
    assert.throws(() => assertCloudflareRuntime(selected, '>=24.22.2 <25', selected), /does not satisfy|excluded Node major/);
  }
  assert.throws(() => assertCloudflareRuntime('24.22.3', '>=24.22.2 <25', '24.22.2'), /authoritative/);
});

test('the Node contract rejects floating pins, malformed ranges and unbounded or wrong-major ranges', () => {
  for (const selected of ['24.x', '24.22', 'v24.22.2', '024.22.2', '24.22.2-beta.1']) {
    assert.throws(() => assertCloudflareRuntime(selected, '>=24.22.2 <25', selected), /exact version/);
  }
  for (const required of ['>=24.22.2', '^24.22.2', '>=24.22 <25', '>=24.22.2 <=25', '>=24.22.2 <25 || >=26.0.0', '>=024.22.2 <25']) {
    assert.throws(() => assertCloudflareRuntime('24.22.2', required, '24.22.2'), /explicit minimum|exact version/);
  }
  assert.throws(() => assertCloudflareRuntime('24.22.2', '>=22.19.0 <25', '24.22.2'), /supported Node 24/);
  assert.throws(() => assertCloudflareRuntime('24.22.2', '>=24.22.2 <26', '24.22.2'), /exclude other Node major/);
});
