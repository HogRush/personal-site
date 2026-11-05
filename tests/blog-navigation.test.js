import { test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const headers = () => readFileSync(new URL('../_headers', import.meta.url), 'utf8');
const blog = readFileSync(new URL('../blog.html', import.meta.url), 'utf8');

test('published blog articles are prefetched with short-lived browser freshness', () => {
  const articleLinks = [...blog.matchAll(/href="(\/blog\/[^"#]+)"/g)].map(match => match[1]);
  const prefetched = [...blog.matchAll(/<link rel="prefetch" href="(\/blog\/[^"#]+)"/g)].map(match => match[1]);
  expect([...new Set(prefetched)].sort()).toEqual([...new Set(articleLinks)].sort());
  expect(headers()).toMatch(/\/blog\/\*\s+Cache-Control:\s*public,\s*max-age=60/);
});

test('blog entry is animated without waiting for scroll observers', () => {
  expect(css).toMatch(/@keyframes blog-enter/);
  expect(/\.blog-page[^{}]*\.reveal\s*\{[^}]*animation:\s*blog-enter/s.test(css)).toBe(true);
  expect(/\.article-page[^{}]*\.reveal\s*\{[^}]*animation:\s*blog-enter/s.test(css)).toBe(true);
  expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
  expect(/\.blog-item:nth-child\(2\)\s*\{\s*animation-delay:\s*110ms/.test(css)).toBe(true);
});

test('shared CSS and JavaScript have bounded browser freshness', () => {
  expect(existsSync(new URL('../_headers', import.meta.url))).toBe(true);
  expect(headers()).toMatch(/\/styles\.css\s+Cache-Control:\s*public,\s*max-age=60/);
  expect(headers()).toMatch(/\/script\.js\s+Cache-Control:\s*public,\s*max-age=60/);
});
