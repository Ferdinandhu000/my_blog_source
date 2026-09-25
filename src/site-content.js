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

export function aboutMarkup(language = 'zh', heading = 'h2') {
  const english = language === 'en';
  const name = english ? profile.nameEn : profile.nameZh;
  const secondaryName = english ? profile.nameZh : profile.nameEn;
  const bio = english ? profile.bioEn : profile.bioZh;
  return `<div class="unified-about"><span class="unified-kicker">HJ BLOG / ABOUT ME</span><${heading}>${escape(name)}<small>${escape(secondaryName)}</small></${heading}><p class="unified-about-bio">${escape(bio)}</p><dl class="unified-about-links"><div><dt>GITHUB</dt><dd><a href="${escape(profile.github)}" target="_blank" rel="noopener noreferrer">github.com/Ferdinandhu000 ↗</a></dd></div><div><dt>EMAIL</dt><dd><a href="mailto:${escape(profile.email)}">${escape(profile.email)} ↗</a></dd></div><div><dt>LINKEDIN</dt><dd><a href="${escape(profile.linkedin)}" target="_blank" rel="noopener noreferrer">linkedin.com/in/hujue ↗</a></dd></div></dl></div>`;
}

export function sourceCreditMarkup() {
  return '<a class="source-credit" href="https://github.com/LBEILC/RhineLabUI" target="_blank" rel="noopener noreferrer">3D INTERFACE BY LBEILC · RHINELABUI ↗</a>';
}
