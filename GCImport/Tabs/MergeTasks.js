// addTab("Merge Tasks", showMergeTasksPage);

function showMergeTasksPage() {
    const flowCache = {}; // place to store flow details so I don't have to retrieve the same one multiple times
    const container = newElement('div', { id: "userInputs", class: ["flows-merge"] });

    const flow1Display = createFlowDisplay(1, 'section1');

    const buttonSection = newElement("div", { id: "taskActions", class: ["displaySection", "section2"] });
    const buttonContainer = newElement("div", { id: "taskButtons" });
    const copyLeft = newElement("button", { innerText: "< Copy", "data-copy-from": "flow2Tasks", "data-copy-to": "flow1Tasks" });
    registerElement(copyLeft, "click", copyChecked);
    const copyRight = newElement("button", { innerText: "Copy >", "data-copy-from": "flow1Tasks", "data-copy-to": "flow2Tasks" });
    registerElement(copyRight, "click", copyChecked);
    const copyAllLeft = newElement("button", { innerText: "<< Copy", "data-copy-from": "flow2Tasks", "data-copy-to": "flow1Tasks" });
    registerElement(copyAllLeft, "click", copyAll);
    const copyAllRight = newElement("button", { innerText: "Copy >>", "data-copy-from": "flow1Tasks", "data-copy-to": "flow2Tasks" });
    registerElement(copyAllRight, "click", copyAll);
    addElements([copyLeft, copyRight, copyAllLeft, copyAllRight], buttonContainer);
    addElement(buttonContainer, buttonSection);

    const flow2Display = createFlowDisplay(2, 'section3');

    const taskContainer = newElement('div', { id: "taskContainer" });
    addElements([flow1Display, buttonSection, flow2Display], taskContainer);

    addElement(taskContainer, container);

    showLoading(initialLoad); // just kicks off loading the flows to populate the lists
    return container;

    async function initialLoad() {
        const allBotFlows = await getAll("/api/v2/flows?sortBy=name&sortOrder=asc&type=digitalbot", "entities", 50);
        const first = qs("select", flow1Display);
        const second = qs("select", flow2Display);
        for (let botFlow of allBotFlows) {
            const option = newElement("option", { innerText: botFlow.name, value: botFlow.id });
            const option2 = newElement("option", { innerText: botFlow.name, value: botFlow.id });
            addElement(option, first);
            addElement(option2, second);
        }
        sendEvent(first, "change");
        sendEvent(second, "change");
        return;
    }

    function createFlowDisplay(number, section) {
        const flowDisplay = newElement("div", { class: ["displaySection"] });
        const label = newElement("label", { innerText: "" });
        const select = newElement("select", { "data-select-for": `flow${number}Tasks` });
        addElement(select, label);
        registerElement(select, "change", updateDisplayedTasks);
        const flowTasks = newElement("div", { id: `flow${number}Tasks`, class: [section] });
        const downloadButton = newElement("button", { "data-source": `flow${number}Tasks`, innerText: "Download" });
        registerElement(downloadButton, "click", downloadFlow);
        addElements([label, flowTasks, downloadButton], flowDisplay);
        return flowDisplay;
    }

    async function getFlowConfig(flowId) {
        const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/flows/${flowId}/latestConfiguration`;
        const result = await fetch(url, { headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        return await result.json();
    }

    async function updateDisplayedTasks(element) {
        if (element instanceof Event) element = element.target;

        if (!flowCache.hasOwnProperty(element.value)) {
            flowCache[element.value] = await getFlowConfig(element.value);
        }

        updateTaskDisplay(eById(element.dataset.selectFor), element.value);
    }

    function updateTaskDisplay(taskDisplay, flowId) {
        const flowInfo = flowCache[flowId];
        clearElement(taskDisplay);
        taskDisplay.appendChild(createHeader(flowInfo.name));
        taskDisplay.setAttribute("data-flow-id", flowId);
        const list = newElement('div', { class: ["collection"] })
        for (let task of flowInfo.flowSequenceItemList) {
            if (task.__type === "Task") {
                addElement(createTaskListing(task.name, task.id), list);
            }
        }
        addElement(list, taskDisplay);
    }

    function createHeader(flowName) {
        const headerDiv = newElement('div', { class: ["header"], innerText: flowName });
        return headerDiv;
    }

    function createTaskListing(taskName, taskId) {
        const labelElem = newElement('label', { class: ["collection-item"], "data-task-id": taskId });
        const inputElem = newElement('input', { type: "checkbox" });
        const spanElem = newElement('span', { innerText: taskName });
        addElements([inputElem, spanElem], labelElem);
        return labelElem;
    }

    function copyChecked(element) {
        if (element instanceof Event) element = element.target;
        const sourceElem = eById(element.dataset.copyFrom)
        const destElem = eById(element.dataset.copyTo)
        const sourceFlow = sourceElem.dataset.flowId;
        const destFlow = destElem.dataset.flowId;
        for (let taskId of getCheckedTaskIds(sourceElem)) {
            copyTaskFromAToB(flowCache[sourceFlow], flowCache[destFlow], taskId);
        }
        updateTaskDisplay(sourceElem, sourceFlow);
        updateTaskDisplay(destElem, destFlow);
    }

    function copyAll(element) {
        if (element instanceof Event) element = element.target;
        const sourceElem = eById(element.dataset.copyFrom)
        const destElem = eById(element.dataset.copyTo)

        const source = eById(element.dataset.copyFrom).dataset.flowId;
        const dest = eById(element.dataset.copyTo).dataset.flowId;
        for (let taskId of getAllTaskIds(eById(element.dataset.copyFrom))) {
            copyTaskFromAToB(flowCache[source], flowCache[dest], taskId);
        }
        updateTaskDisplay(sourceElem, source);
        updateTaskDisplay(destElem, dest);
    }

    function downloadFlow(element) {
        if (element instanceof Event) element = element.target;
        const selectedFlow = flowCache[eById(element.dataset.source).dataset.flowId];
        createAndLoadJSON(selectedFlow.name, encodeDigitalBotFlow(selectedFlow));
    }

    function copyTaskFromAToB(sourceFile, targetFile, taskId) {
        // make sure a task with the same ID doesn't already exist
        for (let task of targetFile.flowSequenceItemList) {
            if (task.id === taskId) {
                return;
            }
        }
        for (let task of sourceFile.flowSequenceItemList) {
            if (task.__type === "Task" && task.id === taskId) {
                const slotsToCopy = getUsedSlotNames(task);
                const variablesToCopy = getFlowVariableNames(task);
                targetFile.flowSequenceItemList.push(task);
                for (let slotName of slotsToCopy) {
                    copyEntityFromAToB(sourceFile, targetFile, slotName);
                    for (let variable of sourceFile.variables) {
                        if (variable.name.split('.')[0] === 'Slot' && variable.name.split('.')[1] === slotName) {
                            targetFile.variables.push(variable);
                        }
                    }
                    targetFile.nluMetaData.mappings.slotToSlotVariables[slotName] = sourceFile.nluMetaData.mappings.slotToSlotVariables[slotName];
                }
                for (let variableName of variablesToCopy) {
                    copyVariableFromAToB(sourceFile, targetFile, variableName);
                }
                copyIntentsFromAToB(sourceFile, targetFile, taskId);
            }
        }
    }

    function copyIntentsFromAToB(sourceFile, targetFile, taskId) {
        for (let mapping in sourceFile.nluMetaData.mappings) {
            if (sourceFile.nluMetaData.mappings[mapping].id === taskId) {
                targetFile.nluMetaData.mappings[mapping] = sourceFile.nluMetaData.mappings[mapping];
                copyUtterancesFromAToB(sourceFile, targetFile, mapping);
            }
        }
    }

    function copyUtterancesFromAToB(sourceFile, targetFile, intentName) {
        let sourceNLU = JSON.parse(sourceFile.nluMetaData.rawNlu);
        let targetNLU = JSON.parse(targetFile.nluMetaData.rawNlu);
        for (let intent of sourceNLU.intents) {
            if (intent.name === intentName) {
                targetNLU.intents.push(intent);
            }
        }
        targetNLU.nluMetaData.rawNlu = JSON.stringify(targetNLU);
    }

    function encodeDigitalBotFlow(json) {
        return btoa(encodeURIComponent(JSON.stringify(json)));
    }

    function createAndLoadJSON(fileName, result) {
        const fileData = new Blob([result], { type: 'text/plain' });
        const fileURL = window.URL.createObjectURL(fileData);
        const downloadLinkElement = newElement('a', { href: fileURL, download: `${fileName}.i3DigitalBotFlow` });
        downloadLinkElement.click();
        window.URL.revokeObjectURL(fileURL);
    }

    function getCheckedTaskIds(collectionList) {
        let selectedTaskIds = [];
        qsa('.collection-item', collectionList).forEach(function (element) {
            if (qs('input', element).checked) {
                selectedTaskIds.push(element.dataset.taskId);
            }
        })
        return selectedTaskIds;
    }

    function getAllTaskIds(collectionList) {
        let selectedTaskIds = [];
        qsa('.collection-item', collectionList).forEach(function (element) {
            selectedTaskIds.push(element.dataset.taskId);
        })
        return selectedTaskIds;
    }

    function getUsedSlotNames(task) {
        let usedSlotNames = [];
        for (let action of task.actionList) {
            if (action.__type === "AskForSlotAction") {
                usedSlotNames.push(action.selectedSlot);
            }
        }
        return usedSlotNames;
    }

    function copyEntityFromAToB(sourceFile, targetFile, slotName) {
        let entityTypeName;
        let formattedRawSource = JSON.parse(sourceFile.nluMetaData.rawNlu);
        let formattedRawTarget = targetFile.nluMetaData.rawNlu ? JSON.parse(targetFile.nluMetaData.rawNlu) : { entities: [], entityTypes: [] };
        for (let entity of sourceFile.nluMetaData.archNlu.entities) {
            if (entity.name === slotName) {
                if (!targetFile.nluMetaData.archNlu) {
                    targetFile.nluMetaData.archNlu = { entities: [], entityTypes: [] }
                }
                if (!targetFile.nluMetaData.archNlu.entities) {
                    targetFile.nluMetaData.archNlu.entities = [];
                }
                targetFile.nluMetaData.archNlu.entities.push(entity);
                entityTypeName = entity.type;
            }
        }
        for (let entity of formattedRawSource.entities) {
            if (entity.name === slotName) {
                formattedRawTarget.entities.push(entity);
            }
        }
        for (let entityType of formattedRawSource.entityTypes) {
            if (entityType.name === entityTypeName) {
                formattedRawTarget.entityTypes.push(entityType);
            }
        }
        for (let entityType of sourceFile.nluMetaData.archNlu.entityTypes) {
            if (entityType.name === entityTypeName) {
                if (!targetFile.nluMetaData.archNlu.entityTypes) {
                    targetFile.nluMetaData.archNlu.entityTypes = [];
                }
                targetFile.nluMetaData.archNlu.entityTypes.push(entityType);
            }
        }
        targetFile.nluMetaData.rawNlu = JSON.stringify(formattedRawTarget);
    }

    function getFlowVariableNames(task) {
        let flowVariableNames = [];
        for (let action of task.actionList) {
            // flow variables can be set in a few places
            if (action.__type === "UpdateVariableAction") {
                for (let variable of action.variables) {
                    if (variable.variable.text.split('.')[0] === "Flow" && flowVariableNames.indexOf(variable.variable.text) < 0) {
                        flowVariableNames.push(variable.variable.text);
                    }
                }
            }
        }
        return flowVariableNames;
    }

    function copyVariableFromAToB(sourceFile, targetFile, variableName) {
        for (let variable of sourceFile.variables) {
            if (variable.name === variableName) {
                targetFile.variables.push(variable);
            }
        }
    }
}