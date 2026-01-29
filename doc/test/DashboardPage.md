---
description: DashboardPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】渲染儀表板基本元素
**範例輸入**：
- 渲染 DashboardPage
- user username 為 "TestUser"
**期待輸出**：
- 顯示標題「儀表板」
- 顯示歡迎訊息 "Welcome, TestUser 👋"
- 顯示登出按鈕

---

## [x] 【前端元素】Admin 角色顯示管理後台連結
**範例輸入**：
- user role 為 'admin'
**期待輸出**：
- 導覽列顯示「🛠️ 管理後台」連結
- 連結指向 `/admin`

---

## [x] 【前端元素】一般用戶不顯示管理後台連結
**範例輸入**：
- user role 為 'user'
**期待輸出**：
- 導覽列 **不顯示**「🛠️ 管理後台」連結

---

## [x] 【Mock API】商品載入中狀態
**範例輸入**：
- API 請求尚未完成
**期待輸出**：
- 顯示「載入商品中...」
- 顯示 Loading Spinner

---

## [x] 【Mock API】商品載入成功並渲染列表
**範例輸入**：
- API 回傳商品列表 [Product A, Product B]
**期待輸出**：
- 顯示 Product A 名稱與價格
- 顯示 Product B 名稱與價格
- 不顯示錯誤訊息或 Loading

---

## [x] 【Mock API】商品載入失敗
**範例輸入**：
- API 回傳 500 錯誤
**期待輸出**：
- 顯示錯誤訊息「無法載入商品資料」
- 不顯示商品列表

---

## [x] 【function 邏輯】登出功能
**範例輸入**：
- 點擊登出按鈕
**期待輸出**：
- 呼叫 `logout` 函式
- 導向至 `/login`
