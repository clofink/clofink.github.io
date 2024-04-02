class WidgetsTab extends Tab {
    tabName = "Widgets";

    render() {
        window.requiredFields = ["Configuration Name", "Inbound Flow Name", "Deployment Name"];
        window.allValidFields = ["Configuration Name", "Inbound Flow Name", "Deployment Name", "Languages", "Default Language", "Home Screen", "Home Screen Logo URL", "Agent Typing Indicator", "Visitor Typing Indicator", "Auto-Start Conversations", "Rich Text Formatting", "Conversation Disconnect", "Clear Conversation", "Humanize Conversation", "Bot Name", "Bot Image URL", "Color", "Position", "Allow Co-Browse", "Allow Agent Control", "Predictive Engagement", "Headless Mode"]
    
        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', {innerText: "Widgets CSV: "});
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const startButton = newElement('button', {innerText: "Start"});
        const buttonClickHandler = this.importWidgetsWrapper.bind(this);
        registerElement(startButton, "click", buttonClickHandler);
        const logoutButton = newElement("button", {innerText: "Logout"});
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "webdeployments" and "architect" scopes`,
            `This will create an Inbound Message Flow (if one with a matching name doesn't exist), a Web Messenger Configuration (if one with a matching name doesn't exist), and a Web Messenger Deployment`,
            `Required CSV columns "Configuration Name", "Inbound Flow Name", and "Deployment Name"`,
            `Default values are used for the messenger configuration if no override is provided`,
            `Other valid fields are "Languages", "Default Language", "Home Screen", "Home Screen Logo URL", "Agent Typing Indicator", "Visitor Typing Indicator", "Auto-Start Conversations", "Rich Text Formatting", "Conversation Disconnect", "Clear Conversation", "Humanize Conversation", "Bot Name", "Bot Image URL", "Color", "Position", "Allow Co-Browse", "Allow Agent Control", "Predictive Engagement", and "Headless Mode"`,
            `Languages: comma-separated list of en-us, fr, es, ar, zh-cn, zh-tw, cs, da, nl, et, fi, de, he, it, ja, ko, lv, lt, no, pl, pt-br, pt-pt, ru, sv, th, tr`,
            `Conversation Disconnect: one of none, display, disconnect`,
            `Color: HEX value`,
            `Position: one of left, right, auto`
        ]);
        const exampleLink = createDownloadLink("Widgets Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, startButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }
    async getAllWidgetConfigs() {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/webdeployments/configurations/?showOnlyPublished=true`;
        const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        return await result.json();
    }
    
    async createInitialVersion(flowId) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/flows/${flowId}/versions/`;
        const body = {
            "nextTrackingNumber": 12,
            "defaultLanguage": "en-US",
            "description": "",
            "initialSequence": "16971a7f-9ce3-4cc9-99b1-782b5597cccc",
            "name": "!AAA Test Flow",
            "uiMetaData": {
                "bridgeServerActions": [],
                "screenPops": []
            },
            "supportedLanguages": ["en-US"],
            "manifest": {
                "language": [{ "id": "en-US" }],
                "userPrompt": [],
                "systemPrompt": []
            },
            "type": "inboundshortmessage",
            "debugSettings": {},
            "errorHandling": {
                "queue": {
                    "config": { "emp": { "pos": 1, "text": "", "type": "que" } },
                    "text": "",
                    "type": "que",
                    "uiMetaData": { "mode": 1 },
                    "metaData": {},
                    "version": 2,
                    "outOfService": true
                },
                "handlingType": "Disconnect"
            },
            "defaultSettings": {},
            "flowMetaData": {
                "flowDocumentVersion": "1.0",
                "minimumServerVersion": "1.0",
                "ttsDataVersion": "1.0"
            },
            "flowSequenceItemList": [
                {
                    "startAction": "d5573005-e73e-486a-a334-86e65d8249f2",
                    "trackingId": 10,
                    "id": "16971a7f-9ce3-4cc9-99b1-782b5597cccc",
                    "name": "Initial State",
                    "__type": "State",
                    "actionList": [
                        { "trackingId": 11, "id": "d5573005-e73e-486a-a334-86e65d8249f2", "name": "Disconnect", "uiMetaData": { "collapsed": false }, "__type": "DisconnectAction" }], "variables": []
                }
            ],
            "supportedLanguageOptions": [
                { 
                    "language": "en-US", 
                    "languageSkill": { 
                        "config": { 
                            "emp": { "pos": 1, "text": "", "type": "lac" } 
                        }, 
                        "text": "", 
                        "type": "lac", 
                        "uiMetaData": { "mode": 3 }, 
                        "metaData": {}, 
                        "version": 2 
                    } 
                }
            ], 
            "variables": []
        }
        // gzip json.stringify flow json, but it's not required to be compressed
        // likely using https://github.com/nodeca/pako/blob/master/README.md
        // const body = {
        //     "flow": "31,139,8,0,0,0,0,0,0,3,149,84,203,110,219,48,16,252,149,128,103,171,16,109,203,174,125,107,225,2,53,144,38,1,228,246,18,4,1,37,173,28,34,34,169,146,203,164,129,161,127,239,210,122,248,81,183,104,78,54,103,151,156,225,206,80,59,166,225,23,110,172,200,159,165,222,222,120,149,129,101,75,62,30,177,2,74,225,43,188,22,122,235,197,22,216,146,129,142,190,167,44,84,92,110,101,141,210,104,66,9,144,90,162,20,85,10,63,61,232,60,180,198,28,38,48,155,20,81,194,139,113,52,157,0,143,50,49,77,162,184,204,63,38,83,62,78,230,243,146,54,106,161,66,247,103,43,116,113,117,3,175,87,95,54,14,9,247,242,27,160,88,9,20,108,185,99,153,149,197,22,82,176,47,96,63,229,129,214,177,229,253,195,136,145,12,0,125,103,234,253,186,33,192,215,181,177,8,69,175,58,20,58,221,212,175,132,150,37,16,3,29,90,13,247,186,223,49,89,12,215,107,168,207,59,176,119,214,168,26,59,158,55,135,160,14,8,49,225,91,29,148,75,157,25,175,11,247,68,172,10,156,11,7,134,1,101,126,155,2,34,141,148,20,236,168,31,172,53,246,43,93,179,34,44,240,211,168,60,132,63,185,209,165,220,67,160,234,240,83,27,218,195,137,130,140,105,231,219,145,209,22,214,52,127,41,156,15,77,153,130,74,156,218,213,1,165,21,205,208,237,141,35,139,141,199,219,50,204,85,6,211,208,122,160,134,167,78,228,166,61,123,37,29,41,212,144,35,107,134,80,156,222,173,172,204,235,49,117,88,175,76,238,21,104,252,209,211,49,254,33,38,145,138,178,162,188,106,205,60,47,34,186,112,198,41,220,17,244,225,90,147,19,215,50,120,72,190,57,20,22,219,72,80,119,9,124,186,24,207,39,209,124,60,91,80,232,98,30,137,89,188,136,98,200,120,178,72,166,73,86,204,2,75,23,246,53,153,206,227,81,107,254,251,2,187,110,3,127,149,162,192,48,250,199,199,206,137,30,16,123,77,131,206,19,74,222,81,254,167,220,142,242,200,135,115,171,115,83,85,162,118,64,135,150,162,114,193,196,65,208,97,91,55,166,144,239,23,97,165,200,42,104,159,205,195,133,119,115,91,247,207,236,248,165,12,95,128,30,74,159,101,85,189,47,196,149,200,47,135,56,20,46,135,120,242,143,16,55,127,222,231,55,236,189,24,34,211,4,0,0",
        //     "flowMetaData": { "flowDocumentVersion": "2.0" }
        // };
        const result = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        const resultJson = await result.json();
        if (result.ok) {
            resultJson.status = 200;
        }
        return resultJson;
    }
    
    importWidgetsWrapper() {
        const boundFunc = this.importWidgets.bind(this);
        showLoading(boundFunc, this.container);
    }
    
    async importWidgets() {
        if (!fileContents) throw "No valid file selected";

        // get list of inbound flows
        const inboundFlows = await getAll("/api/v2/flows?sortBy=name&sortOrder=asc&type=inboundshortmessage", "entities", 50);
        const inboundFlowsMapping = {};
        for (let flow of inboundFlows) {
            inboundFlowsMapping[flow.name] = flow.id;
        }

        // get list of configurations
        const widgetConfigs = await this.getAllWidgetConfigs();
        const widgetConfigMapping = {};
        for (let config of widgetConfigs.entities) {
            widgetConfigMapping[config.name] = { id: config.id, version: config.version };
        }

        const results = [];
        for (let initial of fileContents.data) {
            // create the inbound message flow
            if (!inboundFlowsMapping[initial["Inbound Flow Name"]]) {
                const inboundFlow = await makeCallAndHandleErrors(createItem, ["/api/v2/flows/", { "type": "inboundshortmessage", "name": initial["Inbound Flow Name"], "description": "" }], results, initial["Inbound Flow Name"], "Inbound Message Flow");
                if (!inboundFlow) continue;

                const initialFlowVersion = await makeCallAndHandleErrors(this.createInitialVersion, [inboundFlow.id], results, initial["Inbound Flow Name"], "Initial Flow Version");
                if (!initialFlowVersion) continue;

                const publishedFlow = await makeCallAndHandleErrors(createItem, [`/api/v2/flows/actions/publish?flow=${inboundFlow.id}`, {}], results, initial["Inbound Flow Name"], "Flow Publish");
                if (!publishedFlow) continue;

                inboundFlowsMapping[initial["Inbound Flow Name"]] = inboundFlow.id;
            }
            const flowId = inboundFlowsMapping[initial["Inbound Flow Name"]];

            // create the messenger config
            if (!widgetConfigMapping[initial["Configuration Name"]]) {
                const newConfig = await makeCallAndHandleErrors(createItem, ["/api/v2/webdeployments/configurations/", this.parseInput(this.resolveMapping(initial))], results, initial["Configuration Name"], "Create Messenger Configuration");
                if (!newConfig) continue;

                const publishedConfig = await makeCallAndHandleErrors(createItem, [`/api/v2/webdeployments/configurations/${newConfig.id}/versions/draft/publish`, {}], results, initial["Configuration Name"], "Publish Messenger Configuration");
                if (!publishedConfig) continue;

                widgetConfigMapping[initial["Configuration Name"]] = { id: publishedConfig.id, version: publishedConfig.version };
            }
            const config = widgetConfigMapping[initial["Configuration Name"]];

            const body = {
                "name": initial["Deployment Name"],
                "description": "",
                "configuration": { "id": config.id, "version": config.version },
                "allowAllDomains": true,
                "allowedDomains": [],
                "flow": { "id": flowId },
                "status": "Active"
            }
            const deployment = await makeCallAndHandleErrors(createItem, ["/api/v2/webdeployments/deployments/", body], results, initial["Deployment Name"], "Messenger Deployment");
        }
        return results;
    }
    
    resolveMapping(inputObj) {
        const newObj = {};
        const validConfigProperties = {
            "Configuration Name": "name",
            "Languages": "languages",
            "Default Language": "defaultLanguage",
            "Home Screen": "messenger.homeScreen.enabled", // true, false
            "Home Screen Logo URL": "messenger.homeScreen.logoUrl",
            "Agent Typing Indicator": "messenger.apps.conversations.showAgentTypingIndicator", // true, false
            "Visitor Typing Indicator": "messenger.apps.conversations.showUserTypingIndicator", // true, false
            "Auto-Start Conversations": "messenger.apps.conversations.autoStart.enabled", // true, false
            "Rich Text Formatting": "messenger.apps.conversations.markdown.enabled", // true, false
            "Conversation Disconnect": "messenger.apps.conversations.conversationDisconnect.type", // none, display, disconnect
            "Clear Conversation": "messenger.apps.conversations.conversationClear.enabled", // true, false
            "Humanize Conversation": "messenger.apps.conversations.humanize.enabled", // true, false
            "Bot Name": "messenger.apps.conversations.humanize.bot.name",
            "Bot Image URL": "messenger.apps.conversations.humanize.bot.avatarUrl",
            "Color": "messenger.styles.primaryColor",
            "Position": "position.alignment", // auto, right, left
            "Allow Co-Browse": "cobrowse.enabled",
            "Allow Agent Control": "cobrowse.allowAgentControl",
            "Headless Mode": "headlessMode.enabled",
            "Predictive Engagement": "journeyEvents.enabled"
        }
        const disconnectValues = {
            "none": { enabled: false, type: "Send" },
            "display": { enabled: true, type: "Send" },
            "disconnect": { enabled: true, type: "ReadOnly" }
        }
        for (let key in inputObj) {
            if (validConfigProperties.hasOwnProperty(key)) {
                if (key === "Languages") {
                    const tempList = [];
                    for (let languageCode of inputObj[key].split(",")) {
                        tempList.push(languageCode.trim());
                    }
                    inputObj[key] = tempList;
                }
                if (key === "Conversation Disconnect") {
                    newObj["messenger.apps.conversations.conversationDisconnect"] = disconnectValues[inputObj[key]];
                    continue;
                }
                newObj[validConfigProperties[key]] = inputObj[key];
            }
        }
        return newObj;
    }
    
    parseInput(inputObj) {
        const defaultWidget = {
            "name": "",
            "languages": ["en-us"],
            "defaultLanguage": "en-us",
            "messenger": {
                "enabled": true,
                "homeScreen": { "enabled": false, "logoUrl": "" },
                "apps": {
                    "conversations": {
                        "showAgentTypingIndicator": true,
                        "showUserTypingIndicator": true,
                        "autoStart": { "enabled": false },
                        "markdown": { "enabled": true },
                        "conversationDisconnect": { "enabled": false, "type": "Send" },
                        "conversationClear": { "enabled": false },
                        "humanize": { "enabled": false, "bot": { "name": "", "avatarUrl": "" } }
                    },
                    "knowledge": { "enabled": false, "knowledgeBase": { "id": "" } }
                },
                "styles": { "primaryColor": "#0D6EFD", "modeType": "" },
                "launcherButton": { "visibility": "On" },
                "fileUpload": {
                    "modes": [{ "fileTypes": ["image/jpeg", "image/gif", "image/png"], "maxFileSizeKB": 10240 }]
                }
            },
            "cobrowse": {
                "enabled": false,
                "allowAgentControl": false
            },
            "customI18nLabels": [],
            "supportCenter": { "enabled": false },
            "position": { "alignment": "auto", "sideSpace": 20, "bottomSpace": 12 },
            "persistence": { "enabled": true },
            "journeyEvents": { "enabled": false },
            "authenticationSettings": { "enabled": false, "integrationId": "" },
            "headlessMode": { "enabled": false },
            "status": "Active"
        }
        // loop through each key and understand where it fits into the queue model to recreate
        for (let key in inputObj) {
            if (inputObj[key] === undefined || inputObj[key] === null) continue;

            let exampleCurrent = defaultWidget;
            let parts = key.split(".");
            for (let i = 0; i < parts.length; i++) {
                if (exampleCurrent.hasOwnProperty(parts[i]) && i === parts.length - 1) {
                    exampleCurrent[parts[i]] = inputObj[key];
                }
                else if (exampleCurrent.hasOwnProperty(parts[i])) {
                    exampleCurrent = exampleCurrent[parts[i]];
                }
                else {
                    log(`No matching key found for ${parts[i]}`);
                }
            }
        }
        return defaultWidget;
    }
}