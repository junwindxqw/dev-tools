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

  // ==================== ID Card Tool ====================
  const PROVINCES = {
    '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省', '15': '内蒙古自治区',
    '21': '辽宁省', '22': '吉林省', '23': '黑龙江省',
    '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省', '35': '福建省', '36': '江西省', '37': '山东省',
    '41': '河南省', '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区', '46': '海南省',
    '50': '重庆市', '51': '四川省', '52': '贵州省', '53': '云南省', '54': '西藏自治区',
    '61': '陕西省', '62': '甘肃省', '63': '青海省', '64': '宁夏回族自治区', '65': '新疆维吾尔自治区'
  };
  // 常用区县前缀 (省份码 + 常见区县码)，6 位不足的部分补 00
  const DISTRICT_POOLS = {
    '11': ['110101','110102','110105','110106','110108','110109','110111','110112','110113','110114','110115','110116','110117','110118','110119'],
    '12': ['120101','120102','120103','120104','120105','120106','120110','120111','120112','120113','120114','120115','120116','120117'],
    '13': ['130102','130104','130105','130107','130402','130406','130502','130202','130802','131002','131102'],
    '14': ['140105','140106','140107','140402','140502','140602','140702','140802','141002','141102'],
    '15': ['150102','150103','150104','150105','150202','150203','150302','150402','150502','150602','150702','150802','150902'],
    '21': ['210102','210104','210105','210106','210111','210112','210202','210203','210204','210211','210213','210302','210303','210304','210402','210403','210502','210503'],
    '22': ['220102','220103','220104','220105','220112','220202','220203','220204','220302','220303','220402','220502','220602','220702','220802','222402'],
    '23': ['230102','230103','230104','230108','230109','230302','230303','230304','230402','230403','230502','230503','230602','230603','230702','230802','230902','231002','231102','231202'],
    '31': ['310101','310104','310105','310106','310107','310109','310110','310112','310113','310114','310115','310116','310117','310118','310120'],
    '32': ['320102','320104','320105','320106','320111','320113','320114','320115','320202','320203','320204','320205','320206','320502','320505','320506','320507','320508','320602','320611','320612'],
    '33': ['330102','330105','330106','330108','330109','330110','330111','330112','330113','330202','330203','330205','330206','330211','330302','330303','330304','330305','330306','330327'],
    '34': ['340102','340103','340104','340111','340121','340202','340203','340207','340302','340303','340304','340402','340403','340404','340502','340503','340602','340702','340802','340823'],
    '35': ['350102','350103','350104','350105','350111','350112','350121','350203','350205','350206','350211','350212','350302','350303','350304','350305','350306','350402','350403','350502','350503','350504','350505'],
    '36': ['360102','360103','360104','360111','360112','360121','360202','360203','360204','360205','360206','360302','360303','360402','360403','360424','360502','360521','360602','360681','360702','360703','360704'],
    '37': ['370102','370103','370104','370105','370111','370112','370202','370203','370211','370212','370213','370214','370215','370216','370302','370303','370304','370402','370403','370404','370405','370406','370502','370503','370504'],
    '41': ['410102','410103','410104','410105','410106','410111','410122','410202','410203','410204','410205','410211','410212','410302','410303','410304','410305','410306','410307','410308','410309','410310','410402','410403','410404','410405','410406','410482','410502','410503','410504','410505','410506'],
    '42': ['420102','420103','420104','420105','420106','420111','420112','420113','420114','420115','420116','420117','420202','420203','420204','420205','420206','420207','420208','420209','420210','420502','420503','420504','420505','420506','420525'],
    '43': ['430102','430103','430104','430105','430111','430112','430121','430202','430203','430204','430205','430211','430212','430223','430302','430303','430304','430305','430306','430311','430312','430402','430403','430404','430405','430406','430407','430408','430481','430502','430503','430504','430505','430506','430507'],
    '44': ['440103','440104','440105','440106','440111','440112','440113','440114','440115','440116','440117','440118','440119','440202','440203','440204','440222','440224','440281','440282','440303','440304','440305','440306','440307','440308','440309','440310','440311','440402','440403','440404','440481','440507','440511','440512','440513','440604','440605','440606','440607','440608'],
    '45': ['450102','450103','450105','450107','450108','450109','450110','450111','450112','450123','450202','450203','450204','450205','450206','450211','450212','450222','450302','450303','450304','450305','450311','450312','450313','450323','450402','450403','450404','450405','450406','450422','450502','450503','450512','450521','450522'],
    '46': ['460105','460106','460107','460108','460110','460111','460121','460202','460203','460204','460205','460206','460212','460213','469001','469002','469005'],
    '50': ['500101','500102','500103','500104','500105','500106','500107','500108','500109','500110','500111','500112','500113','500114','500115','500116','500117','500118','500119','500120','500121','500122','500228','500229','500230'],
    '51': ['510104','510105','510106','510107','510108','510112','510113','510114','510115','510116','510117','510118','510121','510129','510131','510132','510133','510134','510181','510182','510183','510184','510185','510302','510303','510304','510311','510402','510403','510404','510411','510421','510502','510503','510504','510521','510522'],
    '52': ['520102','520103','520104','520105','520106','520111','520112','520113','520114','520115','520121','520122','520123','520125','520181','520202','520203','520204','520205','520206','520211','520212','520213','520221','520222','520223','520302','520303','520304','520305','520306','520307','520322','520323','520324'],
    '53': ['530102','530103','530111','530112','530113','530114','530115','530116','530117','530118','530121','530122','530123','530124','530125','530126','530127','530128','530129','530181','530201','530202','530203','530204','530205','530302','530303','530304','530322','530323','530402','530403','530404','530481'],
    '54': ['540102','540103','540104','540105','540106','540107','540108','540109','540121','540122','540123','540124','540125','540202','540203','540221','540302','540303','540321','540402','540421','540502','540521','540602','540621','540702','540721'],
    '61': ['610102','610103','610104','610105','610106','610111','610112','610113','610114','610115','610116','610117','610118','610121','610122','610123','610124','610125','610126','610127','610128','610129','610130','610131','610132','610133','610134','610135','610136','610137','610138','610181','610182','610202','610203','610204','610221','610222','610302','610303','610304','610305','610306','610307','610308','610322','610323','610324','610325'],
    '62': ['620102','620103','620104','620105','620111','620112','620113','620121','620122','620123','620124','620125','620126','620127','620128','620129','620130','620131','620132','620133','620134','620181','620202','620203','620204','620205','620206','620207','620208','620209','620302','620303','620304','620322','620323','620324','620325','620326','620402','620403','620404','620421','620422','620423'],
    '63': ['630102','630103','630104','630105','630106','630107','630111','630121','630122','630123','630124','630125','630126','630127','630128','630181','630182','630183','630184','630202','630203','630221','630222','630223','630224','630225','630226','630227'],
    '64': ['640102','640103','640104','640105','640106','640121','640122','640181','640182','640202','640203','640204','640205','640221','640281','640282','640302','640303','640322','640323','640324','640325'],
    '65': ['650102','650103','650104','650105','650106','650107','650109','650111','650121','650122','650123','650124','650125','650126','650127','650128','650129','650130','650131','650202','650203','650204','650221','650222','650223','650224','650302','650303','650304','650322','650323','650324','650325','650402','650403','650421','650422','650423','650424','650425','650502','650521','650522','650523','650524','650602','650621','650622','650623','650624','650625','650626','650702','650721','650722','650723','650724','650725','650726','652301','652302','652303','652304','652322','652323','652324','652325','652327','652328']
  };

  // 身份证校验码计算 (ISO 7064 MOD 11-2)
  function calcCheckCode(id17) {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkChars = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    for (let i = 0; i < 17; i++) sum += parseInt(id17[i]) * weights[i];
    return checkChars[sum % 11];
  }

  // 随机整数 [min, max]
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 随机日期 [start, end]
  function randDate(startStr, endStr) {
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T23:59:59');
    if (start > end) throw new Error('生日起始日期不能晚于结束日期');
    const t = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  // 生成一张身份证
  function generateIdCard(provinceCode, gender, birthStart, birthEnd) {
    // 地区码: 选省份 + 从区县池随机选
    let area6;
    if (provinceCode && DISTRICT_POOLS[provinceCode]) {
      const pools = DISTRICT_POOLS[provinceCode];
      area6 = pools[randInt(0, pools.length - 1)];
    } else {
      // 随机省份
      const codes = Object.keys(DISTRICT_POOLS);
      const c = codes[randInt(0, codes.length - 1)];
      const pools = DISTRICT_POOLS[c];
      area6 = pools[randInt(0, pools.length - 1)];
    }

    const birth8 = randDate(birthStart, birthEnd);

    // 顺序码: 前 2 位随机, 第 3 位 (身份证第 17 位) 根据性别决定奇偶
    let seq;
    if (gender === 'male') {
      const first2 = randInt(0, 99);
      const genderDigit = randInt(0, 4) * 2 + 1; // 1,3,5,7,9 (奇数)
      seq = String(first2).padStart(2, '0') + String(genderDigit);
    } else if (gender === 'female') {
      const first2 = randInt(0, 99);
      const genderDigit = randInt(0, 4) * 2; // 0,2,4,6,8 (偶数)
      seq = String(first2).padStart(2, '0') + String(genderDigit);
    } else {
      seq = String(randInt(1, 999)).padStart(3, '0');
    }

    const id17 = area6 + birth8 + seq;
    const check = calcCheckCode(id17);
    return id17 + check;
  }

  // 解析身份证 (用于信息展示)
  function parseIdCard(id) {
    if (!/^\d{17}[\dXx]$/.test(id)) return null;
    const area6 = id.slice(0, 6);
    const birth = id.slice(6, 14);
    const seq = id.slice(14, 17);
    const check = id[17];
    const provinceCode = area6.slice(0, 2);
    const province = PROVINCES[provinceCode] || '未知';
    const gender = parseInt(seq[2]) % 2 === 1 ? '男' : '女';
    const year = birth.slice(0, 4), month = birth.slice(4, 6), day = birth.slice(6, 8);
    const age = new Date().getFullYear() - parseInt(year) - ((new Date().getMonth() + 1 < parseInt(month) || (new Date().getMonth() + 1 === parseInt(month) && new Date().getDate() < parseInt(day))) ? 1 : 0);
    const valid = calcCheckCode(id.slice(0, 17)).toUpperCase() === check.toUpperCase();
    return { province, gender, birth: `${year}-${month}-${day}`, age, check, valid };
  }

  const icProvince = document.getElementById('icProvince');
  const icGender = document.getElementById('icGender');
  const icBirthStart = document.getElementById('icBirthStart');
  const icBirthEnd = document.getElementById('icBirthEnd');
  const icCount = document.getElementById('icCount');
  const icResult = document.getElementById('icResult');
  const icInfo = document.getElementById('icInfo');
  const icError = document.getElementById('icError');

  function showIcError(msg) { icError.textContent = '⚠️ ' + msg; icError.classList.add('show'); }
  function clearIcError() { icError.classList.remove('show'); icError.textContent = ''; }

  document.getElementById('icGenerate').onclick = () => {
    clearIcError();
    icInfo.classList.remove('show');
    const province = icProvince.value;
    const gender = icGender.value;
    const count = parseInt(icCount.value) || 1;
    const birthStart = icBirthStart.value || '1970-01-01';
    const birthEnd = icBirthEnd.value || '2005-12-31';

    try {
      const cards = [];
      for (let i = 0; i < count; i++) {
        cards.push(generateIdCard(province, gender, birthStart, birthEnd));
      }
      icResult.value = cards.join('\n');

      // 展示第一张的解析信息
      const parsed = parseIdCard(cards[0]);
      if (parsed) {
        icInfo.innerHTML = `
          <div>📋 已生成 <span class="ic-item">${count}</span> 张身份证号${count > 1 ? '（仅展示第一张详情）' : ''}：</div>
          <div>📍 归属地: <span class="ic-item">${parsed.province}</span></div>
          <div>👤 性别: <span class="ic-item">${parsed.gender}</span></div>
          <div>🎂 出生日期: <span class="ic-item">${parsed.birth}</span></div>
          <div>⏳ 年龄 (预计): <span class="ic-item">${parsed.age} 岁</span></div>
          <div>✅ 校验码: <span class="ic-item">${parsed.check.toUpperCase()}</span> ${parsed.valid ? '✓ 有效' : '✗ 无效'}</div>
        `;
        icInfo.classList.add('show');
      }
    } catch (e) {
      showIcError(e.message);
    }
  };

  document.getElementById('icCopyAll').onclick = () => {
    if (!icResult.value) { showIcError('请先生成'); return; }
    copyText(icResult.value);
  };
  document.getElementById('icClear').onclick = () => {
    icResult.value = '';
    icInfo.classList.remove('show');
    clearIcError();
  };

  console.log('%c🛠️ DevTools 程序员工具箱', 'color:#818cf8;font-weight:bold;font-size:14px;');
})();
