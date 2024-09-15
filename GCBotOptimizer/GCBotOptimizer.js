var queryConfidences = {};
var intentCounts = {};
var botFlowCache = {};

async function run(flowId) {
    await getQueryConfidences(flowId);

    const flowVersion = await getBotFromFile() || await getBotVersion(flowId);

    const newFlowName = `${flowVersion.name} Copy - NLU Optimization`
    const createFlowBody = { "type": "digitalbot", "name": newFlowName, "description": `Flow with a copy of the intents from ${flowVersion.name} used for automated NLU testing and optimization`, "division": { "id": "235a0cf9-7d53-43e1-928e-520327a7e38f" }, "worktypeId": null }
    const newFlow = await makeGenesysRequest(`/api/v2/flows?language=en-us`, "POST", createFlowBody);

    const disconnectAction = createDisconnectAction()
    const initialSequenceId = crypto.randomUUID();
    const flowVersionBody = createInitialFlow(initialSequenceId, newFlow.nluInfo.domain.id, disconnectAction);

    for (let intent in flowVersion.nluMetaData.intents) {
        flowVersionBody.nluMetaData.intents[intent] = {
            confirmation: {
                text: `ToCommunication("I think you want to ${intent}, is that correct?")`,
                type: "com"
            }
        };
    }

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

    flowVersionBody.nluMetaData.rawNlu = JSON.stringify(originalMetaData);
    flowVersionBody.nluMetaData.slots = flowVersion.nluMetaData.slots;
    flowVersionBody.nluMetaData.archNlu = flowVersion.nluMetaData.archNlu;
    flowVersionBody.userInputSettings = flowVersion.userInputSettings;

    for (let key in flowVersion.nluMetaData.mappings.intentsToReusableTasks) {
        const newTask = createTaskAction(key);
        flowVersionBody.flowSequenceItemList.push(newTask);
        flowVersionBody.nluMetaData.mappings.intentsToReusableTasks[key] = { id: newTask.id }
    }

    const publishedVersion = await makeGenesysRequest(`/api/v2/flows/${newFlow.id}/versions`, "POST", flowVersionBody);
    try {
        await publishFlow(newFlow.id);
    }
    catch (error) {
        console.log("Deleting the flow");
        console.error(error);
        // await deleteFlow(newFlow.id);
        return;
    }

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
            testResult = await testFlow(publishedVersion.nluInfo.domain.id, publishedVersion.nluInfo.version.id, query);
        }
        catch (err) {
            console.error(err);
            testResult = await testFlow(publishedVersion.nluInfo.domain.id, publishedVersion.nluInfo.version.id, query);
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
    console.log(total);
    console.log(totalInstances);
    console.log(results);

    await deleteFlow(newFlow.id);
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

async function getBotVersion(flowId) {
    if (!window.botFlowCache[flowId]) {
        window.botFlowCache[flowId] = await makeGenesysRequest(`/api/v2/flows/${flowId}/latestconfiguration`);
    }
    return window.botFlowCache[flowId];
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

async function updateUtterances(flowId, intentName) {
    const utterances = await createUtteranceList(flowId, intentName);
    const container = eById("results");
    clearElement(container);
    for (let utterance of utterances) {
        let fullUtterance = flattenUtterance(utterance.segments);
        addElement(createUtteranceItem(fullUtterance), container);
    }
}

async function createUtteranceList(flowId, intentName) {
    const botflow = await getBotFromFile() || await getBotVersion(flowId);
    const intents = JSON.parse(botflow?.nluMetaData?.rawNlu || "{\"intents\":[]}").intents;
    const intent = intents.find((e) => e.name === intentName);
    return intent?.utterances || [];
}

function createUtteranceItem(utterance) {
    const utteranceContainer = newElement('div', { class: ["utterance"] });
    const utteranceInput = newElement('input', { value: utterance || "" });
    const addAfterButton = newElement('button', { innerText: "+", title: "Add Below" });
    registerElement(addAfterButton, "click", () => {
        const newUtterance = createUtteranceItem();
        addElement(newUtterance, utteranceContainer, "afterend");
    })
    const removeButton = newElement('button', { innerText: "x", title: "Remove" });
    registerElement(removeButton, "click", () => {
        utteranceContainer.remove();
    })
    const moveUpButton = newElement('button', { innerText: "▲", title: "Move Up" });
    registerElement(moveUpButton, "click", () => {
        const allUtteranceContainters = Array.from(qsa(".utterance"));
        const currentIndex = allUtteranceContainters.indexOf(utteranceContainer);
        if (currentIndex === 0) return;
        const prevUtteranceContainer = allUtteranceContainters[currentIndex - 1];
        utteranceContainer.remove();
        addElement(utteranceContainer, prevUtteranceContainer, "beforebegin");
    })
    const moveDownButton = newElement('button', { innerText: "▼", title: "Move Down" });
    registerElement(moveDownButton, "click", () => {
        const allUtteranceContainters = Array.from(qsa(".utterance"));
        const currentIndex = allUtteranceContainters.indexOf(utteranceContainer);
        if (currentIndex === allUtteranceContainters.length - 1) return;
        const nextUtteranceContainer = allUtteranceContainters[currentIndex + 1];
        utteranceContainer.remove();
        addElement(utteranceContainer, nextUtteranceContainer, "afterend");
    })
    addElements([utteranceInput, moveUpButton, moveDownButton, addAfterButton, removeButton], utteranceContainer);
    return utteranceContainer;
}

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}

function encodeFlow(flow) {
    return btoa(encodeURIComponent(JSON.stringify(flow)))
}

function updateFlow() {

}

function createTaskAction(name) {
    const disconnectAction = createDisconnectAction();
    return {
        actionList: [disconnectAction],
        name: name,
        id: crypto.randomUUID(),
        startAction: disconnectAction.id,
        variables: [],
        "__type": "Task"
    }
}

function createDisconnectAction() {
    return {
        id: crypto.randomUUID(),
        name: "Disconnect",
        "__type": "DisconnectAction"
    }
}
async function publishFlow(flowId) {
    const channel = await createChannel();
    await addSubscription(flowId, channel.id);
    const socketConnection = new WebSocket(channel.connectUri);
    await makeGenesysRequest(`/api/v2/flows/actions/publish?flow=${flowId}`, "POST");

    return new Promise((resolve, reject) => {
        socketConnection.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message?.eventBody?.currentOperation?.actionName === "PUBLISH" && message?.eventBody?.currentOperation?.complete) {
                socketConnection.close();
                if (message?.eventBody?.currentOperation?.actionStatus === "SUCCESS") {
                    resolve(message);
                }
                else {
                    reject(message);
                }
            }
        }
        socketConnection.onerror = (event) => {
            reject(event)
        }
    });
}

