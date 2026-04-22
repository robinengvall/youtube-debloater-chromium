// Default settings (all enabled by default)
const defaultSettings = {
  hideShortsShelf: true,
  hideShortsCards: true,
  hideShortsMenu: true,
  hideShortsTabs: true,
  hideShortsSearch: true
};

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  attachEventListeners();
});

// Load settings from chrome.storage
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    document.getElementById('hideShortsShelf').checked = settings.hideShortsShelf;
    document.getElementById('hideShortsCards').checked = settings.hideShortsCards;
    document.getElementById('hideShortsMenu').checked = settings.hideShortsMenu;
    document.getElementById('hideShortsTabs').checked = settings.hideShortsTabs;
    document.getElementById('hideShortsSearch').checked = settings.hideShortsSearch;
  });
}

// Save settings when checkbox changes
function saveSettings() {
  const settings = {
    hideShortsShelf: document.getElementById('hideShortsShelf').checked,
    hideShortsCards: document.getElementById('hideShortsCards').checked,
    hideShortsMenu: document.getElementById('hideShortsMenu').checked,
    hideShortsTabs: document.getElementById('hideShortsTabs').checked,
    hideShortsSearch: document.getElementById('hideShortsSearch').checked
  };
  
  // Save to chrome.storage.sync (syncs across devices)
  chrome.storage.sync.set(settings, () => {
    showStatus();
    // Notify content script to update
    notifyContentScript();
  });
}

// Show "Saved" message
function showStatus() {
  const status = document.getElementById('status');
  status.classList.add('show');
  
  setTimeout(() => {
    status.classList.remove('show');
  }, 2000);
}

// Notify content script that settings have changed
function notifyContentScript() {
  chrome.tabs.query({url: "https://www.youtube.com/*"}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {action: 'updateSettings'}, () => {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready:', chrome.runtime.lastError.message);
        }
      });
    });
  });
}

// Attach event listeners
function attachEventListeners() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveSettings);
  });
  
  // Refresh button reloads all YouTube tabs
  document.getElementById('refresh').addEventListener('click', () => {
    chrome.tabs.query({url: "https://www.youtube.com/*"}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.reload(tab.id);
      });
    });
  });
}
