import { test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const headers = () => readFileSync(new URL('../_headers', import.meta.url), 'utf8');

test('blog list and article reveal content is not artificially delayed', () => {
  expect(/\.js\s+\.blog-page\s+\.reveal\s*,\s*\.js\s+\.article-page\s+\.reveal\s*\{[^}]*opacity:\s*1[^}]*transform:\s*none[^}]*transition:\s*none/s.test(css)).toBe(true);
});

test('shared CSS and JavaScript have bounded browser freshness', () => {
  expect(existsSync(new URL('../_headers', import.meta.url))).toBe(true);
  expect(headers()).toMatch(/\/styles\.css\s+Cache-Control:\s*public,\s*max-age=60/);
  expect(headers()).toMatch(/\/script\.js\s+Cache-Control:\s*public,\s*max-age=60/);
});
