var queryConfidences = {};
var intentCounts = {};
var botFlowCache = {};


async function createAndTrainNlu(data) {

    const newDomain = await createNluDomain("NLU Testing Domain");

    const newVersion = await createNluVersion(newDomain.id, data);

    await trainNluDomain(newDomain.id, newVersion.id);

    await pollStatus(requestUpdateOnTraining, [newDomain.id, newVersion.id], "trainingStatus", ["Trained"], ["Error"], 2000);
    return {domainId: newDomain.id, versionId: newVersion.id};
}

async function createNluDomain(name) {
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains`, "POST", {name: name});
}

async function createNluVersion(domainId, intents) {
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains/${domainId}/versions?includeUtterances=true`, "POST", intents);
}

async function trainNluDomain(domainId, versionId) {
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains/${domainId}/versions/${versionId}/train`, "POST");
}

async function requestUpdateOnTraining(domainId, versionId) {
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains/${domainId}/versions/${versionId}`);
}

async function deleteNluDomain(domainId) {
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains/${domainId}`, "DELETE", undefined, true);
}

async function run(flowId) {
    await getQueryConfidences(flowId);

    const flowVersion = await getBotFromFile() || await getBotVersion(flowId);

    const originalMetaData = JSON.parse(flowVersion.nluMetaData.rawNlu);
    const selectedIntentName = eById('intent').value;
    const selectedIntent = originalMetaData.intents.find((e) => e.name === selectedIntentName);

    const newUtteranceElems = Array.from(qsa(".utterance input"));
    const newUtterances = [];
    for (let utteranceElem of newUtteranceElems) {
        const utterance = utteranceElem.value;
        const existingUtterance = selectedIntent.utterances.find((e) => utterance === flattenUtterance(e.segments));
        if (existingUtterance) newUtterances.push(existingUtterance);
        else newUtterances.push(createNewUtterance(utterance));
    }
    selectedIntent.utterances = newUtterances;

    const nlu = await createAndTrainNlu(originalMetaData);

    const results = {
        "up": [],
        "down": [],
        "even": [],
        "change": []
    };

    let total = 0;
    let totalInstances = 0;
    for (let query in window.queryConfidences) {
        if (window.queryConfidences[query].intent !== eById("intent").value) continue;
        total++;
        totalInstances += window.queryConfidences[query].count;
        let testResult;
        try {
            testResult = await testFlow(nlu.domainId, nlu.versionId, query);
        }
        catch (err) {
            console.error(err);
            testResult = await testFlow(nlu.domainId, nlu.versionId, query);
        }
        const newResult = testResult?.output?.intents[0];
        const currentResult = window.queryConfidences[query];
        if (newResult.name === currentResult.intent) {
            const oldProb = roundTo(currentResult.confidence, 3);
            const newProb = roundTo(newResult.probability, 3);

            if (oldProb === newProb) {
                results.even.push({ query: query, old: oldProb, new: newProb, newIntent: newResult.name, oldIntent: currentResult.intent });
            }
            else if (oldProb < newProb) {
                results.up.push({ query: query, old: oldProb, new: newProb, newIntent: newResult.name, oldIntent: currentResult.intent, difference: roundTo(Math.abs(newProb - oldProb), 3) });
            }
            else {
                results.down.push({ query: query, old: oldProb, new: newProb, newIntent: newResult.name, oldIntent: currentResult.intent, difference: roundTo(Math.abs(newProb - oldProb), 3) });
            }
        }
        else {
            results.change.push({ query: query, old: oldProb, new: newProb, newIntent: newResult.name, oldIntent: currentResult.intent });
        }
    }
    console.log(results);

    // await deleteFlow(newFlow.id);
    await deleteNluDomain(nlu.domainId);
    return;
}

async function getUtteranceStats() {
    const intents = [];
    const utterances = await loadCsvFile();
    for (let turn of utterances.data) {
        if (turn["Ask Action Type"] === "WaitForInputAction" || turn["Ask Action Type"] === "DigitalMenuAction") {
            const intent = turn['Intent'];
            const utterance = turn['Utterance'];
            if (intent && turn["Intent Confidence"]) {
                let matchedIntent = intents.find((e) => e.name === intent);
                if (!matchedIntent) {
                    matchedIntent = {name: intent, words: [], utterances: []}
                    intents.push(matchedIntent);
                }
                
                let matchedUtterance = matchedIntent.utterances.find((e) => e.utterance === utterance);
                if (!matchedUtterance) {
                    matchedUtterance = {utterance: utterance, count: 0};
                    const words = ("" + utterance).toLowerCase().replaceAll(/[’']/g, "").replaceAll(/[,\."?…\s]+/g, " ").split(" ").filter((e)=> !!e);
                    for (let word of words) {
                        let matchedWord = matchedIntent.words.find((e)=> e.word === word);
                        if (!matchedWord) {
                            matchedWord = {word: word, count: 0};
                            matchedIntent.words.push(matchedWord);
                        }
                        matchedWord.count++;
                    }
                    matchedIntent.utterances.push(matchedUtterance);
                }
                matchedUtterance.count++;
            }
        }
    }

    for (let intent of intents) {
        const sortByCount = sortByKey("count");
        intent.utterances.sort(sortByCount);
        intent.words.sort(sortByCount);
    }
    return intents;
}

function roundTo(num, digits) {
    const mult = Math.pow(10, digits);
    return Math.round(num * mult) / mult;
}

function createNewUtterance(utterance) {
    return {
        id: crypto.randomUUID(),
        segments: [{
            text: utterance
        }]
    }
}

function flattenUtterance(segments) {
    let fullUtterance = "";
    for (let segment of segments) {
        fullUtterance += segment.text;
    }
    return fullUtterance;
}

async function getQueryConfidences(flowId) {
    window.queryConfidences = {};

    const csvBotTurns = await loadCsvFile();
    if (csvBotTurns) {
        for (let turn of csvBotTurns.data) {
            const result = csvBotTurn(turn);
            if (result) {
                if (window.queryConfidences[turn["Utterance"]]) window.queryConfidences[turn["Utterance"]].count++
                else window.queryConfidences[turn["Utterance"]] = result;
            }
        }
    }
    else {
        const currentDate = new Date().toISOString().split("T")[0] + "T23:59:59Z";
        const date10DaysAgo = new Date(new Date().valueOf() - (86400000 * 10)).toISOString().split("T")[0] + "T00:00:00Z";
        const jsonBotTurns = await getPagedGenesysItems(`/api/v2/analytics/botflows/${flowId}/reportingturns?interval=${date10DaysAgo}/${currentDate}`);
        for (let turn of jsonBotTurns) {
            const result = jsonBotTurn(turn);
            if (result) window.queryConfidences[turn.userInput] = result;
        }
    }
}

function jsonBotTurn(turn) {
    if (turn?.askAction?.actionType === "WaitForInputAction" || turn?.askAction?.actionType === "DigitalMenuAction") {
        if (turn?.intent?.name && turn?.intent?.confidence) {
            if (!window.intentCounts[turn.intent.name]) {
                window.intentCounts[turn.intent.name] = 0;
            }
            window.intentCounts[turn.intent.name]++;
            return { intent: turn.intent.name, confidence: turn.intent.confidence, count: 1 };
        }
    }
}

function csvBotTurn(turn) {
    if (turn["Ask Action Type"] === "WaitForInputAction" || turn["Ask Action Type"] === "DigitalMenuAction") {
        if (turn["Intent"] && turn["Intent Confidence"]) {
            if (!window.intentCounts[turn["Intent"]]) {
                window.intentCounts[turn["Intent"]] = 0;
            }
            window.intentCounts[turn["Intent"]]++;
            return { intent: turn["Intent"], confidence: turn["Intent Confidence"], count: 1 };
        }
    }
}

async function getBotFromFile() {
    const flowInputFiles = eById('flowInput').files;
    if (flowInputFiles.length < 1) return;

    const file = flowInputFiles[0];
    const reader = new FileReader();

    return new Promise((resolve) => {
        reader.addEventListener('load', function (data) {
            try {
                resolve(decodeDigitalBotFlow(data.target.result));
            }
            catch (error) {
                console.error(error);
                return;
            }
        })
        reader.readAsText(file);
    })
}

async function loadCsvFile() {
    const flowInputFiles = eById('utteranceHistory').files;
    if (flowInputFiles.length < 1) return;

    const file = flowInputFiles[0];
    const reader = new FileReader();

    return new Promise((resolve) => {
        reader.addEventListener('load', function (data) {
            try {
                fileContents = Papa.parse(data.target.result, { header: true, dynamicTyping: true });
                resolve(fileContents);
            }
            catch (error) {
                console.error(error);
                return;
            }
        })
        reader.readAsText(file);
    })
}

function decodeDigitalBotFlow(fileContents) {
    return JSON.parse(decodeURIComponent(atob(fileContents)));
}

async function testFlow(nluDomainId, nluVersionId, query) {
    const body = { "input": { "text": query } }
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains/${nluDomainId}/versions/${nluVersionId}/detect`, "POST", body);
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

async function populateBotSelect(botSelect) {
    botSelect = botSelect || eById('botFlowId');
    const digitalBots = await getAllGenesysItems(`/api/v2/flows?sortBy=name&sortOrder=asc&type=digitalbot`, 50, "entities");
    for (const flow of digitalBots) {
        if (!flow.hasOwnProperty("publishedVersion")) continue;
        const botOption = newElement("option", { innerText: flow.name, value: flow.id });
        addElement(botOption, botSelect);
    }
    await populateIntentList(digitalBots[0].id);
}

function showMainMenu() {
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

    const page = eById('page');
    clearElement(page);
    const inputs = newElement("div", { id: "inputs" });

    const intentLabel = newElement('label', { innerText: "Intent: " });
    const intentSelect = newElement('select', { id: "intent" });
    addElement(intentSelect, intentLabel);

    const botFlowLabel = newElement('label', { innerText: "Bot Flow: " })
    const botSelect = newElement('select', { id: "botFlowId" });
    const refreshButton = newElement('button', { innerText: "Refresh" });
    addElements([botSelect, refreshButton], botFlowLabel);
    registerElement(refreshButton, "click", () => { clearElement(botSelect); showLoading(populateBotSelect) });
    showLoading(populateBotSelect, [botSelect]);

    const flowInputLabel = newElement('label', { innerText: "File: " });
    const flowInput = newElement('input', { type: "file", accept: ".i3DigitalBotFlow", id: "flowInput" });
    addElement(flowInput, flowInputLabel);

    const utteranceHistoryLabel = newElement('label', { innerText: "Utterance History: " });
    const utteranceHistoryInput = newElement('input', { type: "file", accept: ".csv", id: "utteranceHistory" });
    addElement(utteranceHistoryInput, utteranceHistoryLabel);

    registerElement(botSelect, "change", () => { flowInput.value = ""; clearElement(intentSelect); showLoading(populateIntentList, [botSelect.value]) });
    registerElement(flowInput, "change", () => { clearElement(intentSelect); showLoading(populateIntentList, [botSelect.value]) });

    registerElement(intentSelect, "change", () => { updateUtterances(botSelect.value, intentSelect.value) });

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => { showLoading(run, [botSelect.value]) });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" })
    addElements([botFlowLabel, flowInputLabel, utteranceHistoryLabel, intentLabel], inputs);
    addElements([inputs, startButton, logoutButton, results], page);
}

function sortByKey(key) {
    return function (a, b) {
        if (a[key] < b[key]) return 1;
        if (a[key] > b[key]) return -1;
        return 0;
    }
}

async function populateIntentList(flowId) {
    const intentSelect = eById("intent");
    const botflow = await getBotFromFile() || await getBotVersion(flowId);
    const intents = Object.keys(botflow.nluMetaData.intents).sort();
    for (let intent of intents) {
        const intentOption = newElement('option', { innerText: intent });
        addElement(intentOption, intentSelect);
    }
    await updateUtterances(flowId, intents[0]);
}

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}
// window.doNotCompressFlow = true;

runLoginProcess(showLoginPage, showMainMenu);