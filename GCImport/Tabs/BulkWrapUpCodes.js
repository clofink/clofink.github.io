addTab("Wrap-Up Codes", showWrapUpCodesPage);

function showWrapUpCodesPage() {
    window.requiredFields = ["Queue Name", "Wrap-Up Codes"];
    window.allValidFields = ["Queue Name", "Wrap-Up Codes"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label', {innerText: "Wrap-Up Codes CSV: "});
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button', {innerText: "Start"});
    registerElement(startButton, "click", importWrapUpCodesWrapper);
    const logoutButton = newElement("button", {innerText: "Logout"});
    registerElement(logoutButton, "click", logout);
    const helpSection = addHelp([
        `Must have "routing" scope`, 
        `Required CSV columns "Queue Name" and "Wrap-Up Codes"`, 
        `Wrap-Up Codes column is a comma-separated list of wrap-up codes`, 
        `If the code does not exist, it will be created`,
        `Wrap-Up Codes are only added. If there are already codes on a queue, they will not be removed.`
    ]);
    const exampleLink = createDownloadLink("Wrapup Codes Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
    addElements([label, startButton, logoutButton, helpSection, exampleLink], container);
    return container;
    
    async function addWrapUpCodes(queueId, codes) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/queues/${queueId}/wrapupcodes`;
        const result = await fetch(url, {method: "POST", body: JSON.stringify(codes), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        return result.json();
    }
    
    function importWrapUpCodesWrapper() {
        showLoading(importWrapUpCodes);
    }
    
    async function importWrapUpCodes() {
        if (!fileContents) throw "No valid file selected";
    
        const queues = await getAll("/api/v2/routing/queues?sortOrder=asc&sortBy=name&name=**&divisionId", "entities", 25);
        const queueMapping = {};
        for (let queue of queues) {
            queueMapping[queue.name] = queue.id;
        }
    
        const wrapUpCodes = await getAll("/api/v2/routing/wrapupcodes?sortBy=name&sortOrder=ascending", "entities", 25);
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
                        const newWrapUpCode = await createItem("/api/v2/routing/wrapupcodes", {"name": trimmedCode, "division":{"id":"*"}});
                        wrapupCodeMapping[trimmedCode] = newWrapUpCode.id;
                    }
                    codesToAdd.push({id: wrapupCodeMapping[trimmedCode]});
                }
                results.push(addWrapUpCodes(queueMapping[item["Queue Name"]], codesToAdd));
            }
        }
        return Promise.all(results);
    }
}