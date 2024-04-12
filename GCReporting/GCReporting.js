async function getConversations(startDate, endDate) {
    const interactions = [];
    let pageNum = 0;
    let totalPages = 1;
    const pageSize = 100;

    while (pageNum < totalPages) {
        pageNum++;
        const body = {
            "order": "desc",
            "orderBy": "conversationStart",
            "paging": {
                "pageSize": pageSize,
                "pageNumber": pageNum
            },
            "segmentFilters": [
                {
                    "type": "or",
                    "predicates": [
                        {
                            "dimension": "mediaType",
                            "value": "message"
                        }
                    ]
                },
                {
                    "type": "or",
                    "predicates": [
                        {
                            "dimension": "direction",
                            "value": "inbound"
                        }, {
                            "dimension": "direction",
                            "value": "outbound"
                        }
                    ]
                }
            ],
            "conversationFilters": [],
            "evaluationFilters": [],
            "surveyFilters": [],
            "interval": `${startDate}/${endDate}`
        }
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/analytics/conversations/details/query`;
        const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        else {
            throw resultJson.message;
        }
        interactions.push(...resultJson.conversations);
        totalPages = Math.ceil(resultJson.totalHits / pageSize)
    }
    return interactions;
}

async function getItem(path) {
    const url = `https://api.${window.localStorage.getItem('environment')}${path}`;
    const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    if (result.ok) {
        resultJson.status = 200;
    }
    else {
        throw resultJson.message;
    }
    return resultJson;
}

async function getBotTurns(botFlowId, start, end) {
    const resultJson = await getItem(`/api/v2/analytics/botflows/${botFlowId}/reportingturns?interval=${start}/${end}`);
    return resultJson;
}

async function getMessageConversation(conversationId) {
    const resultJson = await getItem(`/api/v2/conversations/messages/${conversationId}`);
    return resultJson;
}

async function getConversation(conversationId) {
    // /api/v2/conversations/{conversationId}
    const resultJson = await getItem(`/api/v2/conversations/${conversationId}`);
    return resultJson;
}

async function getAnalyticsDetails(conversationId) {
    // /api/v2/analytics/conversations/{conversationId}/details
    const resultJson = await getItem(`/api/v2/analytics/conversations/${conversationId}/details`);
    return resultJson;
}

async function getRecording(conversationId) {
    const resultJson = await getItem(`/api/v2/conversations/${conversationId}/recordings`);
    return resultJson;
}

function botParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        const botName = session.flow.flowName;
    
        if (!botStats.exitReasons.hasOwnProperty(session.flow.exitReason)) botStats.exitReasons[session.flow.exitReason] = [];
        botStats.exitReasons[session.flow.exitReason].push({botName: botName, conversationId: conversationId});
        for (let segment of session.segments) {
            addFlowTimes(botStats, "timeInFlow", "maxTimeInFlow", "averageTimeInFlow", segment, {botName: botName, conversationId: conversationId});
        }
    }
}

function acdParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        for (let segment of session.segments) {
            if (!queueStats.disconnectTypes.hasOwnProperty(segment.disconnectType)) queueStats.disconnectTypes[segment.disconnectType] = [];
            switch(segment.disconnectType) {
                case "peer":
                    // customer disconnect
                    queueStats.disconnectTypes[segment.disconnectType].push({conversationId: conversationId});
                    break;
                case "transfer":
                    // went to agent? or another queue?
                    queueStats.disconnectTypes[segment.disconnectType].push({conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId });
                    break;
                case "client":
                    queueStats.disconnectTypes[segment.disconnectType].push({conversationId: conversationId, flowName: session.flow.flowName});
                    break;
                default:
                    console.log(conversationId, segment.disconnectType);
                    break;
            }

            addFlowTimes(queueStats, "queueTime", "maxQueueTime", "averageQueueTime", segment, {queue: queueMapping.hasOwnProperty(segment.queueId) ? queueMapping[segment.queueId] : segment.queueId, conversationId: conversationId});
        }
    }
}

function agentParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        switch (session.mediaType) {
            case "message": {
                for (let segment of session.segments) {
                    switch(segment.segmentType) {
                        case "alert":
                            addFlowTimes(agentStats, "alertTimes", "maxAlertTime", "averageAlertTime", segment, {conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId});
                            break;
                        case "interact":
                            addFlowTimes(agentStats, "interactTimes", "maxInteractTime", "averageInteractTime", segment, {conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId});
                            break;
                        case "wrapup":
                            addFlowTimes(agentStats, "wrapupTimes", "maxWrapupTime", "averageWrapupTime", segment, {conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId});
                            break;
                        case "hold":
                            addFlowTimes(agentStats, "holdTimes", "maxHoldTime", "averageHoldTime", segment, {conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId});
                            break;
                        default:
                            console.log(conversationId, segment.segmentType);
                            break;
                    }
                }
                break;
            }
            case "cobrowse": {
                for (let segment of session.segments) {
                    addFlowTimes(agentStats, "cobrowseTimes", "maxCobrowseTime", "averageCobrowseTime", segment, {conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId, cobrowseRole: session.cobrowseRole});
                }
                break;
            }
            default:
                console.log(conversationId, session.mediaType);
                break;
        }
    }
}

function workflowParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        const flowExitReason = session.flow.exitReason ? session.flow.exitReason : "Unknown"
        if (!workflowStats.disconnectTypes.hasOwnProperty(flowExitReason)) workflowStats.disconnectTypes[flowExitReason] = [];
        workflowStats.disconnectTypes[flowExitReason].push({conversationId: conversationId, flowName: session.flow.flowName});

        for (let segment of session.segments) {
            addFlowTimes(workflowStats, "flowTimes", "maxFlowTime", "averageFlowTime", segment, {conversationId: conversationId, flowName: session.flow.flowName});
        }
    }
}

function addFlowTimes(object, key, maxKey, averageKey, segment, fields) {
    if (!segment.segmentStart || !segment.segmentEnd) return;

    const duration = timeDiff(segment.segmentEnd, segment.segmentStart);
    const prettyDuration = formattedForDisplay(duration / 1000);

    // handle the average
    if (object[averageKey]) {
        const currentCount = object[averageKey].count !== undefined ? object[averageKey].count : 0;
        const currentTotal = object[averageKey].totalDuration !== undefined ? object[averageKey].totalDuration : 0;
        // increment the count
        object[averageKey].count = currentCount + 1;
        // add duration to durrent total
        object[averageKey].totalDuration = currentTotal + duration;
        // set the duration and pretty duration to the average
        object[averageKey].duration = Math.round(object[averageKey].totalDuration / object[averageKey].count);
        object[averageKey].prettyDuration = formattedForDisplay((Math.round(object[averageKey].totalDuration / object[averageKey].count) / 1000));
    }
    // handle the max value
    if (object[maxKey]) {
        const currentMax = object[maxKey].duration !== undefined ? object[maxKey].duration : 0;
        if (duration > currentMax) {
            object[maxKey].duration = duration;
            object[maxKey].prettyDuration = prettyDuration;
            object[maxKey] = {...object[maxKey], ...fields};
        }
    } 
    object[key].push({...fields, duration: duration, prettyDuration: prettyDuration})
}

function getConversationTurns(conversation) {
    for (let participant of conversation.participants) {
        switch(participant.purpose) {
            case "botflow":
                botParticipant(participant, conversation.conversationId);
                break;
            case "acd":
                acdParticipant(participant, conversation.conversationId);
                break;
            case "agent":
                agentParticipant(participant, conversation.conversationId);
                break;
            case "workflow":
                workflowParticipant(participant, conversation.conversationId);
                break;
            case "customer":
                break;
            default:
                console.log(conversation.conversationId, participant.purpose);
                break;
        }
        // if (participant.purpose === "botflow") {
        //     for (let session of participant.sessions) {
        //         console.log(session.flow.flowName);
        //         console.log(`${session.segments[0].segmentStart} - ${session.segments[0].segmentEnd}`);
        //         const sessionTurns = [];
        //         const flowTurns = await getBotTurns(session.flow.flowId, session.segments[0].segmentStart, session.segments[0].segmentEnd);
        //         for (let turn of flowTurns.entities) {
        //             if (turn.sessionId === session.sessionId) {
        //                 if (turn.askActionResult) console.log(turn.askActionResult);
        //                 sessionTurns.push(turn)
        //             }
        //         }
        //         console.log(sessionTurns);
        //     }
        // }
    }
}

