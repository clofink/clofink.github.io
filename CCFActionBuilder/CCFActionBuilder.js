var conditionalActions = {
    "IfActiveSchedule": {params: [{name: "Schedule Name"}, {name: "Action", type: "action"}]},
    "IfActiveLanguage": {params: [{name: "Language Code"}, {name: "Action", type: "action"}]},
    "IfQAPlayback": {params: [{name: "Action", type: "action"}]},
    "IfParticipantData": {params: [{name: "Field Name"}, {name: "Value"}, {name: "Action", type: "action"}]},
    "IfStaff": {params: [{name: "Lower Count", type: "number"}, {name: "Upper Count", type: "number"}, {name: "Action", type: "action"}]},
    "IfEWT": {params: [{name: "Lower Seconds", type: "number"}, {name: "Upper Seconds", type: "number"}, {name: "Action", type: "action"}]},
    "IfPIQ": {params: [{name: "Lower Position", type: "number"}, {name: "Upper Position", type: "number"}, {name: "Action", type: "action"}]},
    "IfTimeInQueue": {params: [{name: "Lower Seconds", type: "number"}, {name: "Upper Seconds", type: "number"}, {name: "Action", type: "action"}]},
    "IfWaiting": {params: [{name: "Lower Bound", type: "number"}, {name: "Upper Bound", type: "number"}, {name: "Action", type: "action"}]},
    "IfPromptTextExists": {params: [{name: "Prompt Name"}, {name: "Action", type: "action"}]},
    "IfRandom": {params: [{name: "Percentage", type: "number"}, {name: "Action", type: "action"}]}
}

var unconditionalActions = {
    "Disconnect": {},
    "SetLanguage": {params: [{name: "Language Code"}]},
    "SetQueue": {params: [{name: "Name"}]},
    "SetPriority": {params: [{name: "Value", type: "number"}]},
    "SetScheduleGroup": {params: [{name: "Type"}, {name: "Name"}]},
    "SetTreatment": {params: [{name: "Type", type: "enum", values: ["Active:", "In-Queue:inqueue"]}, {name: "Name"}]},
    "ScheduleCheck": {},
    "EmergencyCheck": {},
    "SetSkills": {params: [{name: 'Mode', type: "enum", values: ["Clear:clear", "Append:append", "Overwrite:overwrite"]}, {name: 'Skill Name'}], repeatIndex: [1]},
    "SetParticipantData": {params: [{name: 'Mode', type: "enum", values: ['Initialize:initialize', 'Overwrite:overwrite']}, {name: 'Key'}, {name: 'Value'}], repeatIndex: [1,2]},
    "SetWait": {params: [{name:"Seconds", type:"number"}]},
    "SetRedirect": {params: [{name:"URL String"}]},
    "NoOp": {},
    "PlayPIQ": {},
    "PlayPIQDigital": {},
    "PlayEWT": {},
    "PlayEWTDigital": {},
    "Loop": {params: [{name: "Start Index", type: "number"}, {name: "Loop Count", type: "number"}]},
    "ProcessTransferQueue": {},
    "ShowPrompt": {params: [{name: "Prompt Name"}]}
}

var separators = {
    "treatmentSeparator": "|",
    "treatmentNameDelimiters": ["[", "]"],
    "actionSeparator": "~",
    "actionParameterSeparator": ":",
    "treatmentParameterSeparator": "|",
    "treatmentParameterSubParameterSeparator": ":"
}

function updateDependants(element) {
    if (element instanceof Event) element = element.target;
    const dependantElements = qsa(`[data-depends-on='${element.id}']`);
    let visibleSet = false;
    for (let dependantElement of dependantElements) {
        const fieldValue = dependantElement.getAttribute("data-depends-value");
        if (fieldValue.split(",").indexOf(element.value) >= 0) {
            switch (dependantElement.nodeName) {
                case "BUTTON":
                    dependantElement.style.display = "inline-block";
                    break;
                case "OPTION":
                    dependantElement.style.display = "block";
                    if (!visibleSet) {
                        dependantElement.parentElement.value = dependantElement.value;
                        sendEvent(dependantElement.parentElement, "change");
                        visibleSet = true;
                    }
                    break;
                default:
                    dependantElement.style.display = "block";
                    break;
            }
        }
        else dependantElement.style.display = "none";
    }
}

function loadString() {
    let result = {};
    let treatments = qsa(".treatmentBody");
    for (let treatment of treatments) {
        let treatmentName = qs(".treatmentName", treatment).value;
        if (!treatmentName) treatmentName = "root";
        result[treatmentName] = [];

        let actions = qsa(".actionBody", treatment);
        for (let action of actions) {
            const actionName = qs('.actionSelect', action).value;
            const params = qsa(".paramsBody select:not(.actionTypeSelect), .paramsBody input", action);
            const paramValues = [];
            for (let param of params) {
                paramValues.push(param.value);
            }
            result[treatmentName].push({name: actionName, params: paramValues})
        }
    }
    const resultString = generateString(result)
    return resultString;
}

