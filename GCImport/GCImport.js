function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud"]
    const inputsWrapper = newElement('div', {id: "userInputs"});
    const clientIdLabel = newElement('label', {innerText: "Client ID: "});
    const clientInput = newElement('input', {name: "clientId"});
    addElement(clientInput, clientIdLabel);
    const environmentLabel = newElement('label', {innerText: "Environment: "});
    const environmentSelect = newElement('select', {name: "environment"});
    for (let url of urls) {
        const option = newElement('option', {innerText: url});
        addElement(option, environmentSelect);
    }
    addElement(environmentSelect, environmentLabel);
    const loginButton = newElement("button", {id: "login", innerText: "Log In"});
    registerElement(loginButton, "click", login);
    const parent = eById('page');
    clearElement(parent);
    const helpSection = addHelp([
        `Must have "organization:readonly" scope`,
        `Each tool has its own scopes listed`,
        `Canned Responses: response-management`,
        `Skills: routing`,
        `Queues: routing`,
        `Agent Aliases: users`,
        `Wrap-Up Codes: routing`,
        `Widgets: webdeployments, architect`,
        `User Prompts: architect`,
        `User Skills: routing:readonly, users`,
        `Utilization: users:readonly, routing`,
        `User Roles: users:readonly, authorization`,
    ]);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElements([inputsWrapper, helpSection], parent);
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);
    const tabContainer = new TabContainer([
        new CannedResponsesTab(),
        new SkillsTab(),
        new QueuesTab(), 
        new AgentAliasTab(),
        new WrapUpCodesTab(),
        new WidgetsTab(),
        new UserPromptsTab(),
        new UserSkillsTab(),
        new UtilizationTab(),
        new UserRolesTab(),
    ]);
    addElement(tabContainer.getTabContainer(), page);
    getOrgDetails().then(function(result) {
        if (result.status !== 200) {
            log(result.message, "error");
            logout();
            return;
        }
        eById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName}) Current Org ID: ${result.id}`
    }).catch(function(error) {log(error, "error"); logout();});
}

function login() {
    window.localStorage.setItem('environment', qs('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${qs('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    eById('header').innerText = "Current Org Name: Current Org ID:";
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
    const resultJson = await result.json(); 
    resultJson.status = result.status;
    return resultJson;
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
    const summary = newElement("summary", {innerText: "Help"});
    const listContainer = newElement("ul");
    for (let text of textList) {
        const listItem = newElement('li', {innerText: text});
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
        if (result.ok) {
            resultJson.status = 200;
        }
        else {
            throw resultJson.message;
        }
        items.push(...resultJson[resultsKey]);
        totalPages = resultJson.pageCount;
    }
    return items;
}

async function createItem(path, body) {
    const url = `https://api.${window.localStorage.getItem('environment')}${path}`;
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    const resultJson = await result.json();
    if (result.ok) {
        resultJson.status = 200;
    }
    return resultJson;
}

function addTab(tabName, renderCallback) {
    const tabSelected = function() {
        for (let tab of qsa(".tabHeader")) {
            tab.classList.remove("selected");
        }
        newTab.classList.add("selected");
        const tabContainer = eById("tabContent");
        clearElement(tabContainer);
        addElement(renderCallback(), tabContainer);
    }
    const newTab = newElement("div", {class: ["tabHeader"], innerText: tabName});
    registerElement(newTab, "click", tabSelected);
    tabs.push(newTab);
    if (eById("tabList")) showTabs();
}

async function showLoading(loadingFunc, containerElement) {
    eById("loadIcon").classList.add("shown");
    let results = [];
    try {
        results = await loadingFunc();
    }
    catch(error) {
        results = [{name: "", type: "Loading Info", status: "failed", error: error}]
    }
    eById("loadIcon").classList.remove("shown");
    
    let resultsContainer = qs(".resultsContainer");
    if (!resultsContainer) {
        resultsContainer = newElement("div", {class: ["resultsContainer"]});
    }
    clearElement(resultsContainer);

    if (results) {
        const resultHeader = newElement("div", {class: ["resultHeader"], innerText: "Results"});
        addElement(resultHeader, resultsContainer);    
        log(results);
        for (let result of results) {
            // this should be a format like this:
            // {name: "", type: "", status: "failed/success", error: error}
            let item = newElement("div", {class: ["resultItem"], innerText: `[${result.type}] ${result.name}`});
            if (result.status === "failed") {
                item = newElement("div", {class: ["resultItem", "error"], innerText: `[${result.type}] ${result.name}: ${result.error}`});
            }
            addElement(item, resultsContainer);
        }
    }
    addElement(resultsContainer, containerElement);
}

function createDownloadLink(fileName, fileContents, fileType) {
    const fileData = new Blob([fileContents], {type: fileType});
    const fileURL = window.URL.createObjectURL(fileData);
    return newElement('a', {href: fileURL, download: fileName, innerText: "Example"});
}

async function makeCallAndHandleErrors(callFunc, args, results, itemName, itemType) {
    try {
        const result = await callFunc(...args);
        if (result.status !== 200) {
            results.push({name: itemName, type: itemType, status: "failed", error: result.message});
            return;
        }
        results.push({name: itemName, type: itemType, status: "success"});
        return result;
    }
    catch(error) {
        results.push({name: itemName, type: itemType, status: "failed", error: error});
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