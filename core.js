function isSupportedProtocol(urlString) {
  var supportedProtocols = ["https:", "http:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

function shortenLink(link, onSuccess, onError) {
  if (isSupportedProtocol(link)) {
    // Send link to API
    var key = browser.storage.sync.get('key');

    key.then(function(item) {
      var basename = "https://www.googleapis.com"
      var urlfrag = "/urlshortener/v1/url?key=" + item.key
      var longUrl = encodeURIComponent(link)
      // POST request
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", onSuccess);
      xhr.addEventListener("error", onError);
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
