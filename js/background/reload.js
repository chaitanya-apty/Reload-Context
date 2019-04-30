
const activityStates = [false, true];

class ReloadChromeExtension {
  constructor() {
    chrome.browserAction.onClicked.addListener(this.reloadChromeContext.bind(this));
  }

  async reloadChromeContext() {
    const extensionsDetails = await ChromeHelpers.getAllExtesions();
    const storedExtensions = await ChromeHelpers.getStorageValue('extensions');
    for (const extension of extensionsDetails) {
      // Skipping Our Extension ...
      if (extension.name !== 'Reload') {
        if (utilityHelpers.isExtensionStored(extension.id, storedExtensions || [])) {
          this.reloadCurrentExtension(extension.id);
        } else if (!storedExtensions || !storedExtensions.length) {
          // If No options are Choosen ,Unpacked Extensions are reloaded 
          if (utilityHelpers.isActiveDevExtension(extension)) {
            this.reloadCurrentExtension(extension.id);
          }
        }
      }
      this.reloadActiveTab();
    }
  }

  reloadActiveTab() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      if(tabs.length) {
        // Regex Urls || Chrome Pages will not be reloaded
        if (!tabs[0].url.includes('chrome:') && await utilityHelpers.isUrlFiltered(tabs[0].url)) {
          chrome.tabs.reload(tabs[0].id);
          utilityHelpers.notifyUser();
        }
      }
    });
  }

  reloadCurrentExtension(extensionId) {
    for (const enable of activityStates) { // mimic Reloading of Extension
      chrome.management.setEnabled(extensionId, enable);
    }
  }
}

var reloadInstance = new ReloadChromeExtension();