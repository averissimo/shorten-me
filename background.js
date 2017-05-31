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
  function shortenedLinkFromContext(evt) {
    console.log('event', evt)

    var response = JSON.parse(evt.target.response);

    const code = "copyToClipboard(" +
                JSON.stringify(response.id) + ");";

    browser.tabs.executeScript({
      code: "typeof copyToClipboard === 'function';",
    }).then(function(results) {
        // The content script's last expression will be true if the function
        // has been defined. If this is not the case, then we need to run
        // clipboard-helper.js to define function copyToClipboard.
        if (!results || results[0] !== true) {
            return browser.tabs.executeScript(tab.id, {
                file: "clipboard_helper.js",
            });
        }
    }).then(function() {
        return browser.tabs.executeScript(tab.id, {
            code,
        });
    }).catch(function(error) {
        // This could happen if the extension is not allowed to run code in
        // the page, for example if the tab is a privileged page.
        console.error("Failed to copy text: " + error);
    });
    notify({url: info.linkUrl, shortUrl: response.id});
  }

  switch (info.menuItemId) {
    case "shorten-url":
      shortenLink(info.linkUrl, shortenedLinkFromContext, notSupportedFromContext)
      break;
  }
})

function notSupportedFromContext(link) {
  var title = browser.i18n.getMessage("notificationTitle");
  var content = browser.i18n.getMessage("notificationError", message.url);
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/icon-48.png"),
    "title": title,
    "message": content
  });
}

/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message) {
  console.log("background script received message");
  var title = browser.i18n.getMessage("notificationTitle");
  var content = browser.i18n.getMessage("notificationContent", [message.url, message.shortUrl]);
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/icon-48.png"),
    "title": title,
    "message": content
  });
}
