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
    const loadIcon = newElement("div", {id: "loadIcon"});
    addElements([label, startButton, logoutButton, loadIcon], container);
    return container;
}

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
            results.push(createQueue(queue));
        }
    }
    return Promise.all(results);
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
            else if (exampleCurrent[parts[i]]) {
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