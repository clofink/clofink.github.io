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

async function runTests(tests) {
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
                        {
                            "type": "message",
                            "content": "Welcome message 1"
                        },
                        {
                            "type": "message",
                            "content": "What would you like to do?"
                        },
                        {
                            "type": "quickReplies",
                            "content": [
                                "Entity Article",
                                "Schedule Callback",
                                "Test Invalid JSON",
                                "Test Quick Options",
                                "Transcript Test",
                                "Timezone Test"
                            ]
                        }
                    ]
                },
                {
                    "action": "sendMessage",
                    "message": "Test Quick Options",
                    "expects": [
                        {
                            "type": "message",
                            "content": "Here"
                        },
                        {
                            "type": "message",
                            "content": "Value is:"
                        },
                        {
                            "type": "message",
                            "content": "What is the value?"
                        },
                    ]
                }
            ]
        }
    ]
    for (let test of tests) {
        try {
            await runTest(test);
            log(`Test [${test.name}] succeeded`);
        }
        catch(error) {
            log(`Test [${test.name}] failed with error [${error}]`,'warn');
        }
    }
}

function recordAsTestCase() {
    // creates a test case based on the inputs/results
}

async function runTest(testCase) {
    const selectedFlow = eById('botFlow').value;
    const botSession = new BotSession(selectedFlow);
    await botSession.createSession();

    for (let command of testCase.commands) {
        switch (command.action) {
            case "start": {
                let result = await repeatUntilInput("", "NoOp");
                compareResultToExpected(result, command.expects);
                break;
            }
            case "sendMessage": {
                let result = await repeatUntilInput(command.message, "UserInput");
                compareResultToExpected(result, command.expects);
                break;
            }
            default:
                log(`Unsupported command action [${command.action}]`, "warn");
                break;
        }
    }
    return "Success"

    async function repeatUntilInput(firstMessage, messageType) {
        let result = await botSession.sendTurnEvent(firstMessage, messageType);
        while (result.nextActionType === "NoOp") {
            const previousSegments = result?.prompts?.textPrompts?.segments || [];
            result = await botSession.sendTurnEvent("", "NoOp");
            const newSegments = result?.prompts?.textPrompts?.segments || [];
            result.prompts.textPrompts.segments = previousSegments.concat(newSegments);
        }
        return result;
    }
}


function compareResultToExpected(result, expected) {
    log(result);
    const messages = result?.prompts?.textPrompts?.segments
    if (!messages || messages.length < 1) throw `Expected [${expected.length}] but got no response`;
    for (let i = 0; i < expected.length; i++) {
        const expectation = expected[i];
        const currentMessage = messages[i];
        if (!currentMessage) throw `Expected ["${expectation.content}"] but got no message`;
        switch (expectation.type) {
            case "message": {
                if (currentMessage.type === "Text" && currentMessage.text === expectation.content) continue;
                throw `Expected ["${expectation.content}"] but got ["${currentMessage.text}"]`;
            }
            case "quickReplies": {
                if (currentMessage.type === "RichMedia") {
                    if (!Array.isArray(expectation.content)) throw `Bad expectation: [content] for quickReplies must be a list`;
                    for (let t = 0; t < expectation.content.length; t++) {
                        const expectedButtonText = expectation.content[t];

                        if (!currentMessage.content[t]) throw `Expected QuickReply but got none`;
                        if (currentMessage.content[t].contentType !== "QuickReply") throw `Expected QuickReply [${expectedButtonText}] but got [${currentMessage.content[t].contentType}]`
                        if (expectedButtonText === currentMessage.content[t].quickReply.text) continue;
                        throw `Expected ["${expectedButtonText}"] but got ["${currentMessage.content[t].quickReply.text}"]`;
                    }
                    if (currentMessage.content.length > expectation.content.length) throw `Received more [${currentMessage.content.length}] QuickReplies than expected [${expectation.content.length}]`
                }
                else {
                    throw `Expected [RichMedia] but got [${currentMessage.type}]`;
                }
                break;
            }
            default:
                log(`Unsuported expectation type [${expectation.type}]`, "warn");
                break;
        }
    }
    if (messages.length > expected.length) throw `Received more [${messages.length}] messages than expected [${expected.length}]`;
    return true;
}

window.test = [];

async function run() {
    let currentItem = {"expects": []};
    const selectedFlow = eById('botFlow').value;
    const botSession = new BotSession(selectedFlow);
    await botSession.createSession();

    const messageContainer = eById('messageContainer');
    const messagesContainer = newElement("div", {class: ["messages-container"]});
    addElement(messagesContainer, messageContainer);

    const inputField = newElement('input');
    const button = newElement('button', {innerText: "Send"});
    inputField.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            button.click();
        }
    });
    registerElement(button, 'click', () => {window.test.push(currentItem); currentItem = {"action": "sendMessage", "message": inputField.value, "expects": []}; sendTurnEvent(inputField.value, "UserInput"); inputField.value = ""});
    addElements([messagesContainer, inputField, button], messageContainer);

    sendTurnEvent("", "NoOp"); // to start the session
    currentItem.action = "start";


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
                        currentItem.expects.push({"type": "message", "content": prompt.text})
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
            disableInputs();
        }
        if (message.nextActionExit) {
            createMessageRow({text: `Bot disconnected [${message.nextActionExit.reason}] in [${message.nextActionExit.flowLocation.sequenceName}] from block [${message.nextActionExit.flowLocation.actionNumber} ${message.nextActionExit.flowLocation.actionName}]${message.nextActionExit.reasonExtendedInfo ? ` with reason: [${message.nextActionExit.reasonExtendedInfo}]`: ""}`}, "system");
            disableInputs();
        }
        if (message.nextActionType === "NoOp") {
            sendTurnEvent("", "NoOp");
        }
    }

    function disableInputs() {
        inputField.setAttribute("disabled", true);
        button.setAttribute("disabled", true);
    }

    function createMessage(prompt) {
        const message = newElement('div', {innerText: prompt.text});
        return message;
    }
    
    function createQuickButtons(prompt) {
        const buttonContainer = newElement('div', {class: ['button-container']});
        const buttonTexts = [];
        for (let option of prompt.content) {
            if (option.contentType === "Attachment") {
                currentItem.expects.push({"type": "image", "content": option.attachment.url});
                return newElement('img', {src: option.attachment.url});
            }
            if (option.contentType !== "QuickReply") {
                log(`Unhandled option type [${option.contentType}]`, "warn");
                continue;
            }
            const quickButton = newElement("button", {innerText: option.quickReply.text, class: ["quickReply"]});
            buttonTexts.push(option.quickReply.text);
            registerElement(quickButton, "click", () => {window.test.push(currentItem); currentItem = {"action": "sendMessage", "message": option.quickReply.payload, "expects": []}; sendTurnEvent(option.quickReply.payload, "UserInput")});
            addElement(quickButton, buttonContainer);
        }
        if (buttonTexts.length > 0) currentItem.expects.push({"type": "quickReplies", "content": buttonTexts})
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
    const bots = await getAll("/api/v2/flows?sortBy=name&sortOrder=asc&type=digitalbot&includeSchemas=true", "entities", 50);
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
