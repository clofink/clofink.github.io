class CannedResponsesTab extends Tab {
    tabName = "Canned Responses";

    render() {
        window.requiredFields = ["Name", "Library", "Content"];
        window.allValidFields = ["Name", "Library", "Content"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "Canned Responses CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        registerElement(startButton, "click", () => {
            showLoading(async () => { return this.importCannedResponses() }, this.container);
        });
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "response-management" scope`,
            `Required CSV columns "Name", "Library", and "Content"`,
            `If a library with a matching name does not exist, it will be created`,
            `If multiple libraries have the same name, the last one in the list returned from the API will be used`
        ]);
        const exampleLink = createDownloadLink("Canned Responses Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async importCannedResponses() {
        if (!fileContents) throw "No valid file selected";

        const libraries = await getAllGenesysItems("/api/v2/responsemanagement/libraries?", 500, "entities");
        const libraryInfo = {};
        const results = [];
        for (let library of libraries) {
            libraryInfo[library.name] = library.id;
        }

        for (let response of fileContents.data) {
            if (Object.keys(response).length != 3) continue;
            let libraryId;
            if (response.Library && !libraryInfo[response.Library]) {
                const newLibrary = await makeCallAndHandleErrors(makeGenesysRequest, ["/api/v2/responsemanagement/libraries", "POST", { name: response.Library }], results, response.Library, "Response Library");
                if (newLibrary) libraryInfo[response.Library] = newLibrary.id;
            }
            libraryId = libraryInfo[response.Library];
            if (response.Name && response.Content) {
                let substitutions = [];
                const matches = response.Content.match(/({{[\w\d_-]+}})/g);
                if (matches && matches.length >= 0) {
                    for (let match of matches) {
                        substitutions.push({ id: match.substring(2, match.length - 2) });
                        response.Content = response.Content.replace(match, `<span class="rm-placeholder" data-placeholder="true">${match}</span>`);
                    }
                }
                const body = {
                    "assets": [],
                    "libraries": [
                        {
                            "id": libraryId
                        }
                    ],
                    "name": response.Name,
                    "substitutions": substitutions,
                    "texts": [
                        {
                            "content": response.Content,
                            "contentType": "text/html"
                        }
                    ],
                }
                await makeCallAndHandleErrors(makeGenesysRequest, ["/api/v2/responsemanagement/responses", "POST", body], results, response.Name, "Canned Response");
            }
        }
        return results;
    }
}