window.storedValues = {};
window.listenedEvents = [];
window.readyPlugins = [];

var allEvents = [
    "Auth.ready",
    "Auth.authenticating",
    "Auth.authenticated",
    "Auth.loggedOut",
    "Auth.authError",
    "Auth.tokenError",
    "Auth.authProviderError",
    "Auth.error",
    "Auth.logoutError",
    "Auth.signInAvailable",
    "Auth.signedIn",
    "Auth.signingIn",
    "Auth.signInFailed",
    "AuthProvider.signedIn",
    "AuthProvider.signInFailed",
    "CobrowseService.ready",
    "CobrowseService.sessionStarted",
    "CobrowseService.sessionEnded",
    "CobrowseService.controlRequested",
    "CobrowseService.controlGranted",
    "CobrowseService.controlRevoked",
    "CobrowseService.navigationRequested",
    "CobrowseService.navigationGranted",
    "CobrowseService.navigationDeclined",
    "CobrowseVoice.error",
    "CobrowseVoice.sessionStarted",
    "CobrowseVoice.sessionEnded",
    "Conversations.ready",
    "Conversations.opened",
    "Conversations.started",
    "Conversations.closed",
    "Conversations.error",
    "Database.ready",
    "Database.updated",
    "Database.removed",
    "Engage.ready",
    "Engage.inviteAccepted",
    "Engage.inviteRejected",
    "Engage.inviteIgnored",
    "Engage.inviteOffered",
    "Engage.inviteError",
    "Journey.ready",
    "Journey.qualifiedWebMessagingOffer",
    "Journey.qualifiedContentOffer",
    "Journey.qualifiedOpenAction",
    "Knowledge.ready",
    "Knowledge.error",
    "KnowledgeService.ready",
    "KnowledgeService.error",
    "KnowledgeService.searchResults",
    "KnowledgeService.noSearchResultsFound",
    "KnowledgeService.suggestions",
    "KnowledgeService.noSuggestionsFound",
    "KnowledgeService.categories",
    "KnowledgeService.noCategoriesFound",
    "KnowledgeService.article",
    "KnowledgeService.noArticleFound",
    "KnowledgeService.articlesByCategory",
    "KnowledgeService.noArticlesByCategoryFound",
    "KnowledgeService.topViewedArticles",
    "KnowledgeService.noTopViewedArticlesFound",
    "KnowledgeService.feedbackSent",
    "Launcher.ready",
    "Launcher.visible",
    "Launcher.hidden",
    "MessagingService.ready",
    "MessagingService.started",
    "MessagingService.sendingMessage",
    "MessagingService.messagesReceived",
    "MessagingService.uploading",
    "MessagingService.uploadApproved",
    "MessagingService.fileUploaded",
    "MessagingService.fileUploadError",
    "MessagingService.fileUploadCancelled",
    "MessagingService.fileReceived",
    "MessagingService.messagesUpdated",
    "MessagingService.fileDownloaded",
    "MessagingService.fileDownloadError",
    "MessagingService.fileDeleted",
    "MessagingService.oldMessages",
    "MessagingService.historyComplete",
    "MessagingService.typingReceived",
    "MessagingService.typingTimeout",
    "MessagingService.clientTypingStarted",
    "MessagingService.restored",
    "MessagingService.sessionCleared",
    "MessagingService.offline",
    "MessagingService.reconnecting",
    "MessagingService.reconnected",
    "MessagingService.conversationDisconnected",
    "MessagingService.readOnlyConversation",
    "MessagingService.conversationReset",
    "MessagingService.conversationCleared",
    "MessagingService.error",
    "MessagingService.cobrowseOffer",
    "MessagingService.cobrowseOfferAccepted",
    "MessagingService.cobrowseOfferRejected",
    "MessagingService.cobrowseOfferExpired",
    "MessagingService.allowedFileTypes",
    "MessagingService.steppedUpConversation",
    "Messenger.ready",
    "Messenger.opened",
    "Messenger.closed",
    "Messenger.cleared",
    "Toaster.ready",
    "Toaster.opened",
    "Toaster.accepted",
    "Toaster.declined",
    "Toaster.closed",
    "Toaster.error",
]

