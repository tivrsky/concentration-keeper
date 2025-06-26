document.addEventListener('DOMContentLoaded', function () {
  const siteInput = document.getElementById('siteInput');
  const addButton = document.getElementById('addSite');
  const blockedSitesDiv = document.getElementById('blockedSites');
  const enableToggle = document.getElementById('enableToggle');
  const mainContent = document.getElementById('mainContent');
  const statusMessage = document.getElementById('statusMessage');

  // ページ読み込み時に設定を読み込み
  loadSettings();

  // トグルスイッチの変更イベント
  enableToggle.addEventListener('change', function () {
    const isEnabled = enableToggle.checked;
    chrome.storage.local.set({ blockingEnabled: isEnabled }, function () {
      updateBlockingRules();
      updateUI();
    });
  });

  // サイト追加ボタンのクリックイベント
  addButton.addEventListener('click', function () {
    const url = siteInput.value.trim();
    if (url) {
      addBlockedSite(url);
      siteInput.value = '';
    }
  });

  // Enterキーでも追加できるように
  siteInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addButton.click();
    }
  });

  // 設定を読み込み
  function loadSettings() {
    chrome.storage.local.get(['blockingEnabled', 'blockedSites'], function (result) {
      const isEnabled = result.blockingEnabled !== false; // デフォルトはtrue
      enableToggle.checked = isEnabled;
      updateUI();
      loadBlockedSites();
    });
  }

  // UIの状態を更新
  function updateUI() {
    const isEnabled = enableToggle.checked;

    if (isEnabled) {
      mainContent.classList.remove('disabled');
      statusMessage.textContent = 'ブロック機能が有効です';
      statusMessage.className = 'status-message status-enabled';
    } else {
      mainContent.classList.add('disabled');
      statusMessage.textContent = 'ブロック機能が無効です';
      statusMessage.className = 'status-message status-disabled';
    }
  }

  // サイトをブロックリストに追加
  function addBlockedSite(url) {
    chrome.storage.local.get(['blockedSites'], function (result) {
      const blockedSites = result.blockedSites || [];

      // 既に追加されていないかチェック
      if (!blockedSites.includes(url)) {
        blockedSites.push(url);
        chrome.storage.local.set({ blockedSites: blockedSites }, function () {
          updateBlockingRules();
          loadBlockedSites();
        });
      }
    });
  }

  // サイトをブロックリストから削除
  function removeBlockedSite(url) {
    chrome.storage.local.get(['blockedSites'], function (result) {
      const blockedSites = result.blockedSites || [];
      const index = blockedSites.indexOf(url);

      if (index > -1) {
        blockedSites.splice(index, 1);
        chrome.storage.local.set({ blockedSites: blockedSites }, function () {
          updateBlockingRules();
          loadBlockedSites();
        });
      }
    });
  }

  // ブロック済みサイトをUIに表示
  function loadBlockedSites() {
    chrome.storage.local.get(['blockedSites'], function (result) {
      const blockedSites = result.blockedSites || [];
      blockedSitesDiv.innerHTML = '';

      if (blockedSites.length === 0) {
        blockedSitesDiv.innerHTML = '<p>ブロック中のサイトはありません</p>';
        return;
      }

      blockedSites.forEach(function (site) {
        const siteItem = document.createElement('div');
        siteItem.className = 'site-item';

        const siteText = document.createElement('span');
        siteText.textContent = site;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', function () {
          removeBlockedSite(site);
        });

        siteItem.appendChild(siteText);
        siteItem.appendChild(deleteButton);
        blockedSitesDiv.appendChild(siteItem);
      });
    });
  }

  // ブロッキングルールを更新
  function updateBlockingRules() {
    chrome.runtime.sendMessage({ action: 'updateRules' });
  }
});