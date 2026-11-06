(() => {
  const widget = document.querySelector('[data-translator]');
  if (!widget) return;
  const pairs = [
    { en: 'Hello, world!', zh: '你好，世界！' },
    { en: 'Keep it simple.', zh: '保持简单。' },
    { en: 'Make something useful.', zh: '做点真正有用的东西。' }
  ];
  const input = widget.querySelector('[data-input]');
  const output = widget.querySelector('[data-output]');
  const feedback = widget.querySelector('[data-feedback]');
  let reverse = false;
  const normalize = value => value.trim().replace(/\s+/g, ' ').replace(/[.!。！]$/, '').toLowerCase();
  const count = () => { widget.querySelector('[data-count]').textContent = `${input.value.length} / 180`; };
  function translate() {
    feedback.textContent = '';
    if (!input.value.trim()) { output.textContent = '请输入文字或选择下方示例短句。'; return; }
    const match = pairs.find(pair => normalize(reverse ? pair.zh : pair.en) === normalize(input.value));
    output.textContent = match ? (reverse ? match.en : match.zh) : '当前为离线交互示例，尚未接入真实翻译服务。请尝试下方短句。';
  }
  widget.querySelector('[data-translate]').addEventListener('click', translate);
  input.addEventListener('input', () => { count(); output.textContent = '点击「翻译一下」查看演示结果。'; feedback.textContent = ''; });
  widget.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    const pair = pairs[Number(button.dataset.example)];
    input.value = reverse ? pair.zh : pair.en;
    count(); translate();
  }));
  widget.querySelector('[data-swap]').addEventListener('click', () => {
    const previous = output.textContent;
    const hasResult = pairs.some(pair => pair.zh === previous || pair.en === previous);
    reverse = !reverse;
    widget.querySelector('[data-from]').textContent = reverse ? '中文 · Chinese' : 'EN · English';
    widget.querySelector('[data-to]').textContent = reverse ? 'EN · English' : '中文 · Chinese';
    input.value = hasResult ? previous : (reverse ? pairs[0].zh : pairs[0].en);
    widget.querySelectorAll('[data-example]').forEach((button, i) => { button.textContent = reverse ? pairs[i].zh : pairs[i].en; });
    count(); translate();
  });
  widget.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(output.textContent);
      feedback.textContent = '结果已复制';
    } catch (error) { feedback.textContent = '复制不可用，请手动选择文字'; }
  });
})();
