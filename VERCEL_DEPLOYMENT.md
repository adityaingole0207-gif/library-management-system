# ⚡ Complete Vercel Deployment Guide (Frontend + Backend on Vercel)

Both the **Frontend** and **Backend** can be deployed directly on **Vercel** as two connected projects from the same GitHub repository:

```text
               ┌──────────────────────────────┐
               │        GitHub Repo           │
               │ (library-management-system)  │
               └──────────────┬───────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
     ┌──────────────────┐          ┌──────────────────┐
     │  Vercel Project  │          │  Vercel Project  │
     │    (Backend)     │          │    (Frontend)    │
     │  Root: server/   │          │  Root: client/   │
     └─────────┬────────┘          └─────────▲────────┘
               │                             │
               │ MONGODB_URI                 │ VITE_API_URL
               ▼                             │
     ┌──────────────────┐                    │
     │  MongoDB Atlas   │                    │
     │ (Cloud Database) │────────────────────┘
     └──────────────────┘
```

---

## Step 1: Push Code to GitHub

1. Go to [https://github.com/new](https://github.com/new) and create a new repository called `library-management-system`.
2. Open PowerShell in `c:\Users\ingol\Downloads\dbms` and run:
   ```powershell
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/library-management-system.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend on Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Select your GitHub repository: `library-management-system`.
4. Configure:
   - **Project Name:** `library-management-backend` (or any name you prefer)
   - **Framework Preset:** `Other`
   - **Root Directory:** Click *Edit* and choose **`server`**
5. Expand **Environment Variables** and add:
   - **Name:** `MONGODB_URI`
   - **Value:**
     ```text
     mongodb+srv://library_admin:<YOUR_PASSWORD>@cluster0.otjc7ew.mongodb.net/library_management?retryWrites=true&w=majority&appName=Cluster0
     ```
     *(Replace `<YOUR_PASSWORD>` with your MongoDB Atlas password)*
6. Click **Deploy**.
7. Once finished, Vercel will give you a backend domain, e.g.:
   `https://library-management-backend-xyz.vercel.app`
8. **Seed sample data:** Open `https://<your-backend-url>/api/seed` once in your browser to seed initial books, members, and loans into your Atlas database.

---

## Step 3: Deploy Frontend on Vercel

1. In Vercel, click **Add New...** > **Project** again.
2. Select the same repository: `library-management-system`.
3. Configure:
   - **Project Name:** `library-management-frontend`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and choose **`client`**
4. Expand **Environment Variables** and add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://library-management-backend-xyz.vercel.app` *(Your backend URL from Step 2, without a trailing slash)*
5. Click **Deploy**.

---

## 🎉 Done!
Your full project is live:
- Frontend: `https://library-management-frontend-xyz.vercel.app`
- Backend API: `https://library-management-backend-xyz.vercel.app/api/health`
- Database: Connected to your live MongoDB Atlas cluster
