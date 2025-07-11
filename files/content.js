const blockedDomains = ['x.com', 'twitter.com'];

chrome.storage.local.get(['blockingEnabled'], (result) => {
  const isEnabled = result.blockingEnabled !== false; // デフォルトはtrue
  if (!isEnabled) return;

  if (blockedDomains.some(domain => location.hostname.endsWith(domain))) {
    window.location.href = chrome.runtime.getURL('blocked.html');
  }
});
