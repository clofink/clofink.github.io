window.mappings = [
    { name: "Conference Start", path: "conferenceStart", level: "interaction" }
]

async function auditJob(serviceName, startDate, endDate) {
    // Submit a query to create a job. A jobId will be returned. Hang onto this jobId 
    // (HTTP POST /api/v2/analytics/conversations/details/jobs).
    const newJob = await createJob(serviceName, startDate, endDate);
    // Armed with your jobId, you should now periodically poll for the status of your job 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}).
    await getStatus(newJob.id);

    // Is your job still running? Did it fail? Has it successfully completed gathering all of your data? 
    // Depending on load and the volume of data being queried, it might be on the order of seconds to minutes before you see your job complete.
    // If and only if your job has successfully completed, is it time for you to retrieve the results. 
    // At this point, you can ask for the first page of data back 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}/results). 
    const results = await getJobResults(newJob.id);

    // Alongside the results of your query, you will find a cursor. 
    // This is what you will use to advance to the next page of data (that is, this is an iterator and not random-access/numbered-page-style access). 
    // Use that cursor as a query parameter on the URL to advance to the next page of results. 
    // Each page will have a unique cursor to advance you forward. If there is no cursor in the page response, there is no data beyond this page.
    return results;
}

async function createJob(serviceName, startDate, endDate) {
    const body = {
        "interval": `${startDate}/${endDate}`,
        "serviceName": serviceName,
        "sort": [
            {
                "name": "Timestamp",
                "sortOrder": "desc"
            }
        ]
    }
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/audits/query`;
    const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    if (!result.ok) {
        throw resultJson.message;
    }
    return resultJson;
}

async function getStatus(transactionId) {
    // Armed with your jobId, you should now periodically poll for the status of your job 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}).
    return new Promise((resolve, reject) => {
        const repeater = setInterval(async () => {
            const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/audits/query/${transactionId}`;
            const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
            const resultJson = await result.json();
            if (!result.ok) {
                reject();
            }
            if (resultJson.state === "Succeeded") {
                clearInterval(repeater);
                resolve();
            }
            else if (resultJson.state === "Failed") {
                clearInterval(repeater);
                reject();
            }
        }, 2000);
    })
}

async function getJobResults(transactionId) {
    let truncated = true;
    let cursor = "";
    const results = [];

    while (truncated === true) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/audits/query/${transactionId}/results?pageSize=100&cursor=${cursor}`;
        const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        if (!result.ok) {
            throw resultJson.message;
        }
        if(resultJson.entities) results.push(...resultJson.entities);
        if (resultJson.cursor) {
            cursor = encodeURIComponent(resultJson.cursor)
        }
        else {
            truncated = false;
        }
    }
    return results;
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

async function runAudit() {
    const orgInfoCacheKey = btoa(encodeURIComponent(window.orgId));
    if (window.orgInfoCacheKey !== orgInfoCacheKey) {
        const users = await getAllUsers();
        const authTokens = await getAllOauthClients();
        window.usersMapping = mapProperty("id", "name", users);
        window.tokensMapping = mapProperty("id", "name", authTokens);
        window.orgInfoCacheKey = orgInfoCacheKey;
    }

    const startDate = eById('startDate').value + "T00:00:00.000Z";
    const endDate = eById('endDate').value + "T23:59:59.999Z";
    const serviceName = eById('serviceName').value;
    const auditItems = await auditJob(serviceName, startDate, endDate);

    const headers = ["Event Date", "User ID", "Remote IP", "Level", "Action", "Entity Type", "Entity Name", "Status", "Properties Changed", "Old Values", "New Values", "Context", "Changed Entity Names", "Changed Entity Types", "Changed Entity Old Values", "Changed Entity New Values"];
    const paths = ["eventDate", "user.id", "remoteIp", "level", "action", "entityType", "entity.name", "status", "propertyChanges.property", "propertyChanges.oldValues", "propertyChanges.newValues", "context", "entityChanges.entityName", "entityChanges.entityType", "entityChanges.oldValues", "entityChanges.newValues"];
    const dataRows = [];
    for (let auditItem of auditItems) {
        const dataRow = [];
        for (let path of paths) {
            if (path === "user.id") dataRow.push(addIfProperty(auditItem, path, "", "usersMapping"));
            else dataRow.push(addIfProperty(auditItem, path, ""));
        }
        dataRows.push(dataRow);
    }

    window.displayTable = new PagedTable(headers, dataRows, 50, {}, true, true);
    const results = eById("results");
    clearElement(results);
    addElement(window.displayTable.getContainer(), results);

    log(auditItems);
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);

    const currentDate = new Date().toISOString().split("T")[0];
    const twoWeeksAgoDate = new Date(new Date().valueOf() - (86400000 * 14)).toISOString().split("T")[0];
    const startDateLabel = newElement('label', {innerText: "Start Date: "});
    const startDateInput = newElement("input", { type: "date", id: "startDate", value: twoWeeksAgoDate});
    addElement(startDateInput, startDateLabel);
    const endDateLabel = newElement('label', {innerText: "End Date: "});
    const endDateInput = newElement("input", { type: "date", id: "endDate", value: currentDate});
    addElement(endDateInput, endDateLabel);
    const serviceSelect = newElement("select", { id: "serviceName" });
    const services = ["AgentConfig","AnalyticsReporting","Architect","Billing","Callback","Coaching","ContactCenter","ContentManagement","Datatables","Directory","Emails","EmployeeEngagement","EmployeePerformance","ExternalContacts","GDPR","Gamification","Groups","Integrations","JourneyAnalytics","Knowledge","LanguageUnderstanding","Learning","Limits","LogCapture","Marketplace","Messaging","NumberPurchasing","Outbound","PeoplePermissions","PredictiveEngagement","Presence","ProcessAutomation","Quality","ResponseManagement","Routing","SCIM","Scripter","SpeechAndTextAnalytics","Supportability","TaskManagement","Telephony","Triggers","WebDeployments","Webhooks","WorkforceManagement"];
    for (let service of services) {
        const serviceOption = newElement('option', { innerText: service });
        addElement(serviceOption, serviceSelect);
    }
    const downloadAllButton = newElement('button', { innerText: "Download All" });
    registerElement(downloadAllButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFullData(); const download = createDownloadLink("Full Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const downloadFilteredButton = newElement('button', { innerText: "Download Filtered" });
    registerElement(downloadFilteredButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFilteredData(); const download = createDownloadLink("Filtered Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });

    const startButton = newElement('button', { innerText: "Start"} );
    registerElement(startButton, 'click',  () => {showLoading(runAudit)});
    const logoutButton = newElement('button', { innerText: "Logout"} );
    registerElement(logoutButton, 'click', logout);

    const results = newElement('div', { id: "results" })
    addElements([startDateLabel, endDateLabel, serviceSelect, startButton, downloadAllButton, downloadFilteredButton, logoutButton, results], page)

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
    window.flows = undefined;
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

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
}

async function getAllUsers() {
    const users = [];
    let pageNum = 0;
    let totalPages = 1;

    while (pageNum < totalPages) {
        pageNum++;
        const body = {
            "pageSize": 100,
            "pageNumber": pageNum,
            "query": [
                {
                    "type": "EXACT",
                    "fields": ["state"],
                    "values": ["active"]
                }
            ],
            "sortOrder": "ASC",
            "sortBy": "name",
            "expand": [],
            "enforcePermissions": false
        }
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/search`;
        const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
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

async function getAllOauthClients() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/oauth/clients?pageSize=99999`;
    const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
    const resultJson = await result.json();
    return resultJson.entities;
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