import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadArticles, metadata, writeIndex, root } from './content-pipeline.mjs';

const articles = loadArticles();
const before = metadata(articles);
assert.equal(before.records.length, articles.length);
assert.ok(before.categories.length > 0);
assert.equal(new Set(articles.map(article => article.url)).size, articles.length);

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
    assert.doesNotMatch(html, /src="\/assets\/index-/, `3D bundle on direct article: ${article.slug}`);
    assert.ok(search.some(item => item.url === article.url), `Missing search entry: ${article.slug}`);
    const englishPage = path.join(dist, 'en', 'p', article.slug, 'index.html');
    assert.ok(fs.existsSync(englishPage), `Missing /en${article.url}`);
    const englishHtml = fs.readFileSync(englishPage, 'utf8');
    assert.match(englishHtml, /<html lang="en">/, `Wrong language: ${article.slug}`);
    assert.match(englishHtml, /giscus\.app\/client\.js/, `Missing English comments: ${article.slug}`);
    assert.doesNotMatch(englishHtml, /src="\/assets\/index-/, `3D bundle on direct English article: ${article.slug}`);
    assert.ok(englishSearch.some(item => item.url === `/en${article.url}`), `Missing English search entry: ${article.slug}`);
  }
  for (const route of ['archives', 'terminal', 'search', 'about']) {
    assert.match(fs.readFileSync(path.join(dist, route, 'index.html'), 'utf8'), /class="unified-direct"/);
    assert.match(fs.readFileSync(path.join(dist, 'en', route, 'index.html'), 'utf8'), /<html lang="en">/);
  }
  assert.ok(fs.existsSync(path.join(dist, 'assets', 'archive-backdrop.webp')));
}
console.log(`Content checks passed: ${articles.length} articles, ${before.categories.length} categories.`);