function addParametersBlock(action) {
    var actionInfo = {...unconditionalActions, ...conditionalActions};
    if (!actionInfo[action] || !actionInfo[action].params) return;
    const paramsBody = newElement('div', {class: ["paramsBody"]});

    for (let param of actionInfo[action].params) {
        const newParam = createParameterField(param);
        addElement(newParam, paramsBody);
    }
    if (actionInfo[action].repeatIndex !== undefined && actionInfo[action].repeatIndex.length > 0) {
        const addParamButton = newElement('button', {class: ["addParam"], innerText: "Add Parameter"});
        registerElement(
            addParamButton, 
            "click", 
            function() {
                const newParams = [];
                for (let index of actionInfo[action].repeatIndex) {
                    newParams.push(createParameterField(actionInfo[action].params[index]));
                }
                const removeParamButton = newElement('button', {class: ["removeParam"], innerText: "Remove Parameter"});
                registerElement(removeParamButton, "click", function() {
                    for (let param of newParams) {
                        param.remove();
                    }
                    removeParamButton.remove();
                    updateDisplay();
                })
                for (let param of newParams) {
                    addElement(param, addParamButton, "beforebegin");
                }
                addElement(removeParamButton, addParamButton, "beforebegin");
            }
        );
        addElement(addParamButton, paramsBody);
    }
    return paramsBody;
}

function createParameterField(fieldInfo) {
    const paramLabel = newElement('label', {innerText: `${fieldInfo.name}: `});

    const paramType = fieldInfo.type || "string";
    switch(paramType) {
        case "string": {
            const input = newElement('input');
            addElement(input, paramLabel);
            break;
        }
        case "number": {
            const input = newElement('input', {type: "number"});
            addElement(input, paramLabel);
            break;
        }
        case "enum": {
            const select = newElement('select');
            for (let value of fieldInfo.values) {
                const valueParts = value.split(":");
                const option = valueParts.length > 1 ? newElement('option', {value: valueParts[1], innerText: valueParts[0]}) : newElement('option', {value: valueParts[0], innerText: valueParts[0]});
                addElement(option, select);
            }
            addElement(select, paramLabel);
            break;
        }
        case "action": {
            const actionTypeSelect = newActionTypeSelect();
            const actionSelect = newActionSelect("unconditional");

            addElements([actionTypeSelect, actionSelect], paramLabel);
            
            registerElement(
                actionSelect, 
                "change", 
                function() {
                    let existingParams = qs(".paramsBody", paramLabel);
                    if (existingParams) existingParams.remove(); 
                    let paramsElems = addParametersBlock(actionSelect.value); 
                    if(paramsElems) {addElement(paramsElems, paramLabel)};
                }
            );
            registerElements([actionTypeSelect], "change", updateDependants, true);
            break;
        }
        default:
            log(`unknown param type: ${paramType}`, "error");
            break;
    }
    return paramLabel;
}

function generateString(input) {
    const treatmentStrings = [];
    for (let treatment in input) {
        let treatmentString = ""
        if (treatment !== "root") {
            treatmentString += `${window.separators.treatmentNameDelimiters[0]}${treatment}${window.separators.treatmentNameDelimiters[1]}`
        }
        const actionStrings = [];
        for (let action of input[treatment]) {
            if (action.name === "ShowPrompt") {
                actionStrings.push([...action.params].join(window.separators.actionParameterSeparator));
                continue;
            }
            if (action.params.indexOf("ShowPrompt") >= 0) {
                action.params.splice(action.params.indexOf("ShowPrompt"), 1);
            }
            actionStrings.push([action.name, ...action.params].join(window.separators.actionParameterSeparator));
        }
        treatmentString += actionStrings.join(window.separators.actionSeparator);
        treatmentStrings.push(treatmentString);
    }
    return resultString = treatmentStrings.join(window.separators.treatmentSeparator);
}

function parseString(input) {
    const treatments = {};

    const splitTreatments = input.split(window.separators.treatmentSeparator);
    for (let treatment of splitTreatments) {
        let treatmentName = "root";
        let treatmentBody = treatment;
        if (treatment.indexOf(window.separators.treatmentNameDelimiters[0]) >= 0 && treatment.indexOf(window.separators.treatmentNameDelimiters[1]) >= 0) {
            let preNameSplit = treatment.split(window.separators.treatmentNameDelimiters[0]);
            let postNameSplit = preNameSplit[1].split(window.separators.treatmentNameDelimiters[1]);
            treatmentName = postNameSplit[0];
            treatmentBody = postNameSplit[1];
        }
        treatments[treatmentName] = [];

        let splitActions = treatmentBody.split(window.separators.actionSeparator);
        for (let action of splitActions) {
            let splitParameters = action.split(window.separators.actionParameterSeparator);
            let actionName = splitParameters.shift();
            if (Object.keys(window.conditionalActions).indexOf(actionName) < 0 && Object.keys(window.unconditionalActions).indexOf(actionName) < 0) {
                splitParameters.push(actionName);
                actionName = "ShowPrompt";
            }
            treatments[treatmentName].push({name: actionName, params: splitParameters});
        }
    }
    return treatments;
}

