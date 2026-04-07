# 🚀 Deployment Guide - Hostel Automation System

## Overview
This guide will help you deploy your hostel automation system for **FREE** using:
- **Backend**: Railway (recommended) or Render
- **Frontend**: Vercel (recommended) or Netlify
- **Database**: MongoDB Atlas (free tier)

---

## 📋 Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **MongoDB Atlas Account** - For free database hosting
3. **Railway/Render Account** - For backend deployment
4. **Vercel/Netlify Account** - For frontend deployment

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new project

### 1.2 Create Database Cluster
1. Click "Build a Database"
2. Choose **FREE** M0 Sandbox tier
3. Select a cloud provider and region (closest to you)
4. Name your cluster (e.g., "hostel-management")

### 1.3 Setup Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username/password (save these!)
4. Set privileges to "Read and write to any database"

### 1.4 Setup Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

**Example**: `mongodb+srv://username:password@cluster0.abc123.mongodb.net/hostel-management?retryWrites=true&w=majority`

---

## 🔧 Step 2: Prepare Your Code

### 2.1 Update Environment Variables
Create a `.env` file in your root directory:

```env
# Production MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/hostel-management?retryWrites=true&w=majority

# JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (update after frontend deployment)
CLIENT_URL=https://your-frontend-app.vercel.app
```

### 2.2 Update Frontend API URL
In `client/src/services/api.js` or `client/src/context/AuthContext.jsx`, update the API base URL:

```javascript
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-app.railway.app/api'  // Update this after backend deployment
    : 'http://localhost:5000/api',
});
```

### 2.3 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 🖥️ Step 3: Deploy Backend (Railway - Recommended)

### 3.1 Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub account

### 3.2 Deploy Backend
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your hostel management repository
4. Railway will auto-detect it's a Node.js app

### 3.3 Set Environment Variables
1. Go to your project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add these variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: (will update after frontend deployment)

### 3.4 Get Backend URL
1. Go to "Settings" tab
2. Under "Domains", you'll see your app URL
3. Copy this URL (e.g., `https://your-app.railway.app`)

---

## 🌐 Step 4: Deploy Frontend (Vercel - Recommended)

### 4.1 Update API URL in Frontend
Update your frontend API configuration with the Railway backend URL:

```javascript
// In client/src/context/AuthContext.jsx
const api = axios.create({
  baseURL: 'https://your-backend-app.railway.app/api', // Your Railway URL
});
```

### 4.2 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub account

### 4.3 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Set these build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.4 Set Environment Variables (if needed)
1. Go to project settings
2. Add environment variables if your frontend needs any

### 4.5 Get Frontend URL
1. After deployment, copy your Vercel URL
2. Update the `CLIENT_URL` in your Railway backend environment variables

---

## 🗃️ Step 5: Seed Database (Optional)

### 5.1 Update Seed Script for Production
Create a production seed script or run it locally pointing to production DB:

```bash
# Set production MongoDB URI temporarily
export MONGODB_URI="your-atlas-connection-string"
node scripts/seed.js
```

---

## ✅ Step 6: Test Your Deployment

1. **Visit your frontend URL** (Vercel)
2. **Test login functionality**
3. **Test room booking**
4. **Test warden dashboard**
5. **Check database** in MongoDB Atlas

---

## 🔄 Alternative: Deploy Backend on Render

If Railway doesn't work, use Render:

### Render Deployment
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repo
5. Set these settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables in Render dashboard

---

## 🔄 Alternative: Deploy Frontend on Netlify

If Vercel doesn't work, use Netlify:

### Netlify Deployment
1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Set these build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

---

## 🎯 Final Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed on Railway/Render
- [ ] Frontend deployed on Vercel/Netlify
- [ ] Environment variables set correctly
- [ ] API URLs updated in frontend
- [ ] CORS configured for production domain
- [ ] Database seeded with sample data
- [ ] All functionality tested in production

---

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: Update `CLIENT_URL` in backend environment variables
2. **Database Connection**: Check MongoDB Atlas IP whitelist and connection string
3. **Build Failures**: Check Node.js version compatibility
4. **API Not Found**: Verify API base URL in frontend configuration

### Logs:
- **Railway**: Check logs in Railway dashboard
- **Render**: Check logs in Render dashboard
- **Vercel**: Check function logs in Vercel dashboard

---

## 💰 Cost Breakdown (FREE!)

- **MongoDB Atlas**: 512MB storage (free forever)
- **Railway**: 500 hours/month (free tier)
- **Vercel**: Unlimited static sites (free tier)
- **Total Cost**: $0/month

---

## 🔄 Updates & Maintenance

To update your deployed app:
1. Push changes to GitHub
2. Railway/Render will auto-deploy backend
3. Vercel/Netlify will auto-deploy frontend
4. No manual intervention needed!

---

**🎉 Congratulations! Your hostel automation system is now live and accessible worldwide!**