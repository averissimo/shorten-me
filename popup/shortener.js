
function updateTab(tabs) {
  if (tabs[0]) {
    currentTab = tabs[0];
    shortenLink(currentTab.url, shortenedLink, notSupported)
  }
}

function shortenedLink(evt) {
  var response = JSON.parse(evt.target.response);

  var statusEl = document.querySelector("#status input");
  statusEl.value = response.id;
  statusEl.select();
  copyToClipboard(statusEl.value)
}

function notSupported(link) {
  var statusEl = document.querySelector("#status");
  statusEl.innerHTML = 'Something bad happened with:<br/>' +
  '<span style="margin-left:1em;font-size:.8em;">' + link + "</span>";
}

// run this
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then(updateTab)
