function saveOptions(e) {
  browser.storage.sync.set({
    key: document.querySelector("#key").value
  });
  e.preventDefault();
}

function restoreOptions() {
  var gettingItem = browser.storage.sync.get('key');
  gettingItem.then((res) => {
    document.querySelector("#key").value = res.key || 'AIzaSyA61YQflGBiR2a-9q_C83kvb8c5kTifxRk';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
