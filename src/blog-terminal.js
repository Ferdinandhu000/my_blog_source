const links = {
  '/home': '/', '/blog': '/archives/', '/archive': '/archives/',
  '/archives': '/archives/', '/search': '/search/', '/about': '/about/',
  '/github': 'https://github.com/Ferdinandhu000',
};
const commands = ['/help', '/?', ...Object.keys(links), '/ls', '/dir', '/whoami', '/date', '/echo', '/clear'];

export function mountTerminal(root, navigate = url => location.assign(url)) {
  const english = location.pathname.startsWith('/en/') || document.documentElement.lang === 'en';
  const output = root.querySelector('#terminal-output');
  const input = root.querySelector('#terminal-input');
  const form = root.querySelector('#terminal-form');
  if (!output || !input || !form) return () => {};
  const events = new AbortController();
  const history = [];
  let historyIndex = 0;
  function print(message) {
    const line = document.createElement('div');
    line.textContent = message;
    output.append(line);
    line.scrollIntoView({ block: 'nearest' });
  }
  print('HJ BLOG / READY');
  print(english ? 'Type /help to list commands.' : '输入 /help 查看命令。');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const command = input.value.trim();
    input.value = '';
    if (!command) return;
    history.push(command);
    historyIndex = history.length;
    print(`~$ ${command}`);
    const [name, ...args] = command.split(/\s+/);
    if (name === '/clear') { output.replaceChildren(); return; }
    if (name === '/help' || name === '/?') { print('/home  /blog  /archive  /search  /about  /github  /ls  /whoami  /date  /echo  /clear'); return; }
    if (name === '/ls' || name === '/dir') { print('home/  blog/  archives/  search/  about/'); return; }
    if (name === '/whoami') { print('Ferdinand Hu · blog'); return; }
    if (name === '/date') { print(new Date().toLocaleString(english ? 'en-US' : 'zh-CN')); return; }
    if (name === '/echo') { print(args.join(' ')); return; }
    if (links[name]) {
      if (name === '/github') {
        const link = document.createElement('a');
        link.href = links[name];
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `→ ${links[name]}`;
        output.append(link);
      } else navigate(english ? links[name] === '/' ? '/en/' : `/en${links[name]}` : links[name]);
      return;
    }
    print(english ? 'Unknown command. Type /help for available commands.' : '未知命令。输入 /help 查看可用命令。');
  }, { signal: events.signal });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = history[historyIndex] ?? '';
    } else if (event.key === 'Tab' && input.value.startsWith('/')) {
      const matches = commands.filter(command => command.startsWith(input.value));
      if (matches.length === 1) { event.preventDefault(); input.value = matches[0]; }
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      output.replaceChildren();
    }
  }, { signal: events.signal });
  input.focus({ preventScroll: true });
  return () => events.abort();
}

if (document.querySelector('#terminal-form') && !document.querySelector('#unified-root')) mountTerminal(document);
