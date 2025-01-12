# FCManager Web UI

FCManager 是一个基于 Vue 3 + TypeScript 的前端管理系统。

## 技术栈

- Vue 3
- TypeScript
- Vue Router
- Axios
- Vite

## 功能特性

- 🔐 用户认证（登录/注册）
- 👤 个人资料管理
- 📋 任务管理系统
- 🎨 现代化 UI 设计
- 🌙 暗色主题

## 开发环境要求

- Node.js >= 16
- npm >= 7

## 快速开始

1. 克隆项目

```bash
git clone https://github.com/你的用户名/fcmanager-webui.git
cd fcmanager-webui
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构
```
fcmanager-webui/
├── src/
│ ├── components/ # 通用组件
│ ├── views/ # 页面组件
│ ├── services/ # API 服务
│ ├── router/ # 路由配置
│ └── utils/ # 工具函数
├── public/ # 静态资源
└── index.html # 入口 HTML
```


## API 配置

默认 API 地址为 `http://127.0.0.1:5000/`。如需修改，请在 `src/services/api.ts` 中更新 `baseURL`。