var commandMapping = {
    "Auth.logout": {},
    "Auth.getTokens": {},
    "Auth.refreshToken": {},
    "Auth.reAuthenticate": {},
    "AuthProvider.getAuthCode": {},
    "AuthProvider.reAuthenticate": {},
    "AuthProvider.signIn": {},
    "CobrowseService.acceptSession": {joinCode: ""},
    "CobrowseService.declineSession": {joinCode: "", "session-uuid": ""},
    "CobrowseService.offerState": {joinCode: "", "session-uuid": ""},
    "CobrowseService.stopSession": {},
    "CobrowseService.acceptControl": {},
    "CobrowseService.declineControl": {},
    "CobrowseService.startDrawing": {},
    "CobrowseService.stopDrawing": {},
    "CobrowseService.acceptNavigation": {},
    "CobrowseService.declineNavigation": {},
    "Database.set": {messaging: {customAttributes: {key: "value"}}},
    "Database.update": {messaging: {customAttributes: {key: "value"}}},
    "Database.get": {name: "messaging.customAttributes"},
    "Database.remove": {name: "messaging.customAttributes"},
    "Engage.invite": {engageContent: {offerText: ""}},
    "Engage.accept": {},
    "Engage.reject": {},
    "Journey.pageview": {pageTitle: "", pageLocation: "custom-page-location", customAttributes: {visitorPreferredLang: "en"}, traitsMapper: []},
    "Journey.record": {eventName: "product_added", customAttributes: {price: 15.99, code: "CDE-123", name: "Product", hasBatteries: false}, traitsMapper: []},
    "Journey.formsTrack": {selector: "#registration-form", formName: "user registration", captureFormDataOnAbandon: true, customAttributes: { isVip: true }, traitsMapper: [{ fieldName: "firstName", traitName: "givenName" }, { fieldName: "lastName", traitName: "familyName" }]},
    "Journey.trackClickEvents": {clickEvents: [{selector: "button.green-background", eventName: "green_button_clicked" }, {selector: ".close", eventName: "close_button_clicked" }, {selector: "#sign-up", eventName: "signup_button_clicked", customAttributes: {signUpValue: 2000}}]},
    "Journey.trackIdleEvents": {idleEvents: [{idleAfterSeconds: 30, eventName: "idle_30_seconds" }, {idleAfterSeconds: 90, eventName: "idle_90_seconds", customAttributes: {currentCartValue: 129.99}}]},
    "Journey.trackInViewport": {inViewportEvents: [{selector: ".close-button", eventName: "close_button_shown" }, {selector: "#sign-up", eventName: "signup_button_visible", customAttributes: {signUpValue: 2000}}]},
    "Journey.trackScrollDepth": {scrollDepthEvents: [{percentage: 60, eventName: "scrolled_60_percent" }, {percentage: 90, eventName: "bottom_of_page_reached", customAttributes: {scrollValue: 600}}]},
    "Journey.recordActionStateChange": {actionId: "e74846b2-e74a-4f40-b237-3c197a737994", actionState: "errored", errorCode: "00045", errorMessage: "Configuration not available."},
    "KnowledgeService.search": {"pageSize": 3, "query": "", "queryType": "ManualSearch"},
    "KnowledgeService.getSuggestions": {"pageSize": 3, "query": ""},
    "KnowledgeService.getCategories": {},
    "KnowledgeService.getArticle": {"articleId": "123abcd4-e567-890f-g123-456h789abc0d", "searchId": "123abcd4-e567-890f-g123-456h789abc0d", "queryType": "ManualSearch"},
    "KnowledgeService.getArticlesByCategory": {"categoryId": "123abcd4-e567-890f-g123-456h789abc0d"},
    "KnowledgeService.getTopViewedArticles": {"pageSize": 3},
    "KnowledgeService.sendFeedback": {"documentId": "123abcd4-e567-890f-g123-456h789abc0d", "documentVersionId": "123abcd4-e567-890f-g123-456h789abc0d", "documentVariationId": "123abcd4-e567-890f-g123-456h789abc0d", "rating": "Positive", "searchId": "123abcd4-e567-890f-g123-456h789abc0d", "reason": "SearchResults", "comment": "My comment", "queryType": "ManualSearch"},
    "KnowledgeService.getSession": {},
    "Launcher.show": {},
    "Launcher.hide": {},
    "MessagingService.startConversation": {},
    "MessagingService.sendMessage": {message: ""},
    "MessagingService.requestUpload": {file: []},
    "MessagingService.getFile": {id: ""},
    "MessagingService.refreshFiles": {files: [{id: ""}]},
    "MessagingService.downloadFile": {downloadUrl: "", name: ""},
    "MessagingService.deleteFile": {id: ""},
    "MessagingService.sendTyping": {},
    "MessagingService.clearTypingTimeout": {},
    "MessagingService.clearSession": {},
    "MessagingService.fetchHistory": {},
    "MessagingService.resetConversation": {},
    "MessagingService.clearConversation": {},
    "MessagingService.stepUpConversation": {},
    "Messenger.open": {},
    "Messenger.openConversation": {},
    "Messenger.openSearch": {},
    "Messenger.openCobrowse": {},
    "Messenger.clear": {},
    "Messenger.close": {},
    "Toaster.open": {title: "Welcome to Genesys Cloud", body: "Encountering issues? Our support team is ready to troubleshoot and assist you.", buttons: {type: "binary", primary: "Get Support", secondary: "Maybe Later"}},
    "Toaster.accept": {},
    "Toaster.decline": {},
    "Toaster.close": {}
}

