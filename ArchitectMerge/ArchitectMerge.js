registerElement(eById("flowInput1"), "change", readFile);
registerElement(eById("flowInput2"), "change", readFile);
registerElement(eById("startButton"), "click", loadAndDisplay);

registerElement(eById("downloadLeft"), "click", downloadFlow);
registerElement(eById("downloadRight"), "click", downloadFlow);

registerElement(eById("copyCheckedRTL"), "click", copyChecked);
registerElement(eById("copyCheckedLTR"), "click", copyChecked);

registerElement(eById("copyAllRTL"), "click", copyAll);
registerElement(eById("copyAllLTR"), "click", copyAll);

window.flow1Tasks;
window.flow2Tasks;

function copyChecked(element) {
    if (element instanceof Event) element = element.target;
    const source = element.dataset.copyFrom;
    const dest = element.dataset.copyTo;
    for (let taskId of getCheckedTaskIds(eById(source))) {
        log(window[source]);
        log(window[dest]);
        copyTaskFromAToB(window[source], window[dest], taskId);
    }
    refreshTable();
}

function copyAll(element) {
    if (element instanceof Event) element = element.target;
    const source = element.dataset.copyFrom;
    const dest = element.dataset.copyTo;
    for (let taskId of getAllTaskIds(eById(source))) {
        copyTaskFromAToB(window[source], window[dest], taskId);
    }
    refreshTable();
}

function downloadFlow(element) {
    if (element instanceof Event) element = element.target;
    createAndLoadJSON(qs('#flow1Tasks .collection').innerText, encodeDigitalBotFlow(window[element.dataset.Source]));
}

function loadAndDisplay() {
    qsa('.visibleWhenDone').forEach(function (element) {
        element.style.display = 'none';
    })
    // check if the file input is "ready"
    if (!window.flow1Tasks || !window.flow2Tasks) {
        throw 'missing neccessary .i3DigitalBotFlow files';
    }

    refreshTable();
    qsa('.visibleWhenDone').forEach(function (element) {
        element.style.display = 'block';
    })
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
            let slotsToCopy = getUsedSlotNames(task);
            let variablesToCopy = getFlowVariableNames(task);
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

function readFile(event) {
    try {
        if (event.target.files.length < 1) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        const fileLocation = event.target.dataset.file;
        reader.addEventListener('load', function(data) {
            try {
                let fileContents = decodeDigitalBotFlow(data.target.result);
                log(fileContents);
                log(fileLocation);
                window[fileLocation] = fileContents;
            }
            catch (error) {
                console.error(error);
                throw `${file.name} does not contain valid JSON.`;
            }
        })
        reader.readAsText(file);
    }
    catch (error) {
        throw error;
    }
}

function decodeDigitalBotFlow(fileContents) {
    return JSON.parse(decodeURIComponent(atob(fileContents)));
}

function encodeDigitalBotFlow(json) {
    return btoa(encodeURIComponent(JSON.stringify(json)));
}

function createAndLoadJSON(fileName, result) {
    const fileData = new Blob([result], {type: 'text/plain'});
    const fileURL = window.URL.createObjectURL(fileData);
    const downloadLinkElement = newElement('a', {href: fileURL, download: `${fileName}.i3DigitalBotFlow`});
    downloadLinkElement.click();
}

function getCheckedTaskIds(collectionList) {
    let selectedTaskIds = [];
    qsa('.collection-item', collectionList).forEach(function(element) {
        if (qs('input', element).checked) {
            selectedTaskIds.push(element.dataset.taskId);
        }
    })
    return selectedTaskIds;
}

function getAllTaskIds(collectionList) {
    let selectedTaskIds = [];
    qsa('.collection-item', collectionList).forEach(function(element) {
        selectedTaskIds.push(element.dataset.taskId);
    })
    return selectedTaskIds;
}

function refreshTable() {
    const flow1List = qs('#flow1Tasks');
    const flow2List = qs('#flow2Tasks');
    clearElement(flow1List);
    clearElement(flow2List);

    flow1List.appendChild(createHeader(flow1Tasks.name));
    const list1 = newElement('div', {class: ["collection"]})
    for (let task of flow1Tasks.flowSequenceItemList) {
        if (task.__type === "Task") {
            addElement(createTaskListing(task.name, task.id), list1);
        }
    }
    addElement(list1, flow1List);
    flow2List.appendChild(createHeader(flow2Tasks.name));
    const list2 = newElement('div', {class: ["collection"]})
    for (let task of flow2Tasks.flowSequenceItemList) {
        if (task.__type === "Task") {
            addElement(createTaskListing(task.name, task.id), list2);
        }
    }
    addElement(list2, flow2List);
}

function createHeader(flowName) {
    const headerDiv = newElement('div', {class: ["header"], innerText: flowName});
    return headerDiv;
}

function createTaskListing(taskName, taskId) {
    const labelElem = newElement('label', {class: ["collection-item"], "data-task-id": taskId});
    const inputElem = newElement('input', {type: "checkbox"});
    const spanElem = newElement('span', {innerText: taskName});
    addElements([inputElem, spanElem], labelElem);
    return labelElem;
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
    let formattedRawTarget = targetFile.nluMetaData.rawNlu ? JSON.parse(targetFile.nluMetaData.rawNlu) : {entities: [], entityTypes: []};
    for (let entity of sourceFile.nluMetaData.archNlu.entities) {
        if (entity.name === slotName) {
            if (!targetFile.nluMetaData.archNlu) {
                targetFile.nluMetaData.archNlu = {entities: [], entityTypes: []}
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