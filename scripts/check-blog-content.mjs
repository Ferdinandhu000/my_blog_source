import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { loadArticles, markdownRenderer, metadata, writeIndex, root } from './content-pipeline.mjs';
import { profile } from '../src/site-content.js';

const articles = loadArticles();
const before = metadata(articles);
assert.equal(before.records.length, articles.length);
assert.ok(before.categories.length > 0);
assert.equal(new Set(articles.map(article => article.url)).size, articles.length);

const renderer = markdownRenderer();
const markdownFeatures = renderer.render('- [ ] Open\n- [x] Done\n\n```js\nconst answer = 42;\n```\n');
assert.match(markdownFeatures, /class="task-checkbox" type="checkbox" disabled aria-label="Incomplete"/);
assert.match(markdownFeatures, /class="task-checkbox" type="checkbox" disabled checked aria-label="Complete"/);
assert.match(markdownFeatures, /class="code-copy"[^>]*data-copy-code/);
const renderedArticles = new Map();
for (const article of articles) {
  for (const [language, version] of [['zh', article], ['en', article.english]]) {
    const url = `${language === 'en' ? '/en' : ''}${article.url}`;
    const html = renderer.render(version.body).replace(/href="\/p\//g, language === 'en' ? 'href="/en/p/' : 'href="/p/');
    renderedArticles.set(url, html);
    const readable = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '');
    assert.ok(!/\*\*/.test(readable), `Unrendered bold Markdown: ${url}`);
    assert.ok(!/\]\s+\(https?:\/\/|\]https?:\/\/|\]\(\)|\]\s*\/p\//.test(version.body), `Malformed Markdown link: ${url}`);
  }
}
for (const [url, html] of renderedArticles) {
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
    assert.ok(href, `Empty article link: ${url}`);
    const target = new URL(href, `https://ferdinandhu.netlify.app${url}`);
    if (target.origin !== 'https://ferdinandhu.netlify.app') continue;
    const targetHtml = renderedArticles.get(target.pathname);
    if (/^\/(?:en\/)?p\//.test(target.pathname)) assert.ok(targetHtml, `Missing article target: ${url} -> ${href}`);
    if (targetHtml && target.hash) assert.ok(targetHtml.includes(`id="${target.hash.slice(1)}"`), `Missing article heading: ${url} -> ${href}`);
  }
}

const fixture = path.join(root, 'content', 'articles', 'temporary-content-check.zh-cn.md');
const englishFixture = path.join(root, 'content', 'articles', 'temporary-content-check.en.md');
const category = '临时分类验证';
try {
  fs.writeFileSync(fixture, `---\ntitle: 分类动态验证\nslug: temporary-category-check\ndate: 2026-01-01\ncategory: ${category}\n---\n\n内容检索验证。\n`);
  fs.writeFileSync(englishFixture, `---\ntitle: Dynamic category check\nslug: temporary-category-check\ndate: 2026-01-01\ncategory: Temporary test\n---\n\nContent search validation.\n`);
  const withFixture = metadata(writeIndex());
  assert.equal(withFixture.records.length, before.records.length + 1);
  assert.ok(withFixture.categories.includes(category));
  assert.ok(withFixture.records.some(record => record.slug === 'temporary-category-check'));
} finally {
  fs.rmSync(fixture, { force: true });
  fs.rmSync(englishFixture, { force: true });
  writeIndex();
}

