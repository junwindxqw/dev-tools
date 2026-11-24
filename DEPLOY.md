# 🚀 DevTools 部署文档

> 项目为纯静态网站（HTML + CSS + JS），**零构建、零依赖、零后端**，可部署到任意静态托管平台。

## 📋 部署前确认

确保项目文件完整：

```
dev-tools/
├── index.html     ✅ 存在且非空
├── css/style.css  ✅
├── js/app.js      ✅
└── README.md
```

项目已部署在线预览：https://37lmtohhclpbqif7q7m.traesite.cn

---

## 方式一：GitHub Pages（免费）

最推荐，代码已在 GitHub 仓库。

### 步骤

1. 打开仓库 → **Settings** → **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，目录 `/ (root)`
4. 点 **Save**
5. 等待 1-2 分钟，页面顶部会出现访问地址：
   ```
   https://junwindxqw.github.io/dev-tools/
   ```

### 自定义域名（可选）

1. 在仓库 `Settings → Pages → Custom domain` 填入你的域名（如 `tools.example.com`）
2. 在 DNS 服务商添加 CNAME 记录：
   ```
   tools.example.com  →  junwindxqw.github.io
   ```
3. 勾选 **Enforce HTTPS**

---

## 方式二：Vercel（免费）

### 步骤

1. 访问 https://vercel.com 并登录
2. 点 **Add New → Project**
3. 从 GitHub 导入 `dev-tools` 仓库
4. **Framework Preset** 选择 **Other**（不使用任何框架）
5. **Build Command** 留空
6. **Output Directory** 填 `.`（项目根目录）
7. **Root Directory** 填 `.`
8. 点 **Deploy**，约 30 秒完成

### Vercel CLI 方式

```bash
# 安装 CLI
npm i -g vercel

# 在项目根目录执行
cd dev-tools
vercel          # 首次部署（交互式）
vercel --prod   # 部署到生产环境
```

---

## 方式三：Netlify（免费）

### 步骤

1. 访问 https://app.netlify.com/drop
2. 把整个 `dev-tools` 文件夹**拖进网页窗口**
3. 约 10 秒部署完成，自动生成 `xxx.netlify.app` 地址

### 或通过 Netlify CLI

```bash
npm i -g netlify-cli
cd dev-tools
netlify deploy --build
netlify deploy --prod
```

---

## 方式四：Cloudflare Pages（免费，中国可用）

### 步骤

1. 访问 https://pages.cloudflare.com
2. **Create a project** → **Connect to Git**
3. 选择 GitHub 仓库 `dev-tools`
4. 配置：
   - **Production branch**: `main`
   - **Build command**: 留空
   - **Build output directory**: `.`
5. 点 **Save and Deploy**

---

## 方式五：Nginx 自建服务器

### 环境要求

- Linux 服务器（Ubuntu 20.04+ / CentOS 8+）
- Nginx 1.18+

### 步骤

```bash
# 1. 安装 Nginx（Ubuntu/Debian）
sudo apt update && sudo apt install -y nginx

# 2. 克隆项目
cd /var/www
git clone https://github.com/junwindxqw/dev-tools.git

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/dev-tools
sudo chmod -R 755 /var/www/dev-tools

# 4. 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/dev-tools > /dev/null <<'EOF'
server {
    listen 80;
    server_name tools.example.com;    # 改成你的域名或服务器 IP
    root /var/www/dev-tools;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1024;

    # 静态资源缓存（1 小时）
    location ~* \.(css|js|png|jpg|svg|ico|woff2?)$ {
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # SPA 回退（虽然本项目不是 SPA，但保险起见）
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 5. 启用配置
sudo ln -s /etc/nginx/sites-available/dev-tools /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo systemctl reload nginx

# 6. 配置 HTTPS（推荐，免费 Let's Encrypt）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tools.example.com
```

### 后续更新

```bash
cd /var/www/dev-tools
git pull origin main
# 一般不需要重启 Nginx，纯静态文件直接生效
```

---

## 方式六：Docker

### Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 基于轻量级 Nginx Alpine
FROM nginx:alpine

