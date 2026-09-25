export const profile = Object.freeze({
  nameZh: '胡珏',
  nameEn: 'Jue Hu',
  bioZh: '我是胡珏，这是我的博客。我会在这里分享技术笔记、项目实践和一些日常思考。',
  bioEn: "I'm Jue Hu, and this is my blog. I share technical notes, projects, and occasional thoughts here.",
  github: 'https://github.com/Ferdinandhu000',
  email: 'hujue05_123@mail.dlut.edu.cn',
  linkedin: 'https://www.linkedin.com/in/hujue/',
});

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const icons = {
  github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-1-2.7c3.2-.4 6.5-1.6 6.5-7.1A5.5 5.5 0 0 0 19 4.5a5 5 0 0 0-.1-3.5S17.8.7 15 2.4a13 13 0 0 0-6 0C6.2.7 5.1 1 5.1 1A5 5 0 0 0 5 4.5a5.5 5.5 0 0 0-1.5 3.8c0 5.5 3.3 6.7 6.5 7.1a3.4 3.4 0 0 0-1 2.7V22"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="7" cy="8" r="1" fill="currentColor" stroke="none"/><path d="M7 11v7m5 0v-7m0 3a3 3 0 0 1 6 0v4"/></svg>',
};

export function aboutMarkup(language = 'zh', heading = 'h2') {
  const english = language === 'en';
  const bio = english ? profile.bioEn : profile.bioZh;
  return `<div class="unified-about"><span class="unified-kicker">HJ BLOG / ABOUT ME</span><${heading}>${escape(profile.nameEn)}</${heading}><p class="unified-about-bio">${escape(bio)}</p><dl class="unified-about-links"><div><dt>${icons.github}GITHUB</dt><dd><a href="${escape(profile.github)}" target="_blank" rel="noopener noreferrer">github.com/Ferdinandhu000 ↗</a></dd></div><div><dt>${icons.email}EMAIL</dt><dd><a href="mailto:${escape(profile.email)}">${escape(profile.email)} ↗</a></dd></div><div><dt>${icons.linkedin}LINKEDIN</dt><dd><a href="${escape(profile.linkedin)}" target="_blank" rel="noopener noreferrer">linkedin.com/in/hujue ↗</a></dd></div></dl></div>`;
}

export function sourceCreditMarkup() {
  return '<a class="source-credit" href="https://github.com/LBEILC/RhineLabUI" target="_blank" rel="noopener noreferrer">3D INTERFACE BY LBEILC · RHINELABUI ↗</a>';
}
