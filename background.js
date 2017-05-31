/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    // console.log("Item created successfully");
  }
}

browser.contextMenus.create({
  id: "shorten-url",
  //title: browser.i18n.getMessage("shortenURL"),
  title: browser.i18n.getMessage("shortenURL"),
  contexts: ["link"]
}, onCreated);


browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "shorten-url":
      shortenLink(info.linkUrl)
      break;
  }
})

function shortenFromBrowserAction() {
  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      shortenLink(currentTab.url)
    }
  }

  // run this
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab)
}

browser.browserAction.onClicked.addListener(shortenFromBrowserAction);
