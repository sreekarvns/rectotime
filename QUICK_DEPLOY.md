# 🚀 Quick Deploy - 5 Minutes

Get your dashboard online in 5 minutes with Vercel!

## Step 1: Push to GitHub (if not already)

```bash
git init
git add .
git commit -m "Ready to deploy"
git remote add origin https://github.com/YOUR_USERNAME/timetable.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/login (use GitHub)
3. Click "Add New Project"
4. Import your `timetable` repository
5. Click "Deploy"

**Done!** Your app is live at `https://your-project.vercel.app`

## Step 3: (Optional) Set AI API Key

1. In Vercel dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_AI_PROVIDER` = `claude` (or `openai`)
   - `VITE_AI_API_KEY` = `your-api-key`
3. Redeploy

That's it! You can now access your dashboard from anywhere! 🎉

---

## 🔄 Auto-Deploy

Every time you push to GitHub, Vercel automatically deploys your changes. No manual steps needed!
