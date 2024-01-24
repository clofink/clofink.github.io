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

function showLoginPage() {
    const conversationPage = `
    <div id="userInputs">
        <label>Client ID: 
            <input type="text" name="clientId">
        </label>
        <label>Environment: 
            <select name="environment">
                <option>mypurecloud.com</option>
                <option>use2.us-gov-pure.cloud</option>
                <option selected>usw2.pure.cloud</option>
                <option>cac1.pure.cloud</option>
                <option>mypurecloud.ie</option>
                <option>euw2.pure.cloud</option>
                <option>mypurecloud.de</option>
                <option>aps1.pure.cloud</option>
                <option>mypurecloud.jp</option>
                <option>apne2.pure.cloud</option>
                <option>mypurecloud.com.au</option>
                <option>sae1.pure.clou</option>
            </select>
        </label>
        <button id="login">Log In</button>
    </div>`;
    document.getElementById('page').innerHTML = conversationPage;
    document.getElementById('login').addEventListener('click', login);
}

function showMainMenu() {
    const mainBody = `
    <div id="tabList"></div>
    <div id="tabContent">
    </div>`;
    document.getElementById('page').innerHTML = mainBody;
    getOrgDetails().then(function(result) {
        document.getElementById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName}) Current Org ID: ${result.id}`
    }).catch(function(error) {console.error(error)});
    showTabs();
}

function showPage(pageName) {
    switch (pageName) {
        case "login":
            showLoginPage();
            break;
        case "main":
            showMainMenu();
            break;
        case "cannedResponse":
            showCannedResponsePage();
            break;
        case "skills":
            showSkillsPage();
            break;
        case "queues":
            showQueuesPage();
            break;
        default:
            console.log("invalid page: ", pageName);
            break;
    }
}

function login() {
    window.localStorage.setItem('environment', document.querySelector('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${document.querySelector('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    document.getElementById('header').innerText = "Current Org Name: Current Org ID:";
    showPage("login");
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
                console.log(fileContents);
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
    while (tabList.children.length > 0) {
        tabList.children[0].remove();
    }

    for (let i = 0; i < window.tabs.length; i++) {
        addElement(tabs[i], eById('tabList'));
        if (i === 0) tabs[i].click();
    }
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

var tabs = [];
var fileContents;

if (window.location.hash) {
    storeToken(getParameterByName('access_token'));
    let now = new Date().valueOf();
    let expireTime = parseInt(getParameterByName('expires_in')) * 1000;
    console.log(new Date(now + expireTime));
    location.hash = ''
}
if (!getToken()) {
    showPage("login");
}
else {
    showPage("main");
}