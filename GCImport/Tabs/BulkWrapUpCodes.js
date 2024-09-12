class WrapUpCodesTab extends Tab {
    tabName = "Wrap-Up Codes";

    render() {
        window.requiredFields = ["Queue Name", "Wrap-Up Codes"];
        window.allValidFields = ["Queue Name", "Wrap-Up Codes"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "Wrap-Up Codes CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        registerElement(startButton, "click", () => {
            showLoading(async () => { await this.importWrapUpCodes() }, this.container);
        });
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "routing" scope`,
            `Required CSV columns "Queue Name" and "Wrap-Up Codes"`,
            `Wrap-Up Codes column is a comma-separated list of wrap-up codes`,
            `If the code does not exist, it will be created`,
            `Wrap-Up Codes are only added. If there are already codes on a queue, they will not be removed.`
        ]);
        const exampleLink = createDownloadLink("Wrapup Codes Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async importWrapUpCodes() {
        if (!fileContents) throw "No valid file selected";

        const queues = await getAllGenesysItems("/api/v2/routing/queues?sortOrder=asc&sortBy=name&name=**&divisionId", 50, "entities");
        const queueMapping = {};
        for (let queue of queues) {
            queueMapping[queue.name] = queue.id;
        }

        const wrapUpCodes = await getAllGenesysItems("/api/v2/routing/wrapupcodes?sortBy=name&sortOrder=ascending", 50, "entities");
        const wrapupCodeMapping = {};
        for (let wrapUpCode of wrapUpCodes) {
            // wrap up codes are case-insensitive
            wrapupCodeMapping[wrapUpCode.name.toLowerCase()] = wrapUpCode.id;
        }

        const results = [];
        for (let item of fileContents.data) {
            if (item["Queue Name"] && item["Wrap-Up Codes"]) {
                if (!queueMapping[item["Queue Name"]]) {
                    results.push({ name: item["Queue Name"], type: "Code Mapping", status: "failed", error: `No queue exists with name: ${item["Queue Name"]}` });
                    continue;
                }
                const codesToAdd = [];
                for (let wrapUpCode of item["Wrap-Up Codes"].split(",")) {
                    const trimmedCode = wrapUpCode.trim();
                    if (!trimmedCode) continue;
                    if (!wrapupCodeMapping[trimmedCode]) {
                        const newWrapUpCode = await makeCallAndHandleErrors(makeGenesysRequest, ["/api/v2/routing/wrapupcodes", "POST", { "name": trimmedCode, "division": { "id": "*" } }], results, trimmedCode, "Wrap Up Code");
                        if (newWrapUpCode) wrapupCodeMapping[trimmedCode] = newWrapUpCode.id;
                    }
                    codesToAdd.push({ id: wrapupCodeMapping[trimmedCode] });
                }
                await makeCallAndHandleErrors(makeGenesysRequest, [`/api/v2/routing/queues/${queueMapping[item["Queue Name"]]}/wrapupcodes`, "POST", codesToAdd], results, item["Queue Name"], "Code Mapping");
            }
        }
        return results;
    }
}