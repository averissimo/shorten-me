const defaultKey = [ '41a1f837109164081dd190f61e27fc650e6ba0ed',
 '30ff74ef00795ea27b70d4d9dcb28256126e56ec', 
  '93b0d952fa9a8f4ee60c5ec4fe796bda4232fc4f']

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
    navigator.clipboard.writeText(response.link).then(
      () => notifySuccess({url: link, shortUrl: response.link}),
      error => notifyClipboardError({info: error, url: link, shortUrl: response.link})
    )
  }

  if (isSupportedProtocol(link)) {
    // Send link to API
    browser.storage.local.get('prefs').then(ret => {
      let chooseDefaultKey;

      // must remove in the future.
      if ((new Date()).getFullYear() == 2020 && (new Date()).getMonth() <=2) {
        chooseDefaultKey = defaultKey[2];
      } else {
        chooseDefaultKey = defaultKey[Math.floor(Math.random() * defaultKey.length)];
      }

      let item = ret['prefs'] || { key: chooseDefaultKey }
      // console.log('key', item)
      if (item === undefined || item.bitlykey === undefined || item.bitlykey.trim() === '' ) {
        // console.log('setting default key')
        item.bitlykey = chooseDefaultKey
      }

      var basename = "https://api-ssl.bitly.com";
      var longUrl = encodeURIComponent(link);
      var urlfrag = "/v4/bitlinks";
      //
      // console.log('Calling ' + basename + urlfrag + ' with ' + JSON.stringify({"longUrl": link}));
      // POST request
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", executeCopyScript);
      xhr.addEventListener("error", notifyNetworkError);
      xhr.open("POST", basename + urlfrag, true);
      // Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer " + item.bitlykey);
      xhr.send(JSON.stringify({"long_url": link}));
      // console.log('request', xhr);
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
     "iconUrl": browser.extension.getURL("icons/icon-48.png"),
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
