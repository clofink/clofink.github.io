function qs(selector, target) {
    return (target || document).querySelector(selector);
}
function qsa(selector, target) {
    return (target || document).querySelectorAll(selector);
}
function log(message, level) {
    if (message === undefined) throw "No Message"
    if (level && ['log', 'info', 'warn', 'error'].indexOf(level) < 0) throw `Invalid Log Level "${level}". Use info, warn, or error`
    console[level || "log"](message);
}
function eById(id, target) {
    return (target || document).getElementById(id); 
}
function registerElement(element, event, callback) {
    element.addEventListener(event, callback);
}
function unregisterElement(element, event, callback) {
    element.removeEventListener(event, callback);
}
function registerElements(elements, event, callback, doCallback) {
    for (let element of elements) {
        if(doCallback) callback(element);
        registerElement(element, event, callback);
    }
}
function newElement(type, params) {
    const newElem = document.createElement(type);
    for (let param in params) {
        if (param === "class") newElem.classList.add(...params[param]);
        else newElem.setAttribute(param, params[param])
    }
    return newElem;
}
function addElement(element, target, position) {
    if (!position) (target || document.body).appendChild(element);
    else (target || document.body).insertAdjacentElement(position, element);
}
function addElements(elements, target, position) {
    for (let element of elements) {
        addElement(element, target, position);
    }
}
function sendEvent(element, event) {
    element.dispatchEvent(new Event(event));
}
function clearElement(element) {
    while (element.children.length > 0) {
        element.children[0].remove();
    }
}

function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud"]
    const inputsWrapper = newElement('div', {id: "userInputs"});
    const clientIdLabel = newElement('label');
    clientIdLabel.innerText = "Client ID: ";
    const clientInput = newElement('input', {name: "clientId"});
    addElement(clientInput, clientIdLabel);
    const environmentLabel = newElement('label');
    environmentLabel.innerText = "Environment: ";
    const environmentSelect = newElement('select', {name: "environment"});
    for (let url of urls) {
        const option = newElement('option');
        option.innerText = url;
        addElement(option, environmentSelect);
    }
    addElement(environmentSelect, environmentLabel);
    const loginButton = newElement("button", {id: "login"});
    loginButton.innerText = "Log In";
    registerElement(loginButton, "click", login);
    const parent = eById('page');
    clearElement(parent);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElement(inputsWrapper, parent);
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);
    const tabList = newElement('div', {id: "tabList"});
    const tabContent = newElement('div', {id: "tabContent"});
    addElements([tabList, tabContent], page);
    getOrgDetails().then(function(result) {
        document.getElementById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName}) Current Org ID: ${result.id}`
    }).catch(function(error) {console.error(error); logout();});
    showTabs();
}

function login() {
    window.localStorage.setItem('environment', document.querySelector('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${document.querySelector('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    document.getElementById('header').innerText = "Current Org Name: Current Org ID:";
    showLoginPage();
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
    results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function storeToken(token) {
    window.localStorage.setItem('auth', token);
}

function getToken() {
    if (window.localStorage.getItem('auth')) {
        return window.localStorage.getItem('auth');
    }
    return '';
}

async function getOrgDetails() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/organizations/me`;
    const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json(); 
}

function loadFile(event) {
    try {
        if (event.target.files.length < 1) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', function(data) {
            try {
                fileContents = Papa.parse(data.target.result, {header: true, dynamicTyping: true});
                log(fileContents);
                if (fileContents.meta.fields.length < window.requiredFields.length) {
                    fileContents = undefined;
                    throw `${file.name} does not have required fields ${JSON.stringify(window.requiredFields)}`
                }
                let foundFields = 0;
                for (let field of fileContents.meta.fields) {
                    if (window.requiredFields.indexOf(field) >= 0) {
                        foundFields++;
                    }
                }
                if (foundFields < window.requiredFields.length) {
                    fileContents = undefined;
                    throw `${file.name} does not have required fields ${JSON.stringify(window.requiredFields)}`
                }
            }
            catch (error) {
                throw `${file.name} does not contain valid CSV.`
            }
        })
        reader.readAsText(file);
    }
    catch (error) {
        handleError(error);
    }
}

function showTabs() {
    const tabList = eById('tabList');
    clearElement(tabList);

    for (let i = 0; i < window.tabs.length; i++) {
        addElement(tabs[i], tabList);
        if (i === 0) tabs[i].click();
    }
}

function addHelp(textList) {
    const details = newElement('details');
    const summary = newElement("summary");
    summary.innerText = "Help";
    const listContainer = newElement("ul");
    for (let text of textList) {
        const listItem = newElement('li');
        listItem.innerText = text;
        addElement(listItem, listContainer);
    }
    addElements([summary, listContainer], details);
    return details;
}

async function getAll(path, resultsKey, pageSize) {
    const items = [];
    let pageNum = 0;
    let totalPages = 1;

    while (pageNum < totalPages) {
        pageNum++;
        const url = `https://api.${window.localStorage.getItem('environment')}${path}&pageNumber=${pageNum}&pageSize=${pageSize}`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        items.push(...resultJson[resultsKey]);
        totalPages = resultJson.pageCount;
    }
    return items;
}

async function createItem(path, body) {
    const url = `https://api.${window.localStorage.getItem('environment')}${path}`;
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

function addTab(tabName, renderCallback) {
    const tabSelected = function() {
        for (let tab of qsa(".tabHeader")) {
            tab.classList.remove("selected");
        }
        newTab.classList.add("selected");
        const tabContainer = eById("tabContent");
        tabContainer.innerHTML = "";
        addElement(renderCallback(), tabContainer);
    }
    const newTab = newElement("div", {class: ["tabHeader"]});
    newTab.innerText = tabName;
    registerElement(newTab, "click", tabSelected);
    tabs.push(newTab);
    if (eById("tabList")) showTabs();
}

async function showLoading(loadingFunc) {
    eById("loadIcon").classList.add("shown");
    const results = await loadingFunc();
    eById("loadIcon").classList.remove("shown");
    for (let result of results) {
        log(result);
    }
}

var tabs = [];
var fileContents;

if (window.location.hash) {
    storeToken(getParameterByName('access_token'));
    let now = new Date().valueOf();
    let expireTime = parseInt(getParameterByName('expires_in')) * 1000;
    log(new Date(now + expireTime));
    location.hash = ''
}
if (!getToken()) {
    showLoginPage();
}
else {
    showMainMenu();
}