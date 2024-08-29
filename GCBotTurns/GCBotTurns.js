window.levels = ["conversation", "participant", "session", "segment"];
window.fields = [
    { name: "User Input", path: "userInput" },
    { name: "Bot Prompts", path: "botPrompts" },
    { name: "Session ID", path: "sessionId" },
    { name: "Ask Action", path: "askAction" },
    { name: "Ask Action ID", path: "askAction.actionId" },
    { name: "Ask Action Name", path: "askAction.actionName" },
    { name: "Ask Action Number", path: "askAction.actionNumber" },
    { name: "Ask Action Type", path: "askAction.actionType" },
    { name: "Intent", path: "intent" },
    { name: "Intent Name", path: "intent.name" },
    { name: "Intent Confidence", path: "intent.confidence" },
    { name: "Intent Slots", path: "intent.slots" },
    { name: "Intent Slots Names", path: "intent.slots.name" },
    { name: "Intent Slots Values", path: "intent.slots.value" },
    { name: "Intent Slots Types", path: "intent.slots.type" },
    { name: "Intent Slots Confidences", path: "intent.slots.confidence" },
    { name: "Knowledge", path: "knowledge" },
    { name: "Knowledge Base ID", path: "knowledge.knowledgeBaseId" },
    { name: "Knowledge Feedback", path: "knowledge.feedback" },
    { name: "Knowledge Feedback Search ID", path: "knowledge.feedback.searchId" },
    { name: "Knowledge Feedback Rating", path: "knowledge.feedback.rating" },
    { name: "Knowledge Feedback Documents", path: "knowledge.feedback.documents" },
    { name: "Knowledge Feedback Document IDs", path: "knowledge.feedback.documents.id" },
    { name: "Knowledge Feedback Document Questions", path: "knowledge.feedback.documents.question" },
    { name: "Knowledge Feedback Document Answers", path: "knowledge.feedback.documents.answer" },
    { name: "Knowledge Feedback Document Confidences", path: "knowledge.feedback.documents.confidence" },
    { name: "Knowledge Search", path: "knowledge.search" },
    { name: "Knowledge Search ID", path: "knowledge.search.searchId" },
    { name: "Knowledge Search Query", path: "knowledge.search.query" },
    { name: "Knowledge Search Documents", path: "knowledge.search.documents" },
    { name: "Knowledge Search Document IDs", path: "knowledge.search.documents.id" },
    { name: "Knowledge Search Document Questions", path: "knowledge.search.documents.question" },
    { name: "Knowledge Search Document Answers", path: "knowledge.search.documents.answer" },
    { name: "Knowledge Search Document Confidences", path: "knowledge.search.documents.confidence" },
    { name: "Date Created", path: "dateCreated" },
    { name: "Ask Action Result", path: "askActionResult" },
    { name: "Session End Details", path: "sessionEndDetails" },
    { name: "Session End Details Type", path: "sessionEndDetails.type" },
    { name: "Session End Details Reason", path: "sessionEndDetails.reason" },
    { name: "Conversation", path: "conversation" },
    { name: "Conversation ID", path: "conversation.id" },
]

async function getBotTurns(botFlowId, start, end) {
    return getAllGenesysItems(`/api/v2/analytics/botflows/${botFlowId}/reportingturns?interval=${start}/${end}`, 50, "entities");
}

function addIfProperty(object, path, orValue, mapping) {
    const pathParts = path.split(".");
    let currentPiece = object;
    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (Array.isArray(currentPiece)) {
            const displayList = [];
            for (let item of currentPiece) {
                const hasPart = item.hasOwnProperty(part);
                if (hasPart) {
                    if (typeof item[part] === "object") {
                        displayList.push(JSON.stringify(item[part]));
                        continue;
                    }
                    if (window[mapping]) {
                        displayList.push(window[mapping].hasOwnProperty(item[part]) ? window[mapping][item[part]] : item[part]);
                        continue;
                    }
                    displayList.push(item[part])
                }
            }
            return displayList.join("\n")
        }
        const hasPart = currentPiece.hasOwnProperty(part);
        if (hasPart && i + 1 < pathParts.length) {
            currentPiece = currentPiece[part];
            continue;
        }
        if (hasPart) {
            if (Array.isArray(currentPiece[part])) {
                const displayList = [];
                for (let item of currentPiece[part]) {
                    if (typeof item === "object") {
                        displayList.push(JSON.stringify(item));
                        continue;
                    }
                    if (window[mapping]) {
                        displayList.push(window[mapping].hasOwnProperty(item) ? window[mapping][item] : item);
                        continue;
                    }
                    displayList.push(item)
                }
                return displayList.join("\n")
            }    
            if (typeof currentPiece[part] === "object") {
                return JSON.stringify(currentPiece[part])
            }
            if (window[mapping]) {
                return window[mapping].hasOwnProperty(currentPiece[part]) ? window[mapping][currentPiece[part]] : currentPiece[part];
            }
            return currentPiece[part]
        }
    }
    return orValue ? orValue : "";
}

