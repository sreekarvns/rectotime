# Deployment Guide

Deploy your Productivity Dashboard to Vercel so you can access it from anywhere via a URL!

## 🚀 Deploy to Vercel (5 Minutes)

**Easiest and fastest way to deploy your dashboard!**

### Prerequisites
- GitHub account (free)
- Your code pushed to GitHub

### Step-by-Step Deployment

#### Method 1: Via Web Interface (Easiest)

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Ready to deploy"
   git remote add origin https://github.com/YOUR_USERNAME/timetable.git
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/login (use GitHub - it's easiest)

3. **Import your project**
   - Click "Add New Project"
   - Click "Import Git Repository"
   - Select your `timetable` repository
   - Click "Import"

4. **Configure (Auto-detected)**
   - Vercel will auto-detect:
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

5. **Wait ~1-2 minutes**
   - Vercel will build and deploy your app
   - You'll see the deployment progress

6. **Done! 🎉**
   - Your app is live at: `https://your-project.vercel.app`
   - Every push to `main` branch auto-deploys!

#### Method 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Login to Vercel
   - Deploy!

3. **For production**:
   ```bash
   vercel --prod
   ```

---

## 📦 Build for Production

Before deploying, you can test the build locally:

```bash
npm run build
npm run preview
```

This creates a `dist` folder with optimized production files and lets you preview it.

---

## 🔧 Environment Variables

If you're using real AI APIs, set environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. Add:
   - `VITE_AI_PROVIDER=claude` (or `openai`)
   - `VITE_AI_API_KEY=your-key-here`
   - `VITE_AI_MODEL=claude-3-haiku-20240307`
3. Redeploy your app

---

## 🌐 Custom Domain (Optional)

Vercel supports custom domains:

1. **Buy a domain** (Namecheap, Google Domains, etc.)
2. **In Vercel dashboard**:
   - Go to your project → Settings → Domains
   - Add your domain
   - Update DNS records as instructed
3. **Your app will be live at**: `https://yourdomain.com`

---

## 🔄 Auto-Deploy Setup

Vercel automatically:
- ✅ Connects to your GitHub repo
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ No manual steps needed!

---

## 📝 Pre-Deployment Checklist

- [ ] Build works: `npm run build`
- [ ] Test locally: `npm run preview`
- [ ] Check all features work
- [ ] Push code to GitHub
- [ ] Set environment variables (if using real AI)

---

## 🐛 Troubleshooting

### Build fails:
- Check Node.js version (needs 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### App doesn't load:
- Check Vercel deployment logs
- Verify build output directory is `dist`
- Check browser console for errors

### Routes not working:
- Ensure redirect rules are configured (already in `vercel.json`)

---

## 💡 Why Vercel?

**Perfect for personal projects:**
- ✅ Easiest setup (5 minutes)
- ✅ Free tier is generous
- ✅ Best developer experience
- ✅ Auto-deploys from GitHub
- ✅ Zero configuration needed
- ✅ Fast global CDN
- ✅ Automatic HTTPS

Just connect your GitHub repo and click deploy! 🚀
