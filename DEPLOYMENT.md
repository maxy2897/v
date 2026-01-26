# Deployment Guide - Bodipo Business

This guide will help you deploy your application to make it accessible from anywhere using free hosting services.

## 📋 Prerequisites

Before deploying, ensure you have:
- A GitHub account (for code repository)
- A Render.com account (for backend hosting)
- A Vercel account (for frontend hosting)
- Your MongoDB Atlas connection string
- Your Gemini API key
- (Optional) Gmail credentials for email functionality

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

1. **Create a `.gitignore` file** (if not exists):
```
node_modules/
.env.local
dist/
uploads/
.DS_Store
```

2. **Initialize Git and push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy Backend to Render.com

1. **Go to [Render.com](https://render.com)** and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `bodipo-business-api`
   - **Region**: Frankfurt (closest to Spain)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
   - **Plan**: Free

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<your-secure-secret-key>
   JWT_EXPIRE=30d
   GEMINI_API_KEY=<your-gemini-api-key>
   EMAIL_SERVICE=gmail
   EMAIL_USER=<your-gmail-address>
   EMAIL_PASS=<your-gmail-app-password>
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. **Copy your backend URL** (e.g., `https://bodipo-business-api.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. **Update `.env.production`** with your backend URL:
```
VITE_API_URL=https://bodipo-business-api.onrender.com/api
```

2. **Go to [Vercel.com](https://vercel.com)** and sign in
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **Add Environment Variables**:
   ```
   VITE_API_URL=https://bodipo-business-api.onrender.com/api
   ```

7. Click **"Deploy"**
8. Wait for deployment (2-3 minutes)
9. **Copy your frontend URL** (e.g., `https://bodipo-business.vercel.app`)

### Step 4: Update Backend with Frontend URL

1. Go back to Render.com dashboard
2. Open your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://bodipo-business.vercel.app
   ```
5. Save changes (service will redeploy automatically)

## ✅ Verification

1. **Test Backend Health**:
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"message":"✅ Server is running!"}`

2. **Test Frontend**:
   - Open your Vercel URL in a browser
   - Try registering a new account
   - Test login functionality
   - Upload a profile picture
   - Create a money transfer

## 🔧 Troubleshooting

### Backend Issues

**Problem**: "Application failed to respond"
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

**Problem**: CORS errors
- Verify `FRONTEND_URL` is set correctly in Render
- Check that your Vercel URL matches exactly (no trailing slash)

### Frontend Issues

**Problem**: "Failed to fetch" errors
- Verify `VITE_API_URL` is set correctly
- Check that backend is running (visit health endpoint)
- Open browser console for detailed error messages

**Problem**: Images not loading
- Check that backend URL in `.env.production` doesn't have trailing `/api`
- Verify uploads folder is being served correctly

## 📱 Access Your Application

Once deployed, you can access your application from:
- **Any computer**: Open the Vercel URL in any browser
- **Mobile devices**: Open the Vercel URL on your phone
- **Share with others**: Send them your Vercel URL

## 🔄 Updating Your Application

### Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel will automatically redeploy.

### Update Backend:
```bash
git add .
git commit -m "Update backend"
git push
```
Render will automatically redeploy.

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - Backend may sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up
   - 750 hours/month of runtime (sufficient for testing)

2. **Email Configuration**:
   - Gmail requires "App Password" (not your regular password)
   - Enable 2-factor authentication first
   - Generate app password at: https://myaccount.google.com/apppasswords

3. **Database**:
   - MongoDB Atlas free tier: 512MB storage
   - Sufficient for thousands of users
   - Already cloud-hosted, no additional setup needed

## 🎉 Success!

Your application is now accessible from anywhere in the world! Share your Vercel URL with anyone to let them use your application.

**Your URLs**:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`
