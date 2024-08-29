class UserSkillsTab extends Tab {
    tabName = "User Skills";

    render() {
        window.requiredFields = ["Email", "Skills"];
        window.allValidFields = ["Email", "Skills"];
    
        this.container = newElement('div', {id: "userInputs"});
        const label = newElement('label', {innerText: "User Skills CSV: "});
        const fileInput = newElement('input', {type: "file", accept: ".csv"});
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', {innerText: "Start"});
        const buttonClickHandler = this.addUserSkillsWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);
        const logoutButton = newElement("button", {innerText: "Logout"});
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "routing:readonly", "users" scope`, 
            `Required CSV column "Email", "Skills"`,
            `"Skills" is a comma-separated list of skill names.`,
            `Skill names are not case-sensitive`,
            `Each skill can have a proficiency too. The format is <skillName>:<proficiency>`,
            `If a skill is referenced that does not exist, it will be created`
        ]);
        const exampleLink = createDownloadLink("User Skills Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    addUserSkillsWrapper() {
        const boundFunc = this.addUserSkills.bind(this);
        showLoading(boundFunc, this.container);
    }

    async addUserSkills() {
        if (!fileContents) throw "No valid file selected";

        const allSkills = await getAllGenesysItems("/api/v2/routing/skills?", 200, "entities");
        const skillsInfo = {};
        for (let skill of allSkills) {
            skillsInfo[skill.name.toLowerCase()] = skill.id;
        }
        const allUsers = await getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
        const userInfo = {};
        for (let user of allUsers) {
            userInfo[user.email.toLowerCase()] = user.id;
        }

        const results = [];
        for (let user of fileContents.data) {
            if (!userInfo[user.Email.toLowerCase()]) {
                results.push({name: user.Email, type: "User Skill", status: "failed", error: `No active user matching email ${user.Email}`});
                continue;
            }
            const skills = [];
            const values = user.Skills.split(",");
            for (let value of values) {
                const parts = value.split(":"); 
                const skillName = parts[0].toLowerCase().trim();
                if (!skillsInfo[skillName]) {
                    const newSkill = await makeCallAndHandleErrors(makeGenesysRequest, ["/api/v2/routing/skills", "POST", {name: parts[0]}], results, parts[0], "Skill");
                    skillsInfo[skillName] = newSkill.id;
                }
                const skillVal = parseInt(parts[1]);
                if (parts[1] && (isNaN(skillVal) || ![0,1,2,3,4,5].includes(skillVal))) {
                    results.push({name: parts[0], type: "User Skill", status: "failed", error: `Invalid proficiency ${parts[1]} for skill ${parts[0]}`})
                    continue;
                }
                const skill = {};
                if (!parts[1]) skill.proficiency = 0;
                else skill.proficiency = skillVal;
                skill.id = skillsInfo[skillName];
                skills.push(skill);
            }
            if (skills.length < 1) continue;
            await makeCallAndHandleErrors(makeGenesysRequest, [userInfo[user.Email.toLowerCase()], 'POST', skills], results, user.Email, "User Skills")
        }
        return results;
    }
}