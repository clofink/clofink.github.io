function getAllRoles() {
    // includes the permissions for the role under "permissionPolicies"
    return getAllGenesysItems(`/api/v2/authorization/roles?sortBy=name`, 50, "entities");
}

function getAllPermissions() {
    return getAllGenesysItems(`/api/v2/authorization/permissions`, 99999, "entities");
}

function createNewRole(roleName, roleDescription = "") {
    const body = {
        "base": false,
        "description": roleDescription,
        "name": roleName,
        "permissions": [],
        "permissionPolicies": []
    }
    return makeGenesysRequest(`/api/v2/authorization/roles`, "POST", body);
}

function updateRolePermissions(roleId, role) {
    return makeGenesysRequest(`/api/v2/authorization/roles/${roleId}`, "PUT", role);
}

function applyChangesToRole(roleId, permissions) {
    const currentRoleInfo = window.allRoles.find((e)=>e.id === roleId);
    if (!currentRoleInfo) return;
    const newRoleInfo = currentRoleInfo;
    newRoleInfo.permissionPolicies = [];

    for (const permission of permissions) {
        const permParts = permission.name.split(".");
        if (permParts.length !== 3) {
            console.log(`Permission [${permission.name}] doesn't have 3 parts`);
            continue;
        }
        const existingDomains = newRoleInfo.permissionPolicies.filter((e)=>e.domain === permParts[0]);
        if (existingDomains.length === 0) {
            newRoleInfo.permissionPolicies.push({domain: permParts[0], entityName: permParts[1], actionSet: [permParts[2]]});
            continue;
        }
        const existingEntity = existingDomains.filter((e)=>e.entityName === permParts[1]);
        if (existingEntity.length === 0) {
            newRoleInfo.permissionPolicies.push({domain: permParts[0], entityName: permParts[1], actionSet: [permParts[2]]});
            continue;
        }
        existingEntity[0].actionSet.push(permParts[2]);
    }
    console.log(newRoleInfo);
    return updateRolePermissions(roleId, newRoleInfo);
}

function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud"]
    const inputsWrapper = newElement('div', { id: "inputs" });
    const clientIdLabel = newElement('label', { innerText: "Client ID: " });
    const clientInput = newElement('input', { name: "clientId" });
    addElement(clientInput, clientIdLabel);
    const environmentLabel = newElement('label', { innerText: "Environment: " });
    const environmentSelect = newElement('select', { name: "environment" });
    for (let url of urls) {
        const option = newElement('option', { innerText: url });
        addElement(option, environmentSelect);
    }
    addElement(environmentSelect, environmentLabel);
    const loginButton = newElement("button", { id: "login", innerText: "Log In" });
    registerElement(loginButton, "click", login);
    const parent = eById('page');
    clearElement(parent);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElement(inputsWrapper, parent);
}

function createUiSection(id, headerName) {
    const section = newElement('div', { id: id });
    const header = newElement('h2', { innerText: headerName, class: ["header"] })
    addElement(header, section);
    return section;
}

function createUiSectionWithFilter(id, headerName, listName, filterFunc, updateFunc) {
    const section = newElement('div', { id: id });
    const header = newElement('h2', { innerText: headerName, class: ["header"] });
    const searchBar = newElement('input');
    registerElement(searchBar, 'input', () => {
        if (!window.hasOwnProperty(listName) || window[listName]?.length < 1) return;
        const filteredList = window[listName].filter((e) => filterFunc(e, searchBar.value));
        updateFunc(filteredList);
    })
    addElement(searchBar, header)
    addElement(header, section);
    return section;
}

function createNotificationUi(topicName, notificationObject) {
    const details = newElement('details');
    const summary = newElement('summary', { innerText: topicName });
    const pre = newElement("pre", { innerText: JSON.stringify(notificationObject, null, 2), class: ["fullNotificationBody"] })
    addElements([summary, pre], details);
    return details;
}

function createCurrentPermission(permission) {
    const currentPermission = newElement('div', { class: ["currentPermission"] });
    const name = newElement('div', { innerText: permission.name, class: ["valueName"] });
    const description = newElement('div', { innerText: permission.description, class: ["permissionDescription"] });
    const removeButton = newElement('button', { innerText: "Remove" });
    registerElement(removeButton, "click", ()=>{
        const permissionIndex = window.selectedRolePermissions.findIndex((e)=>e.name === permission.name);
        if (permissionIndex < 0) return;
        window.selectedRolePermissions.splice(permissionIndex, 1);
        populateCurrentPermissions(window.selectedRolePermissions);
    })
    addElements([name, description, removeButton], currentPermission);
    return currentPermission;
}

