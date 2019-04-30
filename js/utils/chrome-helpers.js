const APP_OPTIONS = 'APP_OPTIONS';
const EXTENSIONS_LIST = 'EXTENSIONS_LIST';

var ChromeHelpers = {
    getStorageValue:  (prop, requestSource = APP_OPTIONS) => {
      return new Promise((resolve, reject) => {
          let data;
          if(requestSource === APP_OPTIONS) { // Future: May have Multiple Sources
            const storage = localStorage.getItem(APP_OPTIONS);
            data = JSON.parse(storage || null);
            if(prop === requestSource) { // Requesting for Whole Options
               return resolve(data);
            }
             const keyValue = data ? data[prop] : null;
             return resolve(keyValue);
          }
      });
    },
    storeValue: (key, storeDetails) => {
        return new Promise((resolve, reject) => {
            const data = typeof storeDetails === 'string' ? storeDetails : JSON.stringify(storeDetails);
            localStorage.setItem(key, data);
            resolve();
        });
    },
    clearStorage: ()=> {
        if(window.isDev) {
            localStorage.clear();
        }
    },
    getAllExtesions: () => {
        return new Promise((resolve, reject) => {
            chrome.management.getAll(extensionDetails => {
                const modifiedData = extensionDetails.reduce((total, curr) => {
                    if(curr.isApp || !curr.enabled) return total; // Extenion APPS are not selected
                    return [...total, {
                        name: curr.name,
                        id: curr.id,
                        installType: curr.installType,
                        enabled: curr.enabled
                    }];
                }, []);
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(modifiedData);
            });
        });
    }
};