function getAllConversationSegments(interaction, fieldsInfo) {
    const dataRows = [];
    dataRows.push(createDataRow(fieldsInfo, interaction));
    return dataRows;
}

function createDataRow(fieldsInfo, interaction) {
    const dataRow = [];
    for (let field of fieldsInfo) {
        dataRow.push(addIfProperty(interaction, field.path, "", field.mapping));
    }
    return dataRow;
}

async function run() {
    // reset globals 
    window.allConversations = {};

    const start = eById("startDate").value;
    const end = eById("endDate").value;
    const botFlowId = eById("botFlowId").value;

    if (!start || !end) throw new Error("Need a start or end date");
    const botTurnsCacheKey = btoa(encodeURIComponent(`${window.orgId}:${start}:${end}:${botFlowId}`));
    // const orgInfoCacheKey = btoa(encodeURIComponent(window.orgId));

    const startDate = start + "T00:00:00.000Z";
    const endDate = end + "T23:59:59.999Z";

    if (window.botTurnsCacheKey !== botTurnsCacheKey) {
        window.conversationsData = await getBotTurns(botFlowId, startDate, endDate);
        window.botTurnsCacheKey = botTurnsCacheKey;
    }
    const selectedFields = qsa(".fieldOption", eById('fieldContainer'));

    const headers = [];
    const fields = [];
    // fieldLevel, fieldType, customPath
    for (let field of selectedFields) {
        let fieldPath = qs(".fieldType", field).value;
        let fieldName = qs(".fieldType", field).selectedOptions[0].innerText;
        let mapping = qs(".fieldType", field).selectedOptions[0].dataset.mappingName
        if (fieldPath === "custom") {
            fieldPath = qs(".customPath", field).value;
            fieldName = qs(".customPath", field).value;
        }
        headers.push(fieldName);
        fields.push({ name: fieldName, path: fieldPath, mapping: mapping })
    }
    let dataRows = [];
    for (let conversation of window.conversationsData) {
        window.allConversations[conversation.conversationId] = conversation;
        // getConversationTurns(conversation);
        dataRows = dataRows.concat(getAllConversationSegments(conversation, fields));
    }
    window.displayTable = new PagedTable(headers, dataRows, 100, {}, true, true);
    const results = eById("results");
    clearElement(results);
    addElement(window.displayTable.getContainer(), results);

    // console.log(workflowStats);
    // console.log(botStats);
    // console.log(queueStats);
    // console.log(agentStats);
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
    return getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
}

function sortByKey(key) {
    return function (a, b) {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
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

function showMainMenu() {
    const page = eById('page');
    clearElement(page);
    const inputs = newElement("div", { id: "inputs" });
    const startLabel = newElement('label', { innerText: "Start Date: " });
    const startDate = newElement('input', { type: "date", id: "startDate", value: "2024-04-01" });
    addElement(startDate, startLabel);
    const endLabel = newElement('label', { innerText: "End Date: " });
    const endDate = newElement('input', { type: "date", id: "endDate", value: "2024-04-30" });
    addElement(endDate, endLabel);
    const botFlowLabel = newElement('label', { innerText: "Bot Flow ID: " })
    const botFlowInput = newElement('input', { id: "botFlowId" });
    addElement(botFlowInput, botFlowLabel);
    const fieldContainer = newElement('div', { id: "fieldContainer" });
    addElement(createFieldOptions(), fieldContainer);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => {showLoading(run)});
    const downloadAllButton = newElement('button', { innerText: "Download All" });
    registerElement(downloadAllButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFullData(); const download = createDownloadLink("Full Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const downloadFilteredButton = newElement('button', { innerText: "Download Filtered" });
    registerElement(downloadFilteredButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFilteredData(); const download = createDownloadLink("Filtered Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" })
    addElements([startLabel, endLabel, botFlowLabel], inputs)
    addElements([inputs, fieldContainer, startButton, downloadAllButton, downloadFilteredButton, logoutButton, results], page);
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

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}

var tabs = [];
var fileContents;

runLoginProcess(showLoginPage, showMainMenu);

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
    const addFieldButton = newElement("button", { innerText: "+", title: "Add Field Below" });
    registerElement(addFieldButton, "click", () => { addElement(createFieldOptions(), fieldOptionContainer, "afterend") });

    const fieldSelector = newElement("select", { class: ["fieldType"] });
    populateFieldSelector(fieldSelector, "Conversation");

    const customInput = newElement("input", { class: ["customPath"] });
    registerElement(fieldSelector, "change", () => { if (fieldSelector.value === "custom") { addElement(customInput, fieldSelector, "afterend") } else { customInput.remove(); } })

    addElements([fieldSelector, removeButton, addFieldButton], fieldOptionContainer);
    return fieldOptionContainer;
}

function populateFieldSelector(selector, ) {
    for (let field of window.fields) {
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