addTab("Agent Aliases", showAgentAliasPage);

function showAgentAliasPage() {
    window.requiredFields = ["Email", "Alias"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label');
    label.innerText = "Agent Aliases CSV: ";
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button');
    startButton.innerText = "Start";
    registerElement(startButton, "click", importAgentAliasesWrapper);
    const logoutButton = newElement("button");
    logoutButton.innerText = "Logout";
    registerElement(logoutButton, "click", logout);
    const loadIcon = newElement("div", {id: "loadIcon"});
    const helpSection = addHelp([
        `Must have "users" scope`, 
        `Required CSV columns "Email" and "Alias"`
    ]);
    addElements([label, startButton, logoutButton, helpSection, loadIcon], container);
    return container;

    // undocumented API from the UI
    async function updateUserAlias(userInfo, alias) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/${userInfo.id}/profile`;
        const body = {
            "agent": {
                "name": [
                    {
                        "labelKey": "name",
                        "value": alias
                    }
                ]
            },
            "version": userInfo.version
        };
        const result = await fetch(url, {method: "PUT", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        return result.json();
    }
    
    async function getAllUsers() {
        const users= [];
        let pageNum = 0;
        let totalPages = 1;
    
        while (pageNum < totalPages) {
            pageNum++;
            const body = {
                "pageSize": 25,
                "pageNumber": pageNum,
                "query": [
                    {
                        "type":"EXACT",
                        "fields":["state"],
                        "values":["active"]
                    }
                ],
                "sortOrder":"ASC",
                "sortBy":"name",
                "expand":[],
                "enforcePermissions":false
            }
            const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/search`;
            const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
            const resultJson = await result.json();
            users.push(...resultJson.results);
            totalPages = resultJson.pageCount;
        }
        return users;
    }
    
    function importAgentAliasesWrapper() {
        showLoading(importAgentAliases);
    }
    
    async function importAgentAliases() {
        if (!fileContents) throw "No valid file selected";
    
        const users = await getAllUsers();
        const userInfo = {};
        for (let user of users) {
            userInfo[user.email] = {id: user.id, version: user.version};
        }
    
        const results = [];
        for (let user of fileContents.data) {
            if (!userInfo[user.Email]) {
                log(`No active user matching email ${user.Email}`);
                continue;
            }
            results.push(updateUserAlias(userInfo[user.Email], user.Alias));
        }
        return Promise.all(results);
    }
}