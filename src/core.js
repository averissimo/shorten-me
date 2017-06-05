/**
 * Checks if protocol is supported (only http and https)
 * @param  {string}  urlString link that is going to be validated
 * @return {Boolean}           [description]
 */
function isSupportedProtocol(urlString) {
  var supportedProtocols = ["https:", "http:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

/**
 * Shortens the link, copies to clipboard and notifies the firefox window
 * @param  {string} link url that should be shortened
 */
function shortenLink(link) {
  function executeCopyScript(evt) {
    var response = JSON.parse(evt.target.response);

    const code = "copyToClipboard(" +
                JSON.stringify(response.id) + ");";

    console.log('code', code);

    function copyInTab(tabs) {

      if (tabs[0]) {
        currentTab = tabs[0];

        browser.tabs.executeScript(currentTab.id, {
          code: "typeof copyToClipboard === 'function';",
        }).then(function(results) {
          console.log('has function named copyToClipboard', results);
          // The content script's last expression will be true if the function
          // has been defined. If this is not the case, then we need to run
          // clipboard-helper.js to define function copyToClipboard.
          if (!results || results[0] !== true) {
            return browser.tabs.executeScript(currentTab.id, {
              file: "/src/clipboard_helper.js",
            });
          }
        }).then(function(results2) {
          return browser.tabs.executeScript(currentTab.id, {
            code,
          });
        }).catch(function(error) {
            // This could happen if the extension is not allowed to run code in
            // the page, for example if the tab is a privileged page.
            console.error("Failed to copy text: " + error);
        });
        notify({url: link, shortUrl: response.id});
      }
    }

    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then(copyInTab)
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
      xhr.addEventListener("load", executeCopyScript);
      xhr.addEventListener("error", notSupportedFromContext);
      xhr.open("POST", basename + urlfrag, true);
      // Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify({"longUrl": link}));
      console.log('request', xhr)
    });
  } else {
    notSupportedFromContext(link);
  }
}

/**
 * Notifies the user of a successful shortening of the link
 * @param  {[hash]} message contains the shortened and original urls
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

/**
 * TODO: do something
 * @param  {[type]} link [description]
 * @return {[type]}      [description]
 */
function notSupportedFromContext(evt) {
  /*
  var title = browser.i18n.getMessage("notificationTitle");
  var content = browser.i18n.getMessage("notificationError", evt.target);
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/icon-48.png"),
    "title": title,
    "message": content
  });
  */
  console.log('error', evt)
}