# 复制静态文件
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# 暴露端口
EXPOSE 80

# 启动
CMD ["nginx", "-g", "daemon off;"]
```

### 构建 & 运行

```bash
# 构建镜像
docker build -t dev-tools:latest .

# 运行容器
docker run -d --name dev-tools -p 8080:80 dev-tools:latest

# 访问
# http://localhost:8080
```

### docker-compose.yml

```yaml
version: '3'
services:
  dev-tools:
    build: .
    image: dev-tools:latest
    container_name: dev-tools
    restart: always
    ports:
      - "8080:80"
```

```bash
docker compose up -d    # 启动
docker compose down     # 停止
docker compose pull && docker compose up -d --build   # 更新
```

---

## 方式七：GitHub Actions 自动部署到 GitHub Pages

项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
```

推送到 `main` 分支后自动部署。

---

## 🔍 验证部署

无论用哪种方式，部署完成后都检查：

```bash
# 检查首页返回 200
curl -I https://你的域名/index.html
# → HTTP/2 200

# 检查 CSS 和 JS 加载
curl -I https://你的域名/css/style.css
curl -I https://你的域名/js/app.js
# → 都返回 200

# 检查响应头
curl -s -D - https://你的域名/ -o /dev/null | grep -i content-type
# → content-type: text/html; charset=UTF-8
```

浏览器打开后应能看到：
- ✅ 左侧 7 个导航项正常
- ✅ 默认显示 JSON 格式化面板
- ✅ 点击任意导航项切换面板无报错
- ✅ 控制台（F12 → Console）无红色报错

---

## 🛠️ 常见问题

### Q: 页面空白？
检查 Nginx/Vercel/Netlify 的**根目录路径**是否正确指向 `dev-tools/`。

### Q: 刷新 404？
本项目是纯多页面（7 个 panel 都在一个 HTML 里靠 JS 切换），正常不会 404。如果你加了 SPA 路由，需要配置 `try_files $uri /index.html`。

### Q: 中文乱码？
确保服务器返回的 `Content-Type` 包含 `charset=UTF-8`。HTML 已声明 `<meta charset="UTF-8">`，一般不会有问题。

### Q: HTTPS 混合内容警告？
你的域名使用 HTTPS，但站内引用了 HTTP 资源。本项目无外部依赖，不会出现此问题。

### Q: 部署后更新代码？
- **GitHub Pages / Vercel / Netlify / Cloudflare**: 推送代码到仓库，自动重新部署
- **Nginx / Docker**: 手动拉取或重建镜像

---

## 📊 各平台对比

| 平台 | 费用 | 部署难度 | 国内访问 | 自动 HTTPS | 自定义域名 |
|------|------|----------|----------|------------|------------|
| **GitHub Pages** | 免费 | ⭐ 简单 | ⚠️ 一般 | ✅ | ✅ |
| **Vercel** | 免费 | ⭐⭐ 简单 | ⚠️ 一般 | ✅ | ✅ |
| **Netlify** | 免费 | ⭐ 极简单 | ⚠️ 一般 | ✅ | ✅ |
| **Cloudflare Pages** | 免费 | ⭐⭐ 简单 | ✅ 快 | ✅ | ✅ |
| **Nginx 自建** | 服务器费 | ⭐⭐⭐ 中等 | ✅ 最快 | ⚠️ 需配置 | ✅ |
| **Docker** | 服务器费 | ⭐⭐ 简单 | ✅ 快 | ⚠️ 需配置 | ✅ |

> 国内用户推荐 **Cloudflare Pages** 或自建 **Nginx**。

---

## 📦 当前项目信息

| 项 | 值 |
|---|---|
| GitHub 仓库 | https://github.com/junwindxqw/dev-tools |
| Trae 部署 | https://37lmtohhclpbqif7q7m.traesite.cn |
| Site ID | `37lmtohhclpbqif7q7m` |
| 工具数量 | 7 个 |
| 总文件数 | 3 (HTML + CSS + JS) |
| 产物大小 | ~21 KB |
| 部署类型 | StaticWeb |
