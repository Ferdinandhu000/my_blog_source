import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import katex from 'katex';
import hljs from 'highlight.js';

const root = process.cwd();
const articleRoot = path.join(root, 'content', 'articles');
const generated = path.join(root, 'src', 'generated');
const origin = 'https://ferdinandhu.netlify.app';
const categoryEnglish = {
  'AI 与研究': 'AI & Research',
  '算法与数据结构': 'Algorithms & Data Structures',
  'Java 基础': 'Java Fundamentals',
  '桌面开发': 'Desktop Development',
  '开发实践': 'Development Practice',
  '随笔': 'Journal',
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function plain(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|~$\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

function stableId(slug) {
  const number = Number(BigInt(`0x${crypto.createHash('sha256').update(slug).digest('hex').slice(0, 12)}`) % 1000000n);
  return `X-${String(number).padStart(6, '0')}`;
}

export function loadArticles({ requireEnglish = true } = {}) {
  const articles = [];
  const slugs = new Set();
  const ids = new Set();
  for (const file of walk(articleRoot).sort()) {
    const name = path.basename(file);
    if (!name.endsWith('.md') || name.startsWith('_') || name.endsWith('.en.md')) continue;
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    if (data.draft === true) continue;
    const title = String(data.title ?? '').trim();
    const slug = String(data.slug ?? '').trim();
    const date = new Date(data.date);
    if (!title || !/^[a-z0-9][a-z0-9-]*$/.test(slug) || Number.isNaN(date.valueOf())) {
      throw new Error(`Invalid title, slug or date: ${path.relative(root, file)}`);
    }
    if (slugs.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
    slugs.add(slug);
    const id = stableId(slug);
    if (ids.has(id)) throw new Error(`Archive ID collision: ${slug} (${id}); set a distinct slug`);
    ids.add(id);
    const category = String(data.category ?? (Array.isArray(data.categories) ? data.categories[0] : data.categories) ?? '未分类').trim() || '未分类';
    const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
    const text = plain(content);
    const englishFile = file.replace(/(?:\.zh-cn)?\.md$/, '.en.md');
    let english;
    if (fs.existsSync(englishFile)) {
      const translated = matter(fs.readFileSync(englishFile, 'utf8'));
      const englishTitle = String(translated.data.title ?? '').trim();
      if (!englishTitle || String(translated.data.slug ?? '') !== slug || !translated.content.trim())
        throw new Error(`Invalid English article: ${path.relative(root, englishFile)}`);
      const englishText = plain(translated.content);
      english = {
        title: englishTitle,
        category: String(translated.data.category ?? categoryEnglish[category] ?? category).trim(),
        abstract: String(translated.data.description ?? englishText.slice(0, 180)).trim(),
        tags: Array.isArray(translated.data.tags) ? translated.data.tags.map(String) : tags,
        body: translated.content,
        text: englishText,
      };
    } else if (requireEnglish) throw new Error(`Missing English article: ${path.relative(root, englishFile)}`);
    articles.push({
      id, slug, url: `/p/${slug}/`, title, category,
      date: date.toISOString().slice(0, 10), lead: 'Ferdinand Hu',
      clearance: 'PUBLIC', abstract: String(data.description ?? text.slice(0, 140)).trim(),
      source: `/p/${slug}/`,
      tags, body: content, text, file, english,
    });
  }
  articles.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  if (!articles.length) throw new Error('No public Chinese articles found');
  return articles;
}

export function metadata(articles) {
  const categories = [...new Set(articles.map(article => article.category))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return {
    categories,
    columns: categories,
    records: articles.map(({ body, text, file, english, tags, slug, url, ...record }) => ({
      ...record, tags, slug, url,
      urlEn: `/en/p/${slug}/`,
      titleEn: english?.title ?? record.title,
      categoryEn: english?.category ?? record.category,
      abstractEn: english?.abstract ?? record.abstract,
      tagsEn: english?.tags ?? tags,
    })),
  };
}

export function writeIndex() {
  const articles = loadArticles();
  fs.mkdirSync(generated, { recursive: true });
  fs.writeFileSync(path.join(generated, 'articles.json'), JSON.stringify(metadata(articles), null, 2));
  return articles;
}

export function markdownRenderer() {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true, highlight(code, language) {
    const highlighted = language && hljs.getLanguage(language)
      ? hljs.highlight(code, { language }).value : md.utils.escapeHtml(code);
    return `<pre class="hljs"><code>${highlighted}</code></pre>`;
  } });
  md.use(anchor, { permalink: anchor.permalink.linkInsideHeader({ symbol: ' #', placement: 'after' }) });
  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, self) => {
    tokens[index].attrSet('loading', 'lazy');
    tokens[index].attrSet('decoding', 'async');
    return defaultImage(tokens, index, options, env, self);
  };
  // The migrated notes use both TeX delimiters and single-dollar inline math.
  md.inline.ruler.before('escape', 'inline_math', (state, silent) => {
    const rest = state.src.slice(state.pos);
    const opener = rest.startsWith('\\(') ? '\\(' : rest.startsWith('$') && !rest.startsWith('$$') ? '$' : null;
    if (!opener) return false;
    const closer = opener === '$' ? '$' : '\\)';
    const end = state.src.indexOf(closer, state.pos + opener.length);
    if (end < 0 || end === state.pos + opener.length || end >= state.posMax) return false;
    const expression = state.src.slice(state.pos + opener.length, end);
    if (opener === '$' && (/^\s|\s$|\n/.test(expression) || state.src[end + 1] === '$')) return false;
    if (!silent) {
      const token = state.push('math_inline', '', 0);
      token.content = expression;
    }
    state.pos = end + closer.length;
    return true;
  });
  md.block.ruler.before('fence', 'block_math', (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const line = state.src.slice(start, state.eMarks[startLine]).trim();
    const opener = line.startsWith('\\[') ? '\\[' : line.startsWith('$$') ? '$$' : null;
    if (!opener) return false;
    const closer = opener === '$$' ? '$$' : '\\]';
    let end = startLine;
    let source = line.slice(opener.length);
    while (!source.includes(closer) && end + 1 < endLine) {
      end++;
      source += '\n' + state.src.slice(state.bMarks[end], state.eMarks[end]);
    }
    const closeAt = source.indexOf(closer);
    if (closeAt < 0) return false;
    if (!silent) {
      const token = state.push('math_block', '', 0);
      token.content = source.slice(0, closeAt);
    }
    state.line = end + 1;
    return true;
  });
  md.renderer.rules.math_inline = (tokens, index) => katex.renderToString(tokens[index].content, { throwOnError: false, strict: 'ignore' });
  md.renderer.rules.math_block = (tokens, index) => katex.renderToString(tokens[index].content, { displayMode: true, throwOnError: false, strict: 'ignore' });
  return md;
}

export { origin, root };
