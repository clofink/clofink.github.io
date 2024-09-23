const topics = [
    "analytics.conversations.details.jobs.availability",
    "analytics.flow.{flowId}.aggregates",
    "analytics.flow.{flowOutcomeId}.aggregates",
    "analytics.queues.{queueId}.observations",
    "analytics.users.details.jobs.availability",
    "analytics.users.{userId}.aggregates",
    "analytics.wrapup.{wrapupCodeId}.aggregates",
    "architect.dependencytracking.build",
    "architect.prompts.{promptId}",
    "architect.prompts.{promptId}.resources.{languageCode}",
    "architect.systemprompts.{promptId}.resources.{languageCode}",
    "audits.entitytype.{entityType}.entityid.{entityId}",
    "businessunits.{businessUnitId}.workforcemanagement.intraday",
    "contentmanagement.documents.{documentId}",
    "contentmanagement.workspaces.{workspaceId}.documents",
    "conversations.{conversationId}.transcription",
    "detail.events.conversation.{conversationId}.acd.end",
    "detail.events.conversation.{conversationId}.acd.start",
    "detail.events.conversation.{conversationId}.acw",
    "detail.events.conversation.{conversationId}.attributes",
    "detail.events.conversation.{conversationId}.contact",
    "detail.events.conversation.{conversationId}.customer.end",
    "detail.events.conversation.{conversationId}.customer.start",
    "detail.events.conversation.{conversationId}.flow.end",
    "detail.events.conversation.{conversationId}.flow.outcome",
    "detail.events.conversation.{conversationId}.flow.start",
    "detail.events.conversation.{conversationId}.outbound",
    "detail.events.conversation.{conversationId}.user.end",
    "detail.events.conversation.{conversationId}.user.start",
    "detail.events.conversation.{conversationId}.voicemail.end",
    "detail.events.conversation.{conversationId}.voicemail.start",
    "detail.events.conversation.{conversationId}.wrapup",
    "externalcontacts.contacts.{contactId}",
    "externalcontacts.contacts.{contactId}.journey.sessions",
    "externalcontacts.contacts.{contactId}.notes.{noteId}",
    "externalcontacts.contacts.{contactId}.unresolved",
    "externalcontacts.organization.{organizationId}",
    "externalcontacts.organization.{organizationId}.notes.{noteId}",
    "externalcontacts.relationships.{relationshipId}",
    "flows.instances.flow.{flowId}",
    "flows.outcomes.{outcomeId}",
    "flows.{flowId}",
    "gamification.scorecards.users.{userId}",
    "groups.{userId}.greetings",
    "journey.sessions.{sessionId}.action.events",
    "journey.sessions.{sessionId}.app.events",
    "journey.sessions.{sessionId}.outcome.events",
    "journey.sessions.{sessionId}.web.events",
    "managementunits.{managementUnitId}.workforcemanagement.intraday",
    "operations.events.{operationalEventId}",
    "outbound.attemptlimits.{outboundAttemptId}",
    "outbound.callabletimesets.{callbackTimesetId}",
    "outbound.campaignrules.{campaignRuleId}",
    "outbound.campaigns.{campaignId}",
    "outbound.campaigns.{campaignId}.progress",
    "outbound.campaigns.{campaignId}.stats",
    "outbound.contactlistfilters.{contactListId}",
    "outbound.contactlists.{campaignId}",
    "outbound.contactlists.{contactListId}.importstatus",
    "outbound.dnclists.{DNCListId}",
    "outbound.dnclists.{DNCListId}.importstatus",
    "outbound.emailcampaigns.{emailCampaignId}",
    "outbound.emailcampaigns.{emailCampaignId}.progress",
    "outbound.importtemplates.{importTemplateId}.importstatus",
    "outbound.messagingcampaigns.{messagingCampaignId}",
    "outbound.messagingcampaigns.{messagingCampaignId}.progress",
    "outbound.responsesets.{callAnalysisSetId}",
    "outbound.rulesets.{ruleSetId}",
    "outbound.schedules.campaigns.{campaignId}",
    "outbound.schedules.sequences.{sequenceId}",
    "outbound.sequences.{sequenceId}",
    "outbound.settings",
    "outbound.wrapupcodemappings.{wrapUpCodeMappingId}",
    "quality.evaluations",
    "routing.queues.{queueId}.conversations",
    "routing.queues.{queueId}.conversations.callbacks",
    "routing.queues.{queueId}.conversations.calls",
    "routing.queues.{queueId}.conversations.chats",
    "routing.queues.{queueId}.conversations.cobrowseSessions",
    "routing.queues.{queueId}.conversations.emails",
    "routing.queues.{queueId}.conversations.messages",
    "routing.queues.{queueId}.conversations.screenshares",
    "routing.queues.{queueId}.conversations.socialexpressions",
    "routing.queues.{queueId}.conversations.videos",
    "routing.queues.{queueId}.users",
    "speechandtextanalytics.programs.general.jobs.{jobId}",
    "speechandtextanalytics.programs.publishjobs.{jobId}",
    "speechandtextanalytics.topics.publishjobs.{jobId}",
    "taskmanagement.workitems.queues.{queueId}",
    "taskmanagement.workitems.users.{userId}",
    "taskmanagement.workitems.{workitemId}",
    "telephony.providers.edges.phones.{phoneId}",
    "telephony.providers.edges.trunks.{trunkId}",
    "telephony.providers.edges.trunks.{trunkId}.metrics",
    "telephony.providers.edges.{edgeId}",
    "telephony.providers.edges.{edgeId}.logicalinterfaces",
    "telephony.providers.edges.{edgeId}.metrics",
    "telephony.providers.edges.{edgeId}.softwareupdate",
    "users.{userId}.activity",
    "users.{userId}.alerting.alerts",
    "users.{userId}.alerting.heartbeat.alerts",
    "users.{userId}.alerting.heartbeat.rules",
    "users.{userId}.alerting.interactionstats.alerts",
    "users.{userId}.alerting.interactionstats.rules",
    "users.{userId}.alerting.rules",
    "users.{userId}.analytics.reporting.exports",
    "users.{userId}.badges.chats",
    "users.{userId}.callforwarding",
    "users.{userId}.conversations",
    "users.{userId}.conversations.callbacks",
    "users.{userId}.conversations.calls",
    "users.{userId}.conversations.chats",
    "users.{userId}.conversations.cobrowseSessions",
    "users.{userId}.conversations.emails",
    "users.{userId}.conversations.inbound.typing.event",
    "users.{userId}.conversations.messages",
    "users.{userId}.conversations.screenshares",
    "users.{userId}.conversations.socialexpressions",
    "users.{userId}.conversations.videos",
    "users.{userId}.conversations.{conversationId}.recordings",
    "users.{userId}.conversations.{conversationId}.recordings.{recordingId}",
    "users.{userId}.conversationsummary",
    "users.{userId}.fax.documents",
    "users.{userId}.geolocation",
    "users.{userId}.greeting",
    "users.{userId}.integrationpresence",
    "users.{userId}.outbound.contactlists.{contactListId}.export",
    "users.{userId}.outbound.dnclists.{DNCListId}.export",
    "users.{userId}.outofoffice",
    "users.{userId}.presence",
    "users.{userId}.recordings",
    "users.{userId}.routingStatus",
    "users.{userId}.station",
    "users.{userId}.tokens",
    "users.{userId}.userrecordings",
    "users.{userId}.voicemail.messages",
    "users.{userId}.wem.coaching.notifications",
    "users.{userId}.wem.learning.assignment",
    "users.{userId}.workforcemanagement.adherence",
    "users.{userId}.workforcemanagement.adherence.explanations.jobs",
    "users.{userId}.workforcemanagement.adherence.historical.bulk",
    "users.{userId}.workforcemanagement.alternative.shift.jobs",
    "users.{userId}.workforcemanagement.historicaladherencequery",
    "users.{userId}.workforcemanagement.integrations.hris.timeofftypes.jobs",
    "users.{userId}.workforcemanagement.notifications",
    "users.{userId}.workforcemanagement.performanceprediction.schedules.recalculations",
    "users.{userId}.workforcemanagement.schedules",
    "users.{userId}.workforcemanagement.shrinkage.jobs",
    "users.{userId}.workforcemanagement.timeoffbalance.jobs",
    "users.{userId}.workforcemanagement.timeoffrequests",
    "video.conferences.{conferenceJid}",
    "webdeployments.configurations.{configurationId}",
    "webdeployments.deployments.{deploymentId}",
    "wem.learning.assignments.modules.{moduleId}",
    "workflows.{workflowId}.conversations.inbound.typing.event",
    "workforcemanagement.agents",
    "workforcemanagement.agents.{agentId}.adherence.explanations.{adherenceExplanationId}",
    "workforcemanagement.businessunits.{businessUnitId}.activityplans.jobs",
    "workforcemanagement.businessunits.{businessUnitId}.activityplans.runs.jobs",
    "workforcemanagement.businessunits.{businessUnitId}.adherence.explanations",
    "workforcemanagement.businessunits.{businessUnitId}.forecasts.staffingrequirement",
    "workforcemanagement.businessunits.{businessUnitId}.schedules",
    "workforcemanagement.businessunits.{businessUnitId}.scheduling.runs",
    "workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts",
    "workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.copy",
    "workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.generate",
    "workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.import",
    "workforcemanagement.businessunits.{businessUnitId}.workplanbids.{bidId}",
    "workforcemanagement.historicaldata.deletejob",
    "workforcemanagement.historicaldata.status",
    "workforcemanagement.managementunits.{managementUnitId}",
    "workforcemanagement.managementunits.{managementUnitId}.adherence",
    "workforcemanagement.managementunits.{managementUnitId}.agents.sync",
    "workforcemanagement.managementunits.{managementUnitId}.schedules",
    "workforcemanagement.managementunits.{managementUnitId}.shifttrades.state.bulk",
    "workforcemanagement.performanceprediction.schedules.{scheduleId}",
    "workforcemanagement.teams.{teamId}.adherence",
    "workforcemanagement.users.{userId}.schedules.query",
    "workforcemanagement.users.{userId}.schedules.search",
]