function createAvailablePermission(permission) {
    const availablePermission = newElement('div', { class: ["availablePermission"] });
    const name = newElement('div', { innerText: permission.name, class: ["valueName"] });
    const description = newElement('div', { innerText: permission.description, class: ["permissionDescription"] });
    const addButton = newElement('button', { innerText: "Add" });
    registerElement(addButton, "click", ()=>{
        const existingPermission = window.selectedRolePermissions.find((e)=>e.name === permission.name);
        if (existingPermission) return;
        window.selectedRolePermissions.push(permission);
        populateCurrentPermissions(window.selectedRolePermissions);
    })
    addElements([name, description, addButton], availablePermission);
    return availablePermission;
}

function createRoleOption(role) {
    const roleOption = newElement('div', { class: ["roleOption"] });
    const name = newElement('div', { innerText: `${role.default ? "[Default]" : "[Custom]"} ${role.name}`, class: ["valueName"] });
    const description = newElement('div', { innerText: role.description, class: ["permissionDescription"] });
    registerElement(roleOption, "click", () => {
        if (roleOption.classList.contains("selected")) return;
        const allSelected = qsa('#currentRoles .selected');
        for (const selected of allSelected) {
            selected.classList.remove("selected");
        }
        roleOption.classList.add("selected")
        window.selectedRole = window.allRoles.find((e) => e.id === role.id);
        const rolePermissions = getPermissionsFromRole(selectedRole);
        populateCurrentPermissions(rolePermissions);
    })
    addElements([name, description], roleOption);
    return roleOption;
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);

    const uiContainer = newElement('div', { id: "uiContainer" });

    const globalControls = newElement('div', { id: "globalControls" });
    const orgName = newElement('div', { innerText: "Current Org Name: ", class: ["orgName"] });
    const orgId = newElement('div', { innerText: "Current Org ID: ", class: ["orgId"] });
    const buttonContainer = newElement('div', { class: ["buttonContainer"] });
    const exportButton = newElement('button', { innerText: "Export Roles" });
    const logoutButton = newElement('button', { innerText: "Logout" });
    addElements([exportButton, logoutButton], buttonContainer);
    addElements([orgName, orgId, buttonContainer], globalControls);

    registerElement(exportButton, 'click', exportRoles);
    registerElement(logoutButton, 'click', logout);

    const currentRoles = createUiSectionWithFilter("currentRoles", "Current Roles", "allRoles", (item, searchValue) => { return item.name.toLowerCase().includes(searchValue.toLowerCase()) }, populateCurrentRoles);
    const addNewRole = createUiSection("addNewRole", "Add New Role");
    const currentPermissions = createUiSectionWithFilter("currentPermissions", "Current Permissions", "selectedRolePermissions", (item, searchValue) => { return item.name.toLowerCase().includes(searchValue.toLowerCase()) || item.description.toLowerCase().includes(searchValue.toLowerCase()) }, populateCurrentPermissions);
    const availablePermissions = createUiSectionWithFilter("availablePermissions", "All Available Permissions", "allPermissions", (item, searchValue) => { return item.name.toLowerCase().includes(searchValue.toLowerCase()) || item.description.toLowerCase().includes(searchValue.toLowerCase()) }, populateAvailablePermissions);

    const countSpan = newElement('span', { id: "currentCount", innerText: "test" })
    addElement(countSpan, qs(".header", currentPermissions), "afterbegin")
    const footerDiv = newElement('div', {class: ["footer"]});
    const applyButton = newElement('button', { innerText: "Apply Changes"});
    registerElement(applyButton, "click", ()=>{
        showLoading(async()=>{
            const result = await applyChangesToRole(window.selectedRole.id, window.selectedRolePermissions);
            if (result.status !== 200) return;
            const currentRoleIndex = window.allRoles.findIndex((e)=>e.id === window.selectedRole.id);
            if (currentRoleIndex < 0) return;
            window.allRoles.splice(currentRoleIndex, 1, result);
            populateCurrentRoles(window.allRoles);
        })
    })
    addElement(applyButton, footerDiv);

    const div1 = newElement('div');
    const div2 = newElement('div');
    const div3 = newElement('div');
    const nameLabel = newElement('label', { innerText: "Role Name: " });
    const nameInput = newElement('input');
    addElement(nameInput, nameLabel);
    addElement(nameLabel, div1);
    const descriptionLabel = newElement('label', { innerText: "Description" });
    const descriptionInput = newElement('input');
    addElement(descriptionInput, descriptionLabel);
    addElement(descriptionLabel, div2);
    const addButton = newElement('button', { innerText: "Add Role" });
    addElement(addButton, div3);

    registerElement(addButton, 'click', ()=>{showLoading(async ()=>{
        if (!nameInput.value) return;
        const newRole = await createNewRole(nameInput.value, descriptionInput.value);
        if (newRole.status !== 200) return;
        nameInput.value = "";
        descriptionInput.value = "";
        window.allRoles.push(newRole);
        populateCurrentRoles(window.allRoles);
    })})
    addElements([div1, div2, div3], addNewRole);
    addElements([globalControls, currentRoles, addNewRole, currentPermissions, footerDiv, availablePermissions], uiContainer);

    showLoading(async () => {
        const allRoles = await getAllRoles();
        const allPermissions = await getAllPermissions();
        window.allRoles = allRoles;

        for (const item of allPermissions) {
            for (const permissionName in item.permissionMap) {
                for (const permission of item.permissionMap[permissionName]) {
                    window.allPermissions.push({ name: `${permission.domain}.${permission.entityType}.${permission.action}`, description: permission.label });
                }
            }
        }
        populateCurrentRoles(window.allRoles)
        populateAvailablePermissions(window.allPermissions);
    });

    addElement(uiContainer, page);

    getOrgDetails().then(function (result) {
        if (result.status !== 200) {
            log(result.message, "error");
            logout();
            return;
        }
        orgName.innerText = `Current Org Name: ${result.name}`;
        orgId.innerText = `Current Org ID: ${result.id}`
    }).catch(function (error) { log(error, "error"); logout(); });
}