function makeInstanced(func) {
    let id = 0;
    return function() {id++; return func(id, ...arguments);}; 
}

function createActionBlock(type) {
    const actionBody = newElement('li', {class: [`actionBody`]});

    const actionTypeSelect = newActionTypeSelect();
    const actionSelect = newActionSelect(type);

    addElement(actionTypeSelect, actionBody);
    addElement(actionSelect, actionBody);

    const addActionBeforeButton = newElement("button", {class: ["addAction"], innerText: "Add Action Before"});
    registerElement(addActionBeforeButton, "click", function() {addElement(createActionBlock("unconditional"), actionBody, "beforebegin")});
    addElement(addActionBeforeButton, actionBody);
    
    const removeButton = newElement("button", {class: ["removeAction"], innerText: "Remove Action"});
    registerElement(removeButton, "click", function() {actionBody.remove(); updateDisplay();});
    registerElement(actionSelect, "change", function() {let existingParams = qs(".paramsBody", actionBody); if (existingParams) existingParams.remove(); let paramsElems = addParametersBlock(actionSelect.value); if(paramsElems) {addElement(paramsElems, actionBody)}});
    addElement(removeButton, actionBody);
    
    registerElements([actionTypeSelect], "change", updateDependants, true);
    return actionBody;
}

function createActionTypeSelect(id) {
    const actionTypeSelect = newElement('select', {id: `actionTypeSelect${id}`, class: ['actionTypeSelect']});
    const acitonTypeOptions = ["Unconditional", "Conditional"];
    for (let actionType of acitonTypeOptions) {
        const actionTypeOption = newElement('option', {value: actionType.toLowerCase(), innerText: actionType});
        addElement(actionTypeOption, actionTypeSelect);
    }
    return actionTypeSelect;
}

function createActionSelect(id, type) {
    const actionSelect = newElement('select', {id: `actionSelect${id}`, class: ['actionSelect']});

    for (let action of Object.keys(window.unconditionalActions).sort()) {
        const actionOption = newElement('option', {value: action, innerText: action, "data-depends-on": `actionTypeSelect${id}`, "data-depends-value": "unconditional", "style": type === "unconditional" ? "display: block;" : "display: none;"});
        addElement(actionOption, actionSelect);
    }
    for (let action of Object.keys(window.conditionalActions).sort()) {
        const actionOption = newElement('option', {value: action, innerText: action, "data-depends-on": `actionTypeSelect${id}`, "data-depends-value": "conditional", "style": type === "conditional" ? "display: block;" : "display: none;"});
        addElement(actionOption, actionSelect);
    }

    return actionSelect;
}

const newActionSelect = makeInstanced(createActionSelect);
const newActionTypeSelect = makeInstanced(createActionTypeSelect);

function addActionBlock(element) {
    if (element instanceof Event) element = element.target.closest(".treatmentBody");
    const actionBody = createActionBlock("unconditional");
    addElement(actionBody, element);
    sendEvent(qs(".actionTypeSelect", actionBody), "change");
    sendEvent(qs(".actionSelect", actionBody), "change");
}

function addTreatmentBlock() {
    const treatmentBody = newTreatmentBlock();
    addElement(treatmentBody, eById('inputs'));
}

function newTreatmentBlock() {
    const treatmentBody = newElement('div', {class: [`treatmentBody`]});
    const nameInput = newElement('input', {class: ["treatmentName"]});
    addElement(nameInput, treatmentBody);

    const addActionButton = newElement('button', {title: "Add Action", class: ["addAction"], innerText: "Add Action"});
    registerElement(addActionButton, "click", function() {addActionBlock(actionList)});
    addElement(addActionButton, treatmentBody);

    const addTreatmentBeforeButton = newElement('button', {title: "Add Treatment Before", class: ["addTreatment"], innerText: "Add Treatment Before"});
    registerElement(addTreatmentBeforeButton, "click", function() {addElement(newTreatmentBlock(), treatmentBody, "beforebegin")});
    addElement(addTreatmentBeforeButton, treatmentBody);
    
    const removeButton = newElement("button", {title: "Remove Treatment", class: ["removeTreatment"], innerText: "Remove Treatment"});
    registerElement(removeButton, "click", function() {treatmentBody.remove(); updateDisplay();});
    addElement(removeButton, treatmentBody);
    
    const actionList = newElement('ol', {class: ['actionList']});
    addElement(actionList, treatmentBody);
    return treatmentBody;
}

