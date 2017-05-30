
function isSupportedProtocol(urlString) {
  var supportedProtocols = ["https:", "http:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

function transferComplete(evt) {
  console.log('Download complete', evt);
  var response = JSON.parse(evt.target.response);

  var statusEl = document.querySelector("#status input");
  statusEl.value = response.id;
  statusEl.select();
  document.execCommand("Copy");
  console.log('short url is: ' + response.id);
  console.log('document.body:', document.getElementById('status'));
}

function transferFailed(evt) {
  var statusEl = document.querySelector("#status input");
  statusEl.value = 'Problem shortening the url';
}

function updateTab(tabs) {
  if (tabs[0]) {
    currentTab = tabs[0];
    if (isSupportedProtocol(currentTab.url)) {
      // Send currentTab.url to API
      var basename = "https://www.googleapis.com"
      var key = 'AIzaSyA61YQflGBiR2a-9q_C83kvb8c5kTifxRk'
      var urlfrag = "/urlshortener/v1/url?key=" + key
      var longUrl = encodeURIComponent(currentTab.url)
      // POST request
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", transferComplete);
      xhr.addEventListener("error", transferFailed);
      xhr.open("POST", basename + urlfrag, true);
      // Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify({"longUrl": currentTab.url}));
      console.log('request', xhr)
    } else {
      var statusEl = document.querySelector("#status input");
      statusEl.value = 'No support for this url';
    }
  }
}

// run this
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then(updateTab)