function getAllConversationSegments(interaction) {
    const segments = [];

    // TODO: maybe fully parse the conversation and use the segments to add a bunch of info about it (like Bold has)

    for (let participant of interaction.participants) {
        for (let session of participant.sessions) {
            for (let segment of session.segments) {
                segments.push([
                    interaction.conversationId,
                    participant.purpose,
                    segment.segmentStart,
                    segment.segmentEnd ? segment.segmentEnd : "-",
                    segment.segmentType,
                    session.flow && session.flow.flowName ? session.flow.flowName : "-",
                    session.flow && session.flow.flowVersion ? session.flow.flowVersion : "-",
                    session.flow && session.flow.exitReason ? session.flow.exitReason : "-",
                    segment.disconnectType ? segment.disconnectType : "-",
                    session.mediaType ? session.mediaType : "-",
                    segment.segmentType === "wrapup" && segment.wrapUpCode ? wrapupCodeMapping[segment.wrapUpCode] ? wrapupCodeMapping[segment.wrapUpCode] : segment.wrapUpCode : "-",
                    segment.queueId ? queueMapping[segment.queueId] ? queueMapping[segment.queueId] : segment.queueId : "-",
                    session.selectedAgentId ? usersMapping[session.selectedAgentId] ? usersMapping[session.selectedAgentId] : session.selectedAgentId : "-",
                    participant.userId ? usersMapping[participant.userId] ? usersMapping[participant.userId] : participant.userId : "-",
                    interaction.divisionIds && interaction.divisionIds[0] ? divisionMapping[interaction.divisionIds[0]] ? divisionMapping[interaction.divisionIds[0]] : interaction.divisionIds[0] : "-",
                    interaction.knowledgeBaseIds && interaction.knowledgeBaseIds[0] ? knowledgeBaseMapping[interaction.knowledgeBaseIds[0]] ? knowledgeBaseMapping[interaction.knowledgeBaseIds[0]] : interaction.knowledgeBaseIds[0] : "-",
                    segment.errorCode ? segment.errorCode : "-",
                ])
            }
        }
    }
    return segments;
}
async function run() {
    // reset globals 
    window.allConversations = {};
    window.agentStats = {
        averageAlertTime: {},
        maxAlertTime: {},
        alertTimes: [],
        averageInteractTime: {},
        maxInteractTime: {},
        interactTimes: [],
        averageWrapupTime: {},
        maxWrapupTime: {},
        wrapupTimes: [],
        averageHoldTime: {},
        maxHoldTime: {},
        holdTimes: [],
        averageCobrowseTime: {},
        maxCobrowseTime: {},
        cobrowseTimes: [] 
    };
    window.botStats = {
        exitReasons: {},
        averageTimeInFlow: {},
        maxTimeInFlow: {},
        timeInFlow: []
    };
    window.queueStats = {
        disconnectTypes: {},
        averageQueueTime: {},
        maxQueueTime: {},
        queueTime: []
    };
    window.workflowStats = {
        disconnectTypes: {},
        averageFlowTime: {},
        maxFlowTime: {},
        flowTimes: []
    }

    const start = eById("startDate").value;
    const end = eById("endDate").value;
    if (!start || ! end) throw new Error("Need a start or end date");

    const startDate = start + "T00:00:00.000Z";
    const endDate = end + "T23:59:59.999Z";

    const users = await getAllUsers();
    window.usersMapping = mapProperty("id", "name", users);
    const queues = await getAll("/api/v2/routing/queues?sortOrder=asc&sortBy=name&name=**&divisionId", "entities", 25);
    window.queueMapping = mapProperty("id", "name", queues);
    const wrapupCodes = await getAll("/api/v2/routing/wrapupcodes?sortBy=name&sortOrder=ascending", "entities", 25);
    window.wrapupCodeMapping = mapProperty("id", "name", wrapupCodes);
    const divisions = await getAll("/api/v2/authorization/divisions?", "entities", 200);
    window.divisionMapping = mapProperty("id", "name", divisions);
    const knowledgeBases = await getAll("/api/v2/knowledge/knowledgeBases?sortOrder=ASC&sortBy=name", "entities", 25);
    window.knowledgeBaseMapping = mapProperty("id", "name", knowledgeBases);

    const conversations = await getConversations(startDate, endDate);
    let dataRows = [];
    for (let conversation of conversations) {
        window.allConversations[conversation.conversationId] = conversation;
        getConversationTurns(conversation);
        dataRows = dataRows.concat(getAllConversationSegments(conversation));
    }

    const headers = ["Conversation ID", "Purpose", "Start", "End", "Type", "Flow Name", "Flow Version", "Exit Reason", "Disconnect Type", "Media Type", "Wrapup Code", "Queue", "Agent", "Participant Agent", "Division", "Knowledge Base", "Error Code"]
    const table = new PagedTable(headers, dataRows, 25, {}, true, true);
    const results = eById("results");
    clearElement(results);
    addElement(table, results);

    console.log(workflowStats);
    console.log(botStats);
    console.log(queueStats);
    console.log(agentStats);
    return;
}

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
}

async function getAllUsers() {
    const users= [];
    let pageNum = 0;
    let totalPages = 1;

    while (pageNum < totalPages) {
        pageNum++;
        const body = {
            "pageSize": 25,
            "pageNumber": pageNum,
            "query": [
                {
                    "type":"EXACT",
                    "fields":["state"],
                    "values":["active"]
                }
            ],
            "sortOrder":"ASC",
            "sortBy":"name",
            "expand":[],
            "enforcePermissions":false
        }
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/search`;
        const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        else {
            throw resultJson.message;
        }
        users.push(...resultJson.results);
        totalPages = resultJson.pageCount;
    }
    return users;
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

function sortByKey(key) {
    return function(a,b) {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
    }
}

function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud"]
    const inputsWrapper = newElement('div', { id: "userInputs" });
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
    const inputs = newElement("div", {id: "inputs"});
    const startLabel = newElement('label', {innerText: "Start Date"});
    const startDate = newElement('input', {type: "date", id: "startDate", value: "2024-04-01"});
    addElement(startDate, startLabel);
    const endLabel = newElement('label', {innerText: "End Date"});
    const endDate = newElement('input', {type: "date", id: "endDate", value: "2024-04-30"});
    addElement(endDate, endLabel);
    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", run);
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', {id: "results"})
    addElements([startLabel, endLabel], inputs)
    addElements([inputs, startButton, logoutButton, results], page);
    getOrgDetails().then(function (result) {
        if (result.status !== 200) {
            log(result.message, "error");
            logout();
            return;
        }
        eById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName}) Current Org ID: ${result.id}`
    }).catch(function (error) { log(error, "error"); logout(); });
}

function login() {
    window.localStorage.setItem('environment', qs('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${qs('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    eById('header').innerText = "Current Org Name: Current Org ID:";
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
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}