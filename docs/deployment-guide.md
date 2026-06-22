# TelecomIQ – Deployment Guide

## 1. Supabase Setup (PostgreSQL Database)

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up (free tier available)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `telecomiq`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select the closest to your users
4. Click **"Create new project"** — wait ~2 minutes for provisioning

### Get Connection String
1. Go to **Settings** → **Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Use this as your `DB_URL` in the backend environment variables:
   ```
   DB_URL=jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres?user=postgres.[project-ref]&password=[your-password]
   ```

### Important Supabase Settings
- Go to **Settings** → **Database** → **Connection Pooling** → Enable **Transaction mode**
- The free tier allows up to **500 MB** of database storage and **2 active projects**

---

## 2. Backend Deployment (Render)

### Create a Render Web Service
1. Go to [render.com](https://render.com) and sign up
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `telecomiq-backend`
   - **Root Directory**: `telecomIQ_backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: Free

### Environment Variables on Render
```
DB_URL=jdbc:postgresql://[supabase-connection-string]
DB_USERNAME=postgres.[project-ref]
DB_PASSWORD=[your-supabase-password]
JWT_SECRET=[generate-a-base64-256-bit-key]
JWT_EXPIRATION=86400000
AI_SERVICE_URL=https://telecomiq-ai-lyl5.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=[your-gmail]
SMTP_PASSWORD=[your-app-password]
SMTP_FROM=[your-gmail]
MAIL_ENABLED=true
```

### Generate JWT Secret
```bash
openssl rand -base64 32
```

---

## 3. AI Service Deployment (Render)

### Create Another Render Web Service
1. Click **"New"** → **"Web Service"**
2. Configure:
   - **Name**: `telecomiq-ai`
   - **Root Directory**: `telecomIQ_ai_service`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: Free

### Environment Variables
```
GROQ_API_KEY=[your-groq-api-key]
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note:** Render free tier services spin down after 15 minutes of inactivity. First request after idle takes ~30 seconds.

---

## 4. Frontend Deployment (Vercel)

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `telecomIQ_frontend`
   - **Build Command**: `npm run build -- --configuration=production`
   - **Output Directory**: `dist/frontend/browser`

### Update API URL
Before deploying, update `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://telecomiq-backend-mjaj.onrender.com/api'
};
```

---

## 5. Gmail SMTP Setup

### Create Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. **Security** → **2-Step Verification** (enable if not already)
3. **Security** → **App passwords**
4. Select **Mail** and **Other (Custom name)**: `TelecomIQ`
5. Click **Generate** — copy the 16-character password
6. Use this as your `SMTP_PASSWORD`

---

## 6. Free Tier Limits

| Service | Free Tier Limit |
|---------|----------------|
| Supabase | 500 MB DB, 2 projects |
| Render | 750 hours/month, sleeps after 15 min idle |
| Vercel | 100 GB bandwidth, unlimited deployments |
| Groq API | Generous free tier with rate limits |
| Gmail SMTP | 500 emails/day |
