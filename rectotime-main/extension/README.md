# Productivity OS - Chrome Extension

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension is now installed!

## Features

- **Automatic Activity Tracking**: Monitors which websites you visit
- **Time Tracking**: Records time spent on each site
- **Category Detection**: Automatically categorizes sites as productive, distraction, or neutral
- **Idle Detection**: Pauses tracking when you're idle for 2+ minutes
- **Real-time Sync**: Syncs with the main dashboard via localStorage

## How It Works

1. The extension runs in the background and monitors your active tab
2. When you switch tabs or navigate, it logs the activity
3. Activities are categorized and stored locally
4. The dashboard reads this data to display your productivity stats

## Permissions

- `tabs`: To monitor which tab is active
- `storage`: To save activity data locally
- `idle`: To detect when you're away from your computer

## Data Privacy

All data is stored locally on your device. Nothing is sent to external servers.
