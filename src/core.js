const defaultKey = [
  '1cf19ef0-42ce-4e75-8ed8-afedfa129b04']

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

    // console.log('response', response)

    if (response.message) {
      switch (response.message) {
        case "FORBIDDEN": notifyNetworkErrorKey(response.message) ; break;
        default: notifyErrorGeneric(); break;
      }
      return null
    }
    navigator.clipboard.writeText(response.shortUrl).then(
      () => notifySuccess({url: link, shortUrl: response.shortUrl}),
      error => notifyClipboardError({info: error, url: link, shortUrl: response.shortUrl})
    )
  }

  if (isSupportedProtocol(link)) {
    // Send link to API
    browser.storage.local.get('prefs').then(ret => {
      const chooseDefaultKey = defaultKey[Math.floor(Math.random() * defaultKey.length)];

      var basename = "http://shrtn.escalar.pt/";
      var longUrl = encodeURIComponent(link);
      var urlfrag = "/rest/v3/short-urls"
      //
      // console.log('Calling ' + basename + urlfrag + ' with ' + JSON.stringify({"longUrl": link}));
      // POST request
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", executeCopyScript);
      xhr.addEventListener("error", notifyNetworkError);
      xhr.open("POST", basename + urlfrag, true);
      // Send the proper header information along with the request
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("X-Api-Key", chooseDefaultKey);
      xhr.send(JSON.stringify({"longUrl": link, "findIfExists": true}));
      console.log('request', xhr);
    });
  } else {
    // Do nothing TODO: disable icon on these tabs
    notifyNetworkProtocol(link);
  }
}

/*
 *
 *
 *
 *
 * Notifications (success, error, ...)
 *  auxiliary functions
 *
 *
 *
 */

 /**
  * Notify error message
  * @param  {[type]} messageType [description]
  * @param  {[type]} messageArray [description]
  * @return {[type]}         [description]
  */
 function notify(messageType = "notificationErrorGeneric", messageArray = []) {
   var title = browser.i18n.getMessage("notificationTitle");
   var content = browser.i18n.getMessage(messageType, messageArray);
   // console.log('Error: ' + content)
   browser.notifications.create({
     "type": "basic",
     "iconUrl": browser.runtime.getURL("icons/icon-48.png"),
     "title": title,
     "message": content
   });
 }

 /**
  * [notifySuccess description]
  * @param  {[type]} message [description]
  * @return {[type]}         [description]
  */
 function notifySuccess(message) {
   notify("notificationContent", [message.url, message.shortUrl]);
 }

/**
 * [notificationErrorKey description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function notifyErrorGeneric(message) {
  notify("notificationErrorGeneric");
}


/**
 * [notificationErrorKey description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function notifyNetworkErrorKey(message) {
  notify("notificationErrorKey", message);
}

/**
 * Notify host copy error message
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function notifyHostError(message) {
  notify("notificationErrorHost", [message.info, message.url, message.shortUrl]);
}

/**
 * Notify generic clipboard copy error message
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function notifyClipboardError(message) {
  notify("notificationErrorClipboard", [message.info, message.url, message.shortUrl]);
}

/**
 * Notify network error message
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function notifyNetworkError() {
  notify("notificationErrorNetwork", []);
}

/**
 * Notify protocol error message
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function notifyNetworkProtocol(url) {
  notify("notificationErrorProtocol", [url]);
}
