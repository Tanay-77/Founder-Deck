// Open dashboard when toolbar icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/index.html") });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "save_founder") {
    const founder = message.data;

    chrome.storage.local.get({ founders: [] }, (result) => {
      let founders = result.founders;

      const existingIndex = founders.findIndex(f => f.profileUrl === founder.profileUrl);
      if (existingIndex !== -1) {
        founders[existingIndex] = founder;
      } else {
        founders.unshift(founder);
      }

      chrome.storage.local.set({ founders }, () => {
        // Tell content script it worked
        if (sender && sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "save_success", name: founder.name });
        }
      });
    });
    return true;
  }

  if (message.action === "open_dashboard") {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/index.html") });
  }
});
