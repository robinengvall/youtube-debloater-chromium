const defaultSettings = {
  hideShortsShelf: true,
  hideShortsCards: true,
  hideShortsMenu: true,
  hideShortsTabs: true,
  hideShortsSearch: true
};

let currentSettings = { ...defaultSettings };

function loadSettings(callback) {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    currentSettings = settings;
    if (callback) callback();
  });
}

// Hide Shorts sections on home page
function hideShortsShelf() {
  const selectors = [
    'ytd-rich-shelf-renderer',
    'ytd-reel-shelf-renderer'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (currentSettings.hideShortsShelf) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });
  });
}

// Hide Shorts cards in feed
function hideShortsCards() {
  const selectors = [
    'ytm-shorts-lockup-view-model-v2',
    'ytd-reel-item-renderer'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (currentSettings.hideShortsCards) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });
  });
}

// Hide Shorts button in menu
function hideShortsMenu() {
  document.querySelectorAll('a[href^="/shorts/"]').forEach(link => {
    const guideEntry = link.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
    if (guideEntry) {
      if (currentSettings.hideShortsMenu) {
        guideEntry.style.display = 'none';
      } else {
        guideEntry.style.display = '';
      }
    }
  });
  
  document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach(entry => {
    const titleElement = entry.querySelector('yt-formatted-string.title');
    if (titleElement && titleElement.textContent.trim() === 'Shorts') {
      if (currentSettings.hideShortsMenu) {
        entry.style.display = 'none';
      } else {
        entry.style.display = '';
      }
    }
  });
}

// Hide Shorts tab on channel pages
function hideShortsTabs() {
  document.querySelectorAll('yt-tab-shape, tp-yt-paper-tab').forEach(tab => {
    const tabTitle = tab.getAttribute('tab-title');
    const ariaLabel = tab.getAttribute('aria-label');
    if (tabTitle === 'Shorts' || (ariaLabel && ariaLabel.includes('Shorts'))) {
      if (currentSettings.hideShortsTabs) {
        tab.style.display = 'none';
      } else {
        tab.style.display = '';
      }
    }
  });
}

// Hide Shorts in search results and video lists
function hideShortsSearch() {
  document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer').forEach(el => {
    const link = el.querySelector('a[href^="/shorts/"]');
    if (link) {
      if (currentSettings.hideShortsSearch) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    }
  });
}

// Run all enabled functions
function hideAllShorts() {
  hideShortsShelf();
  hideShortsCards();
  hideShortsMenu();
  hideShortsTabs();
  hideShortsSearch();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSettings') {
    loadSettings(() => {
      hideAllShorts();
      sendResponse({status: 'updated'});
    });
    return true; 
});

// Initial run - load settings first, then hide
loadSettings(() => {
  hideAllShorts();
  console.log('YouTube Debloat: Active with settings', currentSettings);
});

// Debounce function to improve performance
let timeout;
function debouncedHideShorts() {
  clearTimeout(timeout);
  timeout = setTimeout(hideAllShorts, 100);
}

// MutationObserver with debounce
const observer = new MutationObserver(debouncedHideShorts);

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also run on URL changes (YouTube uses History API)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(hideAllShorts, 500);
  }
}).observe(document.body, {
  childList: true,
  subtree: true
});
