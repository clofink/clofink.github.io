class UserPromptsTab extends Tab {
    tabName = "User Prompts";

    render() {
        window.requiredFields = ["Name"];
        window.allValidFields = ["Name", "EN-US Text", "Description"];
    
        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "Prompts CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        registerElement(startButton, "click", this.importPromptsWrapper);
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "architect" scope`,
            `Required CSV column "Name", and at least one "Text" field`,
            `All languages can be used if the column name is <Language Code> Text`
        ]);
        const exampleLink = createDownloadLink("Prompts Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    importPromptsWrapper() {
        showLoading(this.importPrompts, this.container);
    }

    async importPrompts() {
        if (!fileContents) throw "No valid file selected";

        const allPrompts = await getAll("/api/v2/architect/prompts?sortBy=name&sortOrder=asc", "entities", 200);
        const promptMapping = {};
        for (let prompt of allPrompts) {
            promptMapping[prompt.name] = prompt.id;
        }

        const results = [];
        for (let prompt of fileContents.data) {
            if (promptMapping.hasOwnProperty(prompt["Name"])) {
                log(`Prompt already exists with name ${prompt["Name"]}`);
                results.push({name: prompt["Name"], type: "Prompt", status: "failed", error: `Prompt already exists with name ${prompt["Name"]}`});
                continue;
            }

            const promptBody = { "name": prompt["Name"], "description": prompt["Description"] || "" };
            const newPrompt = await makeCallAndHandleErrors(createItem, ["/api/v2/architect/prompts", promptBody], results, prompt["Name"], "Prompt");
            if (!newPrompt) continue;

            for (let field in prompt) {
                const fieldParts = field.split(" ");
                if (fieldParts.length !== 2 || fieldParts[1] !== "Text") {
                    continue;
                }
                const resourceBody = { "language": fieldParts[0].toLowerCase(), "ttsString": prompt[field], "text": prompt[field] };
                const newResource = await makeCallAndHandleErrors(createItem, [`/api/v2/architect/prompts/${newPrompt.id}/resources`, resourceBody], results, field, "Prompt Resource");
            }
        }
        return results;
    }
}