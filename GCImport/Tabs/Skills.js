class SkillsTab extends Tab {
    tabName = "Skills";

    render() {
        window.requiredFields = ["Name"];
        window.allValidFields = ["Name"];
    
        this.container = newElement('div', {id: "userInputs"});
        const label = newElement('label', {innerText: "Skills CSV: "});
        const fileInput = newElement('input', {type: "file", accept: ".csv"});
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', {innerText: "Start"});
        const buttonClickHandler = this.importSkillsWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);
        const logoutButton = newElement("button", {innerText: "Logout"});
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "routing" scope`, 
            `Required CSV column "Name"`
        ]);
        const exampleLink = createDownloadLink("Skills Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    importSkillsWrapper() {
        showLoading(this.importSkills, this.container);
    }
    
    async importSkills() {
        if (!fileContents) throw "No valid file selected";
    
        const results = [];
        for (let skill of fileContents.data) {
            if (skill.Name) {
                await makeCallAndHandleErrors(createItem, ["/api/v2/routing/skills", {name: skill.Name}], results, skill.Name, "Skill");
            }
        }
        return results;
    }
}