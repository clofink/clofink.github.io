addTab("Canned Responses", showCannedResponsePage);

function showCannedResponsePage() {
    window.requiredFields = ["Name", "Library", "Type", "Content"];
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
    addElements([label, startButton, logoutButton, helpSection], container);
    return container;
    
    function importCannedWrapper() {
        showLoading(importCannedResponses);
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
                const newLibrary = await createItem("/api/v2/responsemanagement/libraries", {name: response.Library});
                libraryInfo[response.Library] = newLibrary.id;
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
                const newMessage = await createItem("/api/v2/responsemanagement/responses", body);
                results.push(newMessage);
            }
        }
        return results;
    }
}