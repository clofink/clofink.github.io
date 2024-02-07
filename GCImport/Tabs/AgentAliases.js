addTab("Agent Aliases", showAgentAliasPage);

function showAgentAliasPage() {
    window.requiredFields = ["Email", "Alias"];
    window.allValidFields = ["Email", "Alias"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label', {innerText: "Agent Aliases CSV: "});
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button', {innerText: "Start"});
    registerElement(startButton, "click", importAgentAliasesWrapper);
    const logoutButton = newElement("button", {innerText: "Logout"});
    registerElement(logoutButton, "click", logout);
    const helpSection = addHelp([
        `Must have "users" scope`, 
        `Required CSV columns "Email" and "Alias"`
    ]);
    const exampleLink = createDownloadLink("Agent Aliases Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
    addElements([label, startButton, logoutButton, helpSection, exampleLink], container);
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
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
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
        showLoading(importAgentAliases, container);
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
                results.push({name: user.Email, type: "Agent Alias", status: "failed", error: `No active user matching email ${user.Email}`});
                continue;
            }
            try {
                const result = await updateUserAlias(userInfo[user.Email], user.Alias);
                if (result.status !== 200) {
                    results.push({name: user.Email, type: "Agent Alias", status: "failed", error: result.message});
                    continue;
                }
                results.push({name: user.Email, type: "Agent Alias", status: "success"});
            }
            catch (error) {
                results.push({name: user.Email, type: "Agent Alias", status: "failed", error: error});
                continue;
            }
        }
        return results;
    }
}