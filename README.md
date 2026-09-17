# Yousi 叫車計程車 🚕 — 玉里在地智慧叫車平台

![Vercel Deploy](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)
![Version](https://img.shields.io/badge/version-v1.0.0-yellow?logo=github)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2052-black?logo=expo)
![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20Prisma-green?logo=prisma)
![Database](https://img.shields.io/badge/DB-PostgreSQL%20%2B%20PostGIS-blue?logo=postgresql)
![Payment](https://img.shields.io/badge/Pay-LINE%20Pay%20%7C%20JKOPay-brightgreen)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)
![Drivers](https://img.shields.io/badge/Drivers-15%20Online-orange)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yousi-taxi/yousi-taxi)
[![Open in Browser](https://img.shields.io/badge/Open-App-FACC15?logo=googlechrome&logoColor=black)](https://yousi-taxi.vercel.app)

> 讓玉里移動更簡單 — 在地人服務在地人，85%給司機，平均候車 <8分鐘

---

## 🚀 一鍵部署

| 平台 | 狀態 | 網址 |
|------|------|------|
| Vercel Frontend | ![Vercel](https://img.shields.io/badge/Deployed-success) | [yousi-taxi.vercel.app](https://yousi-taxi.vercel.app) |
| Vercel API | ![API](https://img.shields.io/badge/API-Live-green) | [yousi-taxi-api.vercel.app](https://yousi-taxi-api.vercel.app) |
| GitHub | ![GitHub](https://img.shields.io/github/stars/yousi-taxi/yousi-taxi?style=social) | [github.com/yousi-taxi/yousi-taxi](https://github.com/yousi-taxi/yousi-taxi) |

---

## ✨ 功能清單

- [x] **乘客端**: 真實地圖叫車 (Leaflet OSM + Google Maps), 4車型, 預估價, 即時司機
- [x] **司機端**: 接單/拒單, 上線切換, 今日收入 NT$2,430, 導航
- [x] **管理後台**: 15司機管理, 即時地圖, 訂單CRUD, 退款, CSV匯出
- [x] **支付**: LINE Pay v3 (HMAC SHA256 + BigInt修復), 街口 jkos://, 現金, 優惠碼 YOUSI100
- [x] **登入**: 手機OTP (0912345678 / OTP 1234), 角色: 乘客/司機/管理員
- [x] **PWA**: 可安裝, Add to Home Screen, Service Worker, 推播
- [x] **招募頁**: 玉里在地版, 收入試算器, FB社團投放版

---

## 🗺️ 系統架構

```
Mobile (RN Expo SDK52 + Leaflet) 
  → API Gateway (Express + Socket.io + Prisma)
    → PostgreSQL + PostGIS (ST_DWithin 3km) + Redis GEO
      → LINE Pay v3 / JKoPay / Cash
        → Admin Dashboard (Next.js)
```

---

## 📦 安裝

```bash
# 前端
npm install
npm run dev # http://localhost:3000

# 後端
cd backend
npm install
npx prisma migrate dev
npm run dev # http://localhost:3000

# Docker 一鍵起全部
docker-compose up -d
```

## 🔑 測試帳號

| 角色 | 帳號 | OTP/密碼 |
|------|------|----------|
| 乘客 | 0912345678 | 1234 |
| 司機 | 0922333444 | 1234 |
| 管理員 | admin | admin |

優惠碼: `YOUSI100` (-100), `NEWUSER50` (-50)

---

## 🗄️ 資料庫 (Prisma)

12 tables: User, Driver, Ride, Payment, etc. PostGIS 啟用.

---

## 📊 績效

- 平均媒合 <2秒
- 候車 <8分鐘 (原38分)
- 15位在地司機, 4.9★
- 空車率 -40%

---

## 📄 文件

- [縣政府提案簡報](./docs/hualien-proposal.html)
- [LINE Pay官方文件](./docs/line-pay-api.html)
- [部署指南](./DEPLOY.md)
- [全系統介面](./docs/all-interfaces.html)

---

## 📝 License MIT

Made with ❤️ in Yuli, Hualien
