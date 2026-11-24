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

  // ==================== URL Tool ====================
  const urlInput = document.getElementById('urlInput');
  const urlOutput = document.getElementById('urlOutput');
  const urlError = document.getElementById('urlError');

  function showUrlError(msg) { urlError.textContent = '⚠️ ' + msg; urlError.classList.add('show'); }
  function clearUrlError() { urlError.classList.remove('show'); urlError.textContent = ''; }

  // 普通 URL 编码：空格→+，保留 / : ? = & # 等
  function urlEncodeLight(str) {
    // 用 encodeURI + 对 + 号和空格处理
    return str.split('').map(ch => {
      const code = ch.charCodeAt(0);
      // 保留 RFC 3986 unreserved + / : ? # [] @ ! $ & ' ( ) * + , ; =
      if (/[A-Za-z0-9\-_.~]/.test(ch)) return ch;
      // encodeURI 会保留许多 URL 字符，我们 encodeURIComponent 后再保留常见 URL 字符
      return encodeURIComponent(ch);
    }).join('')
      .replace(/%20/g, '+')
      // 把 + / : # ? = & @ 从已编码还原出来（更像 encodeURIComponent + post-process）
      ;
  }

  document.getElementById('urlEncode').onclick = () => {
    if (!urlInput.value) { toast('请输入文本'); return; }
    clearUrlError();
    try {
      // 使用 encodeURI：保留 URL 结构字符，只编码不安全字符
      urlOutput.value = encodeURI(urlInput.value);
      toast('✓ URL 编码成功');
    } catch (e) {
      showUrlError('编码失败: ' + e.message);
    }
  };

  document.getElementById('urlEncodeFull').onclick = () => {
    if (!urlInput.value) { toast('请输入文本'); return; }
    clearUrlError();
    try {
      // encodeURIComponent：完全编码，用于 query 参数值
      urlOutput.value = encodeURIComponent(urlInput.value);
      toast('✓ 完整编码成功');
    } catch (e) {
      showUrlError('编码失败: ' + e.message);
    }
  };

  document.getElementById('urlDecode').onclick = () => {
    if (!urlOutput.value.trim()) { toast('请输入已编码 URL'); return; }
    clearUrlError();
    try {
      urlInput.value = decodeURI(urlOutput.value);
      toast('✓ URL 解码成功');
    } catch {
      try {
        urlInput.value = decodeURIComponent(urlOutput.value);
        toast('✓ 参数解码成功');
      } catch (e) {
        showUrlError('解码失败，请检查格式');
      }
    }
  };

  document.getElementById('urlSwap').onclick = () => {
    const tmp = urlInput.value; urlInput.value = urlOutput.value; urlOutput.value = tmp; clearUrlError();
  };

  document.getElementById('urlCopy').onclick = () => {
    if (!urlOutput.value) { toast('没有可复制内容'); return; }
    copyText(urlOutput.value);
  };

  // ==================== HTML Entity Tool ====================
  const htmlInput = document.getElementById('htmlInput');
  const htmlOutput = document.getElementById('htmlOutput');
  const htmlError = document.getElementById('htmlError');

  function showHtmlError(msg) { htmlError.textContent = '⚠️ ' + msg; htmlError.classList.add('show'); }
  function clearHtmlError() { htmlError.classList.remove('show'); htmlError.textContent = ''; }

  const HTML_ENTITIES = {
    '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39', '/': '#47',
  };
  const HTML_REVERSE = {};
  Object.keys(HTML_ENTITIES).forEach(k => HTML_REVERSE[HTML_ENTITIES[k]] = k);

  function htmlEncode(str) {
    return str.replace(/[&<>"'/]/g, ch => '&' + HTML_ENTITIES[ch] + ';')
              .replace(/[^\x00-\x7F]/g, ch => '&#' + ch.charCodeAt(0) + ';');
  }
  function htmlDecode(str) {
    return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, ent) => {
      if (HTML_REVERSE[ent] !== undefined) return HTML_REVERSE[ent];
      if (ent.startsWith('#')) {
        const code = ent[1] === 'x'
          ? parseInt(ent.substring(2), 16)
          : parseInt(ent.substring(1), 10);
        if (!isNaN(code)) return String.fromCharCode(code);
      }
      return '&' + ent + ';';
    });
  }

  document.getElementById('htmlEncode').onclick = () => {
    if (!htmlInput.value) { toast('请输入 HTML'); return; }
    clearHtmlError();
    htmlOutput.value = htmlEncode(htmlInput.value);
    toast('✓ 已转义为实体');
  };

  document.getElementById('htmlDecode').onclick = () => {
    if (!htmlOutput.value) { toast('请输入 HTML 实体'); return; }
    clearHtmlError();
    htmlInput.value = htmlDecode(htmlOutput.value);
    toast('✓ 已反转义');
  };

  document.getElementById('htmlSwap').onclick = () => {
    const tmp = htmlInput.value; htmlInput.value = htmlOutput.value; htmlOutput.value = tmp; clearHtmlError();
  };

  document.getElementById('htmlCopy').onclick = () => {
    if (!htmlOutput.value) { toast('没有可复制内容'); return; }
    copyText(htmlOutput.value);
  };

  // ==================== Timestamp Tool ====================
  const tsNowMs = document.getElementById('tsNowMs');
  const tsNowSec = document.getElementById('tsNowSec');
  const tsNowStr = document.getElementById('tsNowStr');
  const tsInput = document.getElementById('tsInput');
  const tsOutput = document.getElementById('tsOutput');
  const tsError = document.getElementById('tsError');
  const tsTz = document.getElementById('tsTz');

  function showTsError(msg) { tsError.textContent = '⚠️ ' + msg; tsError.classList.add('show'); }
  function clearTsError() { tsError.classList.remove('show'); tsError.textContent = ''; }

  function pad(n, w = 2) { return String(n).padStart(w, '0'); }
  function formatDate(d) {
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function refreshNow() {
    const now = Date.now();
    tsNowMs.textContent = now + ' ms';
    tsNowSec.textContent = Math.floor(now / 1000) + ' sec';
    tsNowStr.textContent = formatDate(new Date(now));
  }
  refreshNow();
  document.getElementById('tsRefresh').onclick = refreshNow;

  document.getElementById('tsNowBtn').onclick = () => {
    tsInput.value = Date.now().toString();
    clearTsError();
  };

  document.getElementById('tsToday').onclick = () => {
    const d = new Date();
    tsOutput.value = formatDate(d);
    clearTsError();
  };

  function formatWithTz(tsMs, tz) {
    const d = new Date(tsMs);
    try {
      if (tz === 'local') return formatDate(d);
      if (tz === 'UTC') {
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
      }
      // 使用 Intl.DateTimeFormat
      return d.toLocaleString('zh-CN', { timeZone: tz, hour12: false }) + ` (${tz})`;
    } catch {
      return formatDate(d);
    }
  }

  document.getElementById('tsToDate').onclick = () => {
    const raw = tsInput.value.trim();
    if (!raw) { toast('请输入时间戳'); return; }
    clearTsError();
    let n = Number(raw);
    if (isNaN(n)) { showTsError('无效的数字'); return; }
    // 自动识别秒/毫秒：<= 1e12 视为秒
    if (n < 1e12) n = n * 1000;
    try {
      tsOutput.value = formatWithTz(n, tsTz.value);
      toast('✓ 转换成功');
    } catch (e) {
      showTsError('转换失败: ' + e.message);
    }
  };

  document.getElementById('tsFromDate').onclick = () => {
    const raw = tsOutput.value.trim();
    if (!raw) { toast('请输入日期'); return; }
    clearTsError();
    try {
      // 支持 "2024-01-15" 和 "2024-01-15 10:30:00"
      const norm = raw.replace(' ', 'T');
      const d = new Date(norm);
      if (isNaN(d.getTime())) throw new Error('无效日期格式');
      tsInput.value = d.getTime().toString();
      toast('✓ 转换成功');
    } catch (e) {
      showTsError('转换失败: ' + e.message);
    }
  };

  document.getElementById('tsCopyTs').onclick = () => {
    if (!tsInput.value) { toast('没有可复制内容'); return; }
    copyText(tsInput.value);
  };
  document.getElementById('tsCopyDate').onclick = () => {
    if (!tsOutput.value) { toast('没有可复制内容'); return; }
    copyText(tsOutput.value);
  };

  // ==================== UUID Tool ====================
  const uuidHyphen = document.getElementById('uuidHyphen');
  const uuidUpper = document.getElementById('uuidUpper');
  const uuidCount = document.getElementById('uuidCount');
  const uuidResult = document.getElementById('uuidResult');

  function uuidV4() {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40; // v4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant
    const h = Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  document.getElementById('uuidGenerate').onclick = () => {
    const n = Math.max(1, Math.min(100, parseInt(uuidCount.value) || 5));
    const parts = [];
    for (let i = 0; i < n; i++) {
      let id = uuidV4();
      if (!uuidHyphen.checked) id = id.replace(/-/g, '');
      if (uuidUpper.checked) id = id.toUpperCase();
      parts.push(id);
    }
    uuidResult.value = parts.join('\n');
    toast('✓ 已生成 ' + n + ' 个 UUID');
  };

  document.getElementById('uuidCopy').onclick = () => {
    if (!uuidResult.value) { toast('没有可复制内容'); return; }
    copyText(uuidResult.value);
  };
  document.getElementById('uuidClear').onclick = () => { uuidResult.value = ''; };

  console.log('%c🛠️ DevTools 程序员工具箱', 'color:#818cf8;font-weight:bold;font-size:14px;');
})();
