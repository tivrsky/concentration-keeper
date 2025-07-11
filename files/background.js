// 拡張機能のインストール時やアップデート時に実行
chrome.runtime.onInstalled.addListener(() => {
	updateBlockingRules();
});

// ポップアップからのメッセージを受信
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
	if (message.action === "updateRules") {
		updateBlockingRules();
	}
});

// ブロッキングルールを更新する関数
function updateBlockingRules() {
	chrome.storage.local.get(["blockedSites", "blockingEnabled"], (result) => {
		const blockedSites = result.blockedSites || [];
		const isEnabled = result.blockingEnabled !== false; // デフォルトはtrue

		// 既存のルールを削除
		chrome.declarativeNetRequest
			.updateDynamicRules({
				removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1),
			})
			.then(() => {
				// ブロック機能が有効な場合のみ新しいルールを追加
				if (isEnabled && blockedSites.length > 0) {
					const rules = blockedSites.map((site, index) => {
						// URLを正規化
						let urlFilter;
						if (site.startsWith("http://") || site.startsWith("https://")) {
							// 完全URLの場合、ドメイン部分を抽出
							try {
								const url = new URL(site);
								urlFilter = `*://${url.hostname}/*`;
							} catch (_e) {
								urlFilter = `*://${site}/*`;
							}
						} else {
							// ドメインのみの場合
							urlFilter = `*://${site}/*`;
						}

						return {
							id: index + 1,
							action: {
								type: "redirect",
								redirect: {
									url: chrome.runtime.getURL("blocked.html"),
								},
							},
							condition: {
								urlFilter: urlFilter,
								resourceTypes: ["main_frame"],
							},
						};
					});

					chrome.declarativeNetRequest.updateDynamicRules({
						addRules: rules,
					});
				}
			});
	});
}
