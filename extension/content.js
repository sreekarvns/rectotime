// Content script to monitor page activity and sync with dashboard

let lastActivityTime = Date.now();
const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

// Track user activity
function updateActivity() {
  lastActivityTime = Date.now();
}

// Listen for user interactions
document.addEventListener('mousemove', updateActivity);
document.addEventListener('keypress', updateActivity);
document.addEventListener('click', updateActivity);
document.addEventListener('scroll', updateActivity);

// Check for idle state
setInterval(() => {
  const idleTime = Date.now() - lastActivityTime;
  if (idleTime > IDLE_THRESHOLD) {
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'USER_IDLE',
      idleTime: Math.floor(idleTime / 1000),
    });
  }
}, 30000); // Check every 30 seconds

// Listen for activity updates from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ACTIVITY_UPDATE') {
    // Update localStorage for dashboard sync
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('current_activity', JSON.stringify(request.activity));
      
      // Dispatch custom event for dashboard
      window.dispatchEvent(new CustomEvent('activityUpdate', {
        detail: request.activity,
      }));
    }
  }
});

// Sync current activity on page load
chrome.runtime.sendMessage({ type: 'GET_CURRENT_ACTIVITY' }, (response) => {
  if (response && response.activity) {
    localStorage.setItem('current_activity', JSON.stringify(response.activity));
  }
});