const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  const search = JSON.parse(fs.readFileSync(path.join(dist, 'search-index.json'), 'utf8'));
  const englishSearch = JSON.parse(fs.readFileSync(path.join(dist, 'en', 'search-index.json'), 'utf8'));
  assert.equal(search.length, articles.length);
  assert.equal(englishSearch.length, articles.length);
  for (const article of articles) {
    const page = path.join(dist, 'p', article.slug, 'index.html');
    assert.ok(fs.existsSync(page), `Missing ${article.url}`);
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /class="unified-direct"/, `Missing unified reader shell: ${article.slug}`);
    assert.match(html, /giscus\.app\/client\.js/, `Missing comments: ${article.slug}`);
    assert.match(html, new RegExp(profile.nameZh), `Missing Chinese byline: ${article.slug}`);
    assert.match(html, /3D INTERFACE BY LBEILC/, `Missing source credit: ${article.slug}`);
    assert.match(html, /src="\/code-copy\.js"/, `Missing code copy handler: ${article.slug}`);
    assert.doesNotMatch(html, /src="\/assets\/index-/, `3D bundle on direct article: ${article.slug}`);
    assert.ok(search.some(item => item.url === article.url), `Missing search entry: ${article.slug}`);
    const englishPage = path.join(dist, 'en', 'p', article.slug, 'index.html');
    assert.ok(fs.existsSync(englishPage), `Missing /en${article.url}`);
    const englishHtml = fs.readFileSync(englishPage, 'utf8');
    assert.match(englishHtml, /<html lang="en">/, `Wrong language: ${article.slug}`);
    assert.match(englishHtml, /giscus\.app\/client\.js/, `Missing English comments: ${article.slug}`);
    assert.match(englishHtml, new RegExp(profile.nameEn), `Missing English byline: ${article.slug}`);
    assert.doesNotMatch(englishHtml, /src="\/assets\/index-/, `3D bundle on direct English article: ${article.slug}`);
    assert.ok(englishSearch.some(item => item.url === `/en${article.url}`), `Missing English search entry: ${article.slug}`);
  }
  for (const route of ['archives', 'terminal', 'search', 'about']) {
    const chinesePage = fs.readFileSync(path.join(dist, route, 'index.html'), 'utf8');
    const englishPage = fs.readFileSync(path.join(dist, 'en', route, 'index.html'), 'utf8');
    assert.match(chinesePage, /class="unified-direct"/);
    assert.match(englishPage, /<html lang="en">/);
    assert.match(chinesePage, /3D INTERFACE BY LBEILC/);
    assert.match(englishPage, /3D INTERFACE BY LBEILC/);
  }
  const aboutZh = fs.readFileSync(path.join(dist, 'about', 'index.html'), 'utf8');
  const aboutEn = fs.readFileSync(path.join(dist, 'en', 'about', 'index.html'), 'utf8');
  assert.ok(aboutZh.includes(profile.bioZh) && aboutZh.includes(`mailto:${profile.email}`));
  assert.ok(aboutEn.includes(profile.bioEn) && aboutEn.includes(profile.linkedin));
  assert.match(aboutZh, /p\.language='zh';p\.languageChosen=true;/);
  assert.match(aboutEn, /p\.language='en';p\.languageChosen=true;/);
  assert.doesNotMatch(aboutZh, /CURRICULUM VITAE|内容整理中/);
  assert.ok(fs.existsSync(path.join(dist, 'site-content.js')), 'Missing direct terminal profile data');
  assert.ok(fs.existsSync(path.join(dist, 'licenses', 'RHINELABUI-LICENSE')));
  const englishHome = fs.readFileSync(path.join(dist, 'en', 'index.html'), 'utf8');
  assert.match(englishHome, /<html lang="en">/);
  assert.match(englishHome, /src="\/assets\/index-[^"]+\.js"/);
  assert.doesNotMatch(englishHome, /location\.replace\("\/"\)/);
  const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const languageRedirect = home.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(languageRedirect, 'Missing home language redirect');
  for (const [saved, expected] of [
    [null, '/en/?q=1#section'],
    [{ language: 'en' }, '/en/?q=1#section'],
    [{ language: 'zh' }, '/en/?q=1#section'],
    [{ language: 'zh', languageChosen: true }, null],
  ]) {
    let redirected = null;
    vm.runInNewContext(languageRedirect, {
      location: { pathname: '/', search: '?q=1', hash: '#section', replace: value => { redirected = value; } },
      localStorage: { getItem: () => saved && JSON.stringify(saved) },
    });
    assert.equal(redirected, expected, `Unexpected home route for saved language ${saved}`);
  }
  assert.match(fs.readFileSync(path.join(dist, 'en', 'archives', 'index.html'), 'utf8'), /class="unified-direct-close" href="\/en\/"/);
  assert.ok(fs.existsSync(path.join(dist, 'assets', 'archive-backdrop.webp')));
}
console.log(`Content checks passed: ${articles.length} articles, ${before.categories.length} categories.`);
