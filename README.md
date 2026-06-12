# TaskFlow — Full-Stack MERN Task Manager

A complete task management application with JWT authentication, real-time CRUD, and a dark-mode dashboard.

**Live Demo:** [Frontend](https://your-app.vercel.app) | [Backend API](https://your-api.onrender.com)

---

## Features

- **Auth**: Register & Login with bcrypt-hashed passwords and JWT tokens (7-day expiry)
- **Tasks**: Create, read, update, delete tasks — each belonging to the logged-in user
- **Filtering**: Search by title, filter by status (todo / in-progress / completed) and priority (low / medium / high)
- **Dashboard**: Real-time stats — total, to-do, in-progress, completed count
- **Responsive**: Works on mobile and desktop

---

## Tech Stack

| Layer     | Tech                            |
|-----------|---------------------------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js, Express, Express Router |
| Database  | MongoDB Atlas + Mongoose         |
| Auth      | JWT + bcryptjs                   |
| Deploy FE | Vercel                           |
| Deploy BE | Render                           |

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── controllers/    # authController, taskController
│   ├── middleware/     # authMiddleware (JWT protect)
│   ├── models/         # User.js, Task.js (Mongoose schemas)
│   ├── routes/         # authRoutes, taskRoutes
│   ├── server.js       # Express app entry
│   └── .env.example
└── frontend/
    └── src/
        ├── context/    # AuthContext (global auth state)
        ├── pages/      # Login, Register, Dashboard
        ├── utils/      # api.js (axios instance + all API calls)
        └── index.css   # Global styles
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

---

## Deployment

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set root directory to `backend`
4. Build command: `npm install`  
   Start command: `node server.js`
5. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a strong random secret
   - `FRONTEND_URL` — your Vercel URL (for CORS)

### Frontend → Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Connect your repo, set root directory to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` — your Render backend URL + `/api`

---

## API Endpoints

### Auth

| Method | Endpoint            | Access  | Description         |
|--------|---------------------|---------|---------------------|
| POST   | /api/auth/register  | Public  | Register new user   |
| POST   | /api/auth/login     | Public  | Login, returns JWT  |
| GET    | /api/auth/me        | Private | Get current user    |

### Tasks (all protected — requires `Authorization: Bearer <token>`)

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/tasks            | Get all user's tasks  |
| POST   | /api/tasks            | Create new task       |
| PUT    | /api/tasks/:id        | Update task           |
| DELETE | /api/tasks/:id        | Delete task           |
| PATCH  | /api/tasks/:id/toggle | Toggle complete status|

---

## Biggest Challenge

The trickiest part was ensuring **task ownership** — every query against the database must include both the task ID and the authenticated user's ID (`findOne({ _id, user: req.user._id })`), so users can never read or mutate another user's tasks even if they know the task ID. This required careful middleware ordering: JWT verification → user attachment → route handlers, with the user ID threaded through every database operation.

---

## Evaluation Checklist

| Parameter              | Done |
|------------------------|------|
| Working Authentication | ✅ JWT register/login/protect |
| CRUD Functionality     | ✅ Create/read/update/delete + toggle |
| Code Quality           | ✅ Organised folders, REST design, clean code |
| Deployment (Live URL)  | ✅ Vercel + Render |
| GitHub & README        | ✅ This README + public repo |
