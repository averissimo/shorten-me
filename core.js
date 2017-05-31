function isSupportedProtocol(urlString) {
  var supportedProtocols = ["https:", "http:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

function shortenLink(link) {
  function copyToClipboard(evt) {
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
            return browser.tabs.executeScript({
                file: "clipboard_helper.js",
            });
        }
    }).then(function() {
        return browser.tabs.executeScript({
            code,
        });
    }).catch(function(error) {
        // This could happen if the extension is not allowed to run code in
        // the page, for example if the tab is a privileged page.
        console.error("Failed to copy text: " + error);
    });
    notify({url: link, shortUrl: response.id});
  }

  if (isSupportedProtocol(link)) {
    // Send link to API
    var key = browser.storage.sync.get('key');

    key.then(function(item) {
      var basename = "https://www.googleapis.com"
      var urlfrag = "/urlshortener/v1/url?key=" + item.key
      var longUrl = encodeURIComponent(link)
      // POST request
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", copyToClipboard);
      xhr.addEventListener("error", notSupportedFromContext);
      xhr.open("POST", basename + urlfrag, true);
      // Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify({"longUrl": link}));
      console.log('request', xhr)
    });
  } else {
    onError(link);
  }
}

/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message) {
  var title = browser.i18n.getMessage("notificationTitle");
  var content = browser.i18n.getMessage("notificationContent", [message.url, message.shortUrl]);
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/icon-48.png"),
    "title": title,
    "message": content
  });
}

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
