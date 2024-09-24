function createChannel() {
    return makeGenesysRequest(`/api/v2/notifications/channels`, 'POST');
}

function getAvailableTopics() {
    return makeGenesysRequest(`/api/v2/notifications/availabletopics?expand=description,transports,topicParameters,visibility&includePreview=true`);
}

function addSubscriptions(channelId, subscriptions) {
    return makeGenesysRequest(`/api/v2/notifications/channels/${channelId}/subscriptions`, 'POST', subscriptions);
}

function removeSubscription(channelId, topicName) {
    const subscriptionIndex = window.subscribedTopics.indexOf(topicName);
    if (subscriptionIndex < 0) return;

    window.subscribedTopics.splice(subscriptionIndex, 1);
    const newTopics = [];
    for (let topic of window.subscribedTopics) {
        newTopics.push({id: topic});
    }
    return makeGenesysRequest(`/api/v2/notifications/channels/${channelId}/subscriptions`, 'PUT', newTopics);
}

async function run() {
    if (!websocket) {
        const newChannel = await createChannel();
        window.websocket = newChannel.id;
        const socketConnection = new WebSocket(newChannel.connectUri);
    
        socketConnection.onopen = (event) => {
            log(event.data || "");
        }
        socketConnection.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (!window.subscribedTopics.includes(message.topicName)) return;
            const notification = createNotificationUi(message.topicName, message.eventBody);
            addElement(notification, eById('notifications'));
            log(message.eventBody || "");
        }
        socketConnection.onerror = (event) => {
            log(event.data || "");
            window.websocket = undefined;
            window.subscribedTopics = [];
        }
    }
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
    const section = newElement('div', {id: id});
    const header = newElement('h2', {innerText: headerName, class: ["header"]})
    addElement(header, section);
    return section;
}

function createTopicOptionsUi() {
    const section = newElement('div', {id: "topicOptions"});
    const header = newElement('h2', {innerText: "Topics", class: ["header"]});
    const searchBar = newElement('input');
    registerElement(searchBar, 'input', ()=>{
        const filteredList = window.availableTopics.filter((e)=>e.id.toLowerCase().includes(searchBar.value.toLowerCase()));
        populateTopics(filteredList);
    })
    addElement(searchBar, header)
    addElement(header, section);
    return section;
}

function createNotificationUi(topicName, notificationObject) {
    const details = newElement('details');
    const summary = newElement('summary', {innerText: topicName});
    const pre = newElement("pre", {innerText: JSON.stringify(notificationObject, null, 2), class: ["fullNotificationBody"]})
    addElements([summary, pre], details);
    return details;
}

function createAddedTopic(topicName) {
    const addedTopic = newElement('div', { class: ["addedTopic"]});
    const nameSpan = newElement('span', {innerText: topicName});
    const removeButton = newElement('button', {innerText: "Remove"});
    registerElement(removeButton, 'click', async ()=>{
        await removeSubscription(window.websocket, topicName);
        addedTopic.remove();
    })
    addElements([nameSpan, removeButton], addedTopic);
    return addedTopic;
}

function createTopicOption(topic) {
    const addedTopic = newElement('div', { class: ["topicOption"]});
    const nameSpan = newElement('span', {innerText: `${topic.id}\n${topic.description}`});
    registerElement(addedTopic, "click", ()=>{
        const addTopicSection = eById("addTopic");
        clearElement(addTopicSection, "#topicConfig");
        const chosenTopic = window.availableTopics.find((e)=>e.id === topic.id);
        const topicOptions = createAddTopic(chosenTopic);
        addElement(topicOptions, addTopicSection);
    })
    addElement(nameSpan, addedTopic);
    return addedTopic;
}

function createAddTopic(topic) {
    const topicConfig = newElement('div', { id: "topicConfig"});

    const topicNameElem = newElement('div', {class: ['topicName'], innerText: `${topic.visibility === "Preview" ? "[Preview] ": ""}${topic.id}`});
    const topicInputs = newElement('div', {class: ['topicInputs']});
    const addTopicButton = newElement('button', { innerText: "Add"});

    const paramInputList = [];
    for (let param of topic.topicParameters) {

        const paramName = param.split(" ").map((e) => e.substring(0,1).toUpperCase() + e.substring(1)).join(" ");

        const paramLabel = newElement("label", {innerText: `${paramName}: `});
        const paramInput = newElement('input');
        paramInputList.push(paramInput);
        addElement(paramInput, paramLabel);
        addElement(paramLabel, topicInputs);
    }

    registerElement(addTopicButton, "click", async ()=>{
        await run(); // makes sure that a websocket is created
        let topicString = topic.id;
        for (let paramInput of paramInputList) {
            if (!paramInput.value) return;
            topicString = topicString.replace("{id}", paramInput.value);
        }
        
        if (window.subscribedTopics.includes(topicString)) return;
        const addResult = await addSubscriptions(window.websocket, [{id: topicString}]);
        if (addResult.status !== 200) return;

        window.subscribedTopics.push(topicString);
        const addedTopicSection = eById('addedTopics');
        const addedTopic = createAddedTopic(topicString);
        addElement(addedTopic, addedTopicSection);
    
    })

    addElements([topicNameElem, topicInputs, addTopicButton], topicConfig)
    return topicConfig;
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);

    const uiContainer = newElement('div', {id: "uiContainer"});

    const globalControls = newElement('div', {id: "globalControls"});
    const orgName = newElement('div', {innerText: "Current Org Name: ", class: ["orgName"]});
    const orgId = newElement('div', {innerText: "Current Org ID: ", class: ["orgId"]});
    const buttonContainer = newElement('div', { class: ["buttonContainer"]})
    const logoutButton = newElement('button', {innerText: "Logout"});
    addElements([logoutButton], buttonContainer);
    addElements([orgName, orgId, buttonContainer], globalControls);

    registerElement(logoutButton, 'click', logout);

    const topicOptions = createTopicOptionsUi();
    const addTopic = createUiSection("addTopic", "Topic Configuration");
    const addedTopics = createUiSection("addedTopics", "Added Topics");
    const notifications = createUiSection("notifications", "Notifications");

    addElements([globalControls, topicOptions, addTopic, addedTopics, notifications], uiContainer);

    // make this list filter-able
    showLoading(async ()=>{
        const availableTopics = await getAvailableTopics();
        for (const topic of availableTopics.entities) {
            if (!topic.transports.includes("All") && !topic.transports.includes("Websocket")) continue;
            const topicParts = topic.id.split(".");
            if (topicParts[1] === "system") continue;
            window.availableTopics.push(topic);
        }
        populateTopics(window.availableTopics);
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

function populateTopics(availableOptions) {
    const topicsSelect = eById('topicOptions');
    clearElement(topicsSelect, ".topicOption");
    for (const topic of availableOptions) {
        const topicElem = createTopicOption(topic);
        addElement(topicElem, topicsSelect);
    }
}

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
}

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}

var websocket;
var subscribedTopics = [];
var availableTopics = [];

runLoginProcess(showLoginPage, showMainMenu);