function getSampleCommandInput(command) {
    return window.commandMapping[command];
}

function loadGenesys(region, deployId) {
    const apiUrlMapping = {
        "use1": "mypurecloud.com",
        "use2": "use2.us-gov-pure.cloud",
        "usw2": "usw2.pure.cloud",
        "cac1": "cac1.pure.cloud",
        "euw1": "mypurecloud.ie",
        "euw2": "euw2.pure.cloud",
        "euc1": "mypurecloud.de",
        "aps1": "aps1.pure.cloud",
        "apne1": "mypurecloud.jp",
        "apne2": "apne2.pure.cloud",
        "apse2": "mypurecloud.com.au",
        "sae1": "sae1.pure.cloud"
    }

    window['_genesysJs'] = 'Genesys';
    window['Genesys'] = window['Genesys'] || function () {
        (window['Genesys'].q = window['Genesys'].q || []).push(arguments)
    };
    window['Genesys'].t = 1 * new Date();
    window['Genesys'].c = {
        environment: region,
        deploymentId: deployId
    };
    element = newElement('script', {
        async: 1,
        src: `https://apps.${apiUrlMapping[region]}/genesys-bootstrap/genesys.min.js`,
        charset: 'utf-8',
        debug: true
    })
    document.head.appendChild(element);
}

function reloadPage() {
    location.reload();
}

async function runCommandAsync(command, args) {
    return new Promise((resolve, reject) => {
        if (!window.readyPlugins.includes(command.split('.')[0])) reject("Plugin is not ready");
        try {
            Genesys("command", command, args,
                function (result) {
                    resolve(result);
                },
                function (error) {
                    reject(error);
                }
            );
        }
        catch (error) {
            reject(error)
        }
    })
}

function updateDependants(element) {
    if (element instanceof Event) element = element.target;
    const dependantElements = qsa(`[data-depends-on='${element.id}']`);
    let setOption = false;
    for (let dependantElement of dependantElements) {
        const fieldValue = dependantElement.getAttribute("data-depends-value");
        if (fieldValue.split(",").indexOf(element.value) >= 0) {
            switch (dependantElement.nodeName) {
                case "BUTTON":
                    dependantElement.style.display = "inline-block";
                    break;
                case "OPTION":
                    if (!setOption) {
                        dependantElement.parentNode.value = dependantElement.value;
                        sendEvent(dependantElement.parentNode, "change");
                        setOption = true;
                    }
                default:
                    dependantElement.style.display = "block";
                    break;
            }
        }
        else dependantElement.style.display = "none";
    }
}

function updateGlobal(element) {
    if (element instanceof Event) element = element.target;
    let storedValue = element.value;
    if (element.nodeName === "INPUT") {
        if (element.type === "checkbox") storedValue = element.checked;
        if (element.type === "number" || element.type === "range") storedValue = parseInt(element.value);
    }
    window.storedValues[element.id] = storedValue;
}

function registerAllEvents() {
    for (let item in window.storedValues) {
        if (item.split('.').length > 1) {
            Genesys("subscribe", item, handleEvent);
        }
    }
}

function handleEvent(event) {
    const fullEventName = event.publisher && event.eventName ? `${event.publisher}.${event.eventName}` : event.event;
    const eventParts = fullEventName.split(".");
    const plugin = eventParts[0];
    const eventName = eventParts[1];
    if (eventName.toLowerCase() === "ready" && !window.readyPlugins.includes(plugin)) window.readyPlugins.push(plugin);
    if (!window.listenedEvents.includes(fullEventName)) {
        console.log(`Skipping [${fullEventName}] because it is not listened to`);
        return;
    }
    log(event);
    const logItem = createLogItem(fullEventName, event.data)

    addElement(logItem, eById("dataLog"));
    logItem.scrollIntoView({behavior: "smooth"});
}

