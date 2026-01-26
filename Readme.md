# CONSTRUX - Unified Construction Management Platform

**Construx** is a comprehensive construction management platform designed to digitize field operations, streamline communication, and enhance visibility across construction sites. It connects Layout Managers, Site Engineers, and Workers through a unified system comprising a Web Dashboard and a Mobile Application.

### 🏗️ Role-Based Access Control
- **Manager (Web)**: Full oversight of sites, attendance, inventory, requests, and reports.
- **Site Engineer (Mobile)**: Daily reporting (DPR), task management, material requests, and crew attendance.
- **Worker (Mobile)**: Check-in/out via QR/Face ID, view assigned tasks, and raise issues.

### 📱 Core Modules
- **Attendance System**:
  - **Geofencing**: Ensures attendance is marked only within site boundaries.
  - **Face Recognition**: AI-powered identity verification using DeepFace.
- **Material Management**:
  - **Material Approval Requests (MAR)**: Engineers request materials; Managers approve/pay.
  - **Purchase Orders (PO)**: Auto-generation of professional POs upon approval.
  - **Inventory Tracking**: Real-time stock updates based on usage and deliveries.
- **Tool Library**:
  - **Digital Handover**: QR-code based tool borrowing/return tracking.
  - **Availability**: Real-time status of shared tools.
- **Project Management**:
  - **Daily Progress Reports (DPR)**: Site photo uploads and progress logging.
  - **Task Assignment**: Assign and track tasks for specific workers or teams.
- **Finance**:
  - **Petty Cash**: Track site expenses.
  - **Invoicing**: Automated invoice generation for payments.

---

## 🛠️ Technology Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB 
- **Authentication**: JWT, bcryptjs
- **Payment Gateway**: Razorpay Integration

### **Frontend (Web)**
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS, Shadcn UI (Lucide React icons)

### **Frontend (Mobile)**
- **Framework**: React Native (Expo)
- **Camera/Biometrics**: Expo Camera, Local Authentication

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Expo Go (Mobile testing)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# PORT=5500
# MONGO_URI=your_mongo_uri
# JWT_SECRET=your_secret
# RAZORPAY_KEY_ID=...
# RAZORPAY_KEY_SECRET=...
npm run dev
```

### 3. Web Dashboard Setup
```bash
cd web
.env(NEXT_PUBLIC_RAZORPAY_KEY_ID=)
npm install
npm run dev
# Access at http://localhost:3000
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
npx expo run:android
# Scan QR code with Expo Go or run on Emulator
```

---

| Role | Platform | Phone Number | Password |
|------|----------|--------------|----------|
| **Manager** | Web Dashboard | `9999999999` | `password123` |
| **Site Engineer** | Mobile App | `8888888888` | `password123` |
| **Worker** | Mobile App | `7777777777` | `password123` |

