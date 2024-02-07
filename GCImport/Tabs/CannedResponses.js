addTab("Canned Responses", showCannedResponsePage);

function showCannedResponsePage() {
    window.requiredFields = ["Name", "Library", "Type", "Content"];
    window.allValidFields = ["Name", "Library", "Type", "Content"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label', {innerText: "Canned Responses CSV: "});
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button', {innerText: "Start"});
    registerElement(startButton, "click", importCannedWrapper);
    const logoutButton = newElement("button", {innerText: "Logout"});
    registerElement(logoutButton, "click", logout);
    const helpSection = addHelp([
        `Must have "response-management" scope`, 
        `Required CSV columns "Name", "Library", "Type", and "Content"`, 
        `If a library with a matching name does not exist, it will be created`, 
        `If multiple libraries have the same name, the last one in the list returned from the API will be used`
    ]);
    const exampleLink = createDownloadLink("Canned Responses Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
    addElements([label, startButton, logoutButton, helpSection, exampleLink], container);
    return container;
    
    function importCannedWrapper() {
        showLoading(importCannedResponses, container);
    }
    
    async function importCannedResponses() {
        if (!fileContents) throw "No valid file selected";
    
        const libraries = await getAll("/api/v2/responsemanagement/libraries?", "entities", 500);
        const libraryInfo = {};
        const results = [];
        for (let library of libraries) {
            libraryInfo[library.name] = library.id;
        }
    
        for (let response of fileContents.data) {
            if (Object.keys(response).length != 4) continue;
            let libraryId;
            if (response.Library && !libraryInfo[response.Library]) {
                try {
                    const newLibrary = await createItem("/api/v2/responsemanagement/libraries", {name: response.Library});
                    if(newLibrary.status !== 200) {
                        results.push({name: response.Library, type: "Response Library", status: "failed", error: newLibrary.message});
                        continue;
                    }
                    libraryInfo[response.Library] = newLibrary.id;
                    results.push({name: response.Library, type: "Response Library", status: "success"});
                }
                catch(error) {
                    results.push({name: response.Library, type: "Response Library", status: "failed", error: error});
                }
            }
            libraryId = libraryInfo[response.Library];
            if (response.Name && response.Content && response.Type) {
                let substitutions = [];
                const matches = response.Content.match(/({{[\w\d_-]+}})/g);
                if (matches && matches.length >= 0) {
                    for (let match of matches) {
                        substitutions.push({id: match.substring(2, match.length - 2)});
                        response.Content = response.Content.replace(match, `<span class="rm-placeholder" data-placeholder="true">${match}</span>`)
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
                            "contentType": response.Type
                        }
                    ],
                }
                try {
                    const newMessage = await createItem("/api/v2/responsemanagement/responses", body);
                    if (newMessage.status !== 200) {
                        results.push({name: response.Name, type: "Canned Response", status: "failed", error: newMessage.message});
                        continue;
                    }
                    results.push({name: response.Name, type: "Canned Response", status: "success"});
                }
                catch(error) {
                    results.push({name: response.Name, type: "Canned Response", status: "failed", error: error});
                }
            }
        }
        return results;
    }
}