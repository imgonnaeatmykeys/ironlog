# IronLog 🏋️

Your personal gym tracker. Dark, fast, offline-capable PWA.

## Features
- Live workout tracker with sets, reps, weight, and cheat reps
- Last session data shown during active workout
- Workout notes saved per session
- Workout plan builder (fully editable)
- PR goal tracker organized by month
- Full history with volume stats
- Export to JSON backup
- Works offline, installable on iPhone

---

## Deploy to Vercel (step by step)

### 1. Get the code on GitHub
1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **"New repository"** (the green button)
3. Name it `ironlog`, set it to **Public**, click **Create repository**
4. On your computer, open a terminal in the `ironlog` folder and run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ironlog.git
   git push -u origin main
   ```
   *(Replace YOUR_USERNAME with your GitHub username)*

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and click your `ironlog` repository
4. Vercel will auto-detect it as a Vite project — no settings to change
5. Click **Deploy**
6. In ~60 seconds you'll get a URL like `ironlog.vercel.app`

### 3. Install on your iPhone
1. Open the Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. Done! IronLog now lives on your home screen like a real app 🎉

### 4. Pushing updates later
Every time you want to update the app, just edit the code and run:
```
git add .
git commit -m "describe your change"
git push
```
Vercel auto-deploys within seconds. Your phone gets the update next time you open the app.

---

## Data & Backup
- All data is stored in your browser's **localStorage** — it stays on your phone
- Tap **History → ⬇ Export** to download a JSON backup to your Files app
- To restore: open the JSON file, it contains all your plans, history, and PR goals

## Local development
```
npm install
npm run dev
```
