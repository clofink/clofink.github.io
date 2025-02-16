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
        registerElement(startButton, "click", () => {
            showLoading(async () => { return this.bulkUpdateUtilization() }, this.container);
        });
        const exportButton = newElement('button', { innerText: "Export" });
        registerElement(exportButton, "click", () => {
            showLoading(async () => { return this.exportUtilization() }, this.container);
        });
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "users:readonly", "routing" scopes`,
            `Required CSV column "User Email"`,
            `Other possible columns are "Call", "Message", "Chat", "Email", "Message", "Callback", and "Workitem"`,
            `Each column just takes a number for the utlization limit`,
        ]);
        const exampleLink = createDownloadLink("Utilization Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, exportButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async updateUtilization(userId, utilization) {
        return makeGenesysRequest(`/api/v2/routing/users/${userId}/utilization`, 'PUT', utilization);
    }

    async bulkUpdateUtilization() {
        // TODO: add way to set interruptable media
        if (!fileContents) throw "No valid file selected";

        const allUsers = await getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
        const userInfo = {};
        for (let user of allUsers) {
            userInfo[user.email.toLowerCase()] = user.id;
        }

        const results = [];
        for (let user of fileContents.data) {
            if (!userInfo[user["User Email"].toLowerCase()]) {
                results.push({ name: user.Email.toLowerCase(), type: "Utilization", status: "failed", error: `No active user matching email ${user['User Email']}` });
                continue;
            }
            // cannot initialize to nothing, since anything missing will overwrite to org defaults
            const currentUtilization = await makeGenesysRequest(`/api/v2/routing/users/${userInfo[user["User Email"].toLowerCase()]}/utilization`);
            const utilization = { utilization: currentUtilization.utilization };

            for (let type of ["Call", "Message", "Email", "Chat", "Callback", "Workitem"]) {
                if (user[type]) {
                    if (isNaN(parseInt(user[type]))) {
                        results.push({ name: user["User Email"].toLowerCase(), type: "Utilization", status: "failed", error: `Invalid value for ${type} utlization ${user[type]}` });
                    }
                    else {
                        utilization.utilization[type.toLowerCase()] = { maximumCapacity: parseInt(user[type]) }
                    }
                }
            }
            if (Object.keys(utilization.utilization).length < 1) continue;
            await makeCallAndHandleErrors(this.updateUtilization, [userInfo[user["User Email"].toLowerCase()], utilization], results, user["User Email"], "Utilization")
        }
        return results;
    }

    async exportUtilization() {
        const headers = ["User Email", "Level", "Call", "Message", "Chat", "Email", "Callback", "Workitem"];
        const users = await getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
        const dataRows = [];
        for (const user of users) {
            const userUtilization = await makeGenesysRequest(`/api/v2/routing/users/${user.id}/utilization`);
            dataRows.push([
                user.email,
                userUtilization.level,
                userUtilization?.utilization?.call?.maximumCapacity || "",
                userUtilization?.utilization?.message?.maximumCapacity || "",
                userUtilization?.utilization?.chat?.maximumCapacity || "",
                userUtilization?.utilization?.email?.maximumCapacity || "",
                userUtilization?.utilization?.callback?.maximumCapacity || "",
                userUtilization?.utilization?.workitem?.maximumCapacity || "",
            ])
        }
        const downloadLink = createDownloadLink("User Utilization Export.csv", Papa.unparse([headers, ...dataRows]), "text/csv");
        downloadLink.click();
    }
}