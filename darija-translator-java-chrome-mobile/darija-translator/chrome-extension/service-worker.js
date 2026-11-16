chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "translate-darija", title: "Translate selection to Darija", contexts: ["selection"] });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "translate-darija") return;
  await chrome.storage.session.set({ selectedText: info.selectionText || "" });
  if (tab?.windowId !== undefined) await chrome.sidePanel.open({ windowId: tab.windowId });
});
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.windowId !== undefined) await chrome.sidePanel.open({ windowId: tab.windowId });
});
