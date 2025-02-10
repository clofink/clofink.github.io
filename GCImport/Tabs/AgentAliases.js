class AgentAliasTab extends Tab {
    tabName = "Agent Aliases";

    render() {
        window.requiredFields = ["Email", "Alias"];
        window.allValidFields = ["Email", "Alias"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "Agent Aliases CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        registerElement(startButton, "click", () => {
            showLoading(async () => { await this.importAgentAliases() }, this.container);
        });
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "users" scope`,
            `Required CSV columns "Email" and "Alias"`
        ]);
        const exampleLink = createDownloadLink("Agent Aliases Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async importAgentAliases() {
        if (!fileContents) throw "No valid file selected";

        const users = await getAllGenesysItems(`/api/v2/users?state=active`, 100, 'entities');
        const userInfo = {};
        for (let user of users) {
            userInfo[user.email.toLowerCase()] = { id: user.id, version: user.version };
        }

        const results = [];
        for (let user of fileContents.data) {
            const currentUser = userInfo[user.Email.toLowerCase()];
            if (!currentUser) {
                results.push({ name: user.Email, type: "Agent Alias", status: "failed", error: `No active user matching email ${user.Email}` });
                continue;
            }
            const result = await makeCallAndHandleErrors(makeGenesysRequest, [`/api/v2/users/${currentUser.id}`, "PATCH", { version: currentUser.version, preferredName: user.Alias }], results, user.Email, "Agent Alias");
            if (result) userInfo[user.Email.toLowerCase()] = result;
        }
        return results;
    }
}