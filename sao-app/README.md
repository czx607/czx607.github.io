# 扫 - 扫码与账单识别

> 纯净无广告的扫码与账单识别工具 PWA

## ✨ 功能特性

- 📷 **实时扫码** - 打开即调用摄像头，自动识别二维码，支持震动反馈
- 🧾 **AI 账单识别** - 拍照或相册选图，自动提取金额、日期、商家、消费明细
- 📋 **一键整理分享** - 自动生成规范文本格式，支持复制到剪贴板和系统分享
- 📱 **PWA 支持** - 可添加到手机主屏幕，离线使用，体验媲美原生 APP
- 🌙 **深色科技感主题** - 简洁不花哨，移动端优先的大按钮设计
- 💾 **本地历史记录** - 自动保存扫码和账单识别记录，支持分类筛选和删除
- 🚫 **无广告、无追踪** - 纯净体验，数据仅保存在本地

## 🛠️ 技术栈

- React 19 + TypeScript
- Vite 构建工具
- Tailwind CSS 4 样式
- React Router 路由
- jsQR 二维码识别
- Sonner Toast 提示
- Lucide React 图标

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📱 安装到手机

1. 在手机浏览器打开部署后的网址
2. 点击浏览器菜单 → "添加到主屏幕"
3. 桌面会出现"扫"的图标，点开即可全屏使用

## 🧾 账单识别配置

开源版本的账单识别功能需要自行配置 AI 服务。编辑 `src/lib/bill-ocr.ts`，可以选择：

1. **Tesseract.js 本地 OCR**（推荐，纯前端无需后端）
   ```bash
   npm install tesseract.js
   ```
   然后在 `recognizeBill` 函数中使用 Tesseract 识别图片文字，再解析金额等信息。

2. **接入云服务商 OCR API**（百度/阿里/腾讯等）
   - 需要后端代理调用，避免 API Key 泄露
   - 返回结构化的账单数据

3. **接入 AI 图像理解服务**
   - 如 GPT-4V、通义千问 VL 等
   - 直接返回 JSON 格式的账单信息

当前代码中使用的是模拟数据，仅用于 UI 演示。

## 📦 打包成 APK

可以使用以下工具将 PWA 打包为安卓 APK：

- [PWABuilder](https://www.pwabuilder.com/)（微软出品，免费）
- [Median.co](https://median.co/)（原 gonative.io）

## 📁 项目结构

```
sao-app/
├── index.html                    # 入口 HTML
├── package.json                  # 项目依赖配置
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 配置
├── public/
│   ├── favicon.svg               # 网站图标
│   ├── manifest.json             # PWA 应用清单
│   └── sw.js                     # Service Worker（离线缓存）
└── src/
    ├── index.tsx                 # React 入口
    ├── app.tsx                   # 路由配置
    ├── index.css                 # 全局样式
    ├── tailwind-theme.css        # 主题变量
    ├── components/
    │   ├── Layout.tsx            # 应用主布局
    │   └── BottomTabBar.tsx      # 底部导航栏
    ├── hooks/
    │   └── use-mobile.ts         # 移动端检测
    ├── lib/
    │   ├── utils.ts              # 工具函数
    │   ├── history.ts            # 历史记录管理
    │   ├── bill-ocr.ts           # 账单 OCR 调用
    │   └── pwa.ts                # PWA 初始化
    └── pages/
        ├── ScanPage/             # 扫码页
        ├── BillPage/             # 账单识别页
        ├── MinePage/             # 我的页（历史记录）
        ├── ResultDetailPage/     # 结果详情页
        └── NotFoundPage/         # 404 页面
```

## 📄 License

MIT License - 可自由使用、修改、分发

## ⚠️ 注意事项

- 扫码功能需要 HTTPS 环境（localhost 除外）才能调用摄像头
- 账单识别功能需要自行配置 AI 服务，当前为模拟数据
- PWA 图标需要准备 `icon-192.png` 和 `icon-512.png` 放入 `public/` 目录
- 历史记录保存在浏览器 localStorage 中，清除浏览器数据会丢失
