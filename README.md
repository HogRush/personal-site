# 你的名字 · 个人主页

个人网站第一版 —— 纯静态站点（无框架、无构建步骤），暖纸极简 + 编辑部衬线斜体风格，风格参考 [sitor.cc](https://sitor.cc/)。

## 文件结构

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构与全部文案 |
| `styles.css` | 设计 token、组件样式、响应式与亮/暗双模式 |
| `script.js` | 主题切换、移动端导航、滚动入场动效 |
| `.gitignore` | 忽略 `node_modules/`、`.env`、`dist/` 等 |

## 本地预览

任意静态服务器即可，例如：

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 部署

部署目标：Cloudflare Pages（项目名 `personal-site`，生产分支 `main`）。

```bash
wrangler pages deploy . --project-name=personal-site --branch=main
```

## ⚠️ 待替换的占位内容

上线前请把以下内容替换为真实信息（当前均为占位）：

- [ ] 站点标题与描述（`index.html` 的 `<title>` / `<meta name="description">`）
- [ ] 名字：「你的名字」（页头、Hero、页脚签名、页脚版权）
- [ ] 一句话介绍：Hero 副标题
- [ ] 关于段落：两段占位自我介绍 + 签名
- [ ] 项目卡片：项目一 ~ 项目四 的标题、描述、标签、链接
- [ ] 联系方式：邮箱 `you@example.com`（Hero、联系区、页脚）
- [ ] 社交链接：GitHub `your-username`、X `your-handle`（页脚）
- [ ] 页脚版权文案

## 设计说明

- 底色 `#F5F5F0` + 全页 1.5% 透明 SVG 噪点纸纹（暗色模式 3%）
- 文字 `#1C1917` / `#57534E` / `#A8A29E`；焦糖强调 `#D4A574`（浅底 `#FDF6EE`）
- 标题：Playfair Display *斜体*（中文回退 Noto Serif SC / 宋体），`letter-spacing: -0.02em`
- 正文：Inter 16px / 1.5（中文回退 PingFang SC）
- 卡片：白底 + 1px `#E7E5E4` 边框 + 16px 圆角 + 极轻阴影
- 关键词高亮：62% 高度处半透明 accent 色带（马克笔效果）
- 动效：滚动入场 `opacity 0→1 + translateY(14px→0)`（IntersectionObserver）；hover 一律 0.15s ease-out；遵守 `prefers-reduced-motion`
- 主题：默认跟随系统 `prefers-color-scheme`，手动选择存入 `localStorage`（`<head>` 内联脚本防止首屏闪烁）
- 图标：Lucide 风格 inline SVG（`stroke: currentColor`）
