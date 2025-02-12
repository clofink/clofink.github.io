class UserSkillsTab extends Tab {
    tabName = "User Skills";

    render() {
        window.requiredFields = ["Email", "Skills"];
        window.allValidFields = ["Email", "Skills", "Languages"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "User Skills CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        registerElement(startButton, "click", () => {
            showLoading(async () => { return this.addUserSkills() }, this.container);
        });
        const exportButton = newElement('button', { innerText: "Export" });
        registerElement(exportButton, "click", () => {
            showLoading(async () => { return this.exportUserSkills() }, this.container);
        })
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "routing", "users" scope`,
            `Required CSV column "Email"`,
            `"Skills" and "Languages" are comma-separated lists of names.`,
            `Skill and Language names are not case-sensitive`,
            `Each skill or language can have a proficiency. The format is <name>:<proficiency>`,
            `If a skill or language is referenced that does not exist, it will be created`
        ]);
        const exampleLink = createDownloadLink("User Skills Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, exportButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async getAllMapped(path, field = "name") {
        const allItems = await getAllGenesysItems(path);
        const map = {};
        for (const item of allItems) {
            map[item[field].toLowerCase()] = item.id;
        }
        return map;
    }

    async exportUserSkills() {
        const usersInfo = await getAllGenesysItems("/api/v2/users?state=active&expand=languages,skills");
        const dataRows = [];
        for (const user of usersInfo) {
            const userSkills = [];
            for (const skill of user?.skills || []) {
                userSkills.push(`${skill.name}:${skill.proficiency}`);
            }
            const userLanguages = [];
            for (const language of user?.languages || []) {
                userLanguages.push(`${language.name}:${language.proficiency}`);
            }
            dataRows.push([user.email, userSkills.join(","), userLanguages.join(",")])
        }
        const downloadLink = createDownloadLink("User Skills Export.csv", Papa.unparse([["Email", "Skills", "Languages"], ...dataRows]), "text/csv");
        downloadLink.click();
    }

    async parseAndCreateIfNeeded(createPath, fullValue, fullMap, label) {
        const items = [];
        const names = [];
        const itemValues = fullValue?.split(",") || [];
        for (const itemValue of itemValues) {
            const parts = itemValue.split(":");
            const name = parts[0].toLowerCase().trim();
            if (!fullMap[name]) {
                const newItem = await makeCallAndHandleErrors(makeGenesysRequest, [createPath, "POST", { name: parts[0] }], results, parts[0], label);
                fullMap[name] = newItem.id;
            }
            const value = parseInt(parts[1]);
            if (parts[1] && (isNaN(value) || ![0, 1, 2, 3, 4, 5].includes(value))) {
                results.push({ name: parts[0], type: "User Skill", status: "failed", error: `Invalid proficiency ${parts[1]} for ${label.toLowerCase()} ${parts[0]}` })
                continue;
            }
            const item = {};
            if (!parts[1]) item.proficiency = 0;
            else item.proficiency = value;
            item.id = fullMap[name];
            items.push(item);
            names.push(parts[0]);
        }
        return [items, names];
    }

    async addUserSkills() {
        if (!fileContents) throw "No valid file selected";

        const skillsInfo = await this.getAllMapped("/api/v2/routing/skills?");
        const languagesInfo = await this.getAllMapped("/api/v2/routing/languages?");
        const userInfo = await this.getAllMapped("/api/v2/users?state=active", "email");

        const results = [];
        for (const user of fileContents.data) {
            if (!userInfo[user.Email.toLowerCase()]) {
                results.push({ name: user.Email, type: "User Skill", status: "failed", error: `No active user matching email ${user.Email}` });
                continue;
            }
            const [skills, skillNames] = await this.parseAndCreateIfNeeded("/api/v2/routing/skills/", user.Skills, skillsInfo, "Skill");
            const [languages, languageNames] = await this.parseAndCreateIfNeeded("/api/v2/routing/languages/", user.Languages, languagesInfo, "Language");

            if (skills.length > 0) await makeCallAndHandleErrors(makeGenesysRequest, [`/api/v2/users/${userInfo[user.Email.toLowerCase()]}/routingskills/bulk`, 'PATCH', skills], results, `${user.Email} assigned ${skillNames.join(", ")}`, "User Skills");
            if (languages.length > 0) await makeCallAndHandleErrors(makeGenesysRequest, [`/api/v2/users/${userInfo[user.Email.toLowerCase()]}/routinglanguages/bulk`, 'PATCH', languages], results, `${user.Email} assigned ${languageNames.join(", ")}`, "User Skills");
        }
        return results;
    }
}