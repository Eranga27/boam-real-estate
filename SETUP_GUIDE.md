# Boam Real Estate - Setup & Run Guide

Follow these steps to run the full-stack application (Next.js Frontend + Express Backend with PostgreSQL).

## 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (running locally on port 5432)
- **Git**

## 2. Database Setup (PostgreSQL)
Ensure you have a PostgreSQL server running locally.
1. Open **pgAdmin** or your preferred Postgres client.
2. Create a new database named `boam_realestate`.
   *(The backend is already configured to connect to `postgresql://postgres:postgres@localhost:5432/boam_realestate?schema=public`. If your Postgres password is different from `postgres`, update the `DATABASE_URL` in `server/.env`)*.

---

## 3. Running the Backend (Server)

1. Open a new terminal in your project root (`F:\boam-realestate`).
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install backend dependencies (only needed the first time):
   ```bash
   npm install
   ```
4. Push the Prisma schema to your PostgreSQL database (creates the tables):
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will now be running on `http://localhost:5000`.*

---

## 4. Running the Frontend (Client)

1. Open a **second, separate terminal** in your project root (`F:\boam-realestate`).
2. Make sure you are in the root directory (not inside `server/`).
3. Install frontend dependencies (only needed the first time):
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: The `--legacy-peer-deps` flag is required to bypass any React version conflicts between Next.js and Lucide Icons).*
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be running on `http://localhost:3000`.*

---

## 5. Troubleshooting Common Issues

### 🛑 "Module not found" or Next.js SWC helper errors
This usually means your `node_modules` folder got corrupted during an interrupted download. 
**Fix:** Open a Command Prompt terminal and run:
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

### 🛑 Prisma Database Connection Error
If `npx prisma db push` fails, it means it cannot connect to your Postgres server.
**Fix:** 
- Make sure PostgreSQL service is running in Windows Services.
- Ensure the database `boam_realestate` exists in pgAdmin.
- Check the credentials in `server/.env`.

### 🛑 "C: Drive Out of Space" during NPM Install
NPM caches all downloaded packages on your C: drive by default. We have configured NPM to use your `F:\npm-cache` instead, so you shouldn't see this issue anymore.