async function deleteFlow(flowId) {
    return await makeGenesysRequest(`/api/v2/flows?id=${flowId}`, "DELETE");
    const channel = await createChannel();
    await addSubscription(flowId, channel.id);
    const socketConnection = new WebSocket(channel.connectUri);
    await makeGenesysRequest(`/api/v2/flows?id=${flowId}`, "DELETE");

    return new Promise((resolve, reject) => {
        socketConnection.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message?.eventBody?.currentOperation?.actionName === "DELETE" && message?.eventBody?.currentOperation?.complete) {
                socketConnection.close();
                if (message?.eventBody?.currentOperation?.actionStatus === "SUCCESS") {
                    resolve(message);
                }
                else {
                    reject(message);
                }
            }
        }
        socketConnection.onerror = (event) => {
            reject(event)
        }
    });
}

async function createChannel() {
    return makeGenesysRequest(`/api/v2/notifications/channels`, "POST");
}

async function addSubscription(flowId, channelId) {
    const body = [{ "id": `flows.${flowId}` }]
    return makeGenesysRequest(`/api/v2/notifications/channels/${channelId}/subscriptions`, "POST", body);
}

function createInitialFlow(initialSequenceId, nluDomainId, disconnectAction) {
    return {
        "nextTrackingNumber": 12,
        "defaultLanguage": "en-US",
        "description": "",
        "initialSequence": initialSequenceId,
        "name": "Brand New Test",
        "uiMetaData": {
            "bridgeServerActions": [],
            "screenPops": []
        },
        "supportedLanguages": [
            "en-US"
        ],
        "manifest": {
            "nluDomain": [{ "id": nluDomainId, "context": [{ "id": "botFlowSettings" }] }],
            "language": [{ "id": "en-US" }],
            "userPrompt": [],
            "systemPrompt": []
        },
        "type": "digitalbot",
        "botFlowSettings": {
            "engineVersion": "3.0",
            "nluDomainId": nluDomainId,
            "nluDomainVersionId": null,
            "virtualAgentEnabled": false
        },
        "userInputSettings": {
            "enableBargeIn": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "enableAutomaticQuickReplies": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "noMatchesMax": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "noInputsMax": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "endOfSessionMessage": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\"))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "lit": {
                                                "pos": 38,
                                                "text": "I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.",
                                                "type": "str"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\"))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "56ad768d-cb86-454e-a22c-5d97610cee24",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "15279dd5-0383-4a66-98af-5780598dbaf7",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "noInputsTimeout": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "P0D0H1M0S0F",
                        "type": "dur"
                    }
                },
                "text": "P0D0H1M0S0F",
                "type": "dur",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "speechToTextSpeechDetectionSensitivity": {
                "config": {
                    "emp": {
                        "pos": 1,
                        "text": "",
                        "type": "dec"
                    }
                },
                "text": "",
                "type": "dec",
                "uiMetaData": {
                    "mode": 3
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "speechToTextMaxSpeechTimeout": {
                "config": {
                    "emp": {
                        "pos": 1,
                        "text": "",
                        "type": "dur"
                    }
                },
                "text": "",
                "type": "dur",
                "uiMetaData": {
                    "mode": 3
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "enableIntentClassificationHinting": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "",
                        "type": "bln"
                    }
                },
                "text": "",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "interDigitTimeout": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "P0D0H0M3S0F",
                        "type": "dur"
                    }
                },
                "text": "P0D0H0M3S0F",
                "type": "dur",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "dtmfTerminatingCharacter": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "#",
                        "type": "str"
                    }
                },
                "text": "#",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "confirmationRejectionsMax": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "collectionLowConfidenceThreshold": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "20",
                        "type": "int"
                    }
                },
                "text": "20",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "collectionHighConfidenceThreshold": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "70",
                        "type": "int"
                    }
                },
                "text": "70",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "confirmationLowConfidenceThreshold": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "40",
                        "type": "int"
                    }
                },
                "text": "40",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "noMatchApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry.\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry.",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry.\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "f1edb484-4c01-4bc1-b23c-4431daa9885e",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "042d4223-7176-4042-9d2c-9036c69b15e9",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry.\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry.",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry.\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "noInputsApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry, I didn't receive any input from you.\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry, I didn't receive any input from you.",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry, I didn't receive any input from you.\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "0ab4be25-cbdb-4e37-b46d-3f4ee9690ea6",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "f287b97a-c74f-4e48-98f2-632f0af0e533",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry, I didn't receive any input from you.\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry, I didn't receive any input from you.",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry, I didn't receive any input from you.\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry, I didn't receive any input from you."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "noToConfirmationApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"My mistake.\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "My mistake.",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"My mistake.\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "c02f478a-74ca-47e9-ab19-d6148840d7ca",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "8ec24c2c-92e9-4cd5-b204-e3dc7db5b838",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"My mistake.\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "My mistake.",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"My mistake.\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "My mistake."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "confirmationNoMatchApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry, please input \"Yes\" or \"No\".",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "8eee188c-72c2-462e-b894-b2d77dda20f9",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "bc6574a5-ae13-4f2d-ae63-87e12f29e822",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry, please input \"Yes\" or \"No\".",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry, please input \"Yes\" or \"No\"."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "confirmationNoInputApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry, I didn't receive any input from you.  Please input \"Yes\" or \"No\".",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "bec2b623-ff35-421a-a9f4-022eb1c749d0",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "409700ce-69bd-41ad-8af6-17f5b932c7e3",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry, I didn't receive any input from you.  Please input \"Yes\" or \"No\".",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry, I didn't receive any input from you.  Please input \"Yes\" or \"No\"."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ]
        },
        "errorHandling": {
            "recognitionHandlingType": "Exit",
            "agentEscalationConfirmation": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"You want to speak to an advisor. Is that correct?\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "You want to speak to an advisor. Is that correct?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"You want to speak to an advisor. Is that correct?\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "e592b846-15b1-4d0c-b461-3f4d11fde8b9",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "b281a684-9f7c-4fc4-863d-d3b2cb4002c2",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"You want to speak to an advisor. Is that correct?\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "You want to speak to an advisor. Is that correct?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"You want to speak to an advisor. Is that correct?\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "You want to speak to an advisor. Is that correct?"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "agentEscalationHandover": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"One moment, please, and I will put you through to someone.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "One moment, please, and I will put you through to someone.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"One moment, please, and I will put you through to someone.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "9bd4d3b8-4bf8-492e-a8e4-a8bc52a7ab3a",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "37362ab6-8aec-4932-a8e6-b6105f385b09",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"One moment, please, and I will put you through to someone.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "One moment, please, and I will put you through to someone.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"One moment, please, and I will put you through to someone.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "One moment, please, and I will put you through to someone."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "enableAgentEscalation": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "errorEventHandover": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Sorry, an error occurred. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "b6d16419-6a2f-4b22-9f1e-cf07102a874c",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "53522c5e-0f6a-4afa-80f3-baf4d203b8d8",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Sorry, an error occurred. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Sorry, an error occurred. One moment, please, while I put you through to someone who can help."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "recognitionEventHandover": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "b04d43c6-5cb8-4ea9-a13c-dd04a9f916df",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "ac277e8d-55d3-4d98-8316-72bab0e25350",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "agentEscalationHandlingType": "Exit",
            "handlingType": "Exit"
        },
        "nluMetaData": {
            "intents": {},
            "slots": {},
            "rawNlu": null,
            "intentHealthInfo": null,
            "rawNluCompressionFormat": null,
            "nluGeneratedInputInfo": {},
            "mappings": {
                "intentsToReusableTasks": {},
                "slotsToGrammars": {},
                "slotToSlotVariables": {},
                "slotToReferencingIntents": {},
                "slotToEntityTypes": {},
                "dynamicSlotTypes": {}
            }
        },
        "knowledgeSettings": {
            "knowledge": null,
            "knowledgeConfirmation": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Did this answer your question?\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Did this answer your question?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Did this answer your question?\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "9793db06-bca0-4152-b55d-6a22e4fbca1a",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "7411a2bd-b7d5-45aa-8df1-8ec12f904c45",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Did this answer your question?\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Did this answer your question?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Did this answer your question?\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Did this answer your question?"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseFollowup": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"I hope I answered your question.  You can ask anything else you might want to know.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "I hope I answered your question.  You can ask anything else you might want to know.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"I hope I answered your question.  You can ask anything else you might want to know.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "51c610d0-b10e-4885-9d8a-812a2bf34d42",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "b3142f88-305f-4b40-b655-215b388bb84a",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"I hope I answered your question.  You can ask anything else you might want to know.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "I hope I answered your question.  You can ask anything else you might want to know.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"I hope I answered your question.  You can ask anything else you might want to know.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "I hope I answered your question.  You can ask anything else you might want to know."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseMulti": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"To help me clarify your goal, please choose a number from the following list:\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "To help me clarify your goal, please choose a number from the following list:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"To help me clarify your goal, please choose a number from the following list:\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "f7a8b814-2668-4316-b6fa-80de64af3a32",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "d5b96145-fab1-4a5c-89fd-a776653f2807",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"To help me clarify your goal, please choose a number from the following list:\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "To help me clarify your goal, please choose a number from the following list:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"To help me clarify your goal, please choose a number from the following list:\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "To help me clarify your goal, please choose a number from the following list:"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseMultiRetry": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Please choose a number, for example '1'.\\nHere's the list of options again:\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Please choose a number, for example '1'.\nHere's the list of options again:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Please choose a number, for example '1'.\\nHere's the list of options again:\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "fe1de92f-35c0-417e-863f-cb122894e795",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "cd89ee69-2848-4c29-bde5-e8ccf3bbac10",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Please choose a number, for example '1'.\\nHere's the list of options again:\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Please choose a number, for example '1'.\nHere's the list of options again:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Please choose a number, for example '1'.\\nHere's the list of options again:\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Please choose a number, for example '1'.\nHere's the list of options again:"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseSingle": {
                "config": {
                    "emp": {
                        "pos": 1,
                        "text": "",
                        "type": "com"
                    }
                },
                "text": "",
                "type": "com",
                "uiMetaData": {
                    "mode": 3
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeAnswerHighlight": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "false",
                        "type": "bln"
                    }
                },
                "text": "false",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeAnswerHighlightFullArticle": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "View Full Article",
                        "type": "str"
                    }
                },
                "text": "View Full Article",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeAnswerHighlightFlowProgression": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "Continue",
                        "type": "str"
                    }
                },
                "text": "Continue",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeNoMatch": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"None of these\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "None of these",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"None of these\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "666ad582-dfea-4b5d-97dd-411bb3d2b835",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "10cfff8e-8666-4946-ab3d-1e61a990bae8",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"None of these\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "None of these",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"None of these\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "None of these"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "maxNumOfAnswersReturned": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgePathMode": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "statement",
                        "type": "str"
                    }
                },
                "text": "statement",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "KnowledgeBase": {},
            "responseBias": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "neutral",
                        "type": "str"
                    }
                },
                "text": "neutral",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "sendKnowledgeFeedback": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeSettingsMode": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "standard",
                        "type": "str"
                    }
                },
                "text": "standard",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            }
        },
        "virtualAgentSettings": {
            "summarization": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "false",
                        "type": "bln"
                    }
                },
                "text": "false",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "assignWrapupCodes": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "false",
                        "type": "bln"
                    }
                },
                "text": "false",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "enabledWrapupCodes": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "",
                        "type": "wrc_coll",
                        "items": []
                    }
                },
                "text": "",
                "type": "wrc_coll",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            }
        },
        "debugSettings": {},
        "customDefinitions": {
            "dataTypeDefinitions": []
        },
        "defaultSettings": {},
        "flowMetaData": {
            "flowDocumentVersion": "1.0",
            "minimumServerVersion": "1.0",
            "ttsDataVersion": "1.0"
        },
        "flowSequenceItemList": [
            {
                "startAction": disconnectAction.id,
                "trackingId": 10,
                "id": initialSequenceId,
                "name": "Initial Greeting",
                "__type": "BotState",
                "actionList": [disconnectAction],
                "variables": []
            }
        ],
        "supportedLanguageOptions": [
            {
                "language": "en-US",
                "languageSkill": {
                    "config": {
                        "emp": {
                            "pos": 1,
                            "text": "",
                            "type": "lac"
                        }
                    },
                    "text": "",
                    "type": "lac",
                    "uiMetaData": {
                        "mode": 3
                    },
                    "metaData": {},
                    "version": 2
                }
            }
        ],
        "variables": []
    }
}

// window.doNotCompressFlow = true;

runLoginProcess(showLoginPage, showMainMenu);