function updateDisplay() {
    const result = loadString();
    eById('output').value = result;
}

function listenForChanges() {
    const targetNode = document.body;
    const config = { attributes: false, childList: true, subtree: true };
    const observer = new MutationObserver(mutationCallback);
    observer.observe(targetNode, config);
}

function mutationCallback(mutationList) {
    const buttonClasses = ["addParam", "addAction", "addTreatment"];
    for (const mutation of mutationList) {
        for (let addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === 3) return;
            let inputsToWatch = qsa("input, select, button", addedNode);
            for (let inputToWatch of inputsToWatch) {
                if (inputToWatch.nodeName === "INPUT") {
                    registerElement(inputToWatch, "input", updateDisplay);
                }
                else if (inputToWatch.nodeName === "BUTTON") {
                    for (let buttonClass of buttonClasses) {
                        if (inputToWatch.classList.contains(buttonClass)) {
                            registerElement(inputToWatch, "click", updateDisplay);
                        }
                    }
                }
                else {
                    registerElement(inputToWatch, "change", updateDisplay);
                }
            }
        }
        for (let removedNode of mutation.removedNodes) {
            if (removedNode.nodeType === 3) return;
            let inputsToWatch = qsa("input, select, button", removedNode);
            for (let inputToWatch of inputsToWatch) {
                if (inputToWatch.nodeName === "INPUT") {
                    unregisterElement(inputToWatch, "input", updateDisplay);
                }
                else if (inputToWatch.nodeName === "BUTTON") {
                    for (let buttonClass of buttonClasses) {
                        if (inputToWatch.classList.contains(buttonClass)) {
                            unregisterElement(inputToWatch, "click", updateDisplay);
                        }
                    }
                }
                else {
                    unregisterElement(inputToWatch, "change", updateDisplay);
                }
            }
        }
    }
}

function updateFields() {
    const fields = parseString(eById('output').value);
    const inputParent = eById('inputs');
    while (inputParent.childNodes.length > 0) {
        inputParent.childNodes[0].remove();
    }
    console.log(fields)
    for (let treatment in fields) {
        const treatmentBlock = newTreatmentBlock();
        const actionList = qs(".actionList", treatmentBlock);
        addElement(treatmentBlock, inputParent);
        if (treatment !== "root") {
            qs(".treatmentName", treatmentBlock).value = treatment;
        }
        for (let action of fields[treatment]) {
            let actionType = getActionType(action.name);

            const newAction = createActionBlock(actionType);
            addElement(newAction, actionList);
            const actionTypeSelect = qs(".actionTypeSelect", newAction);
            const actionSelect = qs(".actionSelect", newAction);
            actionTypeSelect.value = actionType;
            sendEvent(actionTypeSelect, "change");
            actionSelect.value = action.name;
            sendEvent(actionSelect, "change");
            let params = qsa(".paramsBody input, .paramsBody select:not(.actionTypeSelect)", newAction);
            for (let i = 0; i < action.params.length; i++) {
                if (!params[i]) {
                    const moreButton = qs(".paramsBody .addParam", newAction);
                    if (!moreButton) {
                        log("missing param field", "error");
                        continue;
                    }
                    else {
                        moreButton.click();
                        params = qsa(".paramsBody input, .paramsBody select:not(.actionTypeSelect)", newAction);
                    }
                }
                
                if (params[i].classList.contains("actionSelect")) {
                    if (Object.keys(conditionalActions).indexOf(action.params[i]) < 0 && Object.keys(unconditionalActions).indexOf(action.params[i]) < 0) {
                        action.params.splice(i, 0, "ShowPrompt");
                    }
                    const actionTypeSelect = qs(".actionTypeSelect", qs(".paramsBody", newAction));
                    actionTypeSelect.value = getActionType(action.params[i]);
                    sendEvent(actionTypeSelect, "change");
                    params[i].value = action.params[i];
                    sendEvent(params[i], "change");
                    params = qsa(".paramsBody input, .paramsBody select:not(.actionTypeSelect)", newAction);
                }
                else params[i].value = action.params[i];
            }
        }
    }
}

function getActionType(action) {
    let actionType;
    if (Object.keys(window.unconditionalActions).indexOf(action) >= 0) actionType = "unconditional";
    else if (Object.keys(window.conditionalActions).indexOf(action) >= 0) actionType = "conditional";
    else actionType = "unconditional";
    return actionType;
}

registerElement(eById("addTreatment"), "click", addTreatmentBlock);
registerElement(eById('output'), "input", updateFields);
listenForChanges();