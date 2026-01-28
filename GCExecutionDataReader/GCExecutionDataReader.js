async function getExecutionDataIds(body) {
    const path = `/api/v2/flows/instances/query`
    return makeGenesysRequest(path, "POST", body);
}

async function startJob(body) {
    const path = `/api/v2/flows/instances/jobs`
    return makeGenesysRequest(path, "POST", body);
}

async function getJobStatus(jobId) {
    const path = `/api/v2/flows/instances/jobs/${jobId}`
    return makeGenesysRequest(path);
}

async function getExecutionHistoryForConversation(conversationId) {
    const requestBody = {
        "query": [
            {
                "criteria": {
                    "value": conversationId,
                    "key": "ConversationId",
                    "operator": "eq"
                }
            }
        ]
    }
    const executionDataResult = await getExecutionDataIds(requestBody);

    const executionIds = executionDataResult.entities.map((e) => e.id);
    if (executionIds.length === 0) return [];

    const createJobBody = {
        "ids": executionIds
    }
    const exportJobs = await startJob(createJobBody)

    // getFunc, getFuncArgs, resultKey, successes, failures, interval
    // Registered, Running, Success, Failed
    await pollStatus(getJobStatus, [exportJobs.id], "jobState", ["Success"], ["Failed"], 1000);

    const results = [];
    const jobResult = await getJobStatus(exportJobs.id);
    for (const job of jobResult.entities) {
        if (!job.failed) {
            const executionResponse = await fetch(job.downloadUri);
            const executionData = await executionResponse.json();
            results.push(executionData);
        }
        else {
            log(`Job failed with status code: ${job.statusCode}`, "error");
        }
    }
    return results;
}

async function run() {
    const importElement = document.getElementById('import');
    const importFiles = await getFile(importElement);
    const importJsons = [];
    try {
        for (const file of importFiles) {
            const json = JSON.parse(file);
            importJsons.push(json);
        }
    }
    catch (e) {
        log("Import file was not valid JSON", "error");
    }
    const conversationInput = document.getElementById('conversationId');
    const conversationId = conversationInput?.value;

    importElement.value = "";
    conversationInput.value = "";

    if (!conversationId && importJsons.length === 0) {
        log(`No Conversation ID or file is provided`, "error");
        return;
    }
    let result;
    if (conversationId) {
        result = await getExecutionHistoryForConversation(conversationId);
    }
    for (const executionData of result || importJsons) {
        load(executionData);
    }
}

function exportData() {
    if (!window.headerFields || !window.dataRows) {
        log("No data to export", "error");
        return;
    }
    const download = createDownloadLink("Execution Data.csv", Papa.unparse([window.headerFields, ...window.dataRows]), "text/csv");
    download.click();
}

function prettyPrintMs(ms) {
    const millis = ms % 1000;
    const totalSeconds = Math.floor(ms / 1000);
    const sec_num = parseInt(totalSeconds, 10);
    const minutes = Math.floor(sec_num / 60) % 60;
    const seconds = sec_num % 60;

    const pretty = [minutes, seconds].map(v => v < 10 ? "0" + v : v).join(":")
    return `${pretty}.${millis.toString().padStart(3, "0")}`;
}

function createDownloadLink(fileName, fileContents, fileType) {
    const fileData = new Blob([fileContents], { type: fileType });
    const fileURL = window.URL.createObjectURL(fileData);
    return newElement('a', { href: fileURL, download: fileName });
}

function addHelp(textList) {
    const details = newElement('details');
    const summary = newElement("summary", { innerText: "Help" });
    const listContainer = newElement("ul");
    for (let text of textList) {
        const listItem = newElement('li', { innerText: text });
        addElement(listItem, listContainer);
    }
    addElements([summary, listContainer], details);
    return details;
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
    const helpSection = addHelp([
        `Must use Code Authorization OAuth token`,
        `Required scopes are: organization:readonly, architect:readonly`
    ])
    const parent = eById('page');
    clearElement(parent);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElements([inputsWrapper, helpSection], parent);
}

function createTableHeader(flow, actionCount) {
    const tableHeader = newElement('div', { class: ['tableHeader'], innerText: `Flow Name: ${flow.flowName} v${flow.flowVersion}\nInteraction ID: ${flow.conversationId}\nTotal Flow Time: ${prettyPrintMs(new Date(flow.endDateTime) - new Date(flow.startDateTime))}ms for ${actionCount} actions` });
    return tableHeader;
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);

    const conversationIdLabel = newElement('label', { innerText: "Conversation ID: " });
    const conversationIdInput = newElement('input', { type: "text", id: "conversationId" });
    addElement(conversationIdInput, conversationIdLabel);

    const fileLabel = newElement('label', { innerText: "Execution JSON: " });
    const fileInput = newElement('input', { type: "file", id: "import" });
    addElement(fileInput, fileLabel);

    addElement(conversationIdLabel, page);
    addElement(fileLabel, page);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, 'click', run);
    addElement(startButton, page);

    const exportButton = newElement('button', { innerText: "Export" });
    registerElement(exportButton, 'click', exportData);
    addElement(exportButton, page);

    const resultDiv = newElement('div', { id: "results" });
    addElement(resultDiv, page);
    const cummulativeResultsDiv = newElement('div', { id: "cummulative-results" });
    addElement(cummulativeResultsDiv, page);

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

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

