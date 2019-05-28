// Default Values
var storeInitialDetails = {
    filterUrls: ["http://*/*"],
    notify: true,
    extensions: [],
    taskDetails: []
};

var saveButton,addTaskButton;
var filterTag,notifyTag;
var taskTableRoot, taskTableBody;

const CHECKBOX_NAME = 'installed-extension';

const getElementBy = (type, selector) => {
 switch(type) {
    case 'id' : return document.getElementById(selector);
    case 'class': return document.getElementsByClassName(selector)[0];
    case 'tag': return document.getElementsByTagName(selector)[0];
    default: return document.querySelectorAll(selector);
 }
}
const loadOptions = async () => {
    try {
         saveButton    = getElementBy('id','saveOptions');
         addTaskButton = getElementBy('id','addTask');
         filterTag     = getElementBy('id','filterUrl');
         notifyTag     = getElementBy('id','notify');
         taskTableRoot = getElementBy('id','taskDetails');
         taskTableBody = taskTableRoot.getElementsByTagName('tbody')[0];
        
        // Fetch Stored Data
        var data = await ChromeHelpers.getStorageValue(APP_OPTIONS);
        if (!data) { data = {...storeInitialDetails} }; 
    
        filterTag.value = data.filterUrls.join();
        notifyTag.checked = data.notify;
        loadExtensionsPreview(data.extensions);

        utilityHelpers.registerEventListeners(addTaskButton, 'click', addTask);
        utilityHelpers.registerEventListeners(saveButton, 'click', saveOptions);
    } catch(e) {
        console.log('Failed to Retrieve Options',e)
    }
};

const saveOptions = async () => {
    try {
        var storeDetails = {};
        const filterUrls = filterTag.value.split(',');
        const notify = notifyTag.checked;
        const extensions = getSelectedExtensions();
        const taskDetails = getAddedTasks();

        // Store Details
        storeDetails = {
            ...storeDetails, 
            filterUrls, 
            notify,
            extensions,
            taskDetails
        };

        await ChromeHelpers.storeValue(APP_OPTIONS,storeDetails);
        showStatus();
    } catch (e) {
        console.log('Cannot Store Values:\n', e);
    }
}

const loadExtensionsPreview = async (storedExtensions)=> {
    const extParentElement = getElementBy('id','ext-parent');
    
    // Pulling Extensions Again From Chrome API
    const extensionsDetails = await ChromeHelpers.getAllExtesions();
    for(const installed of extensionsDetails) {
        if(installed.name === 'Reload') {
            continue;
        }
        const label = document.createElement('label');
        const input = document.createElement  ('input');
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
    var statusMsg = getElementBy('id','showStatus');
    statusMsg.style.display = 'inline-block';
    setTimeout(() => {
        statusMsg.style.display = 'none';
    }, 1800)
}

function getSelectedExtensions() {
    let extensionList = [];
    const choosenExtensions = getElementBy('all',`input[name=${CHECKBOX_NAME}]`);
    for(const Element of choosenExtensions) {
        if(!Element.checked) continue;
        const elementLabel =  document.querySelector(`label[for=${Element.id}]`);
        extensionList.push({
            id: Element.id,
            name: elementLabel.textContent
        })
    }
    return extensionList;
}

// Task Helpers
const getTaskDetailPreview  = (taskId) => {
    return `
    <tr id='taskDetail_${taskId}'>
    <td contenteditable = 'true'>Click here to Edit....</td>
    <td><input type="time" name="tasktime_${taskId}" value="12:00:00" required></td>
    <td name='taskDelete_${taskId}'>&#10060;</td>
    </tr>`;
}

function addTask() {
var taskRows = taskTableBody.rows;
var taskId = taskRows.length || 0; // Insert a row in the table at the last row
taskTableBody.innerHTML += getTaskDetailPreview(taskId);
utilityHelpers.registerEventListeners(taskRows[taskId].lastElementChild, 'click', deleteTask);
}
  
function deleteTask(event) {
 const deleteTarget = event.target;
 const taskId = deleteTarget.getAttribute('name').split('_')[1];
 taskTableBody.deleteRow(taskId);
}

function getAddedTasks() {
  var addedTasks = [];
  const taskRows = document.querySelectorAll('[id*="taskDetail_"]');
  for(const task of taskRows) {
    const taskDetailInputs = Array.from(task.cells).splice(0,2); // Hack Will Improve
    addedTasks.push({
        name: taskDetailInputs[0].innerText,
        time: taskDetailInputs[1].firstElementChild.value
    })
    
  }
  return addedTasks;
}
// Task Helpers

// On Dom Load
document.addEventListener('DOMContentLoaded', loadOptions);


