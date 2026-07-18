// Background service worker for activity monitoring

let currentActivity = null;
let activityStartTime = null;
let idleStartTime = null;
const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes in milliseconds

// Productive domains
const PRODUCTIVE_DOMAINS = [
  'leetcode.com',
  'github.com',
  'stackoverflow.com',
  'developer.mozilla.org',
  'docs.',
  'medium.com',
  'dev.to',
  'linkedin.com',
];

// Distraction domains
const DISTRACTION_DOMAINS = [
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
];

function categorizeDomain(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (PRODUCTIVE_DOMAINS.some(d => domain.includes(d))) {
      return 'productive';
    }
    
    if (DISTRACTION_DOMAINS.some(d => domain.includes(d))) {
      return 'distraction';
    }
    
    return 'neutral';
  } catch (e) {
    return 'neutral';
  }
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function updateActivity() {
  const tab = await getCurrentTab();
  if (!tab || !tab.url) return;
  
  const url = tab.url;
  const domain = new URL(url).hostname;
  const category = categorizeDomain(url);
  
  // If same activity, don't update
  if (currentActivity && currentActivity.url === url) {
    return;
  }
  
  // Save previous activity
  if (currentActivity && activityStartTime) {
    const duration = Date.now() - activityStartTime;
    if (duration > 5000) { // Only log if more than 5 seconds
      await saveActivity({
        ...currentActivity,
        endTime: new Date().toISOString(),
        duration: Math.floor(duration / 1000),
      });
    }
  }
  
  // Start new activity
  currentActivity = {
    id: Date.now().toString(),
    url,
    domain,
    category,
    title: tab.title || domain,
    startTime: new Date().toISOString(),
  };
  
  activityStartTime = Date.now();
  
  // Sync with dashboard via localStorage (if dashboard is open)
  chrome.storage.local.set({
    current_activity: currentActivity,
  });
  
  // Broadcast to content scripts
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(t => {
      chrome.tabs.sendMessage(t.id, {
        type: 'ACTIVITY_UPDATE',
        activity: currentActivity,
      }).catch(() => {
        // Ignore errors for tabs that don't have content script
      });
    });
  });
}

async function saveActivity(activity) {
  const result = await chrome.storage.local.get(['activities']);
  const activities = result.activities || [];
  activities.push(activity);
  
  // Keep only last 1000 activities
  if (activities.length > 1000) {
    activities.splice(0, activities.length - 1000);
  }
  
  await chrome.storage.local.set({ activities });
}

// Listen for tab changes
chrome.tabs.onActivated.addListener(() => {
  updateActivity();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    updateActivity();
  }
});

// Monitor idle state
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle') {
    idleStartTime = Date.now();
  } else if (state === 'active' && idleStartTime) {
    const idleDuration = Date.now() - idleStartTime;
    if (idleDuration > IDLE_THRESHOLD) {
      // Pause activity tracking during idle
      if (currentActivity && activityStartTime) {
        const duration = Date.now() - activityStartTime;
        if (duration > 5000) {
          saveActivity({
            ...currentActivity,
            endTime: new Date(idleStartTime).toISOString(),
            duration: Math.floor(duration / 1000),
          });
        }
      }
      currentActivity = null;
      activityStartTime = null;
    }
    idleStartTime = null;
  }
});

// Periodic update (every 10 seconds)
setInterval(() => {
  updateActivity();
}, 10000);

// Initial update
updateActivity();

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_ACTIVITY') {
    sendResponse({
      activity: currentActivity,
      timeSpent: activityStartTime ? Math.floor((Date.now() - activityStartTime) / 1000) : 0,
    });
  }
  
  if (request.type === 'GET_STATS') {
    chrome.storage.local.get(['activities'], (result) => {
      const activities = result.activities || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayActivities = activities.filter(a => {
        const start = new Date(a.startTime);
        start.setHours(0, 0, 0, 0);
        return start.getTime() === today.getTime();
      });
      
      const productive = todayActivities
        .filter(a => a.category === 'productive')
        .reduce((sum, a) => sum + (a.duration || 0), 0);
      
      const distraction = todayActivities
        .filter(a => a.category === 'distraction')
        .reduce((sum, a) => sum + (a.duration || 0), 0);
      
      sendResponse({
        productive: Math.round(productive / 60),
        distraction: Math.round(distraction / 60),
        total: Math.round((productive + distraction) / 60),
        activities: todayActivities.length,
      });
    });
    return true; // Keep channel open for async response
  }
});
