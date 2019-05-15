// Default Values
var storeDetails = {
    filterUrls: ["http://*/*"],
    notify: true,
    extensions: []
};

const CHECKBOX_NAME = 'installed-extension';

const getFormKeyVal = (key) => {
    const formObject = document.Options;
    if(key === 'notify') return formObject[key].checked;
    return formObject[key].value || formObject[key].innerHTML;
}

const loadOptions = async () => {
    try {
        // Listen to Form Changes
        document.getElementById('saveOptions').addEventListener('click', saveOptions);
        
        // Fetch Stored Data
        const data = await ChromeHelpers.getStorageValue(APP_OPTIONS);
        loadExtensionsPreview(data && data.extensions || []);

        const filterTag = document.getElementById('filterUrl');
        const notifyTag = document.getElementById('notify');
        
        
        if (!data) {
            filterTag.value = storeDetails.filterUrls;
            notifyTag.checked = storeDetails.notify;
            ChromeHelpers.storeValue(APP_OPTIONS, storeDetails);
            return;
        }
        // Retrieve Stored Values
        filterTag.value = data.filterUrls.join();
        notifyTag.checked = data.notify;
    } catch(e) {
        console.log('Failed to Retrieve Options')
    }
};

const saveOptions = async () => {
    try {
        const filterUrlValue = (getFormKeyVal('filterUrls') || '').split(',');
        const notification = getFormKeyVal('notify');

        // Store Details
        storeDetails.filterUrls = filterUrlValue; 
        storeDetails.notify = notification;
        storeDetails.extensions = getSelectedExtensions();

        await ChromeHelpers.storeValue(APP_OPTIONS,storeDetails);
        showStatus();
        ChromeHelpers.clearStorage(); // Will not work unless Dev
    } catch (e) {
        console.log('Cannot Store Values:\n', e);
    }
}

const loadExtensionsPreview = async (storedExtensions)=> {
    const extParentElement = document.getElementById('ext-parent');
    
    // Pulling Extensions Again From Chrome API
    const extensionsDetails = await ChromeHelpers.getAllExtesions();
    for(const installed of extensionsDetails) {
        if(installed.name === 'Reload') {
            continue;
        }
        const label = document.createElement('label');
        const input = document.createElement('input');
        const breakLine = document.createElement('br');
        extParentElement.appendChild(breakLine);

        // Initialising CheckBox Props
        input.type = 'checkbox';
        input.name = CHECKBOX_NAME;
        input.id = installed.id;
        input.classList.add('w3-check');
        input.checked = utilityHelpers.isExtensionStored(installed.id, storedExtensions);

        // Initialising Label Props
        label.setAttribute('for', input.id);
        label.innerHTML = installed.name; 
        label.prepend(input);
        extParentElement.appendChild(label);
    }
}

function showStatus() {
    var statusMsg = document.getElementById('showStatus');
    statusMsg.style.display = 'inline-block';
    setTimeout(() => {
        statusMsg.style.display = 'none';
    }, 1800)
}

function getSelectedExtensions() {
    let extensionList = [];
    const choosenExtensions = Array.from(document.querySelectorAll(`input[name=${CHECKBOX_NAME}]`));
    extensionList = choosenExtensions.reduce((total, Element) => {
        if (!Element.checked) { return total; } // Only Selected Extensions considered
        return [...total, { 
            id: Element.id
        }];
    }, []);
    return extensionList;
}
  
// On Dom Load
document.addEventListener('DOMContentLoaded', loadOptions);


