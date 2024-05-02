class BotSession {
    sessionId;
    previousTurnId;

    constructor(botFlowId) {
        this.botFlowId = botFlowId;
    }

    async createSession() {
        // /api/v2/textbots/botflows/sessions POST
        const body = {
            "channel": {
                "inputModes": ["Text"],
                "outputModes": ["Text"],
                "name": "Messaging",
                "userAgent": { "name": "GenesysWebWidget" }
            },
            "externalSessionId": "",
            "flow": {
                "id": this.botFlowId
            },
            "inputData": {
                "variables": {}
            },
            "language": ""
        }
    
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/textbots/botflows/sessions`;
        const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        this.sessionId = resultJson.id;
        return resultJson;
    }

    async sendTurnEvent(message, inputEventType) {
        // /api/v2/textbots/botflows/sessions/{sessionId}/turns POST
        if (!this.sessionId) throw `Session not created`;
        const body = {
            "inputEventUserInput": {
                "mode": "Text",
                "alternatives": [
                    {
                        "transcript": {
                            "text": message
                        }
                    }
                ]
            },
            "previousTurn": this.previousTurnId ? {"id": this.previousTurnId} : null,
            "inputEventType": inputEventType
        }
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/textbots/botflows/sessions/${this.sessionId}/turns`;
        const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        this.previousTurnId = resultJson.id;
        return resultJson;
    }
}

function parseTestCase(testCase) {
    // how to structure them
    // with commands
    // startInteraction, sendMessage
    // and an expectation (what gets returned) (a list, in order);
    const tests = [
        {
            "name": "First Test",
            "commands": [
                {
                    "action": "start",
                    "expects": [
                        {}
                    ]
                }
            ]
        }
    ]
}

function recordAsTestCase() {
    // creates a test case based on the inputs/results
}

function runTest(test) {

}

async function run() {
    const selectedFlow = eById('botFlow').value;
    const botSession = new BotSession(selectedFlow);
    await botSession.createSession();

    const messageContainer = eById('messageContainer');
    const messagesContainer = newElement("div", {class: ["messages-container"]});
    addElement(messagesContainer, messageContainer);

    const inputField = newElement('input');
    const button = newElement('button', {innerText: "Send"});
    registerElement(button, 'click', () => {sendTurnEvent(inputField.value, "UserInput"); inputField.value = ""});
    addElements([messagesContainer, inputField, button], messageContainer);

    sendTurnEvent("", "NoOp"); // to start the session

    function createMessageRow(message, sender) {
        const messageRow = newElement('div', {class: ["message-row"]});
        const messageBubble = newElement('div', {class: ["message-bubble", sender]});
        const messageContent = createMessageContent(message, sender);
        addElement(messageContent, messageBubble);
        addElement(messageBubble, messageRow);
        addElement(messageRow, messagesContainer);
        messageRow.scrollIntoView({behavior: "smooth"});
        return messageRow
    }

    function createMessageContent(message, sender) {
        const messageContent = newElement('div', {class: ["message-content", sender]});
        if (message?.prompts?.textPrompts?.segments) {
            for (let prompt of message.prompts.textPrompts.segments) {
                switch (prompt.type) {
                    case "Text":
                        addElement(createMessage(prompt), messageContent);
                        break;
                    case "RichMedia":
                        addElement(createQuickButtons(prompt), messageContent);
                        break;
                    default:
                        log(`Unknown message prompt type [${prompt.type}]`, "warn");
                }
            }
        }
        else if (message?.text) {
            addElement(createMessage(message), messageContent);
        }
        return messageContent;
    }

    function handleResponse(message) {
        createMessageRow(message, "bot");
        if (message.nextActionDisconnect) {
            createMessageRow({text: `Bot disconnected [${message.nextActionDisconnect.reason}] in [${message.nextActionDisconnect.flowLocation.sequenceName}] from block [${message.nextActionDisconnect.flowLocation.actionNumber} ${message.nextActionDisconnect.flowLocation.actionName}]${message.nextActionDisconnect.reasonExtendedInfo ? ` with reason: [${message.nextActionDisconnect.reasonExtendedInfo}]`: ""}`}, "system");
        }
        if (message.nextActionExit) {
            createMessageRow({text: `Bot disconnected [${message.nextActionExit.reason}] in [${message.nextActionExit.flowLocation.sequenceName}] from block [${message.nextActionExit.flowLocation.actionNumber} ${message.nextActionExit.flowLocation.actionName}]${message.nextActionExit.reasonExtendedInfo ? ` with reason: [${message.nextActionExit.reasonExtendedInfo}]`: ""}`}, "system");
        }
        if (message.nextActionType === "NoOp") {
            botSession.sendTurnEvent("", "NoOp");
        }
    }

    function createMessage(prompt) {
        const message = newElement('div', {innerText: prompt.text});
        return message;
    }
    
    function createQuickButtons(prompt) {
        const buttonContainer = newElement('div', {class: ['button-container']});
        for (let option of prompt.content) {
            if (option.contentType !== "QuickReply") {
                log(`Unhandled option type [${option.contentType}]`, "warn");
                continue;
            }
            const quickButton = newElement("button", {innerText: option.quickReply.text, class: ["quickReply"]});
            registerElement(quickButton, "click", () => {sendTurnEvent(option.quickReply.payload, "UserInput")});
            addElement(quickButton, buttonContainer);
        }
        return buttonContainer;
    }

    async function sendTurnEvent(message, inputEventType) {
        if (message) {
            qs(".button-container")?.remove();
            createMessageRow({text: message}, "visitor");
        }
        const resultJson = await botSession.sendTurnEvent(message, inputEventType);
        handleResponse(resultJson);
        return resultJson;
    }
}

async function getBots() {
    // https://api.usw2.pure.cloud/api/v2/flows?includeSchemas=true&nameOrDescription=&sortBy=name&sortOrder=asc&pageNumber=1&pageSize=50&type=digitalbot
    const bots = await getAll("/api/v2/flows?sortBy=name&sortOrder=asc&type=digitalbot", "entities", 50);
    return bots;
}

function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud", "inintca.com"]
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
    const botSelectLabel = newElement('label', { innerText: "Bot Flow: "});
    const botSelect = newElement('select', {id: "botFlow"});
    addElement(botSelect, botSelectLabel);
    addElement(botSelectLabel, inputs);

    const messageContainer = newElement('div', {id: "messageContainer"});

    const startButton = newElement('button', {innerText: "Start"});
    registerElement(startButton, "click", () => {clearElement(messageContainer); run();});
    showLoading(async () => {await populateBotList(botSelect)});

    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    addElements([inputs, startButton, logoutButton, messageContainer], page);
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

async function populateBotList(select) {
    const bots = await getBots();
    for (let bot of bots) {
        const botOption = newElement("option", {innerText: bot.name, value: bot.id});
        addElement(botOption, select);
    }
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

async function showLoading(loadingFunc) {
    eById("loadIcon").classList.add("shown");
    try {
        await loadingFunc();
    }
    catch (error) {
        console.error(error);
    }
    eById("loadIcon").classList.remove("shown");
}

async function getAll(path, resultsKey, pageSize) {
    const items = [];
    let pageNum = 0;
    let totalPages = 1;

    while (pageNum < totalPages) {
        pageNum++;
        const url = `https://api.${window.localStorage.getItem('environment')}${path}&pageNumber=${pageNum}&pageSize=${pageSize}`;
        const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        else {
            throw resultJson.message;
        }
        items.push(...resultJson[resultsKey]);
        totalPages = resultJson.pageCount;
    }
    return items;
}
