const input = document.querySelector('#search-input');
const filters = document.querySelector('#category-filters');
const results = document.querySelector('#search-results');
const count = document.querySelector('#search-count');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const english = location.pathname.startsWith('/en/');
const initialCategory = new URLSearchParams(location.search).get('category') || '';
let category = initialCategory;
const articles = await fetch(english ? '/en/search-index.json' : '/search-index.json').then(response => response.json());
const categories = [...new Set(articles.map(article => article.category))].sort((a,b) => a.localeCompare(b,'zh-CN'));
function render() {
  const query = input.value.trim().toLocaleLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const matching = articles.filter(article => (!category || article.category === category) && terms.every(term =>
    [article.title, article.category, article.abstract, article.text, ...(article.tags || [])].join(' ').toLocaleLowerCase().includes(term)));
  filters.innerHTML = [['',english ? 'All' : '全部'], ...categories.map(value => [value,value])].map(([value,label]) => `<button type="button" data-category="${escape(value)}" class="${value===category?'active':''}">${escape(label)}</button>`).join('');
  count.textContent = english ? `${matching.length} articles found` : `找到 ${matching.length} 篇文章`;
  results.innerHTML = matching.map(article => `<a class="search-result" href="${article.url}"><small>${escape(article.category)} · ${article.date}</small><strong>${escape(article.title)}</strong><p>${escape(article.abstract)}</p></a>`).join('') || `<p>${english ? 'No matching articles.' : '没有匹配的文章。'}</p>`;
}
filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;
  category = button.dataset.category;
  const url = new URL(location.href);
  if (category) url.searchParams.set('category',category); else url.searchParams.delete('category');
  history.replaceState(null,'',url);
  render();
});
input.addEventListener('input',render);
render();
