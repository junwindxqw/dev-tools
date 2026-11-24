// ===== DevTools · 程序员工具箱 =====
(function () {
  'use strict';

  // --- Toast ---
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // --- Nav Switch ---
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.tool-panel');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tool;
      navItems.forEach(b => b.classList.toggle('active', b === btn));
      panels.forEach(p => p.classList.toggle('active', p.id === `tool-${target}`));
    });
  });

  // --- Copy Helper ---
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('✓ 已复制到剪贴板');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('✓ 已复制到剪贴板');
    }
  }

  // ==================== JSON Tool ====================
  const jsonInput = document.getElementById('jsonInput');
  const jsonError = document.getElementById('jsonError');

  function showJsonError(msg) {
    jsonError.textContent = '⚠️ ' + msg;
    jsonError.classList.add('show');
  }
  function clearJsonError() {
    jsonError.classList.remove('show');
    jsonError.textContent = '';
  }

  document.getElementById('jsonFormat').onclick = () => {
    const raw = jsonInput.value.trim();
    if (!raw) { toast('请输入 JSON'); return; }
    clearJsonError();
    try {
      const parsed = JSON.parse(raw);
      jsonInput.value = JSON.stringify(parsed, null, 2);
      toast('✓ 格式化成功');
    } catch (e) {
      showJsonError('JSON 解析失败: ' + e.message);
    }
  };

  document.getElementById('jsonMinify').onclick = () => {
    const raw = jsonInput.value.trim();
    if (!raw) { toast('请输入 JSON'); return; }
    clearJsonError();
    try {
      const parsed = JSON.parse(raw);
      jsonInput.value = JSON.stringify(parsed);
      toast('✓ 压缩成功');
    } catch (e) {
      showJsonError('JSON 解析失败: ' + e.message);
    }
  };

  document.getElementById('jsonEscape').onclick = () => {
    const raw = jsonInput.value;
    if (!raw) { toast('请输入内容'); return; }
    clearJsonError();
    jsonInput.value = raw
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    toast('✓ 已转义');
  };

  document.getElementById('jsonUnescape').onclick = () => {
    const raw = jsonInput.value;
    if (!raw) { toast('请输入内容'); return; }
    clearJsonError();
    try {
      // Wrap to parse via JSON
      const wrapped = '"' + raw + '"';
      jsonInput.value = JSON.parse(wrapped);
      toast('✓ 已反转义');
    } catch {
      toast('反转义失败，请检查格式');
    }
  };

  document.getElementById('jsonCopy').onclick = () => {
    if (!jsonInput.value) { toast('没有可复制的内容'); return; }
    copyText(jsonInput.value);
  };

  document.getElementById('jsonClear').onclick = () => {
    jsonInput.value = '';
    clearJsonError();
  };

  // ==================== Base64 Tool ====================
  const b64Input = document.getElementById('b64Input');
  const b64Output = document.getElementById('b64Output');
  const b64Error = document.getElementById('b64Error');

  function showB64Error(msg) {
    b64Error.textContent = '⚠️ ' + msg;
    b64Error.classList.add('show');
  }
  function clearB64Error() {
    b64Error.classList.remove('show');
    b64Error.textContent = '';
  }

  // UTF-8 safe Base64
  function b64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  document.getElementById('b64Encode').onclick = () => {
    const raw = b64Input.value;
    if (!raw) { toast('请输入文本'); return; }
    clearB64Error();
    try {
      b64Output.value = b64Encode(raw);
      toast('✓ 编码成功');
    } catch (e) {
      showB64Error('编码失败: ' + e.message);
    }
  };

  document.getElementById('b64Decode').onclick = () => {
    const raw = b64Output.value.trim();
    if (!raw) { toast('请输入 Base64'); return; }
    clearB64Error();
    try {
      b64Input.value = b64Decode(raw);
      toast('✓ 解码成功');
    } catch (e) {
      showB64Error('解码失败，请确认输入是有效的 Base64');
    }
  };

  document.getElementById('b64Swap').onclick = () => {
    const tmp = b64Input.value;
    b64Input.value = b64Output.value;
    b64Output.value = tmp;
    clearB64Error();
  };

  document.getElementById('b64ClearInput').onclick = () => {
    b64Input.value = '';
    clearB64Error();
  };

  document.getElementById('b64Copy').onclick = () => {
    if (!b64Output.value) { toast('没有可复制的内容'); return; }
    copyText(b64Output.value);
  };

  // ==================== Random Generator ====================
  const randLength = document.getElementById('randLength');
  const randLower = document.getElementById('randLower');
  const randUpper = document.getElementById('randUpper');
  const randDigit = document.getElementById('randDigit');
  const randSymbol = document.getElementById('randSymbol');
  const randAmbiguous = document.getElementById('randAmbiguous');
  const randResult = document.getElementById('randResult');
  const randStrength = document.getElementById('randStrength');

  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const AMBIGUOUS = '0O1lI';

  function getCharset() {
    let charset = '';
    if (randLower.checked) charset += LOWER;
    if (randUpper.checked) charset += UPPER;
    if (randDigit.checked) charset += DIGITS;
    if (randSymbol.checked) charset += SYMBOLS;
    if (randAmbiguous.checked) {
      charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    }
    return charset;
  }

  function calcStrength(length, charset) {
    const entropy = length * Math.log2(charset.length);
    if (entropy < 40) return { label: '弱', cls: 'weak' };
    if (entropy < 60) return { label: '中等', cls: 'medium' };
    return { label: '强', cls: 'strong' };
  }

  function randomSecure(len, charset) {
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let out = '';
    for (let i = 0; i < len; i++) {
      out += charset[arr[i] % charset.length];
    }
    return out;
  }

  function updateStrength() {
    const charset = getCharset();
    const len = parseInt(randLength.value) || 0;
    if (charset.length === 0 || len === 0) {
      randStrength.textContent = '';
      randStrength.className = 'strength';
      return;
    }
    const s = calcStrength(len, charset);
    randStrength.textContent = s.label + ' · ' + len + ' 位';
    randStrength.className = 'strength ' + s.cls;
  }

  [randLength, randLower, randUpper, randDigit, randSymbol, randAmbiguous].forEach(el => {
    el.addEventListener('input', updateStrength);
    el.addEventListener('change', updateStrength);
  });

  document.getElementById('randGenerate').onclick = () => {
    const len = parseInt(randLength.value);
    if (!len || len < 1) { toast('请输入有效长度'); return; }
    const charset = getCharset();
    if (!charset) { toast('请至少选择一种字符类型'); return; }
    randResult.value = randomSecure(len, charset);
    updateStrength();
    toast('✓ 已生成');
  };

  document.getElementById('randCopy').onclick = () => {
    if (!randResult.value) { toast('没有可复制的内容'); return; }
    copyText(randResult.value);
  };

  // 初始强度显示
  updateStrength();

  console.log('%c🛠️ DevTools 程序员工具箱', 'color:#818cf8;font-weight:bold;font-size:14px;');
})();
