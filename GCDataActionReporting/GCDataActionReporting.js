async function getActionReport(start, end, integrationId, actionId, durationString) {
    // POST
    // /api/v2/analytics/actions/aggregates/query
    const body = {
        "groupBy": [
            "responseStatus",
            "errorType"
        ],
        "filter": {
            "type": "and",
            "predicates": [
                {
                    "dimension": "actionId",
                    "operator": "matches",
                    "value": actionId
                },
                {
                    "dimension": "integrationId",
                    "operator": "matches",
                    "value": integrationId
                }
            ]
        },
        "interval": `${start}/${end}`,
        "granularity": durationString,
        "metrics": [
            "tTotalExecution"
        ]
    }
    return makeGenesysRequest(`/api/v2/analytics/actions/aggregates/query`, "POST", body);
}

// https://api.usw2.pure.cloud/api/v2/integrations/actions?pageSize=9999&includeAuthActions=false

// https://api.usw2.pure.cloud/api/v2/integrations?pageSize=9999&expand=config
// but which ones?
// ["custom-rest-actions", "purecloud-data-actions", "aws-lambda-data-actions", "function-data-actions", "salesforce-datadip", ""].includes(integrationType.id)

function createDataRow(fieldsInfo, dataLevelIndex, currentItems) {
    const dataRow = [];
    for (let field of fieldsInfo) {
        const fieldLevel = levels.indexOf(field.level);
        if (dataLevelIndex >= fieldLevel) {
            dataRow.push(addIfProperty(currentItems[field.level], field.path, "", field.mapping));
        }
    }
    return dataRow;
}

function formatDurationString(day = 0, hour = 0, minute = 0) {
    // P is the duration designator (for period) placed at the start of the duration representation.
    // Y is the year designator that follows the value for the number of calendar years.
    // M is the month designator that follows the value for the number of calendar months.
    // W is the week designator that follows the value for the number of weeks.
    // D is the day designator that follows the value for the number of calendar days.
    // T is the time designator that precedes the time components of the representation.
    // H is the hour designator that follows the value for the number of hours.
    // M is the minute designator that follows the value for the number of minutes.
    // S is the second designator that follows the value for the number of seconds.
    let durationString = `P`;
    if (day !== "0") durationString += day += "D";
    if (hour !== "0" || minute !== "0") durationString += "T";
    if (hour !== "0") durationString += hour += "H";
    if (minute !== "0") durationString += minute += "M";
    return durationString;
}

