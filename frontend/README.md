<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
=======
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
git clone https://github.com/sonavbinu/Gym-Management-System.git
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
MONGODB_URI=mongodb+srv://sonavbinu567_db_user:O4hg0Vcwcnm6bLsT@cluster0.qr9me5e.mongodb.net/?appName=Cluster0

JWT_SECRET=GymManagementSystem2026
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

Sona
>>>>>>> 5d4df57f021ba1450e75da0b1d9e6f311a57ba7d
