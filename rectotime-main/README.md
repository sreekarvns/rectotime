# Productivity OS - AI-Powered Dashboard

A premium AI-powered productivity dashboard that acts as your personal life operating system with real-time monitoring and guidance. Built with a beautiful Apple/FAANG-inspired design.

## 🚀 Features

### 🤖 AI Companion
- **Always-On Sidebar**: Fixed position AI companion with real-time guidance
- **Current Status**: Live activity display with focus score
- **Live Guidance**: Contextual suggestions based on your activity
- **Quick Actions**: One-click actions for logging problems, breaks, and goals
- **Chat Interface**: Conversational AI chat with context awareness

### 📊 Dashboard
- **Goals Tracking**: Visual progress tracking with completion status
- **Activity Stats**: Real-time productivity metrics
- **Time Tracking**: Manual and automatic time tracking
- **Beautiful UI**: Premium design with glassmorphism and smooth animations

### 🌐 Browser Extension
- **Automatic Activity Monitoring**: Tracks websites you visit
- **Smart Categorization**: Automatically categorizes sites as productive/distraction
- **Idle Detection**: Pauses tracking when you're away
- **Real-time Sync**: Syncs with dashboard instantly

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Chrome browser (for extension)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Install Chrome Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

4. **Open Dashboard**
   - The dashboard will open at `http://localhost:3000`
   - The extension will automatically sync activity data

## 📁 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── AICompanion/     # AI companion sidebar
│   │   ├── Dashboard/        # Dashboard widgets
│   │   └── ui/              # Reusable UI components
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities and helpers
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── extension/               # Chrome extension
│   ├── manifest.json        # Extension manifest
│   ├── background.js        # Background service worker
│   ├── content.js          # Content script
│   └── popup.html/js       # Extension popup
└── package.json
```

## 🎨 Design Philosophy

- **Apple/FAANG Aesthetic**: Clean, modern, sophisticated design
- **Glassmorphism**: Subtle backdrop blur effects
- **Smooth Animations**: 0.3s-0.5s ease transitions
- **Premium Colors**: Deep blues, soft grays, vibrant accents
- **Generous Spacing**: Breathing room between all elements
- **Micro-interactions**: Every interaction feels premium

## 🔧 Configuration

### Customizing Productive/Distraction Domains

Edit `src/utils/activityMonitor.ts` to add or modify domain categories:

```typescript
const PRODUCTIVE_DOMAINS = [
  'leetcode.com',
  'github.com',
  // Add your domains
];

const DISTRACTION_DOMAINS = [
  'youtube.com',
  'twitter.com',
  // Add your domains
];
```

### AI Guidance Rules

Customize AI suggestions in `src/utils/aiGuidance.ts`:

```typescript
// Modify break reminders, goal checks, time-based suggestions, etc.
```

## 🚀 Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## 🌐 Deployment

Want to access your dashboard from anywhere? Deploy it to Vercel!

**Quick Deploy (5 minutes):**
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repo
3. Click deploy - done! 🎉

Your dashboard will be live at `https://your-project.vercel.app`


All platforms offer free tiers perfect for personal use!

---
**Note:** Detailed guides and reports are organized under `docs/`. Keep this README focused on setup and high-level usage, and update files in `docs/` for deep-dive documentation.

## 📝 Usage

1. **Set Goals**: Goals are automatically initialized with sample data. Edit them in the Goals view.

2. **Track Activity**: The Chrome extension automatically tracks your browsing. No setup needed!

3. **Get AI Guidance**: The AI companion provides real-time suggestions based on:
   - Current activity
   - Time spent
   - Goal progress
   - Time of day
   - Productivity patterns

4. **Chat with AI**: Use the chat interface to ask questions about your progress, get suggestions, or discuss goals.

## 🎯 Features Roadmap

- [ ] Integration with Claude Haiku API for real AI responses
- [ ] More detailed analytics and insights
- [ ] Export data functionality
- [ ] Custom goal templates
- [ ] Team/collaboration features
- [ ] Mobile app companion

## 🤝 Contributing

This is a personal productivity tool, but feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

- Design inspired by Apple, Linear, Notion, and Arc browser
- Built with React, TypeScript, Tailwind CSS, and Framer Motion
- Icons from Lucide React

---

**Built with ❤️ for productivity enthusiasts**
