# 🗂️ Task Management Dashboard

A full-stack task management web application with secure authentication, a protected user dashboard, and complete CRUD functionality. Built using modern frontend and backend technologies with a focus on clean UI, security, and scalability.

---

## 🌐 Live Demo

### Frontend
👉 https://task-manager-frontend-v8h1.onrender.com  

### Backend (API)
👉 https://task-manager-backend-g5uk.onrender.com  

> All backend APIs are protected using JWT-based authentication.

---

## 📌 Project Overview

The Task Management Dashboard allows users to securely manage their tasks through a clean and responsive interface. The application demonstrates real-world frontend–backend integration, authentication flows, and RESTful API design.

Users can:
- Sign up and log in securely
- Access a protected dashboard
- Create, update, delete, and view tasks
- Search and filter tasks
- View and update their profile
- Log out securely

---

## 🏗️ Project Structure

```
Task-manager/
├── backend/        # Node.js + Express REST API
├── frontend/       # Next.js (React) frontend
└── README.md       # Project documentation
```

---

## 🚀 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes (dashboard accessible only after login)

### 📊 Dashboard & Tasks
- Task CRUD operations (Create, Read, Update, Delete)
- Task search and filter functionality
- Responsive UI across devices
- Loading, error, and success states for better UX

### 👤 Profile Management
- Fetch authenticated user profile
- Update profile details
- Secure logout flow

### 🔒 Security
- No plain-text password storage
- JWT validation middleware on protected routes
- Input validation on both frontend and backend
- Centralized error handling and basic logging

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JWT (JSON Web Tokens)
- bcrypt

---

## 🔗 API Documentation

- **Base API URL:**  
  https://task-manager-backend-g5uk.onrender.com/api/v1

- RESTful APIs with consistent error responses
- Includes authentication, profile, and task CRUD endpoints
- Postman collection available in the repository

---

## ⚙️ Local Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd Task-manager
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend will run on:
http://localhost:5000

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend will run on:
http://localhost:3000

---

## 👤 Demo Usage

- Create a new account using the signup page
- Log in to access the dashboard
- Add, update, search, and delete tasks

---

## 📈 Production & Scalability Considerations

- Deployment using Docker for consistent environments
- Environment variable management for secrets
- CORS configuration for production domains
- Database indexing for performance optimization
- Pagination and lazy loading for large datasets
- Redis caching for frequently accessed data
- Rate limiting and security headers
- Centralized logging and monitoring

---

## 📄 License

This project is intended for learning, demonstration, and portfolio purposes.
