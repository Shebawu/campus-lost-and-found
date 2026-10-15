# 🎓 Campus Lost & Found + Item Recovery Platform

A full-stack web application that helps university students report lost items, post found items, and reunite people with their belongings. Includes a complete admin dashboard for campus security to verify claims.

## 🌐 Live Demo

- **Frontend:** [campus-lost-and-found-snowy.vercel.app](https://campus-lost-and-found-snowy.vercel.app)
- **Backend API:** [campus-lost-and-found-api-y6d2.onrender.com](https://campus-lost-and-found-api-y6d2.onrender.com)

> ⏰ **Note:** The backend is hosted on Render's free tier, so it may take up to 60 seconds to "wake up" on the first request.

---
## 📸 Screenshots

### 🏠 Home Page
![Home Page](screenshots/homepage.png)

### 📝 Report an Item
![Report Item](screenshots/report-item.png)

### 📋 Item Details & Claim Submission
![Item Detail](screenshots/item-detail.png)

### 🔐 Login
![Login](screenshots/login.png)

### 🛡️ Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### 📝 Register Page
![Register](screenshots/register.png)

### 🔍 Search & Filter
![Search and Filter](screenshots/homepage-with-search.png)

## 📱 Mobile App (Flutter)

### 🔐 Mobile Login
![Mobile Login](screenshots/mobile/mobile-login.png)

### 🏠 Mobile Home — Item List
![Mobile Home](screenshots/mobile/mobile-home.png)

### 📝 Report Item Form
![Mobile Report](screenshots/mobile/mobile-report.png)

### 👤 My Dashboard
![Mobile Dashboard](screenshots/mobile/mobile-dashboard.png)

### 📋 Item Detail & Claim
![Mobile Item Detail](screenshots/mobile/mobile-item-detail.png)

---
## ✨ Features


### 👨‍🎓 For Students
- 🔐 **Secure authentication** with JWT tokens and hashed passwords (bcrypt)
- 📸 **Report lost or found items** with photo uploads (Cloudinary)
- 🔍 **Browse and filter** all reported items
- 📋 **Submit claims** with proof of ownership for found items
- 🖼️ **View detailed item pages** with images, descriptions, and locations

### 🛡️ For Admins
- 📊 **Live dashboard stats** (total items, lost, found, pending claims, returned)
- ✅ **Review and approve/reject** claim requests
- 🔄 **Auto-resolve items** when a claim is approved
- 🔒 **Role-based access control** — admin-only routes

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Web Frontend** | React + Vite, React Router, Axios |
| **Mobile App** | Flutter 3.x, Dart |
| **Mobile State** | Provider |
| **Mobile Storage** | SharedPreferences |
| **Mobile Camera** | image_picker |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Neon) |
| **Auth** | JWT + bcryptjs |
| **File Storage** | Cloudinary |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **Mobile Build** | Flutter CLI (Android SDK) |

---
## 🏗️ Architecture

```mermaid
graph TD
    A[React Frontend<br/>Vercel] -->|HTTP / Axios| B[Node.js + Express API<br/>Render]
    B --> C[(PostgreSQL<br/>Neon)]
    B --> D[Cloudinary<br/>Image CDN]
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (or a free Neon account)
- Cloudinary account (free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/Shebawu/campus-lost-and-found.git
cd campus-lost-and-found
