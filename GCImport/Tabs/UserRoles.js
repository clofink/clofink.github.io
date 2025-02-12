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
        registerElement(startButton, "click", () => {
            showLoading(async () => { return this.bulkUpdateRoles() }, this.container);
        });
        const exportButton = newElement('button', { innerText: "Export" });
        registerElement(exportButton, "click", () => {
            showLoading(async () => { return this.exportUserRoles() }, this.container);
        })
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
        addElements([label, startButton, exportButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async updateRoles(userId, roles) {
        return makeGenesysRequest(`/api/v2/authorization/subjects/${userId}/bulkadd`, "POST", roles);
    }

    async getAllMapped(path, fieldFrom = "name", fieldTo = "id", normalize = true) {
        const allItems = await getAllGenesysItems(path);
        const map = {};
        for (const item of allItems) {
            map[normalize ? item[fieldFrom].toLowerCase() : item[fieldFrom]] = item[fieldTo];
        }
        return map;
    }

    async bulkUpdateRoles() {
        if (!fileContents) throw "No valid file selected";

        const userInfo = await this.getAllMapped(`/api/v2/users?state=active`, "email");
        const rolesInfo = await this.getAllMapped("/api/v2/authorization/roles?");
        const divisionInfo = await this.getAllMapped("/api/v2/authorization/divisions?");

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
            await makeCallAndHandleErrors(this.updateRoles, [userInfo[user.Email.toLowerCase()], { grants: newRoles }], results, user.Email, "User Role");
        }
        return results;
    }

    async exportUserRoles() {
        // this only accounts for 1 division for a role?
        const users = await this.getAllMapped(`/api/v2/users?state=active`, "id", "email", false);
        const roles = await this.getAllMapped("/api/v2/authorization/roles?", "id", "name", false);
        const divisions = await this.getAllMapped("/api/v2/authorization/divisions?", "id", "name", false);
        const userEmailToRolesMapping = {};
        for (const [id, name] of Object.entries(roles)) {
            const roleGrants = await getAllGenesysItems(`/api/v2/authorization/roles/${id}/subjectgrants?`);
            for (const grant of roleGrants) {
                if (!Object.hasOwnProperty.call(users, grant.id)) continue;
                const userEmail = users[grant.id];
                if (!Object.hasOwnProperty.call(userEmailToRolesMapping, userEmail)) userEmailToRolesMapping[userEmail] = [];
                for (const division of grant.divisions) {
                    if (division.id === "*") userEmailToRolesMapping[userEmail].push(name);
                    else userEmailToRolesMapping[userEmail].push(`${name}:${divisions[division.id]}`);
                }
            }
        }
        const dataRows = [];
        for (const [userEmail, rolesList] of Object.entries(userEmailToRolesMapping)) {
            dataRows.push([userEmail, rolesList.join(",")]);
        }
        const downloadLink = createDownloadLink("User Roles Export.csv", Papa.unparse([["Email", "Roles"], ...dataRows]), "text/csv");
        downloadLink.click();
    }
}