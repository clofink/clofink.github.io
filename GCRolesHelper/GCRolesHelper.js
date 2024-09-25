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
    const name = newElement('div', { innerText: permission.name });
    const description = newElement('div', { innerText: permission.description });
    const removeButton = newElement('button', { innerText: "Remove" });
    addElements([name, description, removeButton], currentPermission);
    return currentPermission;
}

function createAvailablePermission(permission) {
    const availablePermission = newElement('div', { class: ["availablePermission"] });
    const name = newElement('div', { innerText: permission.name });
    const description = newElement('div', { innerText: permission.description });
    const addButton = newElement('button', { innerText: "Add" });
    addElements([name, description, addButton], availablePermission);
    return availablePermission;
}

function createRoleOption(role) {
    const roleOption = newElement('div', { class: ["roleOption"] });
    const nameSpan = newElement('span', { innerText: `${role.default ? "[Default]" : "[Custom]"} ${role.name}\n${role.description}` });
    registerElement(roleOption, "click", () => {
        if (roleOption.classList.contains("selected")) return;
        const allSelected = qsa('#currentRoles .selected');
        for (const selected of allSelected) {
            selected.classList.remove("selected");
        }
        roleOption.classList.add("selected")
        const selectedRole = window.allRoles.find((e) => e.id === role.id);
        const rolePermissions = getPermissionsFromRole(selectedRole);
        populateCurrentPermissions(rolePermissions);
    })
    addElement(nameSpan, roleOption);
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
        nameInput.value = "";
        descriptionInput.value = "";
        window.allRoles.push(newRole);
        populateCurrentRoles(window.allRoles);
    })})
    addElements([div1, div2, div3], addNewRole);
    addElements([globalControls, currentRoles, addNewRole, currentPermissions, availablePermissions], uiContainer);

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
    const sortByName = sortByKey('name', false);
    window.selectedRolePermissions = allPermissions.sort(sortByName);
    return allPermissions;
}

function populateCurrentPermissions(permissions) {
    const currentPermissionContainer = eById("currentPermissions");
    const currentPermissionsHeader = qs(".header", currentPermissionContainer);
    clearElement(currentPermissionContainer, ".currentPermission");
    for (const permission of permissions) {
        const permissionElement = createCurrentPermission(permission);
        addElement(permissionElement, currentPermissionContainer);
    }
    currentPermissionsHeader.innerText = `Current Permissions (${permissions.length})`
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

runLoginProcess(showLoginPage, showMainMenu);