function updateListenedEvents() {
    window.listenedEvents = [];
    for (let item in window.storedValues) {
        if (item.split('.').length > 1 && window.storedValues[item]) {
            window.listenedEvents.push(item);
        }
    }
}

function createLogItem(eventName, eventBody, type) {
    type = type || "info"
    const logItem = newElement("div", {class: ['logItem']});
    if (eventName) {
        const logHeader = newElement("div", {class: ["logHeader", type], innerText: eventName});
        addElement(logHeader, logItem);
    }
    if (eventBody && Object.keys(eventBody).length > 0) {
        const logBody = newElement("pre", {class: ["logBody"], innerText: JSON.stringify(eventBody, null, 2)});
        addElement(logBody, logItem);
    }
    return logItem;
}

function load() {
    if (!window.storedValues.deployId || !window.storedValues.region) return;
    window.readyPlugins = [];
    loadGenesys(window.storedValues.region, window.storedValues.deployId);
    registerAllEvents();
    qs("#account").removeAttribute("open");
    qs("#events").setAttribute("open", true);
    qs("#commands").setAttribute("open", true);
}

function selectAllEvents() {
    const allVisible = qsa("label[data-depends-on=plugin][style='display: block;'] input[type=checkbox]");
    for (let visible of allVisible) {
        if (!visible.checked) visible.click();
    }
}

function updateSampleCommand() {
    const sample = getSampleCommandInput(window.storedValues.command);
    eById("commandBody").value = JSON.stringify(sample, null, 2);
}

async function runCommand() {
    let commandResult;
    let resultType;
    try {
        commandResult = await runCommandAsync(window.storedValues.command, JSON.parse(window.storedValues.commandBody));
        resultType = "info";
    }
    catch(error) {
        commandResult = error;
        resultType = "error";
    }
    const logItem = createLogItem(window.storedValues.command, commandResult, resultType);
    addElement(logItem, eById("dataLog"));
    logItem.scrollIntoView({behavior: "smooth"});
}

function createEventRow(fullEventName) {
    const eventParts = fullEventName.split(".");

    const eventSection = eById("events");
    const eventItems = eventSection.dataset?.dependsValue?.split(",") || [];
    if (!eventItems.includes(eventParts[0])) {
        eventItems.push(eventParts[0]);
        eventSection.dataset.dependsValue = eventItems.join(",");
    }

    const eventLabel = newElement('label', {"data-depends-on": "plugin", "data-depends-value": eventParts[0], innerText: splitCamelCase(eventParts[1])});
    const input = newElement('input', { id: fullEventName, type: "checkbox"});
    addElement(input, eventLabel, "afterbegin");
    return eventLabel;
}

function splitCamelCase(camelCaseWord) {
    return camelCaseWord.split("").map((e, i) => e.toUpperCase() === e || i === 0 ? " " + e.toUpperCase() : e).join("").trim();
}

function populateList(parent, createFunc, list) {
    for (let item of list) {
        addElement(createFunc(item), parent);
    }
}

function createCommandRow(command) {
    const commandParts = command.split(".");

    const commandSection = eById('commands');
    const commandItems = commandSection.dataset?.dependsValue?.split(",") || [];
    if (!commandItems.includes(commandParts[0])) {
        commandItems.push(commandParts[0]);
        commandSection.dataset.dependsValue = commandItems.join(",");
    }
    
    return newElement("option", { 'data-depends-on': "plugin", "data-depends-value": commandParts[0], innerText: command });
}

populateList(eById('eventList'), createEventRow, window.allEvents);
populateList(eById('command'), createCommandRow, Object.keys(window.commandMapping));

registerElements(qsa("select"), "change", updateDependants, true);
registerElements(qsa("input,select,textarea"), "change", updateGlobal, true);
registerElement(eById("command"), "change", updateSampleCommand);
registerElement(eById("loadWidget"), "click", load);
registerElement(eById("selectAll"), "click", selectAllEvents);
registerElement(eById("runCommand"), "click", runCommand);
registerElements(qsa("#events input"), "change", updateListenedEvents);
registerElement(eById("reload"), "click", reloadPage);