async function run() {
    // reset globals 
    const start = eById("startDate").value;
    const end = eById("endDate").value;
    const integrationId = eById("integrationId").value;
    const actionId = eById("actionId").value;

    const durationString = formatDurationString(eById("day").value, eById('hour').value, eById('minute').value);

    if (!start || !end) throw new Error("Need a start or end date");

    const startDate = start + "T00:00:00.000Z";
    const endDate = end + "T23:59:59.999Z";

    const reportResults = await getActionReport(startDate, endDate, integrationId, actionId, durationString);

    const headers = ["Interval Start", "Interval End"];
    const newHeaders = [];
    const allIntervals = new Set();
    const data = {}

    for (const result of reportResults.results || []) {
        const fieldName = `${result.group.errorType} (${result.group.responseStatus})`;
        newHeaders.push(fieldName);
        for (const datum of result.data) {
            if (!Object.hasOwnProperty.call(data, datum.interval)) data[datum.interval] = {};
            allIntervals.add(datum.interval);
            data[datum.interval][fieldName] = datum.metrics[0].stats.count;
        }
    }

    const dataRows = [];
    for (const interval of Array.from(allIntervals).sort((a, b) => {
        const aStart = new Date(a.split("/")[0]);
        const bStart = new Date(b.split("/")[0]);
        if (aStart > bStart) return 1;
        if (aStart < bStart) return -1;
        return 0;
    })) {
        const [intervalStart, intervalEnd] = interval.split("/");
        const newFields = [];
        for (const header of newHeaders) {
            if (!Object.hasOwnProperty.call(data[interval], header)) {
                newFields.push(0);
            }
            else {
                newFields.push(data[interval][header]);
            }
        }
        // for (const [key, value] of Object.entries(data[interval])) {
        //     dataRow[headers.indexOf(key)] = value;
        // }
        dataRows.push([intervalStart, intervalEnd, ...newFields]);
    }

    window.displayTable = new PagedTable([...headers, ...newHeaders], dataRows, 100, {}, true, true);
    const results = eById("results");
    clearElement(results);
    addElement(window.displayTable.getContainer(), results);
    return;
}

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
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

    const integrationLabel = newElement('label', { innerText: "Integration: " });
    const integrationSelect = newElement('select', { id: "integrationId" });
    addElement(integrationSelect, integrationLabel);

    const actionLabel = newElement('label', { innerText: "Action: " });
    const actionSelect = newElement("select", { id: "actionId" });
    addElement(actionSelect, actionLabel);

    const dayLabel = newElement('label', { innerText: "Days: " });
    const dayInput = newElement('input', { id: "day", type: "number", value: 0 });
    addElement(dayInput, dayLabel);

    const hourLabel = newElement('label', { innerText: "Hours: " });
    const hourInput = newElement('input', { id: "hour", type: "number", value: 0 });
    addElement(hourInput, hourLabel);

    const minuteLabel = newElement('label', { innerText: "Minutes: " });
    const minuteInput = newElement('input', { id: "minute", type: "number", value: 0, step: 15 });
    addElement(minuteInput, minuteLabel);

    showLoading(getActionsDetails, [integrationSelect, actionSelect]);

    registerElement(integrationSelect, "change", () => {
        clearElement(actionSelect);
        for (const action of window.integrationToActionMap[integrationSelect.value]) {
            const option = newElement("option", { innerText: action.name, value: action.id });
            addElement(option, actionSelect);
        }
    })

    const fieldContainer = newElement('div', { id: "fieldContainer" });

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => { showLoading(run) });
    const downloadAllButton = newElement('button', { innerText: "Download All" });
    registerElement(downloadAllButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFullData(); const download = createDownloadLink("Full Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const downloadFilteredButton = newElement('button', { innerText: "Download Filtered" });
    registerElement(downloadFilteredButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFilteredData(); const download = createDownloadLink("Filtered Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" })
    addElements([startLabel, endLabel, integrationLabel, actionLabel, dayLabel, hourLabel, minuteLabel], inputs)
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

async function getActionsDetails(integrationSelect, actionSelect) {
    const integrations = await getAllGenesysItems('/api/v2/integrations', 999, "entities");
    window.integrationList = [];
    window.integrationToActionMap = {};
    for (const integration of integrations) {
        if (integration.intendedState !== "ENABLED") continue;
        if (["custom-rest-actions", "purecloud-data-actions", "aws-lambda-data-actions", "function-data-actions", "salesforce-datadip", ""].includes(integration.integrationType.id)) {
            integrationList.push(integration);
            if (!Object.hasOwnProperty.call(integrationToActionMap, integration.id)) integrationToActionMap[integration.id] = [];
        }
    }
    for (const integration of window.integrationList.sort(sortByKey("name"))) {
        const option = newElement("option", { innerText: integration.name, value: integration.id });
        addElement(option, integrationSelect);
    }

    const actions = await getAllGenesysItems('/api/v2/integrations/actions', 999, "entities");
    for (const action of actions) {
        if (!Object.hasOwnProperty.call(window.integrationToActionMap, action.integrationId)) {
            console.log(`No integration with ID: ${action.integrationId}`);
            continue;
        }
        window.integrationToActionMap[action.integrationId].push(action);
    }

    for (const action of window.integrationToActionMap[integrationSelect.value].sort(sortByKey("name"))) {
        const option = newElement("option", { innerText: action.name, value: action.id });
        addElement(option, actionSelect);
    }
}

async function populateInputField(select, getDataFunc, dataFuncArgs) {
    const inputData = await getDataFunc(...dataFuncArgs);
    for (const item of inputData.sort(sortByKey("name"))) {
        const option = newElement("option", { innerText: item.name, value: item.id });
        addElement(option, select);
    }
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