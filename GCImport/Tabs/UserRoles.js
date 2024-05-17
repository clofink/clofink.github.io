class UserRolesTab extends Tab {
    tabName = "User Roles";

    render() {
        window.requiredFields = ["Email", "Roles"];
        window.allValidFields = ["Email", "Roles"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "Roles CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', { innerText: "Start" });
        const buttonClickHandler = this.bulkUpdateRolesWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "users:readonly", "authorization" scopes`,
            `Required CSV column "Email", "Roles"`,
            `"Roles is a comma-separated list of roles to add to the user`,
            `"Roles" can include a division as well in the format <RoleName>:<DivisionName>`,
            `Role and Division names are not case sensitive.`,
            `If no Division is included, "All Divisions" is used`
        ]);
        const exampleLink = createDownloadLink("Roles Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    bulkUpdateRolesWrapper() {
        const boundFunc = this.bulkUpdateRoles.bind(this);
        showLoading(boundFunc, this.container);
    }

    async getAllUsers() {
        const users = [];
        let pageNum = 0;
        let totalPages = 1;

        while (pageNum < totalPages) {
            pageNum++;
            const body = {
                "pageSize": 25,
                "pageNumber": pageNum,
                "query": [
                    {
                        "type": "EXACT",
                        "fields": ["state"],
                        "values": ["active"]
                    }
                ],
                "sortOrder": "ASC",
                "sortBy": "name",
                "expand": [],
                "enforcePermissions": false
            }
            const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/search`;
            const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
            const resultJson = await result.json();
            if (result.ok) {
                resultJson.status = 200;
            }
            else {
                throw resultJson.message;
            }    
            users.push(...resultJson.results);
            totalPages = resultJson.pageCount;
        }
        return users;
    }

    async updateRoles(userId, roles) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/authorization/subjects/${userId}/bulkadd`;
        const result = await fetch(url, { method: "POST", body: JSON.stringify(roles), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = {};
        if (result.ok) {
            resultJson.status = 200;
        }
        else {
            resultJson.status = result.status;
            resultJson.message = `Request to update user roles failed with status ${result.status}`;
        }
        return resultJson;
    }

    async bulkUpdateRoles() {
        if (!fileContents) throw "No valid file selected";

        const allUsers = await this.getAllUsers();
        const userInfo = {};
        for (let user of allUsers) {
            userInfo[user.email.toLowerCase()] = user.id;
        }

        const allRoles = await getAll("/api/v2/authorization/roles?", "entities", 200); 
        const rolesInfo = {};
        for (let role of allRoles) {
            rolesInfo[role.name.toLowerCase()] = role.id;
        }

        const allDivisions = await getAll("/api/v2/authorization/divisions?", "entities", 200);
        const divisionInfo = {};
        for (let division of allDivisions) {
            divisionInfo[division.name.toLowerCase()] = division.id;
        }

        const results = [];
        for (let user of fileContents.data) {
            if (!userInfo[user["Email"].toLowerCase()]) {
                results.push({ name: user.Email.toLowerCase(), type: "User Role", status: "failed", error: `No active user matching email ${user.Email}` });
                continue;
            }
            const roles = user["Roles"].split(",");
            const newRoles = [];
            for (let role of roles) {
                const parts = role.split(":");
                const roleName = parts[0]
                const newRole = {}
                if (!rolesInfo[roleName.toLowerCase().trim()]) {
                    results.push({ name: roleName, type: "User Role", status: "failed", error: `No existing role ${roleName} for user ${user.Email}` });
                    continue;
                }
                newRole.roleId = rolesInfo[roleName.toLowerCase().trim()];
                if (parts[1]) {
                    if (!divisionInfo[parts[1].toLowerCase().trim()]) {
                        results.push({ name: parts[1], type: "User Role", status: "failed", error: `No existing division ${parts[1]} for user ${user.Email}` });
                        continue;
                    }
                    newRole.divisionId = divisionInfo[parts[1].toLowerCase().trim()];
                }
                else {
                    newRole.divisionId = "*";
                }
                newRoles.push(newRole);
            }
            await makeCallAndHandleErrors(this.updateRoles, [userInfo[user.Email.toLowerCase()], {grants: newRoles}], results, user.Email, "User Role")
        }
        return results;
    }
}