function createChannel() {
    return makeGenesysRequest(`/api/v2/notifications/channels`, 'POST');
}

function addSubscriptions(channelId, subscriptions) {
    return makeGenesysRequest(`/api/v2/notifications/channels/${channelId}/subscriptions`, 'POST', subscriptions);
}

async function removeSubscription(channelId, topicName) {
    const topic = "v2." + topicName;
    const subscriptionIndex = window.subscribedTopics.indexOf(topic);
    if (subscriptionIndex < 0) return;

    window.subscribedTopics.splice(subscriptionIndex, 1);
    console.log(subscribedTopics)
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

function createTopicOption(topicName) {
    const addedTopic = newElement('div', { class: ["topicOption"]});
    const nameSpan = newElement('span', {innerText: topicName});
    const configureButton = newElement('button', {innerText: "Configure"});
    registerElement(configureButton, "click", ()=>{
        const addTopicSection = eById("addTopic");
        clearElement(addTopicSection, "#topicConfig");
        const topicOptions = createAddTopic(topicName);
        addElement(topicOptions, addTopicSection);
    })
    addElements([nameSpan, configureButton], addedTopic);
    return addedTopic;
}

function createAddTopic(topicName) {
    const topicConfig = newElement('div', { id: "topicConfig"});

    const topicNameElem = newElement('div', {class: ['topicName'], innerText: topicName});
    const topicInputs = newElement('div', {class: ['topicInputs']});
    const addTopicButton = newElement('button', { innerText: "Add"});

    const topicParams = getParams(topicName);
    for (let param of topicParams) {
        const paramLabel = newElement("label", {innerText: `${prettyPrintCamelCase(param.key)}: `});
        const paramInput = newElement('input', { id: param.key });
        addElement(paramInput, paramLabel);
        addElement(paramLabel, topicInputs);
    }

    registerElement(addTopicButton, "click", async ()=>{
        await run(); // makes sure that a websocket is created

        const addedTopicSection = eById('addedTopics');
        const addedTopic = createAddedTopic(topicName);
        addElement(addedTopic, addedTopicSection);

        const topic = "v2." + topicName;
        if (window.subscribedTopics.includes(topic)) return;
        window.subscribedTopics.push(topic);
        const params = getParams(topic);
        for (const param of params) {
            const value = eById(param.key).value;
            if (!value) return;
            topic = topic.replace(param.replace, value);
        }
    
        await addSubscriptions(window.websocket, [{id: topic}]);
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

    const topicOptions = createUiSection("topicOptions", "Topics");
    const addTopic = createUiSection("addTopic", "Topic Configuration");
    const addedTopics = createUiSection("addedTopics", "Added Topics");
    const notifications = createUiSection("notifications", "Notifications");

    addElements([globalControls, topicOptions, addTopic, addedTopics, notifications], uiContainer);

    // make this list filter-able
    for (const topic of topics.sort()) {
        const topicOption = createTopicOption(topic);
        addElement(topicOption, topicOptions);
    }

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

function getParams(topic) {
    const results = [...topic.matchAll(/\{(\w+)\}/g)];
    const formattedResults = [];
    for (let result of results) {
        const formattedResult = {};
        formattedResult.replace = result[0];
        formattedResult.key = result[1];
        formattedResults.push(formattedResult);
    }
    return formattedResults;
}

function updateInputs(fieldName, inputsContainer) {
    clearElement(inputsContainer, ".paramInput");
    const parameters = getParams(fieldName);
    
    for (let parameter of parameters) {
        const paramInput = createInput(parameter.key);
        addElement(paramInput, inputsContainer);
    }
}

function createInput(parameter) {
    const inputLabel = newElement('label', { innerText: `${prettyPrintCamelCase(parameter)}: `, class: ["paramInput"] });
    const inputElem = newElement('input', { id: parameter });
    addElement(inputElem, inputLabel);
    return inputLabel;
}

function prettyPrintCamelCase(string) {
    const capitalRegex = /[A-Z]/g;
    const matches = [...string.matchAll(capitalRegex)];
    matches.reverse();
    for (let match of matches) {
        const end = string.substring(match.index);
        const begin = string.substring(0, match.index);
        string = begin + " " + end;
    }
    return string[0].toUpperCase() + string.substring(1);
}

var websocket;
var subscribedTopics = [];

runLoginProcess(showLoginPage, showMainMenu);