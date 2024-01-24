addTab("Skills", showSkillsPage);

function showSkillsPage() {
    window.requiredFields = ["Name"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label');
    label.innerText = "Skills CSV: ";
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button');
    startButton.innerText = "Start";
    registerElement(startButton, "click", importSkillsWrapper);
    const logoutButton = newElement("button");
    logoutButton.innerText = "Logout";
    registerElement(logoutButton, "click", logout);
    const loadIcon = newElement("div", {id: "loadIcon"});
    addElements([label, startButton, logoutButton, loadIcon], container);
    return container;
}

async function createSkill(name) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/skills`;
    const body = {
        name: name
    }
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
}

function importSkillsWrapper() {
    showLoading(importSkills);
}

async function importSkills() {
    if (!fileContents) throw "No valid file selected";

    const results = [];
    for (let skill of fileContents.data) {
        if (skill.Name) {
            results.push(createSkill(skill.Name));
        }
    }
    return Promise.all(results);
}
