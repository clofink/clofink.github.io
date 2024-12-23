function drawResults (results, start, end) {
    google.charts.load('current', { 'packages': ['timeline'] });
    google.charts.setOnLoadCallback(() => {
        var container = document.getElementById('results');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'User' });
        dataTable.addColumn({ type: 'string', id: 'Status' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });
        const dataTableRows = [];
        const userKeys = Object.keys(results).sort();
        for (const userName of userKeys) {
            const userTimes = results[userName];
            for (const time of userTimes) {
                // need to clamp start/end dates

                const startTime = new Date(time.startTime ?? start) < new Date(start) ? new Date(start) : new Date(time.startTime ?? start);
                const endTime = new Date(time.endTime ?? end) > new Date(end) ? new Date(end) : new Date(time.endTime ?? end);
                const statusName = time.routingStatus || time.systemPresence || "Unknown";
                if (statusName === "OFFLINE") continue;
                dataTableRows.push([userName, statusName, startTime, endTime]);
            }
        }
        dataTable.addRows(dataTableRows);
        chart.draw(dataTable);
    })
}

async function userDetailsJob(startDate, endDate) {
    // Submit a query to create a job. A jobId will be returned. Hang onto this jobId 
    // (HTTP POST /api/v2/analytics/conversations/details/jobs).
    const newJob = await createJob(startDate, endDate);
    // Armed with your jobId, you should now periodically poll for the status of your job 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}).
    await await pollStatus(makeGenesysRequest, [`/api/v2/analytics/users/details/jobs/${newJob.jobId}`], "state", ["FULFILLED"], ["FAILED"], 2000);

    // Is your job still running? Did it fail? Has it successfully completed gathering all of your data? 
    // Depending on load and the volume of data being queried, it might be on the order of seconds to minutes before you see your job complete.
    // If and only if your job has successfully completed, is it time for you to retrieve the results. 
    // At this point, you can ask for the first page of data back 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}/results). 
    const results = await getJobResults(newJob.jobId);

    // Alongside the results of your query, you will find a cursor. 
    // This is what you will use to advance to the next page of data (that is, this is an iterator and not random-access/numbered-page-style access). 
    // Use that cursor as a query parameter on the URL to advance to the next page of results. 
    // Each page will have a unique cursor to advance you forward. If there is no cursor in the page response, there is no data beyond this page.
    return results;
}

async function createJob(startDate, endDate) {
    const body = {
        "interval": `${startDate}/${endDate}`
    }
    return makeGenesysRequest(`/api/v2/analytics/users/details/jobs`, "POST", body);
}

async function getJobResults(jobId) {
    return getAllCursoredGenesysItems(`/api/v2/analytics/users/details/jobs/${jobId}/results`, 100, "userDetails");
}

async function run() {
    const start = eById("startDate").value;
    const end = eById("endDate").value;

    if (!start || !end) throw new Error("Need a start or end date");
    const userDetailsCacheKey = btoa(encodeURIComponent(`${window.orgId}:${start}:${end}`));
    const orgInfoCacheKey = btoa(encodeURIComponent(window.orgId));

    const startDate = start + "T00:00:00.000Z";
    const endDate = end + "T23:59:59.999Z";

    if (window.orgInfoCacheKey !== orgInfoCacheKey) {
        const users = await getAllUsers();
        window.usersMapping = mapProperty("id", "name", users);
        window.orgInfoCacheKey = orgInfoCacheKey;
    }

    if (window.userDetailsCacheKey !== userDetailsCacheKey) {
        window.userDetailsData = await userDetailsJob(startDate, endDate);
        window.userDetailsCacheKey = userDetailsCacheKey;
    }

    const preprocessedUserDetails = {}
    for (const user of userDetailsData) {
        const userName = window.usersMapping[user.userId] ?? user.userId;
        if (user.primaryPresence) {
            const userPresenceKey = `${userName} Presence`;
            if (!preprocessedUserDetails[userPresenceKey]) {
                preprocessedUserDetails[userPresenceKey] = [];
            }
            preprocessedUserDetails[userPresenceKey].push(...user.primaryPresence);
        }
        if (user.routingStatus) {
            const userRoutingKey = `${userName} Routing`;
            if (!preprocessedUserDetails[userRoutingKey]) {
                preprocessedUserDetails[userRoutingKey] = [];
            }
            preprocessedUserDetails[userRoutingKey].push(...user.routingStatus);
        }
    }

    drawResults(preprocessedUserDetails, startDate, endDate);
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
    const currentDate = new Date().toISOString().split("T")[0];
    const date30DaysAgo = new Date(new Date().valueOf() - (86400000 * 30)).toISOString().split("T")[0];

    const inputs = newElement("div", { id: "inputs" });
    const startLabel = newElement('label', { innerText: "Start Date: " });
    const startDate = newElement('input', { type: "date", id: "startDate", value: date30DaysAgo });
    addElement(startDate, startLabel);
    const endLabel = newElement('label', { innerText: "End Date: " });
    const endDate = newElement('input', { type: "date", id: "endDate", value: currentDate });
    addElement(endDate, endLabel);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => { showLoading(run) });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);

    const results = newElement('div', { id: "results" })
    addElements([startLabel, endLabel], inputs)
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

function createDownloadLink(fileName, fileContents, fileType) {
    const fileData = new Blob([fileContents], { type: fileType });
    const fileURL = window.URL.createObjectURL(fileData);
    return newElement('a', { href: fileURL, download: fileName });
}