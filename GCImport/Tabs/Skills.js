function showSkillsPage() {
    const mainBody = `
    <div id="userInputs">
        <label>CSV File: 
            <input id="import" type="file" accept=".csv">
        </label>
        <button id="start">Start</button>
        <button id="back">Back</button>
        <button id="logout">Log Out</button>
    </div>`;
    document.getElementById('page').innerHTML = mainBody;
    window.requiredFields = ["Name"];
    document.getElementById('import').addEventListener("change", loadFile);
    document.getElementById('start').addEventListener('click', importSkills);
    document.getElementById('back').addEventListener("click", function() {showPage("main")});
    document.getElementById('logout').addEventListener("click", logout);
}

async function createSkill(name) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/skills`;
    const body = {
        name: name
    }
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json();
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
