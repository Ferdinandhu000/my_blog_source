document.addEventListener('click', async event => {
  const button = event.target.closest?.('[data-copy-code]');
  if (!button) return;
  const code = button.closest('.code-block')?.querySelector('pre code');
  if (!code) return;
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  try {
    await navigator.clipboard.writeText(code.textContent ?? '');
    button.textContent = english ? 'Copied' : '已复制';
    clearTimeout(button.copyReset);
    button.copyReset = setTimeout(() => { button.textContent = english ? 'Copy' : '复制'; }, 1800);
  } catch {
    button.textContent = english ? 'Copy failed' : '复制失败';
  }
});
