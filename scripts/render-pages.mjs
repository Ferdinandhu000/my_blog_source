import fs from 'node:fs';
import path from 'node:path';
import { loadArticles, markdownRenderer, metadata, origin, root } from './content-pipeline.mjs';

const dist = path.join(root, 'dist');
const md = markdownRenderer();
const articles = loadArticles();
const publicIndex = metadata(articles);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const write = (relative, content) => {
  const target = path.join(dist, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
function shell(title, description, body, options = {}) {
  const url = options.url ?? '/';
  const aside = options.aside ?? '';
  const kind = options.kind ?? 'default';
  const content = kind === 'reader' ? `<div class="unified-reader unified-reader-grid">${body}${aside ? `<aside class="site-aside">${aside}</aside>` : ''}</div>` : body;
  const script = options.script ? `<script type="module" src="${options.script}"></script>` : '';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e8e5df"><title>${escape(title)} · HJ Blog</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${url}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/unified-shell.css"><link rel="stylesheet" href="/katex.min.css"><link rel="stylesheet" href="/highlight.css"></head><body class="unified-direct"><div class="unified-direct-shell"><section class="unified-window ${kind === 'reader' ? 'unified-window--reader' : ''} ${kind === 'terminal' ? 'unified-window--terminal' : ''}" aria-label="${escape(title)}"><div class="unified-top"><span>HJ BLOG / ${kind === 'terminal' ? '~' : kind === 'reader' ? 'ARTICLE' : kind === 'cv' ? 'CV' : 'ARCHIVE'}</span><a class="unified-direct-close" href="/" aria-label="关闭并返回三维首页">CLOSE ×</a></div><main class="unified-content" id="content">${content}</main></section></div>${script}<script>addEventListener('keydown',event=>{if(event.key==='Escape')location.assign('/')})</script><script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script><span id="busuanzi_container_site_pv" hidden><span id="busuanzi_value_site_pv"></span></span><span id="busuanzi_container_site_uv" hidden><span id="busuanzi_value_site_uv"></span></span><span id="busuanzi_container_page_pv" hidden><span id="busuanzi_value_page_pv"></span></span></body></html>`;
}
function toc(html) {
  const headings = [...html.matchAll(/<h([2-4])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)];
  return headings.length ? `<div class="aside-title">目录</div><nav class="toc" aria-label="文章目录">${headings.map(([, level, id, label]) => `<a class="toc-${level}" href="#${escape(id)}">${label.replace(/<[^>]*>/g, '').replace(/\s*#\s*$/, '')}</a>`).join('')}</nav>` : '';
}

for (const article of articles) {
  const rendered = md.render(article.body);
  const tags = article.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('');
  const giscus = `<section class="comments"><h2>评论</h2><script src="https://giscus.app/client.js" data-repo="Ferdinandhu000/my_blog_source" data-repo-id="R_kgDOOfo-fA" data-category="Announcements" data-category-id="DIC_kwDOOfo-fM4C-JqD" data-mapping="pathname" data-strict="0" data-reactions-enabled="1" data-emit-metadata="0" data-input-position="bottom" data-theme="preferred_color_scheme" data-lang="zh-CN" crossorigin="anonymous" async></script></section>`;
  const body = `<article class="article"><div class="eyebrow">${escape(article.category)} / ${escape(article.id)}</div><h1>${escape(article.title)}</h1><div class="meta"><time datetime="${article.date}">${article.date}</time><span>Ferdinand Hu</span></div>${tags ? `<div class="tags">${tags}</div>` : ''}<div class="prose">${rendered}</div>${giscus}</article>`;
  write(`p/${article.slug}/index.html`, shell(article.title, article.abstract, body, { url: article.url, aside: toc(rendered), kind: 'reader' }));
  const sourceDir = path.dirname(article.file);
  for (const item of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!item.isFile() || item.name.endsWith('.md')) continue;
    const output = path.join(dist, 'p', article.slug, item.name);
    fs.copyFileSync(path.join(sourceDir, item.name), output);
  }
}

const groups = Map.groupBy(articles, article => article.date.slice(0, 4));
const archiveList = [...groups].map(([year, items]) => `<section id="${year}" class="unified-year"><h3>${year}<small>${items.length} 篇</small></h3>${items.map(article => `<a class="unified-row" href="${article.url}"><time>${article.date.slice(5)}</time><span>${escape(article.title)}</span><em>${escape(article.category)}</em></a>`).join('')}</section>`).join('');
const categoryList = publicIndex.categories.map(category => `<a href="/search/?category=${encodeURIComponent(category)}">${escape(category)} <small>${articles.filter(article => article.category === category).length}</small></a>`).join('');
write('archives/index.html', shell('归档', '按年份浏览所有文章', `<span class="unified-kicker">HJ BLOG / CHRONOLOGY</span><h1 class="unified-heading">文章归档</h1><nav class="unified-filters" aria-label="分类">${categoryList}</nav>${archiveList}`, { url: '/archives/' }));
write('post/index.html', '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/archives/"><a href="/archives/">转到文章归档</a>');
write('search/index.html', shell('搜索', '搜索文章与分类', `<span class="unified-kicker">HJ BLOG / SEARCH</span><h1 class="unified-heading">检索文章</h1><label class="search-label" for="search-input">关键词</label><input id="search-input" type="search" autocomplete="off" placeholder="标题、正文、标签…"><div id="category-filters" class="filter-list"></div><p id="search-count" role="status"></p><div id="search-results" class="search-results"></div>`, { url: '/search/', script: '/blog-search.js' }));
write('terminal/index.html', shell('终端', '博客终端', `<div class="unified-terminal"><div class="terminal-output" id="terminal-output" aria-live="polite"></div><form class="terminal-prompt" id="terminal-form"><label for="terminal-input">~$</label><input id="terminal-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="终端命令"></form></div>`, { url: '/terminal/', kind: 'terminal', script: '/blog-terminal.js' }));
write('about/index.html', shell('CV', '科研简历', '<div class="unified-cv"><div><span class="unified-kicker">RESEARCH / CV</span><h1>CV</h1><p>内容整理中</p></div></div>', { url: '/about/', kind: 'cv' }));
write('search-index.json', JSON.stringify(articles.map(({ title, url, date, category, tags, abstract, text }) => ({ title, url, date, category, tags, abstract, text }))));
write('unified-shell.css', fs.readFileSync(path.join(root, 'src', 'unified-shell.css')));
write('blog-search.js', fs.readFileSync(path.join(root, 'src', 'blog-search.js')));
write('blog-terminal.js', fs.readFileSync(path.join(root, 'src', 'blog-terminal.js')));
write('katex.min.css', fs.readFileSync(path.join(root, 'node_modules', 'katex', 'dist', 'katex.min.css')));
write('highlight.css', fs.readFileSync(path.join(root, 'node_modules', 'highlight.js', 'styles', 'github-dark.min.css')));
const katexFonts = path.join(root, 'node_modules', 'katex', 'dist', 'fonts');
fs.mkdirSync(path.join(dist, 'fonts'), { recursive: true });
for (const font of fs.readdirSync(katexFonts)) if (font.endsWith('.woff2')) fs.copyFileSync(path.join(katexFonts, font), path.join(dist, 'fonts', font));
write('licenses/RHINELABUI-LICENSE', fs.readFileSync(path.join(root, 'RHINELABUI-LICENSE')));
for (const article of articles.filter(item => item.slug === 'gemini-pixel-certificate')) {
  write(`en/p/${article.slug}/index.html`, `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${article.url}"><link rel="canonical" href="${origin}${article.url}"><a href="${article.url}">转到中文文章</a>`);
}
write('en/index.html', '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/"><a href="/">转到首页</a>');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/archives/', '/search/', '/terminal/', '/about/', ...articles.map(a => a.url)].map(url => `<url><loc>${origin}${url}</loc></url>`).join('')}</urlset>`);
for (const model of ['archive-cassette.glb', 'archive-assembly.glb']) fs.rmSync(path.join(dist, 'assets', model), { force: true });
console.log(`Rendered ${articles.length} article pages and archive/search pages.`);
