/**
 * Called when the item has been created, or when creation failed due to an error.
 */
function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`)
  } else {
    // console.log("Item created successfully");
  }
}

/**
 * Builds the context menus depending on the options
 */
function buildContext() {

  browser.storage.local.get('prefs').then(ret => {
    let item = ret['prefs'] || {link_in_context: true, tab_url_in_context: false}

    browser.contextMenus.removeAll()
    //
    if (item.link_in_context) {
      /**
       * Create context menu to shorten link
       */
      browser.contextMenus.create({
        id: "shorten-url",
        //title: browser.i18n.getMessage("shortenURL"),
        title: browser.i18n.getMessage("shortenURL"),
        contexts: ["link"]
      }, onCreated)
    }

    if (item.tab_url_in_context) {
      /**
       * Create context menu to shorten link
       */
      browser.contextMenus.create({
        id: "shorten-tab",
        //title: browser.i18n.getMessage("shortenURL"),
        title: browser.i18n.getMessage("shortenTab"),
        contexts: ["audio", "editable", "frame", "image", "page", "password", "selection", "video"]
      }, onCreated)
    }
  })
}

/**
 * Action when context menu is clicked
 */
browser.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "shorten-url":
      shortenLink(info.linkUrl)
      break;
    case "shorten-tab":
      shortenLink(tab.url)
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
  const gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
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
  const gettingInfo = browser.tabs.get(activeInfo.tabId)
  gettingInfo.then((tabInfo) => {
    // console.log('tabInfo', tabInfo)
    enableBrowserAction(tabInfo.id, tabInfo.url);
  });
}

function receiveMessage(message,sender,sendResponse){
  //Receives a message that must be an object with a property 'type'.
  //  This format is imposed because in a larger extension we may
  //  be using messages for multiple purposes. Having the 'type'
  //  provides a defined way for other parts of the extension to
  //  both indicate the purpose of the message and send arbitrary
  //  data (other properties in the object).
  // console.log('Received message: ',message);
  if(typeof message !== 'object' || !message.hasOwnProperty('type')){
      //Message does not have the format we have imposed for our use.
      //Message is not one we understand.
      return;
  }
  if(message.type === "optionsUpdated"){
      //The options have been updated and stored by options.js.
      //Re-read all options.
      buildContext();
  }
}

/**
 *
 */

browser.tabs.onUpdated.addListener(checkTabIsSupported)
browser.tabs.onActivated.addListener(checkActivatedTab)

// Initialize browser icon on load
let currentTab
if (currentTab === undefined) {
  currentTab = browser.tabs.query({active: true, currentWindow: true})

  currentTab.then(tabInfoArray => {
    tabInfoArray.forEach(tabInfo => {
      // console.log('tabInfo', tabInfo)
      enableBrowserAction(tabInfo.id, tabInfo.url)
    })
  })
}


/**
 * Adds listener to check when button is pressed
 */
browser.browserAction.onClicked.addListener(shortenFromBrowserAction)

buildContext()

chrome.runtime.onMessage.addListener(receiveMessage);
