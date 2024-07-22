var integrationList, runtimeList, actionList;

class NewActionTab extends Tab {
    tabName = "New"

    render() {
        this.container = newElement("div", { id: "tabContainer" })
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
    
        const timeoutLabel = newElement('label', {innerText: "Timeout Seconds: "});
        const timeoutInput = newElement('input', { id: "timeoutInput", type: "number", max: 60, min: 1, value: 15 });
        addElement(timeoutInput, timeoutLabel);

        const zipLabel = newElement('label', { innerText: "Zip File: " })
        const zipInput = newElement('input', { type: "file", id: "zipInput", accept: ".zip" });
        addElement(zipInput, zipLabel);
    
        addElements([integrationLabel, runtimeLabel, actionNameLabel, entryPointLabel, timeoutLabel, zipLabel], inputs);
    
        const startButton = newElement('button', { innerText: "Start" });
        registerElement(startButton, "click", () => {showLoading(run)});
    
        const logoutButton = newElement('button', { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
    
        addElements([inputs, startButton, logoutButton], this.container);
        return this.container;
    }
}

class UpdateActionTab extends Tab {
    tabName = "Update"

    render() {
        this.container = newElement("div", { id: "tabContainer" })
        const inputs = newElement("div", { id: "inputs" });

        const runtimeLabel = newElement('label', { innerText: "Runtime: " })
        const runtimeSelect = newElement('select', { id: "runtimeSelect" });
        addElement(runtimeSelect, runtimeLabel);
        const actionLabel = newElement('label', { innerText: "Action: " })
        const actionSelect = newElement('select', { id: "actionSelect" });
        registerElement(actionSelect, "change", () => {showLoading(prefillUpdateFields, [actionSelect.value])});
        addElement(actionSelect, actionLabel);
        showLoading(populateSelects, [runtimeSelect, popupateRuntimeDropdown, actionSelect, getUpdatableActions]);
    
        const entryPointLabel = newElement('label', {innerText: "Handler: "});
        const entryPointInput = newElement('input', { id: "entryPointInput" });
        addElement(entryPointInput, entryPointLabel);

        const timeoutLabel = newElement('label', {innerText: "Timeout Seconds: "});
        const timeoutInput = newElement('input', { id: "timeoutInput", type: "number", max: 60, min: 1 });
        addElement(timeoutInput, timeoutLabel);
    
        const zipLabel = newElement('label', { innerText: "Zip File: " })
        const zipInput = newElement('input', { type: "file", id: "zipInput", accept: ".zip" });
        addElement(zipInput, zipLabel);

        addElements([actionLabel, runtimeLabel, entryPointLabel, timeoutLabel, zipLabel], inputs);
        
        const updateButton = newElement('button', { innerText: "Update" });
        registerElement(updateButton, "click", () => {showLoading(runUpdate, [actionSelect.value])});

        const logoutButton = newElement('button', { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);

        addElements([inputs, updateButton, logoutButton], this.container);
        return this.container;
    }
}

async function getUpdatableActions(select) {
    await populateActionDropdown(select, false);
    prefillUpdateFields(window.actionList[0].id);
}

async function prefillUpdateFields(actionId) {
    const actionData = await getActionInfo(actionId);
    entryPointInput.value = actionData?.functionInfo?.function?.handler ? actionData.functionInfo.function.handler : "";
    timeoutInput.value = actionData?.functionInfo?.function?.timeoutSeconds ? actionData.functionInfo.function.timeoutSeconds : "";
    runtimeSelect.value = actionData.functionInfo.function.runtime;
}

async function getActionInfo(actionId) {
    const action = window.actionList.find((e) => e.id === actionId);
    if (action.functionInfo) return action;
    if (action.type === "draft") {
        action.functionInfo = await getDraftFunctionSettings(actionId);
    }
    else {
        action.functionInfo = await getPublishedFunctionSettings(actionId);
    }
    return action;
}

async function runUpdate(actionId) {
    const action = window.actionList.find((e) => e.id === actionId);
    console.log(action);
    const runtimeSelection = eById("runtimeSelect")?.selectedOptions[0]?.value;
    const zipFile = eById('zipInput')?.files[0];
    const fileName = zipFile?.name;
    const handlerName = eById('entryPointInput')?.value;
    const timeoutSeconds = parseInt(eById('timeoutInput')?.value, 10);
    if (!runtimeSelection || !handlerName || !timeoutSeconds) {
        if (!runtimeSelection) console.log("No value for runtime selection found");
        if (!handlerName) console.log("No value for handler name found");
        if (!timeoutSeconds) console.log("No value for timeout seconds found");
        return;
    }

    const settingsBody = {
        "description": action?.functionInfo?.function?.description,
        "handler": handlerName,
        "runtime": runtimeSelection,
        "timeoutSeconds": timeoutSeconds, 
    }
    
    const currentFunctionDate = action?.functionInfo?.zip?.dateCreated;
    if (!action?.functionInfo?.function || (
        action.functionInfo.function.timeoutSeconds != timeoutSeconds ||
        action.functionInfo.function.handler !== handlerName ||
        action.functionInfo.function.runtime !== runtimeSelection
    )) {
        let updateResult;
        let retries = 0;
        let needsRetry = true;
        while (needsRetry && retries < 3) {
            updateResult = await updateDraftFunctionSettings(action.id, settingsBody);
            if (updateResult.status === 504) {
                retries++;
                continue;
            }
            else needsRetry = false;
        }
        if (updateResult.errors) throw updateResult.message;
        action.functionInfo = updateResult;
    }

    if (zipFile) {
        if (!action.uploadInfo || action.uploadInfo.timestamp.valueOf() + (action.uploadInfo.signedUrlTimeoutSeconds * 1000) < new Date().valueOf()) {
            action.uploadInfo = await createPackageUploadUrl(action.id, {fileName: fileName});
            action.uploadInfo.timestamp = new Date();
        }

        const uploadHeaders = {
            ...action.uploadInfo.headers,
            "Content-Type": "application/zip"
        }
        await fetch(action.uploadInfo.url, { method: "PUT", headers: uploadHeaders, body: zipFile});

        let retries = 0;
        const limit = 10;
        while((!action?.functionInfo?.zip?.dateCreated || action?.functionInfo?.zip?.dateCreated === currentFunctionDate) && retries < limit) {
            retries++;
            await wait(1);
            action.functionInfo = await getDraftFunctionSettings(action.id);
        }
    }
}

class TestActionTab extends Tab {
    tabName = "Test"

    render() {
        this.container = newElement("div", { id: "tabContainer" })
        const inputs = newElement("div", { id: "inputs" });

        const actionLabel = newElement('label', { innerText: "Action: " })
        const actionSelect = newElement('select', { id: "actionSelect" });
        const inputLabel = newElement('label', { innerText: "Input: " });
        const inputText = newElement('textarea', { id: "actionInput" });
        addElement(inputText, inputLabel);
        registerElement(actionSelect, "change", () => {showLoading(populateInputTextArea, [actionSelect.value])})
        addElement(actionSelect, actionLabel);
        showLoading(populateSelects, [actionSelect, getTestableActions]);
        
        const testButton = newElement('button', { innerText: "Run Test" });

        registerElement(testButton, "click", () => {
            const selectedActionId = actionSelect.selectedOptions[0].value;
            let selectedAction = window.actionList.find((e) => e.id === selectedActionId);
            showLoading(testAction, [selectedAction, inputText.value]);
        })

        const logoutButton = newElement('button', { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);

        addElements([actionLabel, inputLabel], inputs);
        this.resultsContainer = newElement('div', { id: "results" });
        addElements([inputs, testButton, logoutButton, this.resultsContainer], this.container);
        return this.container;
    }
}

async function getTestableActions(select) {
    await populateActionDropdown(select);
    populateInputTextArea(window.actionList[0].id);
}

async function populateInputTextArea(selectedActionId) {
    const inputText = eById('actionInput');
    const selectedAction = window.actionList.find((e) => e.id === selectedActionId);
    console.log(selectedAction);
    if (!selectedAction.contract.input.inputSchema) {
        console.log(selectedAction);
        if (selectedAction.type === "draft") {
            const actionDetails = await getDraftActionDetails(selectedActionId);
            selectedAction.contract.input = actionDetails?.contract?.input;
            if (!selectedAction?.contract?.input?.inputSchema) selectedAction.contract.input.inputSchema = {};
        }
        else {
            const actionDetails = await getActionDetails(selectedActionId);
            selectedAction.contract.input = actionDetails?.contract?.input;
            if (!selectedAction?.contract?.input?.inputSchema) selectedAction.contract.input.inputSchema = {};
        }
    }
    inputText.value = JSON.stringify(formatInputSchema(selectedAction?.contract?.input?.inputSchema?.properties ? selectedAction.contract.input.inputSchema.properties : {}), null, 2);
}

async function testAction(action, testBody) {
    let result;
    if (action.type === "draft") {
        result = await runDraftActionTest(action.id, JSON.parse(testBody));
    }
    else {
        result = await runActionTest(action.id, JSON.parse(testBody));
    }
    const resultsContainer = eById("results");
    clearElement(resultsContainer);
    if (result.success) {
        const successContainer = newElement('div', { class: ['result', 'success'] });
        const successResult = newElement('pre', { innerText: JSON.stringify(result.finalResult, null, 2) })
        addElement(successResult, successContainer);
        addElement(successContainer, resultsContainer);
    }
    else {
        const errorResult = newElement('div', { class: ['result', 'error'] });
        if (result.error.errors.length > 1) {
            const errorList = newElement("ul");
            for (let error of result.error.errors) {
                const errorItem = newElement("span", { innerText: error.message.split("    ").join("\n") });
                addElement(errorItem, errorList);
            }
            addElement(errorList, errorResult);
        }
        else {
            const errorItem = newElement("span", { innerText: result.error.errors[0].message.split("    ").join("\n") });
            addElement(errorItem, errorResult);
        }
        addElement(errorResult, resultsContainer);
    }
    const resultList = renderResults(result);
    addElement(resultList, resultsContainer);
}

function renderResults(results) {
    const resultsList =  newElement("ol");
    for (let operation of results.operations) {
        const operationItem = newElement("li", {class: ['resultListItem']});
        if (operation.success) operationItem.classList.add("success");
        else operationItem.classList.add("error");
        if (operation.result || operation.error) {
            const details = newElement('details');
            const summary = newElement("summary", {innerText: operation.name });
            const operationResult = newElement('pre', { innerText: JSON.stringify(operation.result || operation.error.errors, null, 2)});
            addElements([summary, operationResult], details);
            addElement(details, operationItem);
        }
        else {
            const operationName = newElement('span', { innerText: operation.name });
            addElement(operationName, operationItem);
        }
        addElement(operationItem, resultsList);
    }
    return resultsList;
}

function formatInputSchema(schema) {
    const formattedSchema = {};
    for (let field in schema) {
        switch (schema[field].type) {
            case "string":
                formattedSchema[field] = "";
                break;
            case "number":
            case "integer":
                formattedSchema[field] = 0;
                break;
            case "boolean":
                formattedSchema[field] = true;
                break;
            default:
                break;
        }
    }
    return formattedSchema;
}

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
            const contentType = result.headers.has("Content-Type") ? result.headers.get("Content-Type") : "";
            if (result.ok && contentType === "application/json" && !isEmptyResponse) {
                return await result.json();
            }
            else if (!isEmptyResponse  && contentType === "application/json") {
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

async function getActionDetails(actionId) {
    const path = `/api/v2/integrations/actions/${actionId}?expand=contract`;
    return makeGenesysRequest(path);
}

async function getDraftActionDetails(actionId) {
    const path = `/api/v2/integrations/actions/${actionId}/draft?expand=contract`;
    return makeGenesysRequest(path);
}

async function runActionTest(actionId, testBody) {
    const path = `/api/v2/integrations/actions/${actionId}/test`;
    return makeGenesysRequest(path, "POST", testBody);
}

async function runDraftActionTest(actionId, testBody) {
    const path = `/api/v2/integrations/actions/${actionId}/draft/test`;
    return makeGenesysRequest(path, "POST", testBody);
}

async function run() {
    const integrationSelection = eById("integrationSelect")?.selectedOptions[0];
    const actionName = eById('actionNameInput')?.value;
    const runtimeSelection = eById("runtimeSelect")?.selectedOptions[0]?.value;
    const zipFile = eById('zipInput')?.files[0];
    const fileName = zipFile?.name;
    const handlerName = eById('entryPointInput')?.value;
    const timeout = eById("timeoutInput")?.value;
    if (!integrationSelection || !actionName || !zipFile || !runtimeSelection || !handlerName || !fileName || !timeout) {
        if (!integrationSelection) console.log("No value for integration selection found");
        if (!actionName) console.log("No value for action name found");
        if (!zipFile) console.log("No value for file found");
        if (!runtimeSelection) console.log("No value for runtime selection found");
        if (!handlerName) console.log("No value for handler name found");
        if (!fileName) console.log("No value for file name found");
        if (!timeout) console.log("No value for timeout found");
        return;
    }

    const newActionBody = {
        "name": actionName,
        "category": integrationSelection.innerText,
        "integrationId": integrationSelection.value
    }
    const newAction = await createNewDraftAction(newActionBody);
    newAction.type = "draft";
    const settingsBody = {
        "description": actionName,
        "handler": handlerName,
        "runtime": runtimeSelection,
        "timeoutSeconds": timeout,
    }
    await updateDraftFunctionSettings(newAction.id, settingsBody);
    newAction.uploadInfo = await createPackageUploadUrl(newAction.id, {fileName: fileName});
    newAction.uploadInfo.timestamp = new Date();

    const uploadHeaders = {
        ...newAction.uploadInfo.headers,
        "Content-Type": "application/zip"
    }
    await fetch(newAction.uploadInfo.url, { method: "PUT", headers: uploadHeaders, body: zipFile});

    newAction.functionInfo = {};
    let retries = 0;
    const limit = 5;
    while(!newAction.functionInfo.zip && retries < limit) {
        retries++;
        await wait(1);
        newAction.functionInfo = await getDraftFunctionSettings(newAction.id);
    }
    if (window.actionList) window.actionList.push(newAction);
}

async function popupateIntegrationDropdown(select) {
    clearElement(select);
    if (!window.integrationList) window.integrationList = await getFunctionIntegrations();
    for (let integration of window.integrationList) {
        if (integration.integrationType.id === "function-data-actions") {
            const integrationOption = newElement("option", { innerText: integration.name, value: integration.id});
            addElement(integrationOption, select);
        }
    }
}

async function popupateRuntimeDropdown(select) {
    clearElement(select);
    if (!window.runtimeList) window.runtimeList = await getAvailableRuntimes();
    for (let runtime of window.runtimeList) {
        if (runtime.status === "Available") {
            const runtimeOption = newElement("option", { innerText: runtime.description, value: runtime.name});
            addElement(runtimeOption, select);
        }
    }
}

async function populateActionDropdown(select, includePublished = true) {
    clearElement(select);
    if (!window.actionList) {
        window.actionList = [];
        window.actionList.push(...(await getAllDraftActions()).map((e) => ({...e, type: "draft"})));
        window.actionList.push(...(await getAllPublishedActions()).map((e) => ({...e, type: "published"})));
    }
    for (let action of window.actionList) {
        if (window.integrationList.some((e) => e.integrationType.id === "function-data-actions" && e.id === action.integrationId) && (includePublished || action.type === "draft")) {
            const actionOption = newElement("option", { innerText: action.name, value: action.id, "data-integration-id": action.integrationId });
            addElement(actionOption, select);
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
    const helpSection = addHelp([
        `Must use Code Authorization OAuth token`,
        `Required scopes are: organization:readonly, upload, integrations`
    ])
    const parent = eById('page');
    clearElement(parent);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElements([inputsWrapper, helpSection], parent);
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);

    const tabContainer = new TabContainer([
        new NewActionTab(),
        new UpdateActionTab(),
        new TestActionTab()
    ]);
    addElement(tabContainer.getTabContainer(), page);

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

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

async function getOrgDetails() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/organizations/me`;
    const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    resultJson.status = result.status;
    return resultJson;
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

async function login() {
    const environment = storeAndReturnValue("environment", qs('[name="environment"]').value);
    const clientId = storeAndReturnValue("clientId", qs('[name="clientId"]').value);
    const redirectUri = storeAndReturnValue("redirectUri", location.origin + location.pathname);
    const codeVerifier = storeAndReturnValue("codeVerifier", generateCodeVerifier());
    const codeChallenge =  await generateCodeChallengeFromVerifier(codeVerifier);
    window.localStorage.setItem('environment', environment);
    window.location.replace(`https://login.${environment}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`);

    // GENERATING CODE VERIFIER
    function dec2hex(dec) {
        return ("0" + dec.toString(16)).substr(-2);
    }

    function generateCodeVerifier() {
        var array = new Uint32Array(56 / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec2hex).join("");
    }

    function sha256(plain) {
        // returns promise ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest("SHA-256", data);
    }

    function base64urlencode(a) {
        var str = "";
        var bytes = new Uint8Array(a);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    async function generateCodeChallengeFromVerifier(v) {
        var hashed = await sha256(v);
        var base64encoded = base64urlencode(hashed);
        return base64encoded;
    }

    function storeAndReturnValue (key, value) {
        if (window.localStorage.getItem(key)) return window.localStorage.getItem(key);
        window.localStorage.setItem(key, value);
        return value;
    }
}

function getToken() {
    const authToken = window.localStorage.getItem('auth');
    if (authToken) {
        return authToken;
    }
    return "";
}

function runLoginProcess(loginPageFunc, nextPageFunc) {
    if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        window.localStorage.setItem("code", (searchParams.get("code")));
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (window.localStorage.getItem('auth') || canGetToken()) {
        loginAndShowPage();
    }
    else {
        loginPageFunc();
    }

    function canGetToken() {
        if (window.localStorage.getItem('code') &&
            window.localStorage.getItem('redirectUri') &&
            window.localStorage.getItem('clientId') &&
            window.localStorage.getItem('codeVerifier') &&
            window.localStorage.getItem('environment')
        ) {
            return true;
        }
        return false
    }

    async function loginAndShowPage() {
        if (!window.localStorage.getItem('auth')) {
            const auth = await getAuthToken();
            window.localStorage.setItem("auth", auth.access_token);
        }
        nextPageFunc();
    }

    async function getAuthToken() {
        const url = `https://login.${window.localStorage.getItem('environment')}/oauth/token`;
        const formData = new URLSearchParams();
        formData.append("grant_type", "authorization_code");
        formData.append("code", window.localStorage.getItem("code"));
        formData.append("redirect_uri", window.localStorage.getItem("redirectUri"));
        formData.append("client_id", window.localStorage.getItem("clientId"));
        formData.append("code_verifier", window.localStorage.getItem("codeVerifier"));
        formData.append("code_challenge_method", "S256");
        const result = await fetch(url, { method: "POST", body: formData });
        if (!result.ok) {
            console.log(result);
            logout();
            return;
        }
        const resultJson = await result.json();
        return resultJson;
    }
}

function logout() {
    window.flows = undefined;
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('code');
    window.localStorage.removeItem('environment');
    window.localStorage.removeItem("clientId");
    window.localStorage.removeItem("redirectUri");
    window.localStorage.removeItem("codeVerifier");
    eById('header').innerText = `Current Org Name: \nCurrent Org ID:`;
    showLoginPage();
}

runLoginProcess(showLoginPage, showMainMenu);