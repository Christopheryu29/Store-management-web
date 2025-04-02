# 🏪 store-management-web

A modern, full-stack **store management system** built with **Next.js**, **Convex**, and **Chakra UI**, designed to streamline operations for both **store owners** and **cashiers**. This web app features secure role assignment, inventory control, checkout functionality, and rich document editing — all powered by the real-time Convex backend.

---


## 🛠 Tech Stack

- 🧠 [Convex](https://www.convex.dev) (backend database + real-time API)
- ⚛️ Next.js (frontend framework)
- 🌈 Chakra UI (responsive components & theming)
- 🔐 Clerk (authentication)
- 📝 Custom Markdown/Blocknote document editor
- 📦 Type-safe data with Convex `defineSchema`

---

## ✨ Features

### 🔐 Role-Based Access
- Cashiers can log in to individual stores and manage checkouts
- Owners can create and manage multiple stores and inventories

### 📦 Inventory Management
- Add, update, delete items
- Sort, search, and filter by price, name, stock
- Pagination, low stock alerts

### 🛒 Cashier Dashboard
- Secure store login via name/password
- Search & filter inventory
- Checkout functionality reduces stock

### 🧾 Owner Dashboard
- View all owned stores
- View sales, debts, and inventories
- Add new stores with passwords
- Manage store inventory with full CRUD access

### 📝 Document Notes
- Create and edit rich documents using a custom editor
- Cover image, icon, publish state
- Store notes in Convex `documents` table

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/store-management-web.git
cd store-management-web
```

### 2. Install Dependencies
```
npm install
```

### 3. Set Up convex
```
npx convex dev
```


---

###🔐 Authentication

 This app uses clerk for uses authentication. Set up your .env.local
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```
 

