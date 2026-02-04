# Task Management Dashboard - Frontend Developer Intern Assignment

## 📋 Project Overview
Complete full-stack task management application with authentication, dashboard, and CRUD operations built for PrimeTrade AI internship assignment.

## 🏗️ Project Structure
Task-manager/
├── backend/ # Node.js Express API server
├── frontend/ # Next.js React application
└── README.md # This main documentation

text

## 🚀 Quick Setup

### 1. Clone and Navigate
```bash
git clone [your-repo-url]
cd Task-manager
2. Start Backend Server
bash
cd backend
npm install
# Copy .env.example to .env and configure
npm run dev
3. Start Frontend Application
bash
cd frontend
npm install
# Copy .env.local.example to .env.local
npm run dev
4. Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:5000

📊 Features Implemented
✅ Authentication System
User registration & login with validation

JWT token-based authentication

Password hashing with bcrypt

Protected routes

✅ Dashboard
Task CRUD operations (Create, Read, Update, Delete)

Real-time statistics and activity overview

Search, filter, and sort functionality

Responsive design

✅ Profile Management
View and update user profile

Change password with current password verification

Account deletion with confirmation

✅ Security
Input validation on both frontend and backend

Password strength requirements

Secure API endpoints with middleware

Error handling and logging

🔗 API Documentation
Base URL: http://localhost:5000/api/v1

Postman collection included in repository

See backend/README.md for detailed API docs

👤 Demo Credentials
Create your own account using registration page

Or use test accounts from your database

🛠️ Tech Stack
Frontend: Next.js 14, React, TypeScript, TailwindCSS

Backend: Node.js, Express, MongoDB, Mongoose

Authentication: JWT, bcrypt

UI: React Icons, Custom Components

📈 Production Scaling Considerations
Deployment: Containerize with Docker for consistency

CORS: Configure allowed origins for production domains

Environment: Use environment variables for configuration

Database: Add indexes on frequently queried fields (userId, email, status)

Caching: Implement Redis for session and API response caching

Security: Add rate limiting, input sanitization, security headers

Monitoring: Integrate logging and error tracking services

Performance: Implement pagination and lazy loading for large datasets

📝 Evaluation Criteria Met
✅ UI/UX quality and responsiveness

✅ Frontend-backend integration quality

✅ Security practices (hashing, JWT, validation)

✅ Code structure and cleanliness

✅ Documentation and reproducibility

✅ Scalability potential

For detailed frontend setup, see frontend/README.md
For detailed backend setup, see backend/README.md