async function exportRoles() {
    if (window?.allRoles?.length < 1 || window?.allPermissions?.length < 1) return;
    const headers = ["Permission"];
    const sortByName = sortByKey('name', false);
    window.allRoles.sort(sortByName);
    window.allPermissions.sort(sortByName);
    const rolePerms = [];
    for (const role of window.allRoles) {
        headers.push(role.name);
        rolePerms.push(getPermissionsFromRole(role));
    }
    const data = [];
    for (const permission of window.allPermissions) {
        const rowData = [permission.name];
        for (const role of rolePerms) {
            if (role.some((e) => e.name === permission.name)) {
                rowData.push("X");
            }
            else {
                rowData.push("");
            }
        }
        data.push(rowData);
    }
    const download = createDownloadLink("Roles Export.csv", Papa.unparse([headers, ...data]), "text/csv");
    download.click();
}

function populateCurrentRoles(roles) {
    const currentRolesContainer = eById('currentRoles');
    const sortByName = sortByKey('name', false);
    roles.sort(sortByName);
    clearElement(currentRolesContainer, ".roleOption")
    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        const roleOption = createRoleOption(role);
        if (i === 0) {
            roleOption.classList.add("selected");
            const rolePermissions = getPermissionsFromRole(roles[0]);
            window.selectedRole = roles[0];
            populateCurrentPermissions(rolePermissions);
        }
        addElement(roleOption, currentRolesContainer);
    };
}

function getPermissionsFromRole(role) {
    const allPermissions = [];
    for (const permission of role.permissionPolicies) {
        for (const action of permission.actionSet) {
            allPermissions.push(...resolvePermission(permission.domain, permission.entityName, action));
        }
    }
    window.selectedRolePermissions = allPermissions;
    return allPermissions;
}

function populateCurrentPermissions(permissions) {
    const sortByName = sortByKey('name', false);
    permissions.sort(sortByName);
    const currentPermissionContainer = eById("currentPermissions");
    const headerCount = eById('currentCount');
    clearElement(currentPermissionContainer, ".currentPermission");
    for (const permission of permissions) {
        const permissionElement = createCurrentPermission(permission);
        addElement(permissionElement, currentPermissionContainer);
    }
    headerCount.innerText = `(${permissions.length}) `;
    currentPermissionContainer.scrollTo({ top: 0, behavior: "instant" })
}

function resolvePermission(domain, entityName, action) {
    const domainMatches = window.allPermissions.filter((e) => e.name.split(".")[0] === domain);
    if (entityName === "*") return domainMatches;
    const entityNameMatches = domainMatches.filter((e) => e.name.split(".")[1] === entityName);
    if (action === "*") return entityNameMatches;
    return entityNameMatches.filter((e) => e.name.split(".")[2] === action);
}

function populateAvailablePermissions(permissions) {
    const sortByName = sortByKey('name', false);
    permissions.sort(sortByName);
    const permissionsContainer = eById('availablePermissions');
    clearElement(permissionsContainer, ".availablePermission");
    for (const permission of permissions) {
        const item = createAvailablePermission(permission);
        addElement(item, permissionsContainer)
    }
}

function createDownloadLink(fileName, fileContents, fileType) {
    const fileData = new Blob([fileContents], { type: fileType });
    const fileURL = window.URL.createObjectURL(fileData);
    return newElement('a', { href: fileURL, download: fileName });
}

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}

var allRoles = [];
var allPermissions = [];
var selectedRolePermissions = [];
var selectedRole;

runLoginProcess(showLoginPage, showMainMenu);