class BulkUserTab extends Tab {
    tabName = "Bulk User";

    render() {
        window.requiredFields = ["Action", "Email"];
        window.allValidFields = ["Action", "Email", "Skills", "Language Skills", "Queues", "Roles", "Groups", "Division", "Phone", "Call Utilization", "Callback Utilization", "Chat Utilization", "Email Utilization", "Message Utilization", "Workitem Utilization", "Title", "Manager", "Department", "Work Phone", "Hire Date", "Location", "Home Phone", "Agent Alias"];
    
        this.container = newElement('div', {id: "userInputs"});
        const label = newElement('label', {innerText: "Agent Aliases CSV: "});
        const fileInput = newElement('input', {type: "file", accept: ".csv"});
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', {innerText: "Start"});
        const buttonClickHandler = this.bulkUserActionsWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);
        const logoutButton = newElement("button", {innerText: "Logout"});
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "users", "stations", "routing", "authorization" scopes`, 
            `Required CSV columns "Action" and "Email"`,
            `Skills format: <skillName>|<skillName>:<proficiency>`,
            `Language Skills format: <languageSkillName>|<languageSkillName>:<proficiency>`,
            `Queues format: <queueName>|<queueName>`,
            `Roles format: <roleName>|<roleName>:<divisionName>|<roleName>:<divisionName>~<divisionName>`
        ]);
        const exampleLink = createDownloadLink("Bulk User Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    bulkUserActionsWrapper() {
        const boundFunc = this.bulkUserActions.bind(this);
        showLoading(boundFunc, this.container);
    }

    mapProperty(propA, propB, objects, caseInsensitive) {
        const mapping = {};
        for (let object of objects) {
            mapping[caseInsensitive ? object[propA].toLowerCase() : object[propA]] = propB ? object[propB] : object
        }
        return mapping;
    }

    async bulkUserActions() {
        if (!fileContents) window.fileContents = {data: [{Action: "Import", Email: "connor.lofink@genesys.com", "Message Utilization": "4", "Call Utilization": "1", "Email Utilization": "3:call|message|callback", Phone: "Tims Phone", Division: "Connor Test", Groups: "Connor Group", Skills: "testskill:1|testskill1| testskill2:5", Queues: "Connor Test|Claims|Customer Service", Roles: "employee:Connor Test~Home|AI Agent:Test|Developer"}]};

        const allSkills = await getAll("/api/v2/routing/skills?", "entities", 200);
        const skillsInfo = this.mapProperty("name", "id", allSkills, true);

        const allLanguageSkills = await getAll("/api/v2/routing/languages?", "entities", 200);
        const languageSkillsInfo = this.mapProperty("name", "id", allLanguageSkills, true);

        const allUsers = await getAllPost("/api/v2/users/search", {"query": [{"type":"EXACT", "fields":["state"], "values":["active"]}], "sortOrder":"ASC", "sortBy":"name", "expand": ["skills", "authorization", "groups", "languages"], "enforcePermissions":false}, 200);
        const userInfo = this.mapProperty("email", null, allUsers, true);

        const allGroups = await getAllPost("/api/v2/groups/search", {"query": [{"type":"EXACT", "fields":["state"], "value":"active"}], "sortOrder":"ASC", "sortBy":"name"}, 200);
        const groupsInfo = this.mapProperty("name", "id", allGroups, true);

        const allRoles = await getAll("/api/v2/authorization/roles?", "entities", 200); 
        const rolesInfo = this.mapProperty("name", "id", allRoles, true);

        const allDivisions = await getAll("/api/v2/authorization/divisions?", "entities", 200);
        const divisionInfo = this.mapProperty("name", "id", allDivisions, true);

        const allQueues = await getAll("/api/v2/routing/queues?", "entities", 200);
        const queueInfo = this.mapProperty("name", undefined, allQueues, true);

        const allStations = await getAll("/api/v2/stations?", "entities", 100);
        const stationInfo = this.mapProperty("name", "id", allStations, true);

        for (let queue in queueInfo) {
            if (queueInfo[queue].memberCount === 0) {
                continue;
            }
            const queueMembers = await getAll(`/api/v2/routing/queues/${queueInfo[queue].id}/members?`, "entities", 200);
            for (let queueMember of queueMembers) {
                if (!userInfo[queueMember.user.email.toLowerCase()]) throw `No existing user found with email [${queueMember.user.email}]`;
                userInfo[queueMember.user.email.toLowerCase()].queues = userInfo[queueMember.user.email.toLowerCase()].queues || [];
                userInfo[queueMember.user.email.toLowerCase()].queues.push(queueInfo[queue].id);
            }
        }

        log(userInfo);
        log(queueInfo);
        log(groupsInfo);
        log(rolesInfo);
        log(divisionInfo);
        log(skillsInfo);
        log(languageSkillsInfo);
        log(stationInfo);

        const queueAdditions = {};
        const queueDeletions = {};

        for (let row of fileContents.data) {
            const setProperties = {
                queues: [],
                groups: [],
                roles: [],
                skills: [],
                languageSkills: [],
                utilization: [],
                division: undefined,
                phone: undefined,
            }

            const user = userInfo[row["Email"].toLowerCase().trim()];
            const userEmail = row["Email"].toLowerCase().trim();
            const action = row["Action"].toLowerCase().trim();

            for (let header in row) {
                switch (header.toLowerCase().trim()) {
                    case "skills": // per user
                        // testskill:1|testskill1| testskill2:5
                        setProperties.skills = row[header].split("|").map((e) => e.toLowerCase().trim().split(":")).map((t) => ({"proficiency": t[1] && !isNaN(parseInt(t[1], 10)) ? parseInt(t[1], 10) : undefined, "id": skillsInfo[t[0]]}));
                        break;
                    case "languageskills": // per user
                        setProperties.languageSkills = row[header].split("|").map((e) => e.toLowerCase().trim().split(":")).map((t) => ({"proficiency": t[1] && !isNaN(parseInt(t[1], 10)) ? parseInt(t[1], 10) : undefined, "id": skillsInfo[t[0]]}));
                        break;
                    case "queues": // per queue
                        setProperties.queues = row[header].split("|").map((e) => queueInfo[e.trim().toLowerCase()].id);
                        const currentUserQueues = new Set(user.queues);
                        const newSetQueues = new Set(setProperties.queues);
                        for (let queue of currentUserQueues.difference(newSetQueues)) {
                            // queues to remove the user from
                            queueDeletions[queue] = queueDeletions[queue] || [];
                            queueDeletions[queue].push(user.id);
                        }
                        for(let queue of newSetQueues.difference(currentUserQueues)) {
                            // queues to add the user to
                            queueAdditions[queue] = queueAdditions[queue] || [];
                            queueAdditions[queue].push(user.id);
                        }
                        break;
                    case "roles": // per user
                        // employee:ConnorTest~Home|AI Agent:Test|Developer
                        setProperties.roles = row[header].split("|").map((e)=>(e.toLowerCase().trim().split(":"))).map((t) => ({name: t[0], id: rolesInfo[t[0]], divisions: t[1] ? t[1].split("~").map((r) => ({name: r, id: divisionInfo[r]})) : undefined}))
                        break;
                    case "groups": // per group
                        setProperties.groups = row[header].split("|").map((e) => e.toLowerCase().trim()).map((e) => ({name: e, id: groupsInfo[e]}));
                        break;
                    case "division": // per user
                        setProperties.division = {name: row[header].toLowerCase().trim(), id: divisionInfo[row[header].toLowerCase().trim()]};
                        break;
                    case "phone": // per user
                        setProperties.phone = {name: row[header].toLowerCase().trim(), id: stationInfo[row[header].toLowerCase().trim()]};
                        break;
                    case "call utilization":
                        setProperties.utilization.call = { maxCapacity: parseInt(row[header].split(":")[0], 10), interruptableMediaTypes: row[header].split(":")[1] ? row[header].split(":")[1].split("|").map((e)=>(e.toLowerCase().trim())) : []}
                        break;
                    case "callback utilization":
                        setProperties.utilization.callback = { maxCapacity: parseInt(row[header].split(":")[0], 10), interruptableMediaTypes: row[header].split(":")[1] ? row[header].split(":")[1].split("|").map((e)=>(e.toLowerCase().trim())) : []}
                        break;
                    case "chat utilization":
                        setProperties.utilization.chat = { maxCapacity: parseInt(row[header].split(":")[0], 10), interruptableMediaTypes: row[header].split(":")[1] ? row[header].split(":")[1].split("|").map((e)=>(e.toLowerCase().trim())) : []}
                        break;
                    case "email utilization":
                        setProperties.utilization.email = { maxCapacity: parseInt(row[header].split(":")[0], 10), interruptableMediaTypes: row[header].split(":")[1] ? row[header].split(":")[1].split("|").map((e)=>(e.toLowerCase().trim())) : []}
                        break;
                    case "message utilization":
                        setProperties.utilization.message = { maxCapacity: parseInt(row[header].split(":")[0], 10), interruptableMediaTypes: row[header].split(":")[1] ? row[header].split(":")[1].split("|").map((e)=>(e.toLowerCase().trim())) : []}
                        break;
                    case "workitem utilization":
                        setProperties.utilization.workitem = { maxCapacity: parseInt(row[header].split(":")[0], 10), interruptableMediaTypes: row[header].split(":")[1] ? row[header].split(":")[1].split("|").map((e)=>(e.toLowerCase().trim())) : []}
                        break;
                    default:
                        // log(`Unknown header [${header}]`, "error");
                        break;
                }
            }

            switch (action) {
                case "update":
                    if (!user) throw `No existing user found with email [${userEmail}]`;
                    break;
                case "import":
                    // order:
                    //  create user
                    //      what fields are needed?
                    //  
                    break;
                case "delete":
                    if (!user) throw `No existing user found with email [${userEmail}]`;
                    break;
                default:
                    throw `Unknown action [${action}]`;
            }
            log(setProperties);
        }
        // update queues
        // update groups
    }

    itemsToRemove(currentSet, newSet) {
        const itemsToRemove = [];
        for (let item of currentSet.difference(newSet)) {
            // queues to remove the user from
            itemsToRemove.push(item);
        }
        return itemsToRemove;
    }
    itemsToAdd(currentSet, newSet) {
        const itemsToAdd = [];
        for (let item of newSet.difference(currentSet)) {
            // queues to remove the user from
            itemsToAdd.push(item);
        }
        return itemsToAdd;
    }
}