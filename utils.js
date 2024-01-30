function qs(selector, target) {
    return (target || document).querySelector(selector);
}
function qsa(selector, target) {
    return (target || document).querySelectorAll(selector);
}
function log(message, level) {
    if (message === undefined) throw "No Message"
    if (level && ['log', 'info', 'warn', 'error'].indexOf(level) < 0) throw `Invalid Log Level "${level}". Use info, warn, or error`
    console[level || "log"](message);
}
function eById(id, target) {
    return (target || document).getElementById(id); 
}
function registerElement(element, event, callback) {
    element.addEventListener(event, callback);
}
function unregisterElement(element, event, callback) {
    element.removeEventListener(event, callback);
}
function registerElements(elements, event, callback, doCallback) {
    for (let element of elements) {
        if(doCallback) callback(element);
        registerElement(element, event, callback);
    }
}
function newElement(type, params) {
    const newElem = document.createElement(type);
    for (let param in params) {
        if (param === "class") newElem.classList.add(...params[param]);
        else if (param === "innerText") newElem.innerText = params[param];
        else newElem.setAttribute(param, params[param])
    }
    return newElem;
}
function addElement(element, target, position) {
    if (!position) (target || document.body).appendChild(element);
    else (target || document.body).insertAdjacentElement(position, element);
}
function addElements(elements, target, position) {
    for (let element of elements) {
        addElement(element, target, position);
    }
}
function sendEvent(element, event) {
    element.dispatchEvent(new Event(event));
}
function clearElement(element) {
    while (element.children.length > 0) {
        element.children[0].remove();
    }
}