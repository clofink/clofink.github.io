addTab("Canned Responses", showCannedResponsePage);

function showCannedResponsePage() {
    window.requiredFields = ["Name", "Library", "Type", "Content"];
    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label');
    label.innerText = "Canned Responses CSV: ";
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button');
    startButton.innerText = "Start";
    registerElement(startButton, "click", importCannedWrapper);
    const logoutButton = newElement("button");
    logoutButton.innerText = "Logout";
    registerElement(logoutButton, "click", logout);
    const loadIcon = newElement("div", {id: "loadIcon"});
    const helpSection = addHelp(`Must have "response-management" permission\nRequired CSV columns "Name", "Library", "Type", and "Content"\nIf a library with a matching name does not exist, it will be created\nIf multiple libraries have the same name, the last one in the list returned from the API will be used`);
    addElements([label, startButton, logoutButton, helpSection, loadIcon], container);
    return container;
}

async function getResponseLibraries() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/responsemanagement/libraries?pageSize=500`;
    const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

async function createResponseLibrary(libraryName) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/responsemanagement/libraries`;
    const body = {
        name: libraryName
    }
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

async function getCannedResponses(libraryId) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/responsemanagement/responses?libraryId=${libraryId}&pageNumer=1&pageSize=1000&expand=substitutionsSchema`;
    const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

async function createCannedResponse(name, content, contentType, libraryId, substitutions) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/responsemanagement/responses`;
    const body = {
        "assets": [],
        "libraries": [
            {
                "id": libraryId
            }
        ],
        "name": name,
        "substitutions": substitutions,
        "texts": [
            {
                "content": content,
                "contentType": contentType
            }
        ],
    }
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

function importCannedWrapper() {
    showLoading(importCannedResponses);
}

async function importCannedResponses() {
    if (!fileContents) throw "No valid file selected";

    const libraries = await getResponseLibraries();
    const libraryInfo = {};
    const results = [];
    for (let library of libraries.entities) {
        libraryInfo[library.name] = library.id;
    }

    for (let response of fileContents.data) {
        if (Object.keys(response).length != 4) continue;
        let libraryId;
        if (response.Library && !libraryInfo[response.Library]) {
            const newLibrary = await createResponseLibrary(response.Library);
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
            results.push(createCannedResponse(response.Name, response.Content, response.Type, libraryId, substitutions));
        }
    }
    return Promise.all(results);
}