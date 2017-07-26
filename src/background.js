/**
 * Called when the item has been created, or when creation failed due to an error.
 */
function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    // console.log("Item created successfully");
  }
}

/**
 * Create context menu to shorten link
 */
browser.contextMenus.create({
  id: "shorten-url",
  //title: browser.i18n.getMessage("shortenURL"),
  title: browser.i18n.getMessage("shortenURL"),
  contexts: ["link"]
}, onCreated);

/**
 * Action when context menu is clicked
 */
browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "shorten-url":
      shortenLink(info.linkUrl)
      break;
  }
})

/**
 * Action when button is pressed
 */
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

function checkTabIsSupported(tabId, changeInfo, tab) {
  enableBrowserAction(tabId, tab.url)
}

function enableBrowserAction(tabId, tabUrl) {
  if (isSupportedProtocol(tabUrl)) {
    browser.browserAction.enable(tabId)
  } else (
    browser.browserAction.disable(tabId)
  )
}

function checkActivatedTab(activeInfo) {
  var gettingInfo = browser.tabs.get(activeInfo.tabId)
  gettingInfo.then(function(tabInfo){
    enableBrowserAction(tabInfo.id, tabInfo.url);
  });
}

/**
 * 
 */

browser.tabs.onUpdated.addListener(checkTabIsSupported)
browser.tabs.onActivated.addListener(checkActivatedTab)

var currentTab = browser.tabs.query({active: true});

currentTab.then(function(tabInfoArray){
  tabInfoArray.forEach(function(tabInfo){
    enableBrowserAction(tabInfo.id, tabInfo.url);
  })
});


/**
 * Adds listener to check when button is pressed
 */
browser.browserAction.onClicked.addListener(shortenFromBrowserAction);
