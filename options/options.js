const options = {
  tab_url_in_context: {
    attr: 'checked',
    def: false
  },
  link_in_context: {
    attr: 'checked',
    def: true
  }
}

/**
 * Inspired on mozilla's webExtensions examples
 */

/**
 * Saving options
 */
function saveOptions(e) {
  e.preventDefault();

  let toSave = {prefs: {}};
  Object.keys(options).forEach((id) => {
    toSave['prefs'][id] = document.getElementById(id)[options[id].attr];
  });
  browser.storage.local.set(toSave);
  chrome.runtime.sendMessage({type:'optionsUpdated'});
}

/**
 * Restore options key from storage
 */
function restoreOptions() {
  // console.log('calling restoreOptions')
  // Initialize i18n.
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = browser.i18n.getMessage(node.dataset.i18n);
  });

  // Restore settings.
  browser.storage.local.get('prefs').then((res) => {
    let currentPrefs = res['prefs'] || {};
    Object.keys(options).forEach((id) => {
      let val = (typeof currentPrefs[id] !== 'undefined') ? currentPrefs[id] : options[id].def;
      document.getElementById(id)[options[id].attr] = val;
    });
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
