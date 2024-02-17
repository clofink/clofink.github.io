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
function registerElement(element, event, callback, doCallback) {
    element.addEventListener(event, callback);
    if (doCallback) sendEvent(element, event);
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
        switch (param) {
            case "class":
                newElem.classList.add(...params[param]);
                break;
            case "innerText":
                newElem.innerText = params[param];
                break;
            case "innerHTML":
                newElem.innerHTML = params[param];
                break;
            default:
                newElem.setAttribute(param, params[param])
                break;
        }
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
function clearElement(element, selector) {
    if (!selector) {
        while (element.children.length > 0) {
            element.children[0].remove();
        }
    }
    else {
        const matchingElements = qsa(`${selector}`, element);
        for (let element of matchingElements) {
            element.remove();
        }
    }
}
function generateRange(low, high) {
    if (low > high) return [];
    const range = [];
    for (low; low < high; low++) {
        range.push(low);
    }
    return range;
}