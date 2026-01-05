# 🏋️ Gym Management System

A full-stack subscription-based gym management system built with TypeScript, React, Node.js, Express, and MongoDB.

## 📋 Features

### User Roles
- **Admin**: Manage members, trainers, subscriptions, and payments
- **Trainer**: View assigned members, manage workout schedules
- **Member**: View subscription status, profile, and assigned trainer

### Core Functionality
- 🔐 **Authentication**: JWT-based auth with role-based access control
- 💳 **Subscription Management**: Monthly/Quarterly/Yearly plans with auto-expiry detection
- 👥 **Member Management**: Complete CRUD operations with profile management
- 🏃 **Trainer Management**: Assign members, manage schedules
- 💰 **Payment System**: Mocked payment records and invoice generation

## 🛠️ Tech Stack

### Frontend
- React 19.2.0
- TypeScript
- Vite
- React Router DOM
- Axios
- [UI Library - TBD]

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Gym-Management-System
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Setup Environment Variables**

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gym-management
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

5. **Run the Application**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
Gym-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Members (Admin only)
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/member/:memberId` - Get member subscriptions
- `PATCH /api/subscriptions/:id/pause` - Pause subscription

### Trainers
- `GET /api/trainers` - Get all trainers
- `POST /api/trainers/assign` - Assign member to trainer

### Payments
- `GET /api/payments/member/:memberId` - Get member payment history

## 📝 License

MIT

## 👨‍💻 Author

Your Name

