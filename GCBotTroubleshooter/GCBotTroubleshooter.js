window.tests = [];
window.flows;

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
            "previousTurn": this.previousTurnId ? { "id": this.previousTurnId } : null,
            "inputEventType": inputEventType
        }
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/textbots/botflows/sessions/${this.sessionId}/turns`;
        const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        this.previousTurnId = resultJson.id;
        return resultJson;
    }
}

class TestBotTab extends Tab {
    tabName = "Test Bot";
    currentTest = [];
    currentItem = {};

    render() {
        this.container = newElement('div');
        const inputs = newElement("div", { id: "inputs" });
        const botSelectLabel = newElement('label', { innerText: "Bot Flow: " });
        const botSelect = newElement('select', { id: "botFlow" });
        addElement(botSelect, botSelectLabel);
        addElement(botSelectLabel, inputs);

        const messageContainer = newElement('div', { id: "messageContainer" });

        const startButton = newElement('button', { innerText: "Start" });
        function startFunc() {
            clearElement(messageContainer);
            this.run();
        }
        registerElement(startButton, "click", startFunc.bind(this));
        showLoading(async () => { await populateBotList(botSelect) });

        const logoutButton = newElement('button', { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);

        const showTestButton = newElement('button', { innerText: "Save Test" });
        function saveTestFunc() {
            if (this.currentItem) this.currentTest.push(this.currentItem);
            window.tests.push({ name: "", commands: this.currentTest });
            this.currentTest = [];
        }
        registerElement(showTestButton, "click", saveTestFunc.bind(this));

        const runTestsButton = newElement('button', { innerText: "Run Tests" });
        registerElement(runTestsButton, "click", this.runTests.bind(this));

        addElements([inputs, startButton, logoutButton, showTestButton, runTestsButton, messageContainer], this.container);

        return this.container;
    }

    async runTests() {
        for (let test of window.tests) {
            try {
                await this.runTest(test);
                log(`Test [${test.name}] succeeded`);
            }
            catch (error) {
                log(`Test [${test.name}] failed with error [${error}]`, 'warn');
            }
        }
    }

    async runTest(testCase) {
        const selectedFlow = eById('botFlow').value;
        const botSession = new BotSession(selectedFlow);
        await botSession.createSession();

        for (let command of testCase.commands) {
            switch (command.action) {
                case "start": {
                    let result = await repeatUntilInput("", "NoOp");
                    this.compareResultToExpected(result, command.expects);
                    break;
                }
                case "sendMessage": {
                    let result = await repeatUntilInput(command.message, "UserInput");
                    this.compareResultToExpected(result, command.expects);
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


    compareResultToExpected(result, expected) {
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

    createMessageRow(message, sender) {
        const messageRow = newElement('div', { class: ["message-row"] });
        const messageBubble = newElement('div', { class: ["message-bubble", sender] });
        const messageContent = this.createMessageContent(message, sender);
        addElement(messageContent, messageBubble);
        addElement(messageBubble, messageRow);
        addElement(messageRow, this.messagesContainer);
        messageRow.scrollIntoView();
        return messageRow
    }

    createMessageContent(message, sender) {
        const messageContent = newElement('div', { class: ["message-content", sender] });
        if (message?.prompts?.textPrompts?.segments) {
            for (let prompt of message.prompts.textPrompts.segments) {
                switch (prompt.type) {
                    case "Text":
                        this.currentItem.expects.push({ "type": "message", "content": prompt.text })
                        addElement(this.createMessage(prompt), messageContent);
                        break;
                    case "RichMedia":
                        addElement(this.createQuickButtons(prompt), messageContent);
                        break;
                    default:
                        log(`Unknown message prompt type [${prompt.type}]`, "warn");
                }
            }
        }
        else if (message?.text) {
            addElement(this.createMessage(message), messageContent);
        }
        return messageContent;
    }

    handleResponse(message) {
        this.createMessageRow(message, "bot");
        if (message.nextActionDisconnect) {
            this.createMessageRow({ text: `Bot disconnected [${message.nextActionDisconnect.reason}] in [${message.nextActionDisconnect.flowLocation.sequenceName}] from block [${message.nextActionDisconnect.flowLocation.actionNumber} ${message.nextActionDisconnect.flowLocation.actionName}]${message.nextActionDisconnect.reasonExtendedInfo ? ` with reason: [${message.nextActionDisconnect.reasonExtendedInfo}]` : ""}` }, "system");
            this.disableInputs();
        }
        if (message.nextActionExit) {
            this.createMessageRow({ text: `Bot disconnected [${message.nextActionExit.reason}] in [${message.nextActionExit.flowLocation.sequenceName}] from block [${message.nextActionExit.flowLocation.actionNumber} ${message.nextActionExit.flowLocation.actionName}]${message.nextActionExit.reasonExtendedInfo ? ` with reason: [${message.nextActionExit.reasonExtendedInfo}]` : ""}` }, "system");
            this.disableInputs();
        }
        if (message.nextActionType === "NoOp") {
            this.sendTurnEvent("", "NoOp");
        }
    }

    disableInputs() {
        this.inputField.setAttribute("disabled", true);
        this.button.setAttribute("disabled", true);
    }

    createMessage(prompt) {
        const message = newElement('div', { innerText: prompt.text });
        return message;
    }

    async run() {
        this.currentItem = { "expects": [] };
        const selectedFlow = eById('botFlow').value;
        this.botSession = new BotSession(selectedFlow);
        await this.botSession.createSession();

        const messageContainer = eById('messageContainer');
        this.messagesContainer = newElement("div", { class: ["messages-container"] });
        addElement(this.messagesContainer, messageContainer);

        this.inputField = newElement('input');
        this.button = newElement('button', { innerText: "Send" });
        function keyPressFunc(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                this.button.click();
            }
        }
        this.inputField.addEventListener("keyup", keyPressFunc.bind(this));
        function sendFunc() {
            this.currentTest.push(this.currentItem);
            this.currentItem = { "action": "sendMessage", "message": this.inputField.value, "expects": [] };
            this.sendTurnEvent(this.inputField.value, "UserInput");
            this.inputField.value = "";
        }
        registerElement(this.button, 'click', sendFunc.bind(this));
        addElements([this.messagesContainer, this.inputField, this.button], messageContainer);

        this.sendTurnEvent("", "NoOp"); // to start the session
        this.currentItem.action = "start";
    }

    createQuickButtons(prompt) {
        const buttonContainer = newElement('div', { class: ['button-container'] });
        const buttonTexts = [];
        for (let option of prompt.content) {
            if (option.contentType === "Attachment") {
                this.currentItem.expects.push({ "type": "image", "content": option.attachment.url });
                return newElement('img', { src: option.attachment.url });
            }
            if (option.contentType !== "QuickReply") {
                log(`Unhandled option type [${option.contentType}]`, "warn");
                continue;
            }
            const quickButton = newElement("button", { innerText: option.quickReply.text, class: ["quickReply"] });
            buttonTexts.push(option.quickReply.text);
            function buttonFunc() {
                this.currentTest.push(this.currentItem);
                this.currentItem = { "action": "sendMessage", "message": option.quickReply.payload, "expects": [] };
                this.sendTurnEvent(option.quickReply.payload, "UserInput");
            }
            registerElement(quickButton, "click", buttonFunc.bind(this));
            addElement(quickButton, buttonContainer);
        }
        if (buttonTexts.length > 0) this.currentItem.expects.push({ "type": "quickReplies", "content": buttonTexts })
        return buttonContainer;
    }

    async sendTurnEvent(message, inputEventType) {
        if (message) {
            qs(".button-container")?.remove();
            this.createMessageRow({ text: message }, "visitor");
        }
        const resultJson = await this.botSession.sendTurnEvent(message, inputEventType);
        this.handleResponse(resultJson);
        return resultJson;
    }
}

class TestCreationTab extends Tab {
    tabName = "Create Tests";

    // maybe make this paged, so each test is its own page?
    // use a lot of the same logic as PagedTable
    // need to capture the current test in json before page change
    // then recreate from the json in a stored list based on the current index
    render() {
        this.container = newElement('div');
        const pageRenderer = this.pageRenderer.bind(this);
        const pageLeave = this.pageLeave.bind(this);
        this.pageModel = new PagedView(window.tests, pageRenderer, pageLeave);
        window.pages = this.pageModel;
        const logoutButton = newElement('button', { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        addElements([logoutButton, this.pageModel.getContainer()], this.container);
        return this.container;
    }
    pageRenderer(testInfo) {
        const testsContainer = newElement("div", { class: ['tests-container'] });
        addElement(this.addTest(testInfo), testsContainer);
        return testsContainer;
    }

    parseTestFromPage() {
        const test = { name: qs(".test-container input", this.pageModel.getContainer()).value, commands: [] };
        const actionsElems = qsa(".actions-container", this.pageModel.getContainer());
        for (let actionsElem of actionsElems) {
            const actionElems = qsa(".action-container", actionsElem);
            for (let actionElem of actionElems) {
                const action = {};
                action.action = qs("select", actionElem).value;
                const messageElem = qs("input", actionElem);
                if (messageElem) action.message = messageElem.value;
                action.expects = [];
                const expectationsElems = qsa(".expectations-container", actionElem);
                for (let expectationsElem of expectationsElems) {
                    const expectationElems = qsa(".expectation-container", expectationsElem);
                    for (let expectationElem of expectationElems) {
                        const expectation = {};
                        expectation.type = qs("select", expectationElem).value;
                        const messageElem = qs('input', expectationElem);
                        if (messageElem) expectation.content = messageElem.value;
                        action.expects.push(expectation);
                    }
                }
                test.commands.push(action);
            }
        }
        return test;
    }

    pageLeave() {
        const pageInfo = this.parseTestFromPage();
        this.pageModel.updatePageData(pageInfo);
    }

    addTest(test) {
        test = test || {};
        const testContainer = newElement('div', { class: ["test-container"] });
        const nameLabel = newElement('label', { innerText: "Test Name: " });
        const nameInput = newElement('input', { value: test.name ? test.name : "" });
        addElement(nameInput, nameLabel);
        const actionsContainer = newElement('div', { class: ["actions-container"] });
        if (test.commands && test.commands.length > 0) {
            for (let command of test.commands) {
                addElement(this.addAction(command), actionsContainer);
            }
        }
        else {
            addElement(this.addAction(), actionsContainer);
        }
        const removeButton = this.createRemoveButton(testContainer, ".tests-container");
        const addTestBelowButton = this.createAddBelowButton(testContainer, this.addTest);

        addElements([nameLabel, removeButton, addTestBelowButton, actionsContainer], testContainer);
        return testContainer;
    }
    addAction(action) {
        action = action || {};
        const actionContainer = newElement('div', { class: ['action-container'] });
        const actionList = ["start", "sendMessage"];
        const actionSelect = newElement('select');
        for (let action of actionList) {
            const actionOption = newElement('option', { innerText: action, value: action });
            addElement(actionOption, actionSelect);
        }
        if (action.action) actionSelect.value = action.action;
        function selectChange() {
            const existingInput = qs(".action-message-input", actionContainer);
            existingInput?.remove();
            if (actionSelect.value === "sendMessage") {
                const newLabel = newElement('label', { innerText: "Message Text: ", class: ["action-message-input"] });
                const newInput = newElement('input', { value: action.message ? action.message : "" });
                addElement(newInput, newLabel);
                addElement(newLabel, actionSelect, "afterend")
            }
        }
        registerElement(actionSelect, 'change', selectChange);
        const removeButton = this.createRemoveButton(actionContainer, ".actions-container");
        const addActionBelowButton = this.createAddBelowButton(actionContainer, this.addAction);

        const expectationsContainer = newElement('div', { class: ['expectations-container'] });
        if (action.expects && action.expects.length > 0) {
            for (let expectation of action.expects) {
                addElement(this.addExpectation(expectation), expectationsContainer);
            }
        }
        else {
            addElement(this.addExpectation(), expectationsContainer);
        }
        addElements([actionSelect, removeButton, addActionBelowButton, expectationsContainer], actionContainer);
        actionSelect.dispatchEvent(new Event("change"));
        return actionContainer;
    }
    addExpectation(expects) {
        expects = expects || {};
        const expectationContainer = newElement('div', { class: ['expectation-container'] })
        const expectationTypeList = ["message", "image", "quickReplies"];
        const expectationSelect = newElement('select');
        for (let expectation of expectationTypeList) {
            const expectationOption = newElement('option', { innerText: expectation, value: expectation });
            addElement(expectationOption, expectationSelect);
        }
        if (expects.type) expectationSelect.value = expects.type;
        function selectChange() {
            qs(".expectation-message-input", expectationContainer)?.remove();
            qs(".buttons-container", expectationContainer)?.remove();
            if (expectationSelect.value === "message") {
                const newLabel = newElement('label', { innerText: "Message Text: ", class: ["expectation-message-input"] });
                const newInput = newElement('input', { value: expects.content ? expects.content : "" });
                addElement(newInput, newLabel);
                addElement(newLabel, expectationSelect, "afterend");
            }
            else if (expectationSelect.value === "image") {
                const newLabel = newElement('label', { innerText: "Image URL: ", class: ["expectation-message-input"] });
                const newInput = newElement('input', { value: expects.content ? expects.content : "" });
                addElement(newInput, newLabel);
                addElement(newLabel, expectationSelect, "afterend");
            }
            else if (expectationSelect.value === "quickReplies") {
                const buttonsContainer = newElement('div', { class: ["buttons-container"] });
                if (expects.type === "quickReplies" && expects.content && expects.content.length > 0) {
                    for (let button of expects.content) {
                        addElement(this.addQuickButton(button), buttonsContainer);
                    }
                }
                else {
                    addElement(this.addQuickButton(), buttonsContainer);
                }
                addElement(buttonsContainer, expectationSelect, "afterend");
            }
        }
        registerElement(expectationSelect, 'change', selectChange.bind(this));

        const removeButton = this.createRemoveButton(expectationContainer, ".expectations-container");
        const addExpectationBelowButton = this.createAddBelowButton(expectationContainer, this.addExpectation);

        addElements([expectationSelect, removeButton, addExpectationBelowButton], expectationContainer);
        expectationSelect.dispatchEvent(new Event("change"));
        return expectationContainer;
    }

    addQuickButton(button) {
        const buttonElem = newElement('input', { class: ["quickReply-text"], value: button ? button : "" });
        return buttonElem;
    }

    createRemoveButton(container, containerSelector) {
        const removeButton = newElement('button', { innerText: "x" });
        registerElement(removeButton, "click", () => { if (container.closest(containerSelector).children.length === 1) return; container.remove() });
        return removeButton;
    }
    createAddBelowButton(container, addFunc) {
        const addBelowButton = newElement('button', { innerText: "+" });
        function addBelowFunc() {
            addElement(addFunc.bind(this)(), container, "afterend")
        }
        registerElement(addBelowButton, "click", addBelowFunc.bind(this));
        return addBelowButton;
    }
}

async function getDigitalBotFlows() {
    // https://api.usw2.pure.cloud/api/v2/flows?includeSchemas=true&nameOrDescription=&sortBy=name&sortOrder=asc&pageNumber=1&pageSize=50&type=digitalbot
    return getAll("/api/v2/flows?type=digitalbot&includeSchemas=true", "entities", 50);
}

async function getByobIntegrations() {
    const integrations = await getAll("/api/v2/integrations?pageNumber=1&pageSize=100&sortBy=name&sortOrder=ASC", "entities", 50);
    return integrations.filter((e) => e.integrationType.id === "genesys-byob");
}

async function getBotFlows() {
    return getAll("/api/v2/flows?type=bot&includeSchemas=true", "entities", 50);
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
    const tabContainer = new TabContainer([
        new TestBotTab(),
        new TestCreationTab(),
    ]);
    addElement(tabContainer.getTabContainer(), page);

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
    if (!window.flows) {
        const digitalBots = await getDigitalBotFlows();
        const bots = await getBotFlows();
        const byobs = await getByobIntegrations();
        window.flows = [...digitalBots, ...bots, ...byobs];
        window.flows.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
    }
    console.log(window.flows);
    for (let bot of window.flows) {
        const botOption = newElement("option", { innerText: bot.name, value: bot.id });
        addElement(botOption, select);
    }
}

// GENERATING CODE VERIFIER
function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}

function generateCodeVerifier() {
    var array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
}

function sha256(plain) {
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
    var str = "";
    var bytes = new Uint8Array(a);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function generateCodeChallengeFromVerifier(v) {
    var hashed = await sha256(v);
    var base64encoded = base64urlencode(hashed);
    return base64encoded;
}

// function login() {
//     window.localStorage.setItem('environment', qs('[name="environment"]').value);
//     window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${qs('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
// }

function logout() {
    window.flows = undefined;
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    window.localStorage.removeItem("clientId");
    window.localStorage.removeItem("redirectUri");
    window.localStorage.removeItem("codeChallenge");
    window.localStorage.removeItem("codeVerifier");
    eById('header').innerText = `Current Org Name: \nCurrent Org ID:`;
    showLoginPage();
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

async function login() {
    const environment = storeAndReturnValue("environment", qs('[name="environment"]').value);
    const clientId = storeAndReturnValue("clientId", qs('[name="clientId"]').value);
    const redirectUri = storeAndReturnValue("redirectUri", location.origin + location.pathname);
    const codeVerifier = storeAndReturnValue("codeVerifier", generateCodeVerifier());
    const codeChallenge = storeAndReturnValue("codeChallenge", await generateCodeChallengeFromVerifier(codeVerifier));
    window.localStorage.setItem('environment', environment);
    window.location.replace(`https://login.${environment}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`);
}

function storeAndReturnValue (key, value) {
    if (window.localStorage.getItem(key)) return window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
    return value;
}

async function getAuthToken() {
    const url = `https://login.${window.localStorage.getItem('environment')}/oauth/token`;
    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("code", window.localStorage.getItem("auth")); // auth code
    formData.append("redirect_uri", window.localStorage.getItem("redirectUri"));
    formData.append("client_id", window.localStorage.getItem("clientId"));
    formData.append("code_verifier", window.localStorage.getItem("codeVerifier"));
    formData.append("code_challenge_method", "S256");
    const result = await fetch(url, { method: "POST", body: formData });
    const resultJson = await result.json();
    return resultJson;
}

function createUrlEncodedFormBody(obj) {
    var formBody = [];
    for (var property in obj) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    return formBody.join("&");
}

if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    storeToken(searchParams.get("code"));
}
if (!getToken()) {
    showLoginPage();
}
else {
    
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
        const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
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

