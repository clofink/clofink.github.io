class UtilizationTab extends Tab {
    tabName = "Utilization";

    render() {
        window.requiredFields = ["User Email"];
        window.allValidFields = ["User Email", "Call", "Message", "Chat", "Email", "Message", "Callback", "Workitem"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "Utilization CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        const buttonClickHandler = this.bulkUpdateUtilizationWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "users" scope`,
            `Required CSV column "User Email"`,
            `Other possible columns are "Call", "Message", "Chat", "Email", "Message", "Callback", and "Workitem"`,
            `Each column just takes a number for the utlization limit`,
        ]);
        const exampleLink = createDownloadLink("Utilization Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    bulkUpdateUtilizationWrapper() {
        const boundFunc = this.bulkUpdateUtilization.bind(this);
        showLoading(boundFunc, this.container);
    }

    async getAllUsers() {
        const users = [];
        let pageNum = 0;
        let totalPages = 1;

        while (pageNum < totalPages) {
            pageNum++;
            const body = {
                "pageSize": 25,
                "pageNumber": pageNum,
                "query": [
                    {
                        "type": "EXACT",
                        "fields": ["state"],
                        "values": ["active"]
                    }
                ],
                "sortOrder": "ASC",
                "sortBy": "name",
                "expand": [],
                "enforcePermissions": false
            }
            const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/search`;
            const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
            const resultJson = await result.json();
            users.push(...resultJson.results);
            totalPages = resultJson.pageCount;
        }
        return users;
    }

    async updateUtilization(userId, utilization) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/users/${userId}/utilization`;
        const result = await fetch(url, { method: "PUT", body: JSON.stringify(utilization), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
    }

    async bulkUpdateUtilization() {
        if (!fileContents) throw "No valid file selected";

        const allUsers = await this.getAllUsers();
        const userInfo = {};
        for (let user of allUsers) {
            userInfo[user.email] = user.id;
        }

        const results = [];
        for (let user of fileContents.data) {
            if (!userInfo[user["User Email"]]) {
                results.push({ name: user.Email, type: "Utilization", status: "failed", error: `No active user matching email ${user['User Email']}` });
                continue;
            }
            const utilization = {utilization: {}}

            for (let type of ["Call", "Message", "Email", "Chat", "Callback", "Workitem"]) {
                if (user[type]) {
                    if (isNaN(parseInt(user[type]))) {
                        results.push({ name: user["User Email"], type: "Utilization", status: "failed", error: `Invalid value for ${type} utlization ${user[type]}` });
                    }
                    else {
                        utilization.utilization[type.toLowerCase()] = {maximumCapacity: parseInt(user[type])}
                    }
                }
            }
            if (Object.keys(utilization.utilization).length < 1) continue;
            await makeCallAndHandleErrors(this.updateUtilization, [userInfo[user["User Email"]], utilization], results, user["User Email"], "Utilization")
        }
        return results;
    }
}