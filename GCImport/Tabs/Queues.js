addTab("Queues", showQueuesPage);

function showQueuesPage() {
    window.requiredFields = ["name"];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label');
    label.innerText = "Queues CSV: ";
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button');
    startButton.innerText = "Start";
    registerElement(startButton, "click", importQueuesWrapper);
    const logoutButton = newElement("button");
    logoutButton.innerText = "Logout";
    registerElement(logoutButton, "click", logout);
    const helpSection = addHelp([
        `Must have "routing" scope`, 
        `Required CSV column "Name"`, 
        `Default values are used for the queue if no override is provided`,
        `Other valid fields are "Division", "Description", "Auto Answer", "Alerting Timeout", "SLA Percentage", "SLA Duration", "ACW", "ACW Timeout", "Manual Assignment", "Scoring Method", "Evaluation Method"`,
        `SLA Percentage: value between 0 and 1`,
        `ACW: one of OPTIONAL, MANDATORY, MANDATORY_TIMEOUT, MANDATORY_FORCED_TIMEOUT, AGENT_REQUESTED`,
        `Scoring Method: one of TimestampAndPriority, PriorityOnly`,
        `Evaluation Method: one of ALL, BEST, NONE`
    ]);
    addElements([label, startButton, logoutButton, helpSection], container);
    return container;
    
    async function createQueue(configObj) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/routing/queues`;
        const body = parseInput(configObj);
        log(body)
        const result = await fetch(url, {method: "POST", body: JSON.stringify(body), headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
        return result.json();
    }
    
    function importQueuesWrapper() {
        showLoading(importQueues);
    }
    
    async function importQueues() {
        if (!fileContents) throw "No valid file selected";
    
        const results = [];
        for (let queue of fileContents.data) {
            if (queue.name) {
                results.push(createQueue(resolveMapping(queue)));
            }
        }
        return Promise.all(results);
    }
    
    function resolveMapping(inputObj) {
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

    function parseInput(inputObj) {
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
            "defaultScripts": {},
            "outboundMessagingAddresses": "",
            "outboundEmailAddress": "",
            "peerId": "",
            "suppressInQueueCallRecording": true,
            "sourceQueueId": ""
        }
        const queue = {};
        // loop through each key and understand where it fits into the queue model to recreate
        for (let key in inputObj) {
            if (!inputObj[key]) continue;
    
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
                    console.error(`No matching key found for ${parts[i]}`);
                }
            }
        }
        return queue;
    }
}