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
const category = '临时分类验证';
try {
  fs.writeFileSync(fixture, `---\ntitle: 分类动态验证\nslug: temporary-category-check\ndate: 2026-01-01\ncategory: ${category}\n---\n\n内容检索验证。\n`);
  const withFixture = metadata(writeIndex());
  assert.equal(withFixture.records.length, before.records.length + 1);
  assert.ok(withFixture.categories.includes(category));
  assert.ok(withFixture.records.some(record => record.slug === 'temporary-category-check'));
} finally {
  fs.rmSync(fixture, { force: true });
  writeIndex();
}

const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  const search = JSON.parse(fs.readFileSync(path.join(dist, 'search-index.json'), 'utf8'));
  assert.equal(search.length, articles.length);
  for (const article of articles) {
    assert.ok(fs.existsSync(path.join(dist, 'p', article.slug, 'index.html')), `Missing ${article.url}`);
    assert.ok(search.some(item => item.url === article.url), `Missing search entry: ${article.slug}`);
  }
}
console.log(`Content checks passed: ${articles.length} articles, ${before.categories.length} categories.`);
