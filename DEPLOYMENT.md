# 🚀 Deployment Guide

## Backend Deployment ✅ (Complete)
Your backend is deployed at: **https://messaging-backend-toob.onrender.com/**

## Frontend Deployment 🎯 (Ready to Deploy)

### Files Created/Updated:
- ✅ `.env.production` - Production environment variables
- ✅ `vite.config.js` - Enhanced build configuration
- ✅ `_redirects` - For Netlify deployment
- ✅ `vercel.json` - For Vercel deployment
- ✅ `.gitignore` - Updated for better security

---

## 📦 **Deploy to Vercel** (Recommended)

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Deploy from Web (Easiest)
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
6. **Environment Variables:** (Add these in Vercel dashboard)
   ```
   VITE_API_URL=https://messaging-backend-toob.onrender.com/api
   VITE_SOCKET_URL=https://messaging-backend-toob.onrender.com
   ```

7. Click **"Deploy"**

### Step 3: Deploy from CLI
```bash
cd frontend
vercel
```
Follow the prompts and enter the environment variables when asked.

---

## 🌐 **Deploy to Netlify** (Alternative)

### Step 1: Deploy from Web
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

5. **Environment Variables:** (Add in Site settings → Environment variables)
   ```
   VITE_API_URL=https://messaging-backend-toob.onrender.com/api
   VITE_SOCKET_URL=https://messaging-backend-toob.onrender.com
   ```

6. Click **"Deploy site"**

### Step 2: Deploy from CLI
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

---

## 🔧 **Deploy to Render** (Same as Backend)

### Configuration:
1. Go to [https://render.com](https://render.com)
2. Click **"New"** → **"Static Site"**
3. Connect your repository
4. Configure:
   - **Name:** messaging-app-frontend
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

5. **Environment Variables:**
   ```
   VITE_API_URL=https://messaging-backend-toob.onrender.com/api
   VITE_SOCKET_URL=https://messaging-backend-toob.onrender.com
   ```

6. Click **"Create Static Site"**

---

## 🧪 **Test Before Deployment**

### 1. Test Production Build Locally:
```bash
cd frontend
npm run build
npm run preview
```
Then open http://localhost:5173 and test all features.

### 2. Verify Backend Connection:
Test your backend API:
```bash
curl https://messaging-backend-toob.onrender.com/health
```

---

## ⚙️ **Post-Deployment**

### Update Backend CORS:
After deploying frontend, update your backend `.env` on Render:
```env
CLIENT_URL=https://your-frontend-url.vercel.app
```
Replace with your actual frontend URL.

### Backend Environment Variables on Render:
Ensure these are set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Strong secret key
- `CLIENT_URL` - Your frontend URL
- `NODE_ENV=production`

---

## 🐛 **Troubleshooting**

### Issue: CORS Error
- Update `CLIENT_URL` in backend with your frontend URL
- Redeploy backend after changing environment variables

### Issue: Socket Connection Failed
- Check that `VITE_SOCKET_URL` uses HTTPS (not HTTP)
- Verify backend is running: https://messaging-backend-toob.onrender.com/health

### Issue: API Calls Failing
- Verify `VITE_API_URL` includes `/api` at the end
- Check browser console for error messages

---

## 📊 **Quick Checklist**

Before deploying:
- [ ] Backend is running and accessible
- [ ] `.env.production` file created with correct URLs
- [ ] Tested production build locally
- [ ] Chose deployment platform (Vercel/Netlify/Render)
- [ ] Committed and pushed changes to Git

After deploying:
- [ ] Frontend loads correctly
- [ ] Can register/login
- [ ] Can send messages
- [ ] Real-time updates work
- [ ] Updated backend CORS with frontend URL

---

## 🎉 **You're Ready!**

Your frontend is now fully configured for production deployment. Choose your preferred platform above and follow the steps!
