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

  // ==================== Regex Tool ====================
  const regexPattern = document.getElementById('regexPattern');
  const regexFlagsInput = document.getElementById('regexFlags');
  const regexText = document.getElementById('regexText');
  const regexHighlight = document.getElementById('regexHighlight');
  const regexMatches = document.getElementById('regexMatches');
  const regexMatchCount = document.getElementById('regexMatchCount');
  const regexError = document.getElementById('regexError');
  const flagG = document.getElementById('flagG');
  const flagI = document.getElementById('flagI');
  const flagM = document.getElementById('flagM');
  const flagS = document.getElementById('flagS');

  function showRegexError(msg) {
    regexError.textContent = '⚠️ ' + msg;
    regexError.classList.add('show');
    regexHighlight.innerHTML = '—';
    regexMatches.innerHTML = '';
    regexMatchCount.textContent = '0 个匹配';
  }
  function clearRegexError() { regexError.classList.remove('show'); regexError.textContent = ''; }

  function syncFlagsFromCheckboxes() {
    let f = '';
    if (flagG.checked) f += 'g';
    if (flagI.checked) f += 'i';
    if (flagM.checked) f += 'm';
    if (flagS.checked) f += 's';
    regexFlagsInput.value = f;
  }
  function syncCheckboxesFromFlags() {
    const f = regexFlagsInput.value;
    flagG.checked = f.includes('g');
    flagI.checked = f.includes('i');
    flagM.checked = f.includes('m');
    flagS.checked = f.includes('s');
  }
  [flagG, flagI, flagM, flagS].forEach(el => el.addEventListener('change', () => { syncFlagsFromCheckboxes(); runRegex(); }));
  regexFlagsInput.addEventListener('input', () => { syncCheckboxesFromFlags(); runRegex(); });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }

  function runRegex() {
    clearRegexError();
    const pattern = regexPattern.value;
    const text = regexText.value;
    if (!pattern || !text) {
      regexHighlight.textContent = text || '等待输入...';
      regexMatches.innerHTML = '';
      regexMatchCount.textContent = '0 个匹配';
      return;
    }
    let re;
    try {
      re = new RegExp(pattern, regexFlagsInput.value || 'g');
    } catch (e) {
      showRegexError('正则语法错误: ' + e.message);
      return;
    }
    // 使用 exec 收集所有匹配（即使没有 g flag 也至少跑一次）
    const matches = [];
    try {
      let m;
      if (re.global) {
        while ((m = re.exec(text)) !== null) {
          matches.push({ value: m[0], index: m.index, groups: m.slice(1) });
          if (m[0].length === 0) re.lastIndex++; // 防止 infinite loop
        }
      } else {
        m = re.exec(text);
        if (m) matches.push({ value: m[0], index: m.index, groups: m.slice(1) });
      }
    } catch (e) {
      showRegexError('执行错误: ' + e.message);
      return;
    }

    regexMatchCount.textContent = matches.length + ' 个匹配';

    // 高亮：用 replace 在整文本上替换
    let highlighted;
    try {
      // 总是用 g flag 来做高亮
      const reGlobal = new RegExp(pattern, regexFlagsInput.value.replace('g', '') + 'g');
      highlighted = escapeHtml(text).replace(reGlobal, s => `<mark>${escapeHtml(s)}</mark>`);
    } catch {
      highlighted = escapeHtml(text);
    }
    regexHighlight.innerHTML = highlighted;

    // 匹配列表
    if (matches.length === 0) {
      regexMatches.innerHTML = '<div style="color:#64748b;padding:8px 0;">无匹配项</div>';
    } else {
      regexMatches.innerHTML = matches.slice(0, 50).map((m, i) =>
        `<div class="regex-match-item">
          <span class="regex-match-index">#${i + 1} @${m.index}</span>
          <span class="regex-match-value">${escapeHtml(m.value)}</span>
        </div>`
      ).join('') + (matches.length > 50 ? `<div style="color:#64748b;font-size:11px;padding:4px 0;">...仅显示前 50 个</div>` : '');
    }
  }

  [regexPattern, regexText].forEach(el => el.addEventListener('input', runRegex));

  // ==================== Color Tool ====================
  const colorPicker = document.getElementById('colorPicker');
  const colorHex = document.getElementById('colorHex');
  const colorRgb = document.getElementById('colorRgb');
  const colorHsl = document.getElementById('colorHsl');
  const colorPreview = document.getElementById('colorPreview');
  const colorPreviewText = document.getElementById('colorPreviewText');
  const colorError = document.getElementById('colorError');

  function showColorError(msg) { colorError.textContent = '⚠️ ' + msg; colorError.classList.add('show'); }
  function clearColorError() { colorError.classList.remove('show'); colorError.textContent = ''; }

  // HEX -> RGB
  function hexToRgb(hex) {
    let h = hex.replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('无效 HEX');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  // RGB -> HEX
  function rgbToHex(r, g, b) {
    const pad = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return '#' + pad(r) + pad(g) + pad(b);
  }
  // RGB -> HSL
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  // HSL -> RGB
  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
  // 解析多种格式 -> {r, g, b}
  function parseColor(input) {
    const v = input.trim();
    // HEX
    if (/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(v)) {
      return hexToRgb(v.startsWith('#') ? v : '#' + v);
    }
    // rgb(r, g, b)
    const rgbM = v.match(/rgba?\(\s*(\d+)\s*[°,]\s*(\d+)\s*[°,]\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)/i);
    if (rgbM) return { r: +rgbM[1], g: +rgbM[2], b: +rgbM[3] };
    // hsl(h, s%, l%)
    const hslM = v.match(/hsl\(\s*(\d+)\s*[°,]\s*(\d+)%\s*[, ]\s*(\d+)%\s*\)/i);
    if (hslM) return hslToRgb(+hslM[1], +hslM[2], +hslM[3]);
    throw new Error('无法解析颜色，支持格式: #RRGGBB, rgb(r,g,b), hsl(h,s%,l%)');
  }

  function updateColorAll(rgb) {
    clearColorError();
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    colorHex.value = hex;
    colorRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    colorHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    colorPicker.value = hex;
    colorPreview.style.background = hex;
    colorPreviewText.textContent = hex.toUpperCase();
  }

  colorPicker.addEventListener('input', () => {
    try { updateColorAll(hexToRgb(colorPicker.value)); } catch {}
  });
  colorHex.addEventListener('input', () => {
    try { updateColorAll(parseColor(colorHex.value)); } catch (e) { showColorError(e.message); }
  });
  colorRgb.addEventListener('input', () => {
    try { updateColorAll(parseColor(colorRgb.value)); } catch (e) { showColorError(e.message); }
  });
  colorHsl.addEventListener('input', () => {
    try { updateColorAll(parseColor(colorHsl.value)); } catch (e) { showColorError(e.message); }
  });
  // 预设色
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      try { updateColorAll(hexToRgb(btn.dataset.color)); } catch {}
    });
  });
  // data-copy 复制按钮
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.copy);
      if (el && el.value) copyText(el.value);
    });
  });

  // ==================== Counter Tool ====================
  const counterInput = document.getElementById('counterInput');
  const cntChars = document.getElementById('cntChars');
  const cntCharsNoSpace = document.getElementById('cntCharsNoSpace');
  const cntWords = document.getElementById('cntWords');
  const cntLines = document.getElementById('cntLines');
  const cntChinese = document.getElementById('cntChinese');
  const cntBytes = document.getElementById('cntBytes');

  function countText() {
    const t = counterInput.value;
    cntChars.textContent = t.length;
    cntCharsNoSpace.textContent = t.replace(/\s/g, '').length;
    // 词数：英文单词 + 中文每个字
    const words = (t.match(/[a-zA-Z0-9]+/g) || []).length;
    const chinese = (t.match(/[\u4e00-\u9fff]/g) || []).length;
    cntWords.textContent = words + chinese;
    cntLines.textContent = t ? t.split('\n').length : 0;
    cntChinese.textContent = chinese;
    cntBytes.textContent = new TextEncoder().encode(t).length;
  }
  counterInput.addEventListener('input', countText);

  document.getElementById('counterClear').onclick = () => { counterInput.value = ''; countText(); };
  document.getElementById('counterLorem').onclick = () => {
    counterInput.value = `Hello 世界！这是一段示例文本。\nThis is a sample text for testing.\n包含中英文、Numbers 123、以及一些特殊字符 !@#。\n程序员的日常：写代码，调试，喝咖啡 ☕`;
    countText();
  };

  // ==================== Base Conversion Tool ====================
  const binInput = document.getElementById('binInput');
  const octInput = document.getElementById('octInput');
  const decInput = document.getElementById('decInput');
  const hexInput = document.getElementById('hexInput');
  const baseError = document.getElementById('baseError');

  function showBaseError(msg) { baseError.textContent = '⚠️ ' + msg; baseError.classList.add('show'); }
  function clearBaseError() { baseError.classList.remove('show'); baseError.textContent = ''; }

  let baseSyncing = false;
  function setAllFromDecimal(bigInt) {
    baseSyncing = true;
    try {
      const n = bigInt;
      const neg = n < 0n;
      const abs = neg ? -n : n;
      binInput.value = (neg ? '-' : '') + abs.toString(2);
      octInput.value = (neg ? '-' : '') + abs.toString(8);
      decInput.value = n.toString();
      hexInput.value = (neg ? '-' : '') + abs.toString(16).toUpperCase();
    } finally {
      baseSyncing = false;
    }
  }

  function parseToBigInt(str, base) {
    let s = str.trim();
    if (!s) throw new Error('请输入数值');
    let neg = false;
    if (s.startsWith('-')) { neg = true; s = s.slice(1); }
    // 去掉前缀
    if (base === 2 && /^0b/i.test(s)) s = s.slice(2);
    if (base === 8 && /^0o/i.test(s)) s = s.slice(2);
    if (base === 16 && /^0x/i.test(s)) s = s.slice(2);
    if (!s) throw new Error('空值');
    const validChars = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9a-fA-F]+$/ };
    if (!validChars[base].test(s)) throw new Error('含有非法字符');
    // 用 BigInt 解析
    let n = 0n;
    const b = BigInt(base);
    for (const ch of s) {
      n = n * b + BigInt(parseInt(ch, base));
    }
    return neg ? -n : n;
  }

  function onBaseInput(input, base) {
    if (baseSyncing) return;
    clearBaseError();
    try {
      const n = parseToBigInt(input.value, base);
      setAllFromDecimal(n);
    } catch (e) {
      showBaseError(e.message + '（' + ({2:'二进制',8:'八进制',10:'十进制',16:'十六进制'}[base]) + '）');
    }
  }

  binInput.addEventListener('input', () => onBaseInput(binInput, 2));
  octInput.addEventListener('input', () => onBaseInput(octInput, 8));
  decInput.addEventListener('input', () => onBaseInput(decInput, 10));
  hexInput.addEventListener('input', () => onBaseInput(hexInput, 16));

  // 初始化一个示例
  binInput.value = '1010';
  setAllFromDecimal(10n);

  console.log('%c🛠️ DevTools 程序员工具箱', 'color:#818cf8;font-weight:bold;font-size:14px;');
})();
