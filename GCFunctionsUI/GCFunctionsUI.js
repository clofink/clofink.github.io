async function makeGenesysRequest(path, method, body, isEmptyResponse) {
    let needsRepeating = true;
    while(needsRepeating) {
        const url = `https://api.${window.localStorage.getItem('environment')}${path}`;
        const result = await fetch(url, {method: method, body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        if (result.status === 429) {
            const retryWait = result.headers.get("Retry-After");
            const waitSeconds = isNaN(parseInt(retryWait, 10)) ? 1 : parseInt(retryWait, 10);
            await wait(waitSeconds);
        }
        else {
            needsRepeating = false;
            if (result.ok && !isEmptyResponse) {
                return await result.json();
            }
            else if (!isEmptyResponse) {
                return await result.json();
            }
            else {
                throw result;
            }
        }
    }
}

async function getAllGenesysItems(path, pageSize = 100, entitiesKey = "entities") {
    const items = [];
    let pageNum = 0;
    let totalPages = 1;
    while (pageNum < totalPages) {
        pageNum++;
        const results = await makeGenesysRequest(`${path}${path.includes('?') ? "&" : "?"}pageNumber=${pageNum}&pageSize=${pageSize}`);
        items.push(...results[entitiesKey]);
        totalPages = results.pageCount;
    }
    return items;
}

async function wait(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
async function getAvailableRuntimes() {
    const path = `/api/v2/integrations/actions/functions/runtimes`;
    return makeGenesysRequest(path);
}
 async function getDraftFunctionSettings(actionId) {
    const path = `/api/v2/integrations/actions/${actionId}/draft/function`;
    return makeGenesysRequest(path);
}

async function getPublishedFunctionSettings(actionId) {
    const path = `/api/v2/integrations/actions/${actionId}/function`;
    return makeGenesysRequest(path);
}

async function createNewDraftAction(body) {
    const path = `/api/v2/integrations/actions/drafts`;
    return makeGenesysRequest(path, "POST", body);
}

async function updateDraftFunctionSettings(actionId, body) {
    const path = `/api/v2/integrations/actions/${actionId}/draft/function`;
    return makeGenesysRequest(path, "PUT", body);
}

async function createPackageUploadUrl(actionId, body) {
    const path = `/api/v2/integrations/actions/${actionId}/draft/function/upload`
    return makeGenesysRequest(path, "POST", body);
}

async function getFunctionIntegrations() {
    const path =  `/api/v2/integrations`;
    return getAllGenesysItems(path);
}

async function getAllPublishedActions() {
    const path =  `/api/v2/integrations/actions`;
    return getAllGenesysItems(path);
}

async function getAllDraftActions() {
    const path = `/api/v2/integrations/actions/drafts`;
    return getAllGenesysItems(path);
}

async function run() {
    createNew();
}

async function createNew() {
    const integrationSelection = eById("integrationSelect")?.selectedOptions[0];
    const actionName = eById('actionNameInput')?.value;
    const runtimeSelection = eById("runtimeSelect")?.selectedOptions[0]?.value;
    const zipFile = eById('zipInput')?.files[0];
    const fileName = zipFile?.name;
    const handlerName = eById('entryPointInput')?.value;
    if (!integrationSelection || !actionName || !zipFile || !runtimeSelection || !handlerName || !fileName) {
        if (!integrationSelection) console.log("No value for integration selection found");
        if (!actionName) console.log("No value for action name found");
        if (!zipFile) console.log("No value for file found");
        if (!runtimeSelection) console.log("No value for runtime selection found");
        if (!handlerName) console.log("No value for handler name found");
        if (!fileName) console.log("No value for file name found");
        return;
    }

    const newActionBody = {
        "name": actionName,
        "category": integrationSelection.innerText,
        "integrationId": integrationSelection.value
    }
    const newAction = await createNewDraftAction(newActionBody);
    const settingsBody = {
        "description": actionName,
        "handler": handlerName,
        "runtime": runtimeSelection,
    }
    const updatedSettings = await updateDraftFunctionSettings(newAction.id, settingsBody);

    const packageUploadUrl = await createPackageUploadUrl(newAction.id, {fileName: fileName});

    const uploadHeaders = {
        ...packageUploadUrl.headers,
        "Content-Type": "application/zip"
    }
    const uploadResult = await fetch(packageUploadUrl.url, { method: "PUT", headers: uploadHeaders, body: zipFile});

    await wait(10);

    const draftSettings = await getDraftFunctionSettings(newAction.id);
}

async function popupateIntegrationDropdown(select) {
    clearElement(select);
    const allIntegrations = await getFunctionIntegrations();
    for (let integration of allIntegrations) {
        if (integration.integrationType.id === "function-data-actions") {
            const integrationOption = newElement("option", { innerText: integration.name, value: integration.id});
            addElement(integrationOption, select);
        }
    }
}

async function popupateRuntimeDropdown(select) {
    clearElement(select);
    const runtimes = await getAvailableRuntimes();
    for (let runtime of runtimes) {
        if (runtime.status === "Available") {
            const runtimeOption = newElement("option", { innerText: runtime.description, value: runtime.name});
            addElement(runtimeOption, select);
        }
    }
}

async function populateSelects() {
    for (let i = 0; i < arguments.length; i+=2) {
        const field = arguments[i];
        const handler = arguments[i+1];
        if (!field || !handler) return;
        await handler(field);
    }
}

function getFileFromInput(input, validateFunc) {
    return new Promise((resolve, reject) => {
        const file = resolve(input.files[0]);
        const reader = new FileReader();
        reader.addEventListener('load', function(data) {
            if (validateFunc && !validateFunc(data.target.result)) reject(`${file.name} failed to validate`);
            resolve(data.target.result);
        })
        reader.readAsText(file);
    });
}

function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud"]
    const inputsWrapper = newElement('div', { id: "inputs" });
    const clientIdLabel = newElement('label', { innerText: "Client ID: " });
    const clientInput = newElement('input', { name: "clientId" });
    addElement(clientInput, clientIdLabel);
    const environmentLabel = newElement('label', { innerText: "Environment: " });
    const environmentSelect = newElement('select', { name: "environment" });
    for (let url of urls) {
        const option = newElement('option', { innerText: url });
        addElement(option, environmentSelect);
    }
    addElement(environmentSelect, environmentLabel);
    const loginButton = newElement("button", { id: "login", innerText: "Log In" });
    registerElement(loginButton, "click", login);
    const parent = eById('page');
    clearElement(parent);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElement(inputsWrapper, parent);
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);

    const inputs = newElement("div", { id: "inputs" });

    const integrationLabel = newElement('label', { innerText: "Integration: " })
    const integrationSelect = newElement('select', { id: "integrationSelect" });
    addElement(integrationSelect, integrationLabel);
    const runtimeLabel = newElement('label', { innerText: "Runtime: " })
    const runtimeSelect = newElement('select', { id: "runtimeSelect" });
    addElement(runtimeSelect, runtimeLabel);
    showLoading(populateSelects, [integrationSelect, popupateIntegrationDropdown, runtimeSelect, popupateRuntimeDropdown]);

    const actionNameLabel = newElement('label', {innerText: "Action Name: "});
    const actionNameInput = newElement('input', { id: "actionNameInput" });
    addElement(actionNameInput, actionNameLabel);

    const entryPointLabel = newElement('label', {innerText: "Handler: "});
    const entryPointInput = newElement('input', { id: "entryPointInput", value: "src/index.handler" });
    addElement(entryPointInput, entryPointLabel);

    const zipLabel = newElement('label', { innerText: "Zip File: " })
    const zipInput = newElement('input', { type: "file", id: "zipInput", accept: ".zip" });
    addElement(zipInput, zipLabel);

    addElements([integrationLabel, runtimeLabel, actionNameLabel, entryPointLabel, zipLabel], inputs);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => {showLoading(run)});

    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);


    addElements([inputs, startButton, logoutButton], page);
    getOrgDetails().then(function (result) {
        if (result.status !== 200) {
            log(result.message, "error");
            logout();
            return;
        }
        window.orgName = result.name;
        window.orgId = result.id;
        eById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName})\nCurrent Org ID: ${result.id}`
    }).catch(function (error) { log(error, "error"); logout(); });
}

function login() {
    window.localStorage.setItem('environment', qs('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${qs('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    eById('header').innerText = `Current Org Name: \nCurrent Org ID:`;
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
    const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    resultJson.status = result.status;
    return resultJson;
}

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

function createFieldOptions() {
    const fieldOptionContainer = newElement('div', { class: ["fieldOption"] });
    const removeButton = newElement("button", { innerText: "x", title: "Remove Field" });
    registerElement(removeButton, "click", () => { if (qsa(".fieldOption", fieldOptionContainer.parent).length === 1) return; fieldOptionContainer.remove() });
    const addFieldButton = newElement("button", { innerText: "+", title: "Add Field Below" });
    registerElement(addFieldButton, "click", () => { addElement(createFieldOptions(), fieldOptionContainer, "afterend") });

    const fieldSelector = newElement("select", { class: ["fieldType"] });
    populateFieldSelector(fieldSelector, "Conversation");

    const customInput = newElement("input", { class: ["customPath"] });
    registerElement(fieldSelector, "change", () => { if (fieldSelector.value === "custom") { addElement(customInput, fieldSelector, "afterend") } else { customInput.remove(); } })

    addElements([fieldSelector, removeButton, addFieldButton], fieldOptionContainer);
    return fieldOptionContainer;
}

async function showLoading(loadingFunc, args = []) {
    eById("loadIcon").classList.add("shown");
    try {
        await loadingFunc(...args);
    }
    catch(error) {
        console.error(error);
    }
    eById("loadIcon").classList.remove("shown");
}

async function getDetailsForAllActions() {
    const allIntegrations = await getFunctionIntegrations();
    const allFunctionIntegrations = allIntegrations.filter((e) => e.integrationType.id === "function-data-actions");
    const allPublishedActions = await getAllPublishedActions();
    const allDraftActions = await getAllDraftActions();
    const functionActions = allPublishedActions.filter((e) => allFunctionIntegrations.some((t) => e.integrationId === t.id));
    const functionDraftActions = allDraftActions.filter((e) => allFunctionIntegrations.some((t) => e.integrationId === t.id));


    for (let action of functionActions) {
        const result = await getPublishedFunctionSettings(action.id);
        console.log(result);
    }
    for (let action of functionDraftActions) {
        const result = await getDraftFunctionSettings(action.id);
        console.log(result);
    }
}