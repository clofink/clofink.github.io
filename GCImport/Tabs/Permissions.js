// addTab("Permissions", showPermissionsPage);

function showPermissionsPage() {
    window.requiredFields = ["Configuration Name", "Inbound Flow Name", "Deployment Name"];

    const container = newElement('div', { id: "userInputs" });
    const label = newElement('label', {innerText: "Permissions CSV: "});
    const fileInput = newElement('input', { type: "file", accept: ".csv" });
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button', {innerText: "Start"});
    registerElement(startButton, "click", setupPermissionsWrapper);
    const logoutButton = newElement("button", {innerText: "Logout"});
    registerElement(logoutButton, "click", logout);
    const helpSection = addHelp([
    ]);
    addElements([label, startButton, logoutButton, helpSection], container);
    return container;

    function setupPermissionsWrapper() {
        showLoading(setupPermissions, container);
    }

    async function getAllLicenses() {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/license/definitions`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        return resultJson.entities;
    }

    async function getPermissions() {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/authorization/permissions/?pageNumber=1&pageSize=50`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        return resultJson.entities;
    }

    function prettyPrintCamelCase(string) {
        const capitalRegex = /[A-Z]/g;
        const matches = [...string.matchAll(capitalRegex)];
        matches.reverse();
        for (let match of matches) {
            const end = string.substring(match.index);
            const begin = string.substring(0, match.index);
            string = begin + " " + end;
        }
        return string[0].toUpperCase() + string.substring(1);
    }

    async function setupPermissions() {
        const allPerms = await getAll("/api/v2/authorization/permissions/?", "entities", 200);
        const actions = {};
        const entityTypes = {};
        const availableEntities = {};
        const domains = {};
        const allPermissions = [];
        for (let permission of allPerms) {
            // domains[permission.domain] = [];
            for (let mapping in permission.permissionMap) {
                for (let item of permission.permissionMap[mapping]) {
                    // domains[permission.domain].push(item);
                    allPermissions.push(item);
                    // if (!actions.hasOwnProperty(item.action)) {
                    //     actions[item.action] = [];
                    // }
                    // if (!entityTypes.hasOwnProperty(item.entityType)) {
                    //     entityTypes[item.entityType] = [];
                    // }
                    const prettyEntity = prettyPrintCamelCase(item.entityType);
                    if (!availableEntities.hasOwnProperty(prettyEntity)) {
                        availableEntities[prettyEntity] = [];
                    }
                    availableEntities[prettyEntity].push(item.action);
                    // actions[item.action].push(item);
                    // entityTypes[item.entityType].push(item);
                }
            }
        }
        // log(domains);
        // log(actions);
        // log(entityTypes);
        log(availableEntities);
        log(allPermissions);
        return [];
    }
}