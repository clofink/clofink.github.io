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
    let index = 0;
    while (index < element.children.length) {
        const currentElement = element.children[index];
        if (!selector || (selector && currentElement.matches(selector))) {
            currentElement.remove();
        }
        else {
            index++;
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
async function wait(time) {
    return new Promise((resolve) => {
        setTimeout(() => {resolve()}, time);
    })
}
function sortByKey(key, caseSensitive = true) {
    return function (a, b) {
        const valueA = caseSensitive ? a[key] : a[key].toLowerCase();
        const valueB = caseSensitive ? b[key] : b[key].toLowerCase();
        if (valueA > valueB) return 1;
        if (valueA < valueB) return -1;
        return 0;
    }
}
function removeFromArray(array, item) {
    const indexToRemove = array.indexOf(item);
    if (indexToRemove < 0) return;
    array.splice(indexToRemove, 1);
}

function replaceInArray(array, item, replacement) {
    const indexToRemove = array.indexOf(item);
    if (indexToRemove < 0) return;
    array.splice(indexToRemove, 1, replacement);
}

function capitalizeWords(string) {
    return string.split(" ").map((e) => e.substring(0,1).toUpperCase() + e.substring(1)).join(" ");
}

function prettyPrintCamelCase(string) {
    const capitalRegex = /[A-Z]/g;
    const matches = [...string.matchAll(capitalRegex)];
    matches.reverse();
    for (let match of matches) {
        const end = string.substring(match.index);
        const begin = string.substring(0, match.index);
        string = begin + " " + end;
    }
    return string[0].toUpperCase() + string.substring(1);
}

async function showLoading(loadingFunc, args = [], spinnerSelector = "#loadIcon") {
    const spinnerElement = qs(spinnerSelector);
    spinnerElement.classList.add("shown");
    try {
        await loadingFunc(...args);
    }
    catch(error) {
        console.error(error);
    }
    spinnerElement.classList.remove("shown");
}