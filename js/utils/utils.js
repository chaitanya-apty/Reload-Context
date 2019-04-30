var utilityHelpers = {
    notifyUser: async () => {
      var notifDetails = {
        type: "basic",
        title: "Reload Extension",
        message: "reloading current page...",
        silent: true,
        iconUrl: "../images/96x96.png"
      }
      try {
          const notify = await ChromeHelpers.getStorageValue('notify');
          if(notify) {
            chrome.notifications.create(notifDetails, (notifiedId) => {
              setTimeout(() => {
                chrome.notifications.clear(notifiedId);
              }, 2600);
            });
          }
      } catch(E) {console.log(E)}
    },
    isActiveDevExtension: (currentExtDetails) => {
        const {installType, enabled, ...rest} = currentExtDetails;
        return installType === "development" && enabled;
    },
    isUrlFiltered: async (url)=> {
      const urls = await ChromeHelpers.getStorageValue('filterUrls');
      for (const filter of urls) {
        const regex = new RegExp(filter);
        if(filter && url.match(regex)) { // filter&regex value can be '', will optimise later
          return true;
        }
      }
      return false;
    },
    isExtensionStored: (currentId, storedData) => {
      return !!storedData.find(store => store.id === currentId);
    }
  }