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

    async exportData(fields) {
        const result = {};

        let users = [];
        let queues = [];
        let roles = [];

        for (let field of fields) {
            switch (field) {
                case "users": {
                    const usersResult = await getAllPost("/api/v2/users/search", {"query":[{"type":"EXACT","fields":["state"],"values":["active","inactive"]}], "sortOrder":"ASC", "sortBy":"name", "expand": ["skills", "groups", "languages", "team", "locations", "employerInfo", "station"], "enforcePermissions":false}, 200);
                    users = usersResult;
                    result.users = usersResult;
                    break;
                }
                case "groups": {
                    const groupsResult = await getAllPost("/api/v2/groups/search", {"query": [{"type":"EXACT", "fields":["state"], "value":"active"}], "sortOrder":"ASC", "sortBy":"name"}, 200);
                    result.groups = groupsResult;
                    break;
                }
                case "queues": {
                    const queuesResult = await getAll("/api/v2/routing/queues?", "entities", 200);
                    queues = queuesResult;
                    result.queues = queuesResult;
                    break;
                }
                case "roles": {
                    const rolesResult = await getAll("/api/v2/authorization/roles?", "entities", 200);
                    roles = rolesResult;
                    result.roles = rolesResult;
                    break;
                }
                case "stations": {
                    const stationsResult = await getAll("/api/v2/stations?", "entities", 100);
                    result.stations = stationsResult;
                    break;
                }
                case "locations": {
                    const locationsResult = await getAll("/api/v2/locations?", "entities", 100);
                    result.locations = locationsResult;
                    break;
                }
                case "divisions": {
                    const divisionResults = await getAll("/api/v2/authorization/divisions?", "entities", 100);
                    result.divisions = divisionResults;
                    break;
                }
                case "work teams": {
                    const workTeamResults = await getAll("/api/v2/teams?", "entities", 100);
                    result.workTeams = workTeamResults;
                    break;
                }
                case "skills": {
                    const skillResults = await getAll("/api/v2/routing/skills?", "entities", 200);
                    result.skills = skillResults;
                    break;
                }
                case "language skills": {
                    const languageSkillResults = await getAll("/api/v2/routing/languages?", "entities", 200);
                    result.languageSkills = languageSkillResults;
                    break;
                }
                case "queue membership": {
                    const queueMembership = {};
                    for (let queue of queues) {
                        if (queue.memberCount === 0) continue;
                        const queueMembers = await getAll(`/api/v2/routing/queues/${queue.id}/members?`, "entities", 200);
                        queueMembership[queue.id] = queueMembers;
                    }
                    result.queueMembership = queueMembership;
                    break;
                }
                case "role membership": {
                    const roleMembership = {};
                    for (let role of roles) {
                        if (role.userCount === 0) continue;
                        const roleMembers = await getAll(`/api/v2/authorization/roles/${role.id}/subjectgrants?`, "entities", 200);
                        roleMembership[role.id] = roleMembers;
                    }
                    result.roleMembership = roleMembership;
                    break;
                }
                case "utilization": {
                    const utilizations = {};
                    for (let user of users) {
                        const utilizationResult = await this.getUserUtilization(user.id);
                        utilizations[user.id] = utilizationResult;
                    }
                    result.utilization = utilizations;
                    break;
                }
            }
        }
        return result;
    }

    addToTemplate(list, template, type, defaultValue) {
        for (let item of list) {
            template[`${type}:${item.name}`] = defaultValue;
        }
    }

    async bulkUserExport() {
        const data = await this.exportData(["users", "queues", "groups", "roles", "divisions", "locations", "stations", "skills", "language skills", "work teams", "queue membership", "role membership", "utilization"]);
        log(data);
        const userIdMapping = this.mapProperty("id", "email", data.users, true);
        const userInfo = this.mapProperty("email", null, data.users, true);
        const groupIdMapping = this.mapProperty("id", "name", data.groups);
        const queueIdMapping = this.mapProperty("id", "name", data.queues);
        const stationIdMapping = this.mapProperty("id", "name", data.stations);
        const locationIdMapping = this.mapProperty("id", "name", data.locations);
        const roleIdMapping = this.mapProperty("id", "name", data.roles);
        const divisionIdMapping = this.mapProperty("id", "name", data.divisions);

        for (let queueId in data.queueMembership) {
            for (let queueMember of data.queueMembership[queueId]) {
                if (queueMember.user.id === "UNKNOWN-USER") continue;
                userInfo[queueMember.user.email.toLowerCase()].queues = userInfo[queueMember.user.email.toLowerCase()].queues || [];
                userInfo[queueMember.user.email.toLowerCase()].queues.push(queueId);
            }
        }
        for (let roleId in data.roleMembership) {
            for (let roleMember of data.roleMembership[roleId]) {
                if (roleMember.type !== "PC_USER") continue;
                userInfo[userIdMapping[roleMember.id]].roles = userInfo[userIdMapping[roleMember.id]].roles || [];
                userInfo[userIdMapping[roleMember.id]].roles.push({id: roleId, divisions: roleMember.divisions});

            }
        }
        for (let userId in data.utilization) {
            userInfo[userIdMapping[userId]].utilization = data.utilization[userId];
        }

        const templateObject = {};
        const headers = ["Action", "Activated", "Email", "Name", "Manager", "Department", "Title", "Hire Date", "Location", "Division", "Utilization Level", "Alias", "Work Phone", "Extension", "Station"];
        for (let header of headers) {
            templateObject[header] = "";
        }
        this.addToTemplate(data.queues, templateObject, "Queue", "N");
        this.addToTemplate(data.groups, templateObject, "Group", "N");
        this.addToTemplate(data.roles, templateObject, "Role", "");
        this.addToTemplate(data.skills, templateObject, "Skill", "");
        this.addToTemplate(data.languageSkills, templateObject, "Language Skill", "");
        this.addToTemplate(data.workTeams, templateObject, "Work Team", "N");

        for (let mediaType of ["call", "callback", "chat", "email", "message", "workitem"]) {
            templateObject[`Utilization Capacity:${mediaType}`] = "";
            templateObject[`Utilization Interrupted By:${mediaType}`] = "";
        }

        const dataRows = [];
        for (let user in userInfo) {
            const currentUser = userInfo[user];
            const dataRow = structuredClone(templateObject);
            const phoneInfo = this.processPhone(currentUser.addresses);
            
            dataRow.Action = "UPDATE";
            dataRow.Activated = currentUser.state === "active" ? true : false,
            dataRow.Email = currentUser.email,
            dataRow.Name = currentUser.name,
            dataRow.Manager = currentUser.manager ? userIdMapping[currentUser.manager.id] : "",
            dataRow.Department = currentUser.department ? currentUser.department : "",
            dataRow.Title = currentUser.title ? currentUser.title : "",
            dataRow["Hire Date"] = currentUser?.employerInfo?.dateHire ? currentUser.employerInfo.dateHire : "",
            dataRow.Location = currentUser.locations.map((e)=>locationIdMapping[e.locationDefinition.id]).join(","),
            dataRow.Division = currentUser.division.name,
            dataRow["Utilization Level"] = currentUser.utilization.level,
            dataRow.Alias = currentUser.preferredName ? currentUser.preferredName : "",
            dataRow["Work Phone"] = phoneInfo.number,
            dataRow.Extension = phoneInfo.extension,
            dataRow.Station = currentUser?.station?.associatedStation?.id ? stationIdMapping[currentUser.station.associatedStation.id] : ""

            if (currentUser.team) {
                dataRow[`Work Team:${currentUser.team.name}`] = "Y";
            }
            for (let queue of currentUser.queues || []) {
                dataRow[`Queue:${queueIdMapping[queue]}`] = "Y";
            }
            for (let skill of currentUser.skills || []) {
                dataRow[`Skill:${skill.name}`] = skill.proficiency;
            }
            for (let languageSkill of currentUser.languages || []) {
                dataRow[`Language Skill:${languageSkill.name}`] = languageSkill.proficiency;
            }
            for (let group of currentUser.groups || []) {
                dataRow[`Group:${groupIdMapping[group.id]}`] = "Y";
            }
            for (let role of currentUser.roles || []) {
                const divisions = [];
                for (let division of role.divisions) {
                    if (division.id === "*") divisions.push(division.id);
                    else divisions.push(divisionIdMapping[division.id]);
                }
                dataRow[`Role:${roleIdMapping[role.id]}`] = divisions.join(",");
            }
            for (let mediaType in currentUser.utilization.utilization) {
                dataRow[`Utilization Capacity:${mediaType}`] = currentUser.utilization.utilization[mediaType].maximumCapacity;
                dataRow[`Utilization Interrupted By:${mediaType}`] = currentUser.utilization.utilization[mediaType].interruptableMediaTypes.join(",");
            }
            dataRows.push(dataRow);
        }
        log(dataRows);
        const download = createDownloadLink("Users Export.csv", Papa.unparse(dataRows, {escapeFormulae: true}), "text/csv");
        download.click(); 
    }

    async bulkUserActions() {
        const data = await this.exportData(["skills", "language skills", "users", "groups", "roles", "divisions", "stations", "queues", "locations", "work teams", "queue membership", "role membership", "utilization"])
        
        const userInfo = this.mapProperty("email", null, data.users, true);
        const userIdMapping = this.mapProperty("id", "email", data.users, true);
        const skillsInfo = this.mapProperty("name", "id", data.skills);
        const languageSkillsInfo = this.mapProperty("name", "id", data.languageSkills);
        const groupsInfo = this.mapProperty("name", "id", data.groups);
        const rolesInfo = this.mapProperty("name", "id", data.roles);
        const divisionInfo = this.mapProperty("name", "id", data.divisions);
        const queueInfo = this.mapProperty("name", undefined, data.queues);
        const stationInfo = this.mapProperty("name", "id", data.stations);
        const locationInfo = this.mapProperty("name", "id", data.locations);
        const workTeamsInfo = this.mapProperty("name", "id", data.workTeams);

        for (let queueId in data.queueMembership) {
            for (let queueMember of data.queueMembership[queueId]) {
                if (queueMember.user.id === "UNKNOWN-USER") continue;
                userInfo[queueMember.user.email.toLowerCase()].queues = userInfo[queueMember.user.email.toLowerCase()].queues || [];
                userInfo[queueMember.user.email.toLowerCase()].queues.push(queueId);
            }
        }
        for (let roleId in data.roleMembership) {
            for (let roleMember of data.roleMembership[roleId]) {
                if (roleMember.type !== "PC_USER") continue;
                userInfo[userIdMapping[roleMember.id]].roles = userInfo[userIdMapping[roleMember.id]].roles || [];
                userInfo[userIdMapping[roleMember.id]].roles.push({id: roleId, divisions: roleMember.divisions});

            }
        }
        for (let userId in data.utilization) {
            userInfo[userIdMapping[userId]].utilization = data.utilization[userId];
        }

        const fullData = {userInfo, userIdMapping, skillsInfo, languageSkillsInfo, groupsInfo, rolesInfo, divisionInfo, queueInfo, stationInfo, locationInfo, workTeamsInfo}
        log(fullData);
        // ["Action", "Activated", "Email", "Name", "Manager", "Department", "Title", "Hire Date", "Location", "Division", "Utilization Level", "Alias", "Work Phone", "Extension", "Station"]
        for (let row of fileContents.data) {
            const newUserInfo = {
                skills: [],
                languageSkills: [],
                groups: [],
                roles: [],
                queues: [],
                workTeams: [],
                utilization: {
                    call: {},
                    callback: {},
                    chat: {},
                    email: {},
                    message: {},
                    workitem: {}
                }
            };
            for (let field in row) {
                switch (field.toLowerCase().trim()) {
                    case "action": {
                        newUserInfo.action = row[field];
                        break;
                    }
                    case "activated": {
                        newUserInfo.activated = row[field];
                        break;
                    }
                    case "email": {
                        newUserInfo.email = row[field];
                        break;
                    }
                    case "name": {
                        newUserInfo.name = row[field];
                        break;
                    }
                    case "manager": {
                        newUserInfo.manager = row[field];
                        break;
                    }
                    case "department": {
                        newUserInfo.department = row[field];
                        break;
                    }
                    case "title": {
                        newUserInfo.title = row[field];
                        break;
                    }
                    case "hire date": {
                        newUserInfo.hireDate = row[field];
                        break;
                    }
                    case "location": {
                        newUserInfo.location = row[field];
                        break;
                    }
                    case "division": {
                        newUserInfo.division = row[field];
                        break;
                    }
                    case "utilization level": {
                        newUserInfo.utilizationLevel = row[field];
                        break;
                    }
                    case "alias": {
                        newUserInfo.alias = row[field];
                        break;
                    }
                    case "work phone": {
                        newUserInfo.workPhone = row[field];
                        break;
                    }
                    case "extension": {
                        newUserInfo.extension = row[field];
                        break;
                    }
                    case "station": {
                        newUserInfo.station = row[field];
                        break;
                    }
                    default: {
                        const fieldParts = field.split(":");
                        if (fieldParts.length < 2) {
                            console.log(`Unknown column header [${field}]`);
                            break;
                        }
                        switch (fieldParts[0].toLowerCase().trim()) {
                            case "skill": {
                                newUserInfo.skills.push({name: fieldParts[1], value: row[field]});
                                break;
                            }
                            case "language skill": {
                                newUserInfo.languageSkills.push({name: fieldParts[1], value: row[field]});
                                break;
                            }
                            case "queue": {
                                newUserInfo.queues.push({name: fieldParts[1], value: row[field]});
                                break;
                            }
                            case "group": {
                                newUserInfo.groups.push({name: fieldParts[1], value: row[field]});
                                break;
                            }
                            case "role": {
                                newUserInfo.roles.push({name: fieldParts[1], value: row[field]});
                                break;
                            }
                            case "work team": {
                                newUserInfo.workTeams.push({name: fieldParts[1], value: row[field]})
                                break;
                            }
                            case "utilization capacity": {
                                newUserInfo.utilization[fieldParts[1]].maxCapacity = row[field];
                                break;
                            }
                            case "utilization interrupted by": {
                                newUserInfo.utilization[fieldParts[1]].interruptedBy = row[field];
                                break;
                            }
                            default: {
                                console.log(`Unknown column header [${field}]`);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            const validationResult = this.validateRow(newUserInfo, fullData);
            log(validationResult);
        }
    }

    validateRow(newUserInfo, data) {
        newUserInfo.errors = [];
        if (data.divisionInfo.hasOwnProperty(newUserInfo.division)) {
            newUserInfo.division = {name: newUserInfo.division, id: data.divisionInfo[newUserInfo.division]}
        }
        else {
            newUserInfo.errors.push(`No division with name [${newUserInfo.division}] in account`);
        }
        for (let queue of newUserInfo.queues) {
            if (data.queueInfo.hasOwnProperty(queue.name)) queue.id = data.queueInfo[queue.name].id;
            else {
                newUserInfo.errors.push(`No queue with name [${queue.name}] in account`);
            }
        }
        for (let role of newUserInfo.roles) {
            if (data.rolesInfo.hasOwnProperty(role.name)) {
                role.id = data.rolesInfo[role.name];
                role.divisions = [];
                if (role.value) {
                    const divisions = role.value.split(",");
                    for (let division of divisions) {
                        if (division === "*") {
                            role.divisions.push(division);
                        }
                        else if (data.divisionInfo.hasOwnProperty(division)) {
                            role.divisions.push(data.divisionInfo[division]);
                        }
                        else {
                            newUserInfo.errors.push(`No division with name [${division}] in account`);
                        }
                    }
                }
            }
            else {
                newUserInfo.errors.push(`No role with name [${role.name}] in account`);
            }
        }
        for (let skill of newUserInfo.skills) {
            if (data.skillsInfo.hasOwnProperty(skill.name)) {
                skill.id = data.skillsInfo[skill.name];
            }
            else {
                newUserInfo.errors.push(`No skill with name [${skill.name}] in account`);
            }
            if (skill.value !== null && skill.value !== "N") {
                const intProficiency = parseInt(skill.value, 10);
                if (isNaN(intProficiency) || intProficiency < 0 || intProficiency > 5) {
                    newUserInfo.errors.push(`Invalid proficiency [${skill.value}] provided for skill [${skill.name}]`);
                }
            }
        }
        for (let languageSkill of newUserInfo.languageSkills) {
            if (data.languageSkillsInfo.hasOwnProperty(languageSkill.name)) {
                languageSkill.id = data.languageSkillsInfo[languageSkill.name];
            }
            else {
                newUserInfo.errors.push(`No language skill with name [${languageSkill.name}] in account`);
            }
            if (languageSkill.value !== null && languageSkill.value !== "N") {
                const intProficiency = parseInt(languageSkill.value, 10);
                if (isNaN(intProficiency) || intProficiency < 0 || intProficiency > 5) {
                    newUserInfo.errors.push(`Invalid proficiency [${languageSkill.value}] provided for language skill [${languageSkill.name}]`);
                }
            }
        }
        for (let group of newUserInfo.groups) {
            if (data.groupsInfo.hasOwnProperty(group.name)) {
                group.id = data.groupsInfo[group.name];
            }
            else {
                newUserInfo.errors.push(`No group with name [${group.name}] in account`);
            }
        }
        for (let workTeam of newUserInfo.workTeams) {
            if (data.workTeamsInfo.hasOwnProperty(workTeam.name)) {
                workTeam.id = data.workTeamsInfo[workTeam.name];
            }
            else {
                newUserInfo.errors.push(`No group with name [${workTeam.name}] in account`);
            }
        }
        for (let mediaType in newUserInfo.utilization) {
            const validMediaTypes = ['call', 'callback', 'chat', 'email', 'message', 'workitem'];
            if (validMediaTypes.includes(mediaType)) {
                const intCapacity = parseInt(newUserInfo.utilization[mediaType].maxCapacity, 10);
                if (isNaN(intCapacity)) {
                    newUserInfo.errors.push(`Invalid capacity value [${newUserInfo.utilization[mediaType].maxCapacity}] for media type [${mediaType}]`);
                }
                if (newUserInfo.utilization[mediaType].interruptedBy) {
                    const interruptableMediaTypes = newUserInfo.utilization[mediaType].interruptedBy.split(",");
                    for (let interruptableMediaType of interruptableMediaTypes) {
                        if (!validMediaTypes.includes(interruptableMediaType)) {
                            newUserInfo.errors.push(`Invalid interruptable media type [${interruptableMediaType}] for media type [${mediaType}]`);
                        }
                    }
                }
            }
            else {
                newUserInfo.errors.push(`Invalid media type [${mediaType}]`);
            }
        }
        return newUserInfo;
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
        return;
        return this.updateOnPath(`/api/v2/routing/users/${userId}/utilization`, 'PUT', {utilization: utilization});
    }
    // async addUserRoles(userId, roles) {
    //     return this.updateOnPath(`/api/v2/authorization/roles/${userId}/bulkadd`, 'POST', roles);
    // }
    // async removeUserRoles(userId, roles) {
    //     return this.updateOnPath(`/api/v2/authorization/roles/${userId}/bulkremove`, 'POST', roles);
    // }
    async updateUserRoles(userId, roles) {
        return;
        return this.updateOnPath(`/api/v2/authorization/roles/${userId}/bulkreplace`, 'POST', roles);
    }
    async updateQueue(queueId, updates) {

    }
    async updateUserSkills(userId, skills) {
        return;
        return this.updateOnPath(`/api/v2/users/${userId}/routingskills/bulk`, 'PUT', skills);
    }
    async updateUserLanguageSkills(userId, languageSkills) {
        return;
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
    areSkillsListsEqual(skillListA, skillListB) {
        console.log(skillListA);
        console.log(skillListB);
        if (skillListA.length !== skillListB.length) return false;
        for (let skill of skillListA) {
            if (!skillListB.includes(skill)) return false;
        }
        return true;
    }
    areQueuesListsEqual(queuesListA, queuesListB) {
        if (queuesListA.length !== queuesListB.length) return false;
        for (let queue of queuesListA) {
            if (!queuesListB.includes(queue)) return false;
        }
        return true;
    }
    areRolesListsEqual(rolesListA, rolesListB) {
        console.log(rolesListA);
        console.log(rolesListB);
        if (rolesListA.length !== rolesListB.length) return false;
        for (let roleA of rolesListA) {
            const aParts = roleA.split(":");
            const aDivisions = aParts[1] ? aParts[1].split("|") : [];
            let foundMatch = false;
            for (let roleB of rolesListB) {
                const bParts = roleB.split(":");
                if (aParts[0] !== bParts[0]) continue;
                foundMatch = true;
                const bDivisions = bParts[1] ? bParts[1].split("|") : [];
                if (aDivisions.length !== bDivisions.length) return false;
                for (let division of aDivisions) {
                    if (!bDivisions.includes(division)) return false;
                }
            }
            if (!foundMatch) return false;
        }
        return true;
    }
    areUtilizationListsEqual(utilizationListA, utilizationListB) {
        console.log(utilizationListA);
        console.log(utilizationListB);
        if (utilizationListA.length !== utilizationListB.length) return false;
        for (let utilizationA of utilizationListA) {
            const aParts = utilizationA.split(":");
            const interruptableMediaTypesA = aParts[2] ? aParts[2].split("|") : [];
            let foundMatch = false;
            for (let utilizationB of utilizationListB) {
                const bParts = utilizationB.split(":");
                if (aParts[0] !== bParts[0]) continue;
                foundMatch = true;
                const interruptableMediaTypesB = bParts[2] ? bParts[2].split("|") : [];
                if (interruptableMediaTypesA.length !== interruptableMediaTypesB.length) return false;
                for (let interruptableMediaType of interruptableMediaTypesA) {
                    if (!interruptableMediaTypesB.includes(interruptableMediaType)) return false;
                }
            }
            if (!foundMatch) return false;
        }
        return true;
    }
    normalizeList(list, delimiters) {
        const currentDelimiter = delimiters.pop();
        const listLevel = list.split(currentDelimiter);
        const normalizedValues = [];
        for (let item of listLevel) {
            let value = item.toLowerCase().trim();
            if (delimiters.length > 0) value = this.normalizeList(value, delimiters);
            normalizedValues.push(value);
        }
        return normalizedValues.join(currentDelimiter);
    }
    validateValue(key, value, mappings) {
        switch(key) {
            case "utilization":
                this.validateUtilization(value);
                break;
            case "roles":
                this.validateRoles(value, mappings);
            case "skills":
                this.validateSkills(value, mappings);
                break;
            case "language skills":
                this.validateSkills(value, mappings);
                break;
            case "queues":
                break;
            case "division":

                break;
        }
    }
    validateUtilization(value) {
        const mediaTypes = new Set(["call", "callback", "chat", "email", "message", "workitem"]);
        const includedMediaTypes = new Set();
        const utilizations = value.split(",");
        for (let utilization of utilizations) {
            const parts = utilization.split(":");
            if (!mediaTypes.has(parts[0])) throw `Unknown media type [${parts[0]}]`;
            includedMediaTypes.add(parts[0]);
            const maxCapacity = parts[1] && !isNaN(parseInt(parts[1])) ? parseInt(parts[1]) : undefined;
            if (maxCapacity === undefined) throw `Invalid capacity [${parts[1]}] for media type [${parts[0]}]`;
            const interruptableMediaTypes = parts[2] ? parts[2].split("|") : [];
            for (let interruptableMediaType of interruptableMediaTypes) {
                if (!mediaTypes.has(interruptableMediaType)) throw `Unknown interruptable media type [${interruptableMediaType}] for media type [${parts[0]}]`;
            }
        }
        const missingMediaTypes = Array.from(mediaTypes.difference(includedMediaTypes));
        if (missingMediaTypes.length > 0) throw `Missing required media types [${missingMediaTypes.join(", ")}]`;
        return true;
    }
    validateRoles(value, mappings) {
        if (value === "") return true;
        const existingDivisions = mappings.divisions;
        const existingRoles = mappings.roles;
        const roles = value.split(",");
        for (let role of roles) {
            const parts = role.split(":");
            const existingRole = existingRoles[parts[0]];
            if (!existingRole) throw `No role [${parts[0]}]`;
            const divisions = parts[1] ? parts[1].split("|") : [];
            for (let division of divisions) {
                const existingDivision = existingDivisions[division];
                if (!existingDivision) throw `No division [${division}]`;
            }
        }
        return true;
    }
    validateSkills(value, mappings) {
        if (value === "") return true;
        const existingSkills = mappings.skills;
        const skills = value.split(",");
        for (let skill of skills) {
            const parts = skill.split(":");
            const existingSkill = existingSkills[parts[0]];
            if (!existingSkill) throw `No skill [${parts[0]}]`;
            const proficiency = parts[1] ? parts[1] : undefined;
            if (proficiency && isNaN(parseInt(parts[1]))) throw `Invalid proficiency [${parts[1]}] for skill [${parts[0]}]`;
        }
        return true;
    }
    validateQueues(value, mappings) {
        if (value === "") return true;
        const queues = value.split(",");
        for (let queue of queues) {
            if (!mappings.queues[queue]) throw `No queue [${queue}]`;
        }
        return true;
    }
}