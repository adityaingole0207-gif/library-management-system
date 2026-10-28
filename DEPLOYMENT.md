# 🚀 Deployment Guide: Vercel + Render + MongoDB Atlas

This guide walks you through deploying your **Library Management System** with a production cloud setup:
1. **Database:** MongoDB Atlas (Free Cloud Database)
2. **Backend API:** Render (Free Cloud Node.js hosting)
3. **Frontend:** Vercel (Fast Free React deployment)

---

## Step 1: Create Free MongoDB Cloud Database (MongoDB Atlas)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a Deployment** and select the **M0 FREE** tier.
3. Choose your closest region (e.g. Mumbai, Singapore, US, Frankfurt) and click **Create**.
4. Set up **Database Access (User)**:
   - Username: `library_admin`
   - Password: `<choose_a_strong_password>`
5. Set up **Network Access**:
   - Go to **Network Access** > **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** and confirm.
6. Retrieve Connection String:
   - Click **Database** > **Connect** > **Drivers (Node.js)**.
   - Copy connection URI. It will look like:
     ```text
     mongodb+srv://library_admin:<password>@cluster0.abcde.mongodb.net/library_management?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password.

---

## Step 2: Push Your Code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) called `library-management-system`.
2. In your terminal inside the project folder (`c:\Users\ingol\Downloads\dbms`), run:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/library-management-system.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy Backend on Render

1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select your `library-management-system` repository.
4. Configure the settings:
   - **Name:** `library-management-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In **Environment Variables**, add:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI from Step 1>`
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a live URL, e.g.:
   `https://library-management-api.onrender.com`
8. *(Optional)* Seed initial data: In Render, go to **Shell** tab and run:
   ```bash
   node seed.js
   ```

---

## Step 4: Deploy Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** > **Project**.
3. Select your GitHub repository `library-management-system`.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select `client`
5. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://library-management-api.onrender.com` (your Render backend URL from Step 3 without trailing slash)
6. Click **Deploy**.

Vercel will build and deploy your React frontend in under a minute with full routing support via [`client/vercel.json`](file:///c:/Users/ingol/Downloads/dbms/client/vercel.json).

---

## ✅ Deployment Checklist

- [x] `client/vercel.json` rewrite configured for React client-side routing.
- [x] Dynamic API URL configured via `import.meta.env.VITE_API_URL`.
- [x] `render.yaml` configuration added.
- [x] Clean Git repository initialized and committed.
