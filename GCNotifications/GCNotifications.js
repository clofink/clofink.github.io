async function getMessages(conversationId, messageIds) {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/conversations/messages/${conversationId}/messages/bulk`;
    const result = await fetch(url, { method: "POST", body: JSON.stringify(messageIds), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    if (!result.ok) {
        throw resultJson.message;
    }
    const resultJson = await result.json();
    log(resultJson);
    return resultJson;
}

async function createChannel() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/notifications/channels`;
    const result = await fetch(url, { method: "POST", headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    if (!result.ok) {
        throw resultJson.message;
    }
    const resultJson = await result.json();
    return resultJson;
}

async function addSubscriptions(channelId, subscriptions) {
    // api/v2/notifications/channels/{channelId}/subscriptions
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/notifications/channels/${channelId}/subscriptions`;
    const result = await fetch(url, { method: "POST", body: JSON.stringify(subscriptions), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    if (!result.ok) {
        throw resultJson.message;
    }
    const resultJson = await result.json();
    return resultJson;
}

window.allMessageIds = [];
window.conversationId;

async function run() {
    const userId = eById('userId').value;
    const newChannel = await createChannel();
    const socketConnection = new WebSocket(newChannel.connectUri);
    socketConnection.onopen = (event) => {
        log(event.data || "");
    }
    socketConnection.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.topicName !== topicName) return;
        log(message || "");
    }
    socketConnection.onerror = (event) => {
        log(event.data || "");
    }

    // const topicName = `v2.users.${userId}.conversations.messages`
    const topicName = `v2.flows.${userId}`

    // await addSubscriptions(newChannel.id, [{id: `v2.users.${userId}.conversations`}]);
    await addSubscriptions(newChannel.id, [{id: topicName}]);
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

function showMainMenu() {
    const page = eById('page');
    clearElement(page);
    const inputs = newElement("div", { id: "inputs" });
    const userIdLabel = newElement('label', { innerText: "User ID: " });
    const userIdInput = newElement('input', { id: "userId", value: "7d92d64c-4b62-4c42-9faa-ef6d5d6456d1" });
    addElement(userIdInput, userIdLabel);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", run);
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" });

    addElement(userIdLabel, inputs)
    addElements([inputs, startButton, logoutButton, results], page);

    getOrgDetails().then(function (result) {
        if (result.status !== 200) {
            log(result.message, "error");
            logout();
            return;
        }
        window.orgName = result.name;
        window.orgId = result.id;
        eById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName})\nCurrent Org ID: ${result.id}`
    }).catch(function (error) { log(error, "error"); logout(); });
}

function login() {
    window.localStorage.setItem('environment', qs('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${qs('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    eById('header').innerText = `Current Org Name: \nCurrent Org ID:`;
    showLoginPage();
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function storeToken(token) {
    window.localStorage.setItem('auth', token);
}

function getToken() {
    if (window.localStorage.getItem('auth')) {
        return window.localStorage.getItem('auth');
    }
    return '';
}

async function getOrgDetails() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/organizations/me`;
    const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    resultJson.status = result.status;
    return resultJson;
}

var tabs = [];
var fileContents;

if (window.location.hash) {
    storeToken(getParameterByName('access_token'));
    let now = new Date().valueOf();
    let expireTime = parseInt(getParameterByName('expires_in')) * 1000;
    log(new Date(now + expireTime));
    location.hash = ''
}
if (!getToken()) {
    showLoginPage();
}
else {
    showMainMenu();
}

function timeDiff(firstTime, secondTime) {
    firstTime = new Date(firstTime);
    secondTime = new Date(secondTime);
    return firstTime - secondTime;
}
function formattedForDisplay(seconds) {
    var sec_num = parseInt(seconds, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":")
}

function createFieldOptions() {
    const fieldOptionContainer = newElement('div', { class: ["fieldOption"] });
    const removeButton = newElement("button", { innerText: "x", title: "Remove Field" });
    registerElement(removeButton, "click", () => { if (qsa(".fieldOption", fieldOptionContainer.parent).length === 1) return; fieldOptionContainer.remove() });
    const levelSelector = newElement("select", { class: ["fieldLevel"] });
    for (let level of ["Conversation", "Participant", "Session", "Segment"]) {
        const levelOption = newElement("option", { value: level, innerText: level });
        addElement(levelOption, levelSelector);
    }
    const addFieldButton = newElement("button", { innerText: "+", title: "Add Field Below" });
    registerElement(addFieldButton, "click", () => { addElement(createFieldOptions(), fieldOptionContainer, "afterend") });

    const fieldSelector = newElement("select", { class: ["fieldType"] });
    populateFieldSelector(fieldSelector, "Conversation");

    const customInput = newElement("input", { class: ["customPath"] });
    registerElement(levelSelector, "change", () => { customInput.remove(); clearElement(fieldSelector); populateFieldSelector(fieldSelector, levelSelector.value) });
    registerElement(fieldSelector, "change", () => { if (fieldSelector.value === "custom") { addElement(customInput, fieldSelector, "afterend") } else { customInput.remove(); } })

    addElements([levelSelector, fieldSelector, removeButton, addFieldButton], fieldOptionContainer);
    return fieldOptionContainer;
}

function populateFieldSelector(selector, level) {
    for (let field of fields[level]) {
        const option = newElement("option", { value: field.path, innerText: field.name });
        if (field.hasOwnProperty("mapping")) option.setAttribute("data-mapping-name", field.mapping);
        addElement(option, selector)
    }
    const option = newElement("option", { value: "custom", innerText: "Custom" });
    addElement(option, selector);
}

function createDownloadLink(fileName, fileContents, fileType) {
    const fileData = new Blob([fileContents], { type: fileType });
    const fileURL = window.URL.createObjectURL(fileData);
    return newElement('a', { href: fileURL, download: fileName });
}

async function showLoading(loadingFunc) {
    eById("loadIcon").classList.add("shown");
    try {
        await loadingFunc();
    }
    catch(error) {
        console.error(error);
    }
    eById("loadIcon").classList.remove("shown");
}