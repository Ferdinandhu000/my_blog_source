import { records, categories } from './data';
import { escapeHtml } from './html';

type View = 'home' | 'archives' | 'search' | 'terminal' | 'cv' | 'detail' | 'reader';
type Route = { hjView: View; index?: number; slug?: string; hash?: string };
type SearchItem = { title: string; url: string; date: string; category: string; tags: string[]; abstract: string; text: string };
type Callbacks = {
  ready: () => boolean;
  showArchive: () => void;
  showDetail: (index: number) => void;
};

const paths: Record<'archives' | 'search' | 'terminal' | 'cv', string> = {
  archives: '/archives/', search: '/search/', terminal: '/terminal/', cv: '/about/',
};
const articleIndex = (slug: string) => records.findIndex(record => record.slug === slug);

export class UnifiedUI {
  private root = document.createElement('div');
  private route: Route = { hjView: 'home' };
  private filter = '全部档案';
  private query = '';
  private searchIndex?: SearchItem[];
  private generation = 0;
  private disposeTerminal?: () => void;
  private previousFocus?: HTMLElement;
  get isOpen() { return !['home', 'detail'].includes(this.route.hjView); }

  constructor(private callbacks: Callbacks) {
    this.root.id = 'unified-root';
    document.body.append(this.root);
    history.replaceState({ ...(history.state ?? {}), hjView: 'home' }, '', location.href);
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onKeyDown, true);
    this.root.addEventListener('click', this.onPanelClick);
    this.root.addEventListener('input', this.onSearchInput);
    window.addEventListener('popstate', () => this.render(history.state?.hjView ? history.state as Route : { hjView: 'home' }));
  }

  open(view: 'archives' | 'search' | 'terminal' | 'cv') {
    if (!this.callbacks.ready()) return;
    if (view === 'archives' || view === 'search') {
      this.filter = '全部档案';
      this.query = '';
    }
    this.navigate({ hjView: view }, paths[view]);
  }

  private navigate(route: Route, path: string) {
    history.pushState(route, '', path);
    this.render(route);
  }

  private render(route: Route) {
    this.generation++;
    this.disposeTerminal?.();
    this.disposeTerminal = undefined;
    const wasOpen = this.isOpen;
    this.route = route;
    document.title = route.hjView === 'reader' ? document.title : 'HJ BLOG · 个人博客';
    if (!this.isOpen) {
      this.root.replaceChildren();
      document.body.classList.remove('unified-open');
      document.querySelector<HTMLElement>('#stage')!.inert = false;
      if (route.hjView === 'detail' && typeof route.index === 'number') this.callbacks.showDetail(route.index);
      else this.callbacks.showArchive();
      if (wasOpen && route.hjView === 'home') this.previousFocus?.focus({ preventScroll: true });
      return;
    }
    if (!wasOpen) this.previousFocus = document.activeElement as HTMLElement;
    document.body.classList.add('unified-open');
    document.querySelector<HTMLElement>('#stage')!.inert = true;
    if (route.hjView === 'archives') this.callbacks.showArchive();
    const terminal = route.hjView === 'terminal';
    const title = route.hjView === 'reader' ? 'ARTICLE / 阅读' : terminal ? 'HJ BLOG / ~' : route.hjView === 'cv' ? 'CURRICULUM VITAE' : route.hjView === 'search' ? 'ARCHIVE / 检索' : 'ARCHIVE / 文章归档';
    this.root.innerHTML = `<div class="unified-overlay"><section class="unified-window ${route.hjView === 'reader' ? 'unified-window--reader' : ''} ${terminal ? 'unified-window--terminal' : ''}" role="dialog" aria-modal="true" aria-label="${route.hjView === 'reader' ? '文章阅读' : title}" tabindex="-1"><div class="unified-top"><span>${title}</span><button type="button" data-unified-close aria-label="关闭窗口">CLOSE ×</button></div><div class="unified-content"></div></section></div>`;
    const content = this.root.querySelector<HTMLElement>('.unified-content')!;
    if (route.hjView === 'archives') this.renderArchives(content);
    else if (route.hjView === 'search') {
      content.innerHTML = '<span class="unified-kicker">HJ BLOG / SEARCH</span><h2 class="unified-heading">检索文章</h2><label class="unified-search-label" for="unified-search">关键词</label><input id="unified-search" type="search" autocomplete="off" placeholder="标题、正文、标签…"><div class="unified-filters" aria-label="分类筛选"></div><p id="unified-search-count" role="status"></p><div id="unified-search-results"></div>';
      void this.loadSearchIndex(this.generation);
    }
    else if (route.hjView === 'cv') content.innerHTML = '<div class="unified-cv"><div><span class="unified-kicker">RESEARCH / CV</span><h2>CV</h2><p>内容整理中</p></div></div>';
    else if (terminal) {
      content.innerHTML = '<div class="unified-terminal"><div class="terminal-output" id="terminal-output" aria-live="polite"></div><form class="terminal-prompt" id="terminal-form"><label for="terminal-input">~$</label><input id="terminal-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="终端命令"></form></div>';
      const generation = this.generation;
      void import('./blog-terminal.js').then(({ mountTerminal }) => {
        if (generation !== this.generation) return;
        this.disposeTerminal = mountTerminal(this.root, url => this.terminalNavigate(url));
      });
    } else if (route.hjView === 'reader' && route.slug) {
      content.innerHTML = '<p role="status">正在读取文章…</p>';
      void this.loadReader(route.slug, content, this.generation, route.hash);
    }
    (this.root.querySelector<HTMLElement>(route.hjView === 'search' ? '#unified-search' : '.unified-window'))?.focus({ preventScroll: true });
  }

  private renderArchives(content: HTMLElement) {
    const filtered = records.map((record, index) => ({ record, index }))
      .filter(({ record }) => this.filter === '全部档案' || record.category === this.filter);
    const groups = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const year = item.record.date.slice(0, 4);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(item);
    }
    content.innerHTML = `<span class="unified-kicker">HJ BLOG / CHRONOLOGY</span><h2 class="unified-heading">文章归档</h2><div class="unified-filters" aria-label="分类筛选">${categories.map(category => `<button type="button" data-unified-filter="${escapeHtml(category)}" aria-pressed="${category === this.filter}">${escapeHtml(category)}</button>`).join('')}</div>${[...groups].map(([year, items]) => `<section class="unified-year"><h3>${year}<small>${items.length} 篇</small></h3>${items.map(({ record, index }) => `<button type="button" class="unified-row" data-unified-index="${index}"><time>${escapeHtml(record.date.slice(5))}</time><span>${escapeHtml(record.title)}</span><em>${escapeHtml(record.category)}</em></button>`).join('')}</section>`).join('') || '<p>此分类暂无文章。</p>'}`;
  }

  private async loadSearchIndex(generation: number) {
    try {
      this.searchIndex ??= await fetch('/search-index.json').then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SearchItem[]>;
      });
      if (generation === this.generation) this.renderSearch();
    } catch {
      if (generation === this.generation) this.root.querySelector<HTMLElement>('#unified-search-results')!.textContent = '搜索索引暂不可用。';
    }
  }

  private renderSearch() {
    if (!this.searchIndex || this.route.hjView !== 'search') return;
    const filters = this.root.querySelector<HTMLElement>('.unified-filters')!;
    filters.innerHTML = categories.map(category => `<button type="button" data-unified-filter="${escapeHtml(category)}" aria-pressed="${category === this.filter}">${escapeHtml(category)}</button>`).join('');
    const terms = this.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = this.searchIndex.filter(item => (this.filter === '全部档案' || item.category === this.filter) &&
      terms.every(term => [item.title, item.category, item.abstract, item.text, ...item.tags].join(' ').toLocaleLowerCase().includes(term)));
    this.root.querySelector<HTMLElement>('#unified-search-count')!.textContent = `找到 ${matches.length} 篇文章`;
    this.root.querySelector<HTMLElement>('#unified-search-results')!.innerHTML = matches.map(item => {
      const index = articleIndex(item.url.split('/')[2]);
      return `<button type="button" class="unified-row" data-unified-index="${index}"><time>${escapeHtml(item.date)}</time><span>${escapeHtml(item.title)}</span><em>${escapeHtml(item.category)}</em></button>`;
    }).join('') || '<p>没有匹配的文章。</p>';
  }

  private async loadReader(slug: string, content: HTMLElement, generation: number, hash?: string) {
    try {
      const response = await fetch(`/p/${slug}/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (generation !== this.generation) return;
      const article = page.querySelector<HTMLElement>('article.article');
      if (!article) throw new Error('文章内容不存在');
      const commentsScript = article.querySelector<HTMLScriptElement>('script[src*="giscus.app/client.js"]');
      commentsScript?.remove();
      article.querySelectorAll('script').forEach(script => script.remove());
      for (const element of article.querySelectorAll<HTMLElement>('[src], [href]')) {
        for (const attribute of ['src', 'href']) {
          const value = element.getAttribute(attribute);
          if (value && !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(value))
            element.setAttribute(attribute, new URL(value, response.url).pathname);
        }
      }
      this.ensureStyle('/katex.min.css');
      this.ensureStyle('/highlight.css');
      const grid = document.createElement('div');
      grid.className = 'unified-reader unified-reader-grid';
      grid.append(article);
      const aside = page.querySelector<HTMLElement>('.site-aside');
      if (aside) grid.append(aside);
      content.replaceChildren(grid);
      if (hash) this.scrollToHeading(hash, content);
      document.title = `${records[articleIndex(slug)]?.title ?? '文章'} · HJ Blog`;
      if (commentsScript) {
        const script = document.createElement('script');
        for (const attribute of commentsScript.attributes) script.setAttribute(attribute.name, attribute.value);
        article.querySelector('.comments')?.append(script);
      }
    } catch {
      if (generation === this.generation) content.innerHTML = `<p role="alert">文章暂时无法加载。</p><a href="/p/${encodeURIComponent(slug)}/">打开独立文章页 →</a>`;
    }
  }

  private ensureStyle(href: string) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }

  private terminalNavigate(url: string) {
    if (url === '/') this.navigate({ hjView: 'home' }, '/');
    else if (url === '/search/') this.open('search');
    else if (url === '/archives/') this.open('archives');
    else if (url === '/about/') this.open('cv');
  }

  private scrollToHeading(hash: string, content: HTMLElement) {
    const id = hash.replace(/^#/, '');
    const decodedId = decodeURIComponent(id);
    const target = [...content.querySelectorAll<HTMLElement>('[id]')].find(node => node.id === id || node.id === decodedId);
    if (target) content.scrollTop += target.getBoundingClientRect().top - content.getBoundingClientRect().top;
  }

  private onPanelClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-unified-close]') || target.classList.contains('unified-overlay')) {
      history.back();
      return;
    }
    const filter = target.closest<HTMLButtonElement>('[data-unified-filter]');
    if (filter) {
      this.filter = filter.dataset.unifiedFilter!;
      if (this.route.hjView === 'search') this.renderSearch();
      else this.renderArchives(this.root.querySelector<HTMLElement>('.unified-content')!);
      this.root.querySelector<HTMLButtonElement>(`[data-unified-filter="${CSS.escape(this.filter)}"]`)?.focus();
      return;
    }
    const row = target.closest<HTMLButtonElement>('[data-unified-index]');
    if (row) this.navigate({ hjView: 'detail', index: Number(row.dataset.unifiedIndex) }, '/');
  };

  private onSearchInput = (event: Event) => {
    if ((event.target as HTMLElement).id !== 'unified-search') return;
    this.query = (event.target as HTMLInputElement).value;
    this.renderSearch();
  };

  private onDocumentClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !this.callbacks.ready()) return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.hash && this.isOpen && this.route.hjView === 'reader' && url.pathname === location.pathname) {
      event.preventDefault();
      const content = this.root.querySelector<HTMLElement>('.unified-content');
      if (content) this.scrollToHeading(url.hash, content);
      return;
    }
    if (url.pathname === '/archives/' || url.pathname === '/terminal/' || url.pathname === '/about/' || url.pathname === '/search/') {
      event.preventDefault();
      this.open(url.pathname === '/archives/' ? 'archives' : url.pathname === '/terminal/' ? 'terminal' : url.pathname === '/search/' ? 'search' : 'cv');
      return;
    }
    const match = url.pathname.match(/^\/p\/([a-z0-9-]+)\/$/);
    if (match && articleIndex(match[1]) >= 0) {
      event.preventDefault();
      this.navigate({ hjView: 'reader', slug: match[1], index: articleIndex(match[1]), hash: url.hash }, url.pathname + url.hash);
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      history.back();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...this.root.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')]
      .filter(node => node.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1)!;
    if (document.activeElement === this.root.querySelector('.unified-window')) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
}
