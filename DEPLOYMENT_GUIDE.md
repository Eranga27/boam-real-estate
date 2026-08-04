# Boam Real-Estates Deployment Guide

Deploying a full-stack application (Next.js Frontend + Express Backend + PostgreSQL) requires setting up three different environments. This guide walks you through the cleanest and most cost-effective way to deploy your application to production.

## Architecture Overview
1. **Database**: Supabase or Neon (Free, reliable PostgreSQL hosting)
2. **Backend**: Render or Railway (Free/Cheap Node.js hosting)
3. **Frontend**: Vercel (Free Next.js hosting, created by the makers of Next.js)

---

## Step 1: Prepare the Codebase for Production

I have already updated your frontend code to use dynamic environment variables instead of hardcoded `localhost` URLs! However, you need to configure your environment variables.

### 1. Frontend Environment Variables
In your `F:\boam-realestate\.env.local` (or create one), you will define where the frontend looks for the backend. In development, it looks like this:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
*(You will change this to your production backend URL later on Vercel).*

### 2. Backend Environment Variables
In your `F:\boam-realestate\server\.env`, you have database strings and secrets.
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/boam_realestate?schema=public"
JWT_SECRET="your_secret_key"
FRONTEND_URL="http://localhost:3000"
```

---

## Step 2: Deploy the Database (Supabase / Neon)

You need a production database since `localhost:5432` won't work on the internet.

1. Go to [Supabase](https://supabase.com/) or [Neon](https://neon.tech/) and create a free account.
2. Create a new PostgreSQL Project/Database.
3. Once created, find the **Connection String** (Database URL) provided by the service. It will look like this: `postgresql://user:password@aws-host.supabase.co:5432/postgres`.
4. Copy this connection string.

---

## Step 3: Deploy the Backend (Render or Railway)

We recommend **Render.com** as it is very straightforward for Node.js Express apps.

1. Create a free account on [Render.com](https://render.com/).
2. Push your code to a GitHub repository if you haven't already.
3. On Render, click **New +** > **Web Service**.
4. Connect your GitHub account and select your `boam-real-estate` repository.
5. Configure the deployment:
   - **Name**: `boam-backend`
   - **Root Directory**: `server` (Important! Tell Render to look inside the `server/` folder).
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start` (Make sure your `server/package.json` has `"start": "ts-node src/index.ts"` or builds it properly. If not, use `npx ts-node src/index.ts`).
6. **Environment Variables**: Add the following in the Render dashboard:
   - `DATABASE_URL`: *Paste the connection string you got from Supabase/Neon*.
   - `JWT_SECRET`: *Generate a long random string for security*.
   - `FRONTEND_URL`: *We will update this after we deploy Vercel*.
   - `NODE_ENV`: `production`
7. Click **Create Web Service**. 
8. *Important:* Run the database migrations on your new database. You can do this from your local machine by temporarily changing your local `server/.env` `DATABASE_URL` to the production one, and running `npx prisma db push`.

Once deployed, Render will give you a URL like `https://boam-backend.onrender.com`. Copy this!

---

## Step 4: Deploy the Frontend (Vercel)

Vercel is the easiest and best platform for Next.js applications.

1. Go to [Vercel.com](https://vercel.com/) and create an account using your GitHub.
2. Click **Add New...** > **Project**.
3. Import your `boam-real-estate` repository.
4. Vercel automatically detects Next.js. Leave the Root Directory as `/` (since the frontend is in the root).
5. Open the **Environment Variables** dropdown and add:
   - `NEXT_PUBLIC_API_URL`: *Paste the Render Backend URL (e.g., `https://boam-backend.onrender.com`)*.
6. Click **Deploy**.

Vercel will give you a live URL like `https://boam-realestate.vercel.app`. Copy this!

---

## Step 5: Final Connections

1. **Update Backend CORS**: Go back to Render.com -> your backend service -> Environment Variables. Add or update `FRONTEND_URL` to be your new Vercel URL (e.g., `https://boam-realestate.vercel.app`). This ensures CORS allows your frontend to talk to your backend.
2. **Update Next.js Image Config**: Since your properties have uploaded images, you need to tell Next.js to allow images from your backend URL.
   - Open `next.config.mjs` in your codebase.
   - Change `{ protocol: 'http', hostname: 'localhost', port: '5000' }` to your new backend URL domain, e.g.:
     ```javascript
     { protocol: 'https', hostname: 'boam-backend.onrender.com' }
     ```
   - Commit and push this change to GitHub. Vercel will automatically redeploy.

## You're Live! 🚀
Your application is now successfully hosted. Users can access the Vercel link to browse properties, and your backend running on Render will securely handle the API requests and talk to your PostgreSQL database.