async function getOrgDetails() {
    const path = `/api/v2/organizations/me`;
    return makeGenesysRequest(path);
}

function load(executionData) {
    log(executionData)
    const steps = getTaskSteps(executionData.flow);
    const flowEndedTime = new Date(executionData.flow.endDateTime);
    // update the durations for each item here
    for (let i = 1; i < steps.length; i++) {
        const currentStep = steps[i];
        const prevStep = steps[i - 1];
        prevStep.duration = new Date(currentStep.dateTime) - new Date(prevStep.dateTime);

        // if it is the last one, set its own duration to the difference between its started time and ended time
        if (i === steps.length - 1) {
            currentStep.duration = flowEndedTime - new Date(currentStep.dateTime);
        }
    }

    window.headerFields = ["Action Number", "Type", "Start Date", "Tracking ID", "Name", "Duration"];
    let actionNum = 0;
    const specialOnes = ["eventLoop", "startedFlow", "endedFlow"]
    window.dataRows = steps.map((e) => {
        if (e.type.includes('action') || specialOnes.includes(e.type)) actionNum++;
        return [e.type.includes('action') || specialOnes.includes(e.type) ? actionNum : "", e.type, e.dateTime, e.trackingId || "", e.name || "", prettyPrintMs(e.duration)]
    });

    const totalTime = new Date(executionData.flow.endDateTime) - new Date(executionData.flow.startDateTime);
    const cummulativeHeaderFields = ['Tracking ID', 'Name', 'Type', 'Count', 'Total (in ms)', 'Average (in ms)', 'High (in ms)', 'Low (in ms)', 'Percent of Total Time'];
    const cummulativeData = {};
    for (const step of steps) {
        // skip ones that do not have a tracking ID
        if (step.trackingId === undefined) continue;
        // initialize the object with all properties needed
        if (!Object.hasOwnProperty.call(cummulativeData, step.trackingId)) cummulativeData[step.trackingId] = { actionName: step.name, actionType: step.type, count: 0, high: 0, low: Infinity, total: 0, average: 0, percentTotal: 0 };
        cummulativeData[step.trackingId].count++;
        cummulativeData[step.trackingId].total += step.duration;
        if (step.duration > cummulativeData[step.trackingId].high) cummulativeData[step.trackingId].high = step.duration;
        if (step.duration < cummulativeData[step.trackingId].low) cummulativeData[step.trackingId].low = step.duration;
        cummulativeData[step.trackingId].average = Math.round(cummulativeData[step.trackingId].total / cummulativeData[step.trackingId].count);
        cummulativeData[step.trackingId].percentTotal = Math.round((cummulativeData[step.trackingId].total / totalTime) * 10000) / 100;
    }
    const cummulativeDataRows = Object.entries(cummulativeData).map(([key, value]) => ([key, value.actionName, value.actionType, value.count, value.total, value.average, value.high, value.low, value.percentTotal]));

    const resultsElem = document.getElementById('results');
    const resultTable = new PagedTable(
        window.headerFields,
        window.dataRows,
        25,
        {},
        true,
        true,
        "-"
    );
    clearElement(resultsElem);
    const tableHeader = createTableHeader(executionData.flow, steps.length);
    addElement(tableHeader, resultsElem);
    addElement(resultTable.container, resultsElem);

    const cummulativeResultElem = document.getElementById('cummulative-results');
    const cummulativeResultTable = new PagedTable(
        cummulativeHeaderFields,
        cummulativeDataRows,
        25,
        {},
        true,
        true,
        "-"
    );
    clearElement(cummulativeResultElem);
    const cummulativeTableHeader = createTableHeader(executionData.flow, steps.length);
    addElement(cummulativeTableHeader, cummulativeResultElem);
    addElement(cummulativeResultTable.container, cummulativeResultElem);

    log(steps);
    return steps;
}

function getTaskSteps(task) {
    const taskSteps = [];
    for (const step of task.execution) {
        const [stepType, stepInfo] = Object.entries(step)[0];
        const currentStepInfo = {
            type: stepType,
            dateTime: stepInfo.dateTime,
            trackingId: stepInfo.trackingId,
            name: stepInfo.actionName || stepInfo.taskName,
            fullInfo: stepInfo
        }

        // if (stepType.includes('action')) {
        taskSteps.push(currentStepInfo);
        // }

        // if the child has execution, add each step to the total
        if (stepInfo.hasOwnProperty('execution')) {
            taskSteps.push(...getTaskSteps(stepInfo));
        }
    }
    return taskSteps;
}

runLoginProcess(showLoginPage, showMainMenu);