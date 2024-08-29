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

    const knowledgeBaseSelect = newElement('select', {id: "knowledgeBases"});
    const queryInput = newElement('textarea', {id: "query", rows: 3});
    addElements([knowledgeBaseSelect, queryInput], inputs);
    showLoading(populateKnowledgeSelect, [knowledgeBaseSelect]);
    const startButton = newElement('button', {innerText: "Start"});
    const resultsContainer = newElement('div', {id: "results"});
    registerElement(startButton, "click", runWrapper);
    addElements([inputs, startButton, resultsContainer], page);
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

async function run() {
    const kbId = eById("knowledgeBases").value;
    const queries = eById("query").value.split("\n");

    const headers = ["Query", "Title", "ID", "Phrases", "Confidence %"];
    const dataRows = [];
    
    for (let query of queries) {
        const results = await searchKb(kbId, query.trim(), 5);
        for (let result of results.results) {
            console.log(result);
            const phrases = [];
            for (let phrase of result.document.alternatives) {
                phrases.push(phrase.phrase);
            }
            dataRows.push([query.trim(), result.document.title, result.document.id, phrases.join("\n"), floatToDisplayPercent(result.confidence, 2)]);
        }
    }
    const table = new PagedTable(headers, dataRows, 25, {}, true, true);
    const resultsElem = eById('results');
    clearElement(resultsElem);
    addElement(table.getContainer(), resultsElem);
}

async function runWrapper() {
    await showLoading(run);
}

function floatToDisplayPercent(decimalVal, decimalPlaces) {
    decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 0;
    const mult = Math.pow(10, decimalPlaces);
    const newVal = Math.round(decimalVal * 100 * mult);
    return newVal / mult;
}

async function populateKnowledgeSelect(selectElement) {
    const allKbs = await getAllGenesysItems("/api/v2/knowledge/knowledgeBases?sortOrder=ASC&sortBy=name", 100, "entities");
    for (let kb of allKbs) {
        const kbOption = newElement("option", {value: kb.id, innerText: kb.name});
        addElement(kbOption, selectElement);
    }
}

async function searchKb(kbId, query, maxResults) {
    const body = {
        "query": query,
        "pageSize": maxResults,
        "pageNumber": 1,
        "includeDraftDocuments": false
    }
    return makeGenesysRequest(`/api/v2/knowledge/knowledgeBases/${kbId}/documents/search?expand=documentAlternatives`, "POST", body);
}

async function getOrgDetails() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/organizations/me`;
    const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    resultJson.status = result.status;
    return resultJson;
}

runLoginProcess(showLoginPage, showMainMenu);