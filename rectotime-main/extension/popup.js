// Popup script for extension

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
}

function updateStats() {
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
    if (response) {
      document.getElementById('productive-time').textContent = `${response.productive}m`;
      document.getElementById('total-time').textContent = `${response.total}m`;
    }
  });
}

function updateCurrentActivity() {
  chrome.runtime.sendMessage({ type: 'GET_CURRENT_ACTIVITY' }, (response) => {
    if (response && response.activity) {
      const activity = response.activity;
      const timeSpent = response.timeSpent || 0;
      
      document.getElementById('current-domain').textContent = activity.domain;
      document.getElementById('current-time').textContent = formatTime(timeSpent);
      
      const badge = document.getElementById('activity-badge');
      badge.textContent = activity.category;
      badge.className = `badge badge-${activity.category}`;
    } else {
      document.getElementById('current-domain').textContent = 'No activity';
      document.getElementById('current-time').textContent = '--';
      document.getElementById('activity-badge').textContent = '--';
    }
  });
}

// Update on load
updateStats();
updateCurrentActivity();

// Update every 5 seconds
setInterval(() => {
  updateStats();
  updateCurrentActivity();
}, 5000);
