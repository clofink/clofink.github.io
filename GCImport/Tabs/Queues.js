class QueuesTab extends Tab {
    tabName = "Queues";

    render() {
        window.requiredFields = ["Name"];
        window.allValidFields = ["Name", "Division", "Description", "Auto Answer", "Alerting Timeout", "SLA Percentage", "SLA Duration", "ACW", "ACW Timeout", "Manual Assignment", "Scoring Method", "Evaluation Method", "Script", "In-Queue Flow"];
    
        this.container = newElement('div', {id: "userInputs"});
        const label = newElement('label', {innerText: "Queues CSV: "});
        const fileInput = newElement('input', {type: "file", accept: ".csv"});
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', {innerText: "Start"});
        registerElement(startButton, "click", this.importQueuesWrapper);
        const logoutButton = newElement("button", {innerText: "Logout"});
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "routing" scope`, 
            `If using the Script column, "scripts-readonly" or "scripts" scope required. If using the In-Queue Flow column, "architect-readonly" or "architect" scope required`,
            `Required CSV column "Name"`, 
            `Default values are used for the queue if no override is provided`,
            `Other valid fields are "Division", "Description", "Auto Answer", "Alerting Timeout", "SLA Percentage", "SLA Duration", "ACW", "ACW Timeout", "Manual Assignment", "Scoring Method", "Evaluation Method", "Script", "In-Queue Flow"`,
            `SLA Percentage: value between 0 and 1`,
            `ACW: one of OPTIONAL, MANDATORY, MANDATORY_TIMEOUT, MANDATORY_FORCED_TIMEOUT, AGENT_REQUESTED`,
            `Scoring Method: one of TimestampAndPriority, PriorityOnly`,
            `Evaluation Method: one of ALL, BEST, NONE`
        ]);
        const exampleLink = createDownloadLink("Queues Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }
        
    importQueuesWrapper() {
        showLoading(this.importQueues, this.container);
    }
    
    async importQueues() {
        if (!fileContents) throw "No valid file selected";
    
        const scripts = {};
        const inQueueFlows = {};
        let scriptsAdded = false;
        let inQueueFlowsAdded = false;

        const results = [];
        for (let queue of fileContents.data) {
            if (queue.Name) {
                const newFields = {}
                if (queue["Script"]) {
                    if (!scriptsAdded) {
                        const allScripts = await getAll("/api/v2/scripts?sortBy=name&sortOrder=ascending&scriptDataVersion=0&pageDataVersion=0&divisionIds=", "entities", 25);
                        for (let script of allScripts) {
                            scripts[script.name] = script.id;
                        }
                        scriptsAdded = true;
                    }
                    if (scripts.hasOwnProperty(queue["Script"])) {
                        newFields["defaultScripts.MESSAGE.id"] = scripts[queue["Script"]];
                    }
                    else {
                        log(`No script with the name: ${queue["Script"]}`)
                    }
                }
                if (queue["In-Queue Flow"]) {
                    if (!inQueueFlowsAdded) {
                        const allInqueueFlows = await getAll("/api/v2/flows?sortBy=name&sortOrder=asc&type=inqueueshortmessage", "entities", 50);
                        for (let flow of allInqueueFlows) {
                            inQueueFlows[flow.name] = flow.id;
                        }
                        inQueueFlowsAdded = true;
                    }
                    if (inQueueFlows.hasOwnProperty(queue["In-Queue Flow"])) {
                        newFields["messageInQueueFlow.id"] = inQueueFlows[queue["In-Queue Flow"]];
                    }
                    else {
                        log(`No In-Queue Flow with the name: ${queue["In-Queue Flow"]}`)
                    }
                }
                const mappedQueue = resolveMapping(queue);
                await makeCallAndHandleErrors(createItem, ["/api/v2/routing/queues", parseInput({...mappedQueue, ...newFields})], results, mappedQueue.name, "Queue");
            }
        }
        return Promise.all(results);
    }
    resolveMapping(inputObj) {
        const newObj = {};
        const validQueueProperties = {
            "Name" : "name",
            "Division": "division.name",
            "Description": "description",
            "Auto Answer": "mediaSettings.message.enableAutoAnswer", // true, false
            "Alerting Timeout": "mediaSettings.message.alertingTimeoutSeconds",
            "SLA Percentage": "mediaSettings.message.serviceLevel.percentage", // 0 - 1
            "SLA Duration": "mediaSettings.message.serviceLevel.durationMs",
            "ACW": "acwSettings.wrapupPrompt", // OPTIONAL, MANDATORY, MANDATORY_TIMEOUT, MANDATORY_FORCED_TIMEOUT, AGENT_REQUESTED
            "ACW Timeout": "acwSettings.timeoutMs",
            "Manual Assignment": "enableManualAssignment", // true, false
            "Scoring Method": "scoringMethod", // TimestampAndPriority, PriorityOnly
            "Evaluation Method": "skillEvaluationMethod", // ALL, BEST, NONE
        }
        for (let key in inputObj) {
            if (validQueueProperties.hasOwnProperty(key)) {
                newObj[validQueueProperties[key]] = inputObj[key];
            }
        }
        return newObj;
    }
    parseInput(inputObj) {
        const example = {
            "name": "",
            "division": {
                "id": "",
                "name": ""
            },
            "description": "",
            "mediaSettings": {
                "message": {
                    "enableAutoAnswer": "",
                    "alertingTimeoutSeconds": "",
                    "serviceLevel": {
                        "percentage": "",
                        "durationMs": ""
                    },
                    "autoAnswerAlertToneSeconds": "",
                    "manualAnswerAlertToneSeconds": "",
                    "subTypeSettings": {
                        "enableAutoAnswer": ""
                    }
                }
            },
            "routingRules": [
              {
                "operator": "",
                "threshold": "",
                "waitSeconds": ""
              }
            ],
            "conditionalGroupRouting": "",
            "bullseye": "",
            "scoringMethod": "",
            "acwSettings": {
                "wrapupPrompt": "",
                "timeoutMs": ""
            },
            "skillEvaluationMethod": "",
            "memberGroups": [
                {
                    "id": "",
                    "name": "",
                    "division": "",
                    "type": ""
                }
            ],
            "queueFlow": {
                "name": "",
                "id": ""
            },
            "emailInQueueFlow": {
                "name": "",
                "id": ""
            },
            "messageInQueueFlow": {
                "name": "",
                "id": ""
            },
            "whisperPrompt": "",
            "onHoldPrompt": "",
            "autoAnswerOnly": true,
            "enableTranscription": true,
            "enableAudioMonitoring": true,
            "enableManualAssignment": true,
            "agentOwnedRouting": "",
            "directRouting": "",
            "callingPartyName": "",
            "callingPartyNumber": "",
            "defaultScripts": {
                "EMAIL": {"id": ""},
                "CALLBACK": {"id": ""},
                "VOICE": {"id": ""},
                "CHAT": {"id": ""},
                "MESSAGE": {"id": ""}
            },
            "outboundMessagingAddresses": "",
            "outboundEmailAddress": "",
            "peerId": "",
            "suppressInQueueCallRecording": true,
            "sourceQueueId": ""
        }
        const queue = {};
        // loop through each key and understand where it fits into the queue model to recreate
        for (let key in inputObj) {
            if (inputObj[key] === undefined || inputObj[key] === null) continue;
    
            let exampleCurrent = example;
            let queueCurrent = queue;
            let parts = key.split(".");
            for (let i = 0; i < parts.length; i++) {
                if (i === parts.length - 1) {
                    queueCurrent[parts[i]] = inputObj[key];
                }
                else if (exampleCurrent.hasOwnProperty(parts[i])) {
                    if (!queueCurrent[parts[i]]) queueCurrent[parts[i]] = {};
                    exampleCurrent = exampleCurrent[parts[i]];
                    queueCurrent = queueCurrent[parts[i]];
                }
                else {
                    log(`No matching key found for ${parts[i]}`, "error");
                }
            }
        }
        return queue;
    }
}