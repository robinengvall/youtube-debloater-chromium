
function hideShortsSelectors() {
  const selectors = [
    'ytd-rich-shelf-renderer',
    'ytd-reel-shelf-renderer',
    'ytm-shorts-lockup-view-model-v2',
    'ytd-reel-item-renderer'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
  });
}

function hideShortsLinks() {
  document.querySelectorAll('a[href^="/shorts/"]').forEach(link => {
    if (link.style.display !== 'none') {
      link.style.display = 'none';
    }
    
    const container = link.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');
    if (container && container.style.display !== 'none') {
      container.style.display = 'none';
    }
  });
}

function hideShortsTabs() {
  document.querySelectorAll('yt-tab-shape, tp-yt-paper-tab').forEach(tab => {
    const tabTitle = tab.getAttribute('tab-title');
    const ariaLabel = tab.getAttribute('aria-label');
    if ((tabTitle === 'Shorts' || (ariaLabel && ariaLabel.includes('Shorts'))) && tab.style.display !== 'none') {
      tab.style.display = 'none';
    }
  });
}

function hideAllShorts() {
  hideShortsSelectors();
  hideShortsLinks();
  hideShortsTabs();
}

hideAllShorts();

let timeout;
function debouncedHideShorts() {
  clearTimeout(timeout);
  timeout = setTimeout(hideAllShorts, 100);
}

const observer = new MutationObserver(debouncedHideShorts);

observer.observe(document.body, {
  childList: true,
  subtree: true
});

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

console.log('YouTube Debloat: Shorts blocker active');
