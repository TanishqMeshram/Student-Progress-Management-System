# Student Progress Management System

## 📚 Project Overview

The **Student Progress Management System** is a full-stack MERN application designed to help educators and administrators monitor, analyze, and encourage the competitive programming progress of students. By integrating with the Codeforces API, the system automatically syncs student contest and problem-solving data, detects inactivity, and sends automated email reminders. The platform features a modern, responsive UI with rich data visualizations, CSV export, and a seamless light/dark mode toggle.

---

## 🚀 Features

- **Student Table View**
  - List all enrolled students with Name, Email, Phone, Codeforces Handle, Current Rating, Max Rating, Last Updated, Reminders Sent, and Auto Reminder status.
  - Add, edit, and delete students.
  - Download the entire student dataset as a CSV file.
  - "View Details" button navigates to a student's profile page.

- **Student Profile View**
  - Contest history with filtering by last 30, 90, or 365 days.
  - Interactive rating graph and contest list (with rank and unsolved problems).
  - Problem-solving statistics with filtering by last 7, 30, or 90 days.
  - Metrics: most difficult problem solved, total solved, average rating, average per day.
  - Bar chart of problems solved by rating bucket.
  - Submission heatmap for visualizing activity.

- **Codeforces Data Sync**
  - Automatic daily sync via cron job (default: 2 AM).
  - Manual sync triggered on handle update.
  - Option to update cron schedule from the frontend with live preview.

- **Inactivity Detection & Email Reminders**
  - Detects students with no submissions in the last 7 days.
  - Sends automatic, customizable email reminders.
  - Tracks and displays reminder email count per student.
  - Toggle to enable/disable reminders for individual students.

- **User Experience**
  - Fully responsive UI for mobile, tablet, and desktop.
  - Light/Dark mode toggle (persists user preference).
  - Smooth loading indicators and toast notifications for all async actions.
  - Accessible, modular, and well-documented codebase.

---

## ⚙️ Tech Stack

- **Frontend:** React, Tailwind CSS, Recharts, React Router, React Toastify, PapaParse
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Axios, Nodemailer, node-cron
- **Other:** Codeforces API, dotenv, Framer Motion

---

## 🛠️ Setup Instructions

### 1. **Clone the Repository**

```bash
git clone https://github.com/TanishqMeshram/Student-Progress-Management-System.git
cd Student-Progress-Management-System 
```

### 2. **Backend Setup**
```bash
cd backend
npm install
```
#### Create a .env file in the backend directory ####

```bash
MONGO_URI=mongodb://localhost:27017/student-progress
PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
STUDENT_SYNC_CRON=0 2 * * *
EMAIL_CRON=0 8 * * 1
```

Run backend server:
```bash
nodemon server.js
```

### 3. **Frontend Setup**
```bash
cd ../frontend
npm install
```
#### Create a .env file in the frontend directory ####

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend server:
```bash
npm run dev
```

## API Documentation

### Student APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/students` | Get all students |
| POST   | `/api/students` | Add a new student |
| GET    | `/api/students/:id` | Get a student by ID |
| PUT    | `/api/students/:id` | Update a student by ID |
| DELETE | `/api/students/:id` | Delete a student by ID |
| PUT    | `/api/students/:id/toggle-reminder` | Toggle auto-reminder for a student |

---

### Student Progress APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/students/:id/progress` | Get rating and submission history |
| GET    | `/api/students/:id/contest-history?range=90` | Get contest history (filter by days) |
| GET    | `/api/students/:id/problem-solving-stats?range=30` | Get problem-solving stats (filter by days) |

---

### Sync & Cron APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/sync/cron-time` | Get current cron schedule |
| POST   | `/api/sync/update-cron` | Update cron schedule |

---

## File Structure

student-progress-management-system/
│
├── backend/
│ ├── controllers/ # Route logic and API handlers
│ ├── cron/ # Cron job schedulers and sync logic
│ ├── middlewares/ # Custom middleware functions
│ ├── models/ # Mongoose schemas and models
│ ├── routes/ # API route definitions
│ ├── utils/ # Utility functions (e.g., email sender, validators)
│ ├── .env # Backend environment variables
│ ├── package.json # Backend dependencies and scripts
│ └── server.js # Backend entry point
│
└── frontend/
├── src/
│ ├── api/ # API service calls (Axios instances)
│ ├── assets/ # Static files like images, logos
│ ├── components/ # Reusable UI components
│ ├── context/ # Global state management (React Context)
│ ├── pages/ # Frontend page components
│ ├── utils/ # Helper functions (e.g., CSV export, formatting)
│ ├── App.jsx # Main application component
│ ├── main.jsx # React entry point
│ └── index.css # Global styles
├── .env # Frontend environment variables
├── package.json # Frontend dependencies and scripts
└── vite.config.js # Vite configuration

## 🎯 Final Notes

Thank you for exploring the **Student Progress Management System**.  
This project is designed to make student performance tracking seamless, insightful, and actionable. Contributions, feature requests, and improvements are always welcome!

Happy Coding! 🚀
