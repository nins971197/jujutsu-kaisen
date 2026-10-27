# 咒术回战 · 视觉档案

> 一个关于《咒术回战》的非官方粉丝站点。用文字、排版与原创抽象图形，记录这个关于诅咒、选择与告别的故事。

**在线地址**：<https://nins971197.github.io/jujutsu-kaisen/> — 已发布，GitHub Pages 构建完成。

---

## 页面结构

| 页面 | 内容 |
| --- | --- |
| `index.html` | 首页：作品简介、三大力量体系、精选角色、篇章年表、观看入口 |
| `world.html` | 咒术世界：咒力 / 术式 / 领域 / 束缚 / 咒具五大体系、领域索引、阵营、术语表 |
| `characters.html` | 角色档案：16 位角色，支持阵营筛选与档案弹窗 |
| `watch.html` | 观看指南：五步入坑顺序、发行年表、观看前须知、总集篇 |
| `404.html` | 自定义错误页 |

### 交互

- 滚动进度条、滚动显现、数字计数
- 角色阵营筛选 + 键盘可操作的档案弹窗（`Esc` 关闭、焦点管理）
- 世界观页签（支持方向键切换）
- 术语手风琴
- “领域展开”全屏动画，随机展示一个领域名
- 手机端全屏导航
- 完整支持 `prefers-reduced-motion`

### 视觉

- 纯手写 HTML / CSS / JavaScript，**零运行时依赖、零外部请求**
- 不使用任何官方图片素材；角色卡、封面与 OG 图均为原创抽象设计
- 深色编辑排版 + 咒力红 / 紫色光晕 + 日文竖排点缀
- 响应式适配 1440 → 320px

## 本地预览

需要 Node.js 18+。

```bash
node scripts/serve.mjs
# 打开 http://localhost:4173
```

或使用任意静态服务器：

```bash
python -m http.server 4173
```

## 发布到 GitHub Pages

### 方式一：一键脚本（推荐）

1. 打开 GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**。
2. 生成一个勾选 **`repo`** 权限的 token。
3. 在项目目录执行：

```powershell
$env:GITHUB_TOKEN = "ghp_你的token"
node scripts/deploy.mjs
```

脚本会自动：

- 创建公开仓库 `jujutsu-kaisen`（已存在则复用）
- 提交并推送到 `main`
- 启用 GitHub Pages（`main` 分支根目录）
- 轮询构建状态并输出站点地址

可选：`$env:REPO_NAME = "my-site"` 自定义仓库名。

### 方式二：手动发布

```bash
git init -b main
git add -A
git commit -m "feat: launch Jujutsu Kaisen visual archive"
git remote add origin https://github.com/nins971197/jujutsu-kaisen.git
git push -u origin main
```

然后进入仓库 **Settings → Pages**，Source 选择 **Deploy from a branch**，Branch 选择 `main` / `(root)`，保存即可。

> 提示：GitHub Pages 通常需要 1–2 分钟完成首次构建。

## 修改内容

- 角色：编辑 `characters.html` 中每张 `.char-card` 的 `data-*` 属性与卡片文案
- 世界观：编辑 `world.html` 的五个 `.tabpanel` 与术语 `<details>`
- 观看指南：编辑 `watch.html` 的 `.watch-item` 与年表
- 配色：编辑 `assets/css/style.css` 顶部 `:root` 变量
- 分享图：替换 `assets/img/og.png`（1200×630）

## 目录

```text
.
├── index.html
├── world.html
├── characters.html
├── watch.html
├── 404.html
├── favicon.ico
├── assets/
│   ├── css/style.css
│   ├── js/site.js
│   └── img/
│       ├── favicon.svg
│       └── og.png
├── scripts/
│   ├── serve.mjs
│   └── deploy.mjs
├── robots.txt
├── sitemap.xml
└── .nojekyll
```

## 版权与声明

- 本站为**非官方粉丝作品**，仅供学习、交流与个人展示，不用于商业用途。
- 《咒术回战》原作 © 芥见下下 / 集英社；动画 © MAPPA 及相关权利方。
- 站内所有视觉元素（角色抽象卡面、光晕、印章、OG 图）均为本项目原创设计，**未使用官方图像素材**。
- 角色危险度为站点主观分级，非官方设定；年表与播出信息依据公开资料整理，如与官方公告不一致，以官方为准。
- 如权利方认为内容不妥，请联系删除。

---

Made with ♥ for 呪術廻戦.
