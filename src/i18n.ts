import type { ArchiveRecord } from './data';

export type Language = 'zh' | 'en';
let language: Language = 'en';
try {
  language = JSON.parse(localStorage.getItem('hj-blog-settings') ?? '{}').language === 'zh' ? 'zh' : 'en';
} catch { /* Storage can be unavailable in private browsing. */ }
if (location.pathname.startsWith('/en/')) language = 'en';
document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';

export const getLanguage = () => language;
export function setLanguage(next: Language) {
  if (language === next) return;
  language = next;
  document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
  window.dispatchEvent(new Event('hj-language-change'));
}
export const titleOf = (record: ArchiveRecord) => language === 'en' ? record.titleEn : record.title;
export const categoryOf = (record: ArchiveRecord) => language === 'en' ? record.categoryEn : record.category;
export const abstractOf = (record: ArchiveRecord) => language === 'en' ? record.abstractEn : record.abstract;
export const tagsOf = (record: ArchiveRecord) => language === 'en' ? record.tagsEn : record.tags;
export const articleUrl = (record: ArchiveRecord) => language === 'en' ? record.urlEn : record.url;
export const categoryLabel = (category: string, records: ArchiveRecord[]) =>
  category === '全部档案' ? (language === 'en' ? 'All articles' : category)
    : language === 'en' ? records.find(record => record.category === category)?.categoryEn ?? category : category;
export const tr = (zh: string, en: string) => language === 'en' ? en : zh;
