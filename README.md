# IT Career Learning Platform

單人使用的 IT 實務學習管理平台，使用 React、Vite、TypeScript、Tailwind CSS、JSON seed data 與 localStorage。

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

## GitHub Pages

專案已包含 `.github/workflows/deploy.yml`。推送到 `main` 後，GitHub Actions 會建置 `dist` 並部署到 GitHub Pages。

平台使用 hash routing，重新整理頁面時不需要額外的 server rewrite 設定。
