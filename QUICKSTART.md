# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Dashboard
```bash
npm run dev
```
The dashboard will open at `http://localhost:3000`

### 3. Install Chrome Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` folder from this project

## ✨ What You'll See

### Dashboard Features
- **Main Dashboard**: View your goals, stats, and time tracking
- **AI Companion Sidebar**: Right side panel with real-time guidance
- **Activity Monitoring**: Automatic tracking via Chrome extension

### AI Companion Features
- **Current Status**: See what you're working on and focus score
- **Live Guidance**: Get contextual suggestions based on your activity
- **Quick Actions**: Log problems, start breaks, mark goals complete
- **Chat**: Ask the AI anything about your productivity

## 🎯 First Steps

1. **Check Your Goals**: The dashboard comes with sample goals. You can modify them in the Goals view.

2. **Browse the Web**: The extension automatically tracks your activity. Visit LeetCode, GitHub, or other sites to see it in action.

3. **Interact with AI**: Click on the AI Companion sidebar and try the chat feature or check the guidance tab.

## 🔧 Customization

### Add Your Own Goals
Edit goals in the Goals view or modify the sample data in `src/App.tsx`.

### Customize Domain Categories
Edit `src/utils/activityMonitor.ts` to add productive or distraction domains.

### Adjust AI Guidance
Modify `src/utils/aiGuidance.ts` to customize when and how the AI provides suggestions.

## 📊 Understanding the Data

- **Productive Time**: Time spent on learning/coding sites
- **Distraction Time**: Time on social media/entertainment
- **Focus Score**: Calculated based on your activity patterns
- **Activity Count**: Number of site visits tracked today

## 🐛 Troubleshooting

### Extension Not Tracking
- Make sure the extension is enabled in `chrome://extensions/`
- Refresh the dashboard page
- Check that you've granted necessary permissions

### Dashboard Not Showing Data
- Make sure the extension is installed and running
- Check browser console for errors
- Try refreshing the page

### AI Companion Not Visible
- Check if it's collapsed (look for a small bar on the right)
- Try resizing your browser window
- Check browser console for errors

## 🎨 Design Notes

The dashboard uses:
- **Glassmorphism**: Subtle blur effects on panels
- **Smooth Animations**: All interactions are animated
- **Premium Colors**: Deep blues and soft grays
- **Rounded Corners**: Everything has soft, rounded edges

Enjoy your new productivity dashboard! 🚀
