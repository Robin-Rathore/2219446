<img width="1600" height="781" alt="image" src="https://github.com/user-attachments/assets/5f962ad4-d8b8-4234-be0f-eb1b87a2feda" />

<img width="1600" height="781" alt="image" src="https://github.com/user-attachments/assets/9752d362-1307-4ad9-abbd-83c63b212d75" />
<img width="1600" height="781" alt="image" src="https://github.com/user-attachments/assets/3ac709c8-d750-42fd-a6b7-a9d7d2f52457" />


This repository contains the complete solution for the Full Stack Track assignment for Affordmed Campus Hiring. It includes:

* ✅ Logging Middleware Package
* ✅ URL Shortener Backend Microservice (Express + MongoDB)
* ✅ URL Shortener Frontend App (React + Material UI)

---

## 📁 Repository Structure

```
/affordmed-assessment
├── backend/                # Express.js backend for URL shortening
├── frontend/               # React + TypeScript + MUI frontend client
├── logging-middleware/     # Reusable logging middleware used by both frontend and backend
├── package.json            # Root runner with concurrently
```

---

## 📦 Installation

```bash
# Clone the repository
https://github.com/your-username/your-roll-number.git

# Navigate to project root
cd assessment

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install logging middleware dependencies
cd ../logging-middleware && npm install
```

---

## 🚀 Running the App

From the project root, run both backend and frontend with one command:

```bash
npm run start
```

This uses `concurrently` to:

* Start backend on: `http://localhost:8080`
* Start frontend on: `http://localhost:3000`

---

## 🔒 Auth Setup

Set your **access token** using:

```js
setAuthToken("your-access-token");
```

This is used internally by the logging middleware.

---


* Tech stack decisions
* Data modeling
* Logging integration strategy

---

## 📜 Logging Middleware (Reusable)

* Located in `logging-middleware/`
* Used in both frontend and backend
* Sends logs to protected test server API
* Accepts stack, level, package, and message fields

---

## 🧪 API Endpoints (Backend)

| Method | Endpoint               | Description                   |
| ------ | ---------------------- | ----------------------------- |
| POST   | /shorturls             | Create short link             |
| GET    | /shorturls/\:shortcode | Retrieve stats for short link |
| GET    | /\:shortcode           | Redirect to original URL      |

---

## 🖥️ Frontend Features

* Create up to 5 short links concurrently
* Input optional validity & shortcode
* View all results and detailed stats
* Responsive layout with Material UI

---

## 📚 Notes

* Do **not** include your name or Affordmed in the repo name, README, or commit history
* Ensure proper structure and cleanliness for evaluation
* All commits follow logical milestones

---

## 🛠️ Build Tools

* Frontend: Vite + React + TypeScript
* Backend: Express.js + Mongoose
* Logging: Axios-based custom client
