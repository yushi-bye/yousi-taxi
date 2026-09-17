
# 部署到 yousi-taxi.vercel.app 步驟

## 1. 準備
```
npm i -g vercel
vercel login
```

## 2. 部署
在 yousi-taxi-v1 資料夾下：
```
vercel --prod --name yousi-taxi
```
- Framework: Vite
- Build Command: npm run build
- Output: dist

會得到網址: https://yousi-taxi.vercel.app (若被占用會是 yousi-taxi-xxx.vercel.app，可在Dashboard改名)

## 3. 自訂網域 yousi-taxi.vercel.app
若名稱被占用：
- 到 vercel.com/dashboard -> yousi-taxi -> Settings -> Domains
- Add Domain: yousi-taxi.vercel.app
- 若已被別人註冊，改用 yousi-yuli.vercel.app 或 yousi-taxi-tw.vercel.app

## 4. 環境變數
Vercel Dashboard -> Settings -> Environment Variables 新增:
VITE_API_URL=https://yousi-taxi-api.vercel.app
VITE_LINE_PAY_CHANNEL_ID=...

## 5. 後端API部署
同樣部署 backend 資料夾:
cd ../backend && vercel --prod --name yousi-taxi-api

## 6. PWA
已包含 manifest.json + sw.js，手機可 Add to Home Screen

完成！
