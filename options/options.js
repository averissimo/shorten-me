/**
 * Inspired on mozilla's webExtensions examples
 */

/**
 * Saving options
 */
function saveOptions(e) {
  browser.storage.sync.set({
    key: document.querySelector("#key").value
  });
  e.preventDefault();
}

/**
 * Restore options key from storage
 */
function restoreOptions() {
  var gettingItem = browser.storage.sync.get('key');
  gettingItem.then((res) => {
    document.querySelector("#key").value = res.key;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
