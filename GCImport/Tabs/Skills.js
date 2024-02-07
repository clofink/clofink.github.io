addTab("Skills", showSkillsPage);

function showSkillsPage() {
    window.requiredFields = ["Name"];
    window.allValidFields = ["Name"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label', {innerText: "Skills CSV: "});
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button', {innerText: "Start"});
    registerElement(startButton, "click", importSkillsWrapper);
    const logoutButton = newElement("button", {innerText: "Logout"});
    registerElement(logoutButton, "click", logout);
    const helpSection = addHelp([
        `Must have "routing" scope`, 
        `Required CSV column "Name"`
    ]);
    const exampleLink = createDownloadLink("Skills Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
    addElements([label, startButton, logoutButton, helpSection, exampleLink], container);
    return container;

    function importSkillsWrapper() {
        showLoading(importSkills, container);
    }
    
    async function importSkills() {
        if (!fileContents) throw "No valid file selected";
    
        const results = [];
        for (let skill of fileContents.data) {
            if (skill.Name) {
                try {
                    const result = await createItem("/api/v2/routing/skills", {name: skill.Name})
                    if (result.status !== 200) {
                        results.push({name: skill.Name, type: "Skill", status: "failed", error: result.message});
                        continue;
                    }
                    results.push({name: skill.Name, type: "Skill", status: "success"});
                }
                catch(error) {
                    results.push({name: skill.Name, type: "Skill", status: "failed", error: error});
                }
            }
        }
        return results;
    }
}