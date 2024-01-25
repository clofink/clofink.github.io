addTab("Wrap-Up Codes", showWrapUpCodesPage);

function showWrapUpCodesPage() {
    window.requiredFields = ["Queue Name", "Wrap-Up Codes"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label');
    label.innerText = "Wrap-Up Codes CSV: ";
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button');
    startButton.innerText = "Start";
    registerElement(startButton, "click", importWrapUpCodesWrapper);
    const logoutButton = newElement("button");
    logoutButton.innerText = "Logout";
    registerElement(logoutButton, "click", logout);
    const loadIcon = newElement("div", {id: "loadIcon"});
    addElements([label, startButton, logoutButton, loadIcon], container);
    return container;
}

async function getAllWrapUpCodes() {
    const wrapUpCodes = [];
    let pageNum = 0;
    let totalPages = 1;

    while (pageNum < totalPages) {
        pageNum++;
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/wrapupcodes?pageNumber=${pageNum}&pageSize=25&sortBy=name&sortOrder=ascending`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        wrapUpCodes.push(...resultJson.entities);
        totalPages = resultJson.pageCount;
    }
    return wrapUpCodes;
}

async function getAllQueues() {
    const queues = [];
    let pageNum = 0;
    let totalPages = 1;

    while (pageNum < totalPages) {
        pageNum++;
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/queues/?pageNumber=${pageNum}&pageSize=25&sortOrder=asc&sortBy=name&name=**&divisionId`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        queues.push(...resultJson.entities);
        totalPages = resultJson.pageCount;
    }
    return queues;
}

async function createWrapUpCode(name) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/wrapupcodes`;
    const body = {
        "name": name,
        "division":{"id":"*"}
    };
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();

}

async function addWrapUpCodes(queueId, codes) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/queues/${queueId}/wrapupcodes`;
    const result = await fetch(url, {method: "POST", body: JSON.stringify(codes), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

function importWrapUpCodesWrapper() {
    showLoading(importWrapUpCodes);
}

// NOTE: this only ADDs wrap up codes to queues. It does not remove any
async function importWrapUpCodes() {
    if (!fileContents) throw "No valid file selected";

    const queues = await getAllQueues();
    const queueMapping = {};
    for (let queue of queues) {
        queueMapping[queue.name] = queue.id;
    }

    const wrapUpCodes = await getAllWrapUpCodes();
    const wrapupCodeMapping = {};
    for (let wrapUpCode of wrapUpCodes) {
        wrapupCodeMapping[wrapUpCode.name] = wrapUpCode.id;
    }

    const results = [];
    for (let item of fileContents.data) {
        if (item["Queue Name"] && item["Wrap-Up Codes"]) {
            if (!queueMapping[item["Queue Name"]]) {
                log(`No queue exists with name: ${item["Queue Name"]}`);
                continue;
            }
            const codesToAdd = [];
            for (let wrapUpCode of item["Wrap-Up Codes"].split(",")) {
                const trimmedCode = wrapUpCode.trim();
                if (!trimmedCode) continue;
                if (!wrapupCodeMapping[trimmedCode]) {
                    const newWrapUpCode = await createWrapUpCode(trimmedCode);
                    wrapupCodeMapping[trimmedCode] = newWrapUpCode.id;
                }
                codesToAdd.push({id: wrapupCodeMapping[trimmedCode]});
            }
            results.push(addWrapUpCodes(queueMapping[item["Queue Name"]], codesToAdd));
        }
    }
    return Promise.all(results);
}