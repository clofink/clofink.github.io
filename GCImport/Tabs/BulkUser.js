class BulkUserTab extends Tab {
    tabName = "Bulk User";

    render() {
        window.requiredFields = ["Action", "Email", "Name", "Division"];
        window.allValidFields = ["Action", "Email", "Name", "Skills", "Language Skills", "Queues", "Roles", "Groups", "Division", "Phone", "Utilization", "Title", "Manager Email", "Department", "Work Phone", "Hire Date", "Location", "Home Phone", "Agent Alias"];
    
        this.container = newElement('div', {id: "userInputs"});
        const label = newElement('label', {innerText: "Bulk User CSV: "});
        const fileInput = newElement('input', {type: "file", accept: ".csv"});
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);

        const startButton = newElement('button', {innerText: "Import"});
        const buttonClickHandler = this.bulkUserActionsWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);

        const exportButton = newElement('button', {innerText: "Export"});
        const exportButtonHandler = this.bulkUserExportWrapper.bind(this);
        registerElement(exportButton, "click", exportButtonHandler);

        const logoutButton = newElement("button", {innerText: "Logout"});
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "users", "stations", "routing", "authorization" scopes`, 
            `Required CSV columns "Action", "Email", "Name", "Division"`,
            `Valid values for Action are CREATE and UPDATE`,
            `Skills format: <skillName>,<skillName>:<proficiency>`,
            `Language Skills format: <languageSkillName>,<languageSkillName>:<proficiency>`,
            `Queues format: <queueName>,<queueName>`,
            `Roles format: <roleName>,<roleName>:<divisionName>,<roleName>:<divisionName>|<divisionName>`,
            `Utilization format: <mediaType>:<maxCapacity>,<mediaType>:<maxCapacity>:<interruptableMediaType>|<interruptableMediaType>`
        ]);
        const exampleLink = createDownloadLink("Bulk User Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, exportButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    bulkUserActionsWrapper() {
        const boundFunc = this.bulkUserActions.bind(this);
        showLoading(boundFunc, this.container);
    }
    bulkUserExportWrapper() {
        const boundFunc = this.bulkUserExport.bind(this);
        showLoading(boundFunc, this.container);
    }

    mapProperty(propA, propB, objects, caseInsensitive) {
        const mapping = {};
        for (let object of objects) {
            mapping[caseInsensitive ? object[propA].toLowerCase() : object[propA]] = propB ? object[propB] : object
        }
        return mapping;
    }

    async bulkUserExport() {
        const allUsers = await getAllPost("/api/v2/users/search", {"query":[{"type":"EXACT","fields":["state"],"values":["active","inactive"]}], "sortOrder":"ASC", "sortBy":"name", "expand": ["skills", "groups", "languages", "team", "locations", "employerInfo", "station"], "enforcePermissions":false}, 200);
        const userIdMapping = this.mapProperty("id", "email", allUsers, true);
        const userInfo = this.mapProperty("email", null, allUsers, true);
        const allGroups = await getAllPost("/api/v2/groups/search", {"query": [{"type":"EXACT", "fields":["state"], "value":"active"}], "sortOrder":"ASC", "sortBy":"name"}, 200);
        const groupIdMapping = this.mapProperty("id", "name", allGroups, true);
        const allQueues = await getAll("/api/v2/routing/queues?", "entities", 200);
        const queueInfo = this.mapProperty("name", undefined, allQueues, true);
        const queueIdMapping = this.mapProperty("id", "name", allQueues, true);
        const allStations = await getAll("/api/v2/stations?", "entities", 100);
        const stationIdMapping = this.mapProperty("id", "name", allStations, true);
        const allLocations = await getAll("/api/v2/locations?", "entities", 100);
        const locationIdMapping = this.mapProperty("id", "name", allLocations);

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

        const headers = ["Action", "Activated", "Email", "Name", "Skills", "Language Skills", "Groups", "Queues", "Manager", "Department", "Title", "Hire Date", "Location", "Division", "Roles", "Utilization Level", "Utilization", "Alias", "Work Phone", "Extension", "Station"];
        const dataRows = [];
        for (let user in allUsers) {
            const currentUser = allUsers[user];
            currentUser.utilization = await this.getUserUtilization(currentUser.id);
            currentUser.roles = await this.getUserRoles(currentUser.id);
            const phoneInfo = this.processPhone(currentUser.addresses);
            const dataRow = [
                "REPLACE",
                currentUser.state === "active" ? true : false,
                currentUser.email,
                currentUser.name,
                currentUser.skills.map((e)=>`${e.name}:${e.proficiency}`).join(","),
                currentUser.languages.map((e)=>`${e.name}:${e.proficiency}`).join(","),
                currentUser.groups.map((e)=>groupIdMapping[e.id]).join(","),
                currentUser.queues ? currentUser.queues.map((e)=>queueIdMapping[e]).join(",") : "",
                currentUser.manager ? userIdMapping[currentUser.manager.id] : "",
                currentUser.department ? currentUser.department : "",
                currentUser.title ? currentUser.title : "",
                currentUser?.employerInfo?.dateHire ? currentUser.employerInfo.dateHire : "",
                currentUser.locations.map((e)=>locationIdMapping[e.locationDefinition.id]).join(","),
                currentUser.division.name,
                this.processRoles(currentUser.roles.grants),
                currentUser.utilization.level,
                this.processUtilization(currentUser.utilization.utilization),
                currentUser.preferredName ? currentUser.preferredName : "",
                phoneInfo.number,
                phoneInfo.extension,
                currentUser?.station?.associatedStation?.id ? stationIdMapping[currentUser.station.associatedStation.id] : ""
            ];

            dataRows.push(dataRow);
        }
        log(dataRows);
        const download = createDownloadLink("Users Export.csv", Papa.unparse({fields: headers, data: dataRows}, {escapeFormulae: true}), "text/csv");
        download.click(); 
    }

    async bulkUserActions() {
        if (!fileContents) window.fileContents = {data: [{Action: "UPDATE", Email: "connor.lofink+test@gmail.com", "Utilization Level": "Agent", Utilization: "callback:1,chat:4,workitem:2,message:4,call:1,email:3:call|message|callback", Division: "Connor Test", Groups: "Connor Group", "Language Skills": "english:4", Skills: "testskill:5,testskill1", Queues: "Connor Test,Claims  , Customer Service ", Roles: "employee:Connor Test|Home,AI Agent:Test,Developer"}]};

        const allSkills = await getAll("/api/v2/routing/skills?", "entities", 200);
        const skillsInfo = this.mapProperty("name", "id", allSkills, true);

        const allLanguageSkills = await getAll("/api/v2/routing/languages?", "entities", 200);
        const languageSkillsInfo = this.mapProperty("name", "id", allLanguageSkills, true);

        const allUsers = await getAllPost("/api/v2/users/search", {"query":[{"type":"EXACT","fields":["state"],"values":["active","inactive"]}], "sortOrder":"ASC", "sortBy":"name", "expand": ["skills", "groups", "languages", "team", "locations", "employerInfo", "station"], "enforcePermissions":false}, 200);
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

        const allLocations = await getAll("/api/v2/locations?", "entities", 100);
        const locationInfo = this.mapProperty("name", "id", allLocations);

        // create direct association between user and the queues they belong to
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

        const queueAdditions = {};
        const queueDeletions = {};

        for (let row of fileContents.data) {
            const setProperties = {
                queues: [],
                groups: [],
                roles: [],
                skills: [],
                languageSkills: [],
                utilizationLevel: undefined,
                utilization: [],
                division: undefined,
                phone: undefined,
            }

            const user = userInfo[row["Email"].toLowerCase().trim()];
            const userEmail = row["Email"].toLowerCase().trim();
            const action = row["Action"].toLowerCase().trim();

            const userUtiliation = await this.getUserUtilization(user.id);
            const currentUtilization = user ? this.processUtilization(userUtiliation.utilization) : "";
            const userRoles = await this.getUserRoles(user.id);
            const currentRoles  = user ? this.processRoles(userRoles.grants) : "";

            // "Action", "Activated", "Email", "Name", "Skills", "Language Skills", "Groups", "Queues", 
            // "Manager", "Department", "Title", "Hire Date", "Location", "Division", "Roles", 
            // "Utilization Level", "Utilization", "Alias", "Work Phone", "Extension", "Station"
            for (let header in row) {
                switch (header.toLowerCase().trim()) {
                    case "skills": // per user
                        // testskill:1,testskill1, testskill2:5
                        setProperties.skills = row[header].split(",").map((e) => e.toLowerCase().trim().split(":")).map((t) => ({"proficiency": t[1] && !isNaN(parseInt(t[1], 10)) ? parseInt(t[1], 10) : 0, "id": skillsInfo[t[0]]}));
                        break;
                    case "language skills": // per user
                        setProperties.languageSkills = row[header].split(",").map((e) => e.toLowerCase().trim().split(":")).map((t) => ({"proficiency": t[1] && !isNaN(parseInt(t[1], 10)) ? parseInt(t[1], 10) : 0, "id": languageSkillsInfo[t[0]]}));
                        break;
                    case "queues": // per queue
                        setProperties.queues = row[header].split(",").map((e) => queueInfo[e.trim().toLowerCase()].id);
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
                        // employee:Connor Test|Home,AI Agent:Test,Developer
                        setProperties.roles = row[header].split(",").map((e)=>(e.toLowerCase().trim().split(":"))).map((t) => ({name: t[0], id: rolesInfo[t[0]], divisions: t[1] ? t[1].split("|").map((r) => ({name: r, id: divisionInfo[r]})) : undefined}))
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
                    case "utilization level":
                        setProperties.utilizationLevel = row[header].toLowerCase().trim();
                        break;
                    case "utilization":
                        // callback:1,chat:1,workitem:1,message:4,call:1,email:3:call|message|callback
                        setProperties.utilization = this.processUtilizationInput(row[header]);
                        break;
                    default:
                        // log(`Unknown header [${header}]`, "error");
                        break;
                }
            }

            switch (action) {
                case "update":
                    if (!user) throw `No existing user found with email [${userEmail}]`;
                    // only want to do any of these if the column is included
                    // AND the value has changed
                    // if (setProperties.roles) await this.updateUserRoles(user.id, setProperties.roles);
                    if (setProperties.skills) await this.updateUserSkills(user.id, setProperties.skills);
                    if (setProperties.languageSkills) await this.updateUserLanguageSkills(user.id, setProperties.languageSkills);
                    if (row['Utilization'] && row['Utilization'] !== currentUtilization && setProperties.utilization) await this.updateUserUtilization(user.id, setProperties.utilization)
                    break;
                case "create":
                    // order:
                    //  create user
                    //      what fields are needed?
                    //  
                    break;
                default:
                    throw `Unknown action [${action}]`;
            }
            log(setProperties);
        }
        if (Object.keys(queueAdditions).length > 0) {
            // add all users to queues
        }
        if (Object.keys(queueDeletions).length > 0) {
            // remove all users from queue
        }
        // update groups
    }

    itemsToRemove(currentSet, newSet) {
        const itemsToRemove = [];
        for (let item of currentSet.difference(newSet)) {
            itemsToRemove.push(item);
        }
        return itemsToRemove;
    }
    itemsToAdd(currentSet, newSet) {
        const itemsToAdd = [];
        for (let item of newSet.difference(currentSet)) {
            itemsToAdd.push(item);
        }
        return itemsToAdd;
    }

    async setUserSkills(skills, userId) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/${userId}/routingskills/bulk`;
        const result = await fetch(url, {method: "PUT", body: JSON.stringify(skills), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
    }
    async setUserLanguageSkills(skills, userId) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/${userId}/routinglanguages/bulk`;
        const result = await fetch(url, {method: "PUT", body: JSON.stringify(skills), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
    }

    async getUserUtilization(userId) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/users/${userId}/utilization?pageSize=99999`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
    }
    async getUserRoles(userId) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/authorization/subjects/${userId}?pageSize=99999`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
    }

    processRoles(grants) {
        const roles = {};
        for (let grant of grants) {
            roles[grant.role.name] = roles[grant.role.name] || [];
            if (grant.division.id !== "*") roles[grant.role.name].push(grant.division.name)
        }

        const results = [];
        for (let role in roles) {
            results.push(`${role}${roles[role].length > 0 ? ":" + roles[role].join("|") : ""}`)
        }
        return results.join(",");
    }
    processUtilization(utilization) {
        const results = [];
        for (let mediaType of Object.keys(utilization).sort()) {
            results.push(`${mediaType}:${utilization[mediaType].maximumCapacity}${utilization[mediaType].interruptableMediaTypes.length > 0 ? ":" + utilization[mediaType].interruptableMediaTypes.join("|") : ""}`);
        }
        return results.join(",");
    }
    processUtilizationInput(utilizationString) {
        const utilization = {};
        const parts = utilizationString.split(",").map((e)=>e.toLowerCase().trim());
        for (let part of parts) {
            const subParts = part.split(":");
            let subPart;
            for (let i = 0; i < subParts.length; i++) {
                switch (i) {
                    case 0:
                        subPart = subParts[i];
                        utilization[subParts[i]] = {};
                        break;
                    case 1:
                        utilization[subPart].maximumCapacity = !isNaN(parseInt(subParts[i])) ? parseInt(subParts[i]) : 0;
                        break;
                    case 2:
                        utilization[subPart].interruptableMediaTypes = subParts[i].split("|").map((e)=>e.trim());
                        break;
                }
            }
        }
        return utilization;
    }
    processPhone(addresses) {
        const phone = {number: "", extension: ""}
        for (let address of addresses) {
            if (address.type !== "WORK") continue;
            phone.number = address.address || address.display;
            phone.extension = address.extension || "";
            break;
        }
        return phone;
    }
    createDownloadLink(fileName, fileContents, fileType) {
        const fileData = new Blob([fileContents], { type: fileType });
        const fileURL = window.URL.createObjectURL(fileData);
        return newElement('a', { href: fileURL, download: fileName });
    }

    async updateUser(userId, updates) {

    }
    async updateUserUtilization(userId, utilization) {
        return this.updateOnPath(`/api/v2/routing/users/${userId}/utilization`, 'PUT', {utilization: utilization});
    }
    // async addUserRoles(userId, roles) {
    //     return this.updateOnPath(`/api/v2/authorization/roles/${userId}/bulkadd`, 'POST', roles);
    // }
    // async removeUserRoles(userId, roles) {
    //     return this.updateOnPath(`/api/v2/authorization/roles/${userId}/bulkremove`, 'POST', roles);
    // }
    async updateUserRoles() {
        return this.updateOnPath(`/api/v2/authorization/roles/${userId}/bulkreplace`, 'POST', roles);
    }
    async updateQueue(queueId, updates) {

    }
    async updateUserSkills(userId, skills) {
        return this.updateOnPath(`/api/v2/users/${userId}/routingskills/bulk`, 'PUT', skills);
    }
    async updateUserLanguageSkills(userId, languageSkills) {
        return this.updateOnPath(`/api/v2/users/${userId}/routinglanguages/bulk`, 'PATCH', languageSkills);
    }
    async updateUserStation(userId, stationId) {
        return this.updateOnPath(`platform/api/v2/users/${userId}/station/defaultstation/${stationId}`, 'PUT', {});
    }
    async removeUserStation(userId, stationId) {
        this.updateOnPath(`/api/v2/users/${userId}/station/defaultstation`, "DELETE", {});
        this.updateOnPath(`/api/v2/stations/${stationId}/associateduser`, "DELETE", {});
    }
    async updateOnPath(path, method, body) {
        const url = `https://api.${window.localStorage.getItem('environment')}${path}`;
        const result = await fetch(url, {method: method, body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        return resultJson;
    }
}