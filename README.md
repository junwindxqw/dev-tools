# 🛠️ DevTools · 程序员工具箱

一个纯静态、零依赖的程序员常用工具集合。暗色主题现代 UI，左侧菜单栏 + 右侧工具面板布局，开箱即用。

🌐 **在线访问**: https://37lmtohhclpbqif7q7m.traesite.cn

---

## ✨ 功能特性

| # | 工具 | 说明 |
|---|------|------|
| 1 | **JSON 格式化** | 格式化 / 压缩 / 转义 / 反转义 / 实时校验 |
| 2 | **Base64 编解码** | 文本 ⇄ Base64，UTF-8 安全，双向交换 |
| 3 | **URL 编解码** | 两种编码模式（保留 URL 结构 / 完整转义），智能解码 |
| 4 | **HTML 实体** | 命名实体 / 十进制 / 十六进制，双向转换 |
| 5 | **时间戳转换** | 秒/毫秒自动识别，多时区（本地 / UTC / CST / EST / GMT / JST），实时显示当前时间 |
| 6 | **UUID 生成** | v4 随机生成，批量 1-100 个，大小写 / 连字符可选 |
| 7 | **随机字符生成** | 密码级强度，可配置字符集、长度，排除混淆字符，实时强度提示 |
| 8 | **正则表达式测试** | 实时匹配高亮、支持 g/i/m/s flags、匹配列表 + 数量统计 |
| 9 | **颜色转换** | HEX / RGB / HSL 互转、HTML5 取色器、10 种预设色 |
| 10 | **文本计数** | 字符数 / 不含空格 / 词数 / 行数 / 中文字数 / UTF-8 字节数 |
| 11 | **进制转换** | 二 / 八 / 十 / 十六进制互转，实时同步，支持 BigInt 大整数 |

## 🧩 技术栈

- **纯原生 HTML5 + CSS3 + JavaScript** — 零构建、零依赖、零后端
- **Web Crypto API** — 密码学安全的随机数生成
- **深色 / 响应式** — 移动端自适应

## 📂 项目结构

```
dev-tools/
├── index.html        # 主页面（含 7 个工具面板）
├── css/style.css     # 全局样式 + 各工具样式
├── js/app.js         # 所有工具逻辑（约 500 行）
├── .gitignore
└── README.md
```

## 🚀 本地运行

任选其一，打开浏览器访问 http://localhost:8765：

```bash
# Python 3
python3 -m http.server 8765

# Node.js
npx serve .

# PHP
php -S localhost:8765
```

## 📦 部署

项目为纯静态网站，上传任意静态托管即可：

- **GitHub Pages**: 推送到 `gh-pages` 分支
- **Vercel / Netlify / Cloudflare Pages**: 直接连接仓库，无需构建配置
- **Trae 部署**: 已发布至 https://37lmtohhclpbqif7q7m.traesite.cn

## 🧪 测试

内置 31 项自动化功能测试（jsdom），覆盖全部 7 个工具：

```bash
cd /tmp/jsdom-test && npm install jsdom && node test.cjs
# 运行结果: 31/31 通过
```

## 📝 开发计划

- [ ] 正则表达式测试器
- [ ] Markdown 实时预览
- [ ] 颜色选择器 / HEX-RGB 互转
- [ ] IP 地址查询
- [ ] 单位换算（字节 / 长度 / 温度）
- [ ] 代码压缩 / Minify
- [ ] Cookie / Header 解析器

## 📄 License

MIT © DevTools Contributors
