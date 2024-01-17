window.storedValues = {};

function generateWord(charList, length, firstWord, capitalChance) {
    let randomWord = "";
    for (let i = 0; i < length; i++) {
        let randomLetter = charList[randomIntFromInterval(1, charList.length) - 1];
        const highChance = Math.floor(100/capitalChance);
        const upperChance = randomIntFromInterval(1, highChance);
        if (firstWord && i === 0) randomLetter = randomLetter.toUpperCase();
        else if (upperChance === 1) randomLetter = randomLetter.toUpperCase();
        randomWord += randomLetter;
    }
    return randomWord;
}

function generateWords(charList, count, capitalChance, firstLetter) {
    const wordList = [];
    for (let i = 0; i < count; i++){
        const wordLen = randomIntFromInterval(window.storedValues.wordLenMin, window.storedValues.wordLenMax);
        if (i === 0 && firstLetter) wordList.push(generateWord(charList, wordLen, true, capitalChance));
        else wordList.push(generateWord(charList, wordLen, false, capitalChance));
    }
    return wordList.join(" ");
}

function generateSentence(charList) {
    const sentenceParts = [];
    const clauses = randomIntFromInterval(window.storedValues.clauseMin, window.storedValues.clauseMax);
    const clauseEndings = window.storedValues.clauseEndChars.split("");
    const sentenceEndings = window.storedValues.sentenceEndChars.split("");
    for (let i = 0; i < clauses; i++) {
        const words = randomIntFromInterval(window.storedValues.wordsPerClauseMin, window.storedValues.wordsPerClauseMax);
        const clauseSep = clauseEndings[randomIntFromInterval(0, clauseEndings.length - 1)];
        let clause;
        if (window.storedValues.capitalizeSentenceStart && i === 0) clause = generateWords(charList, words, window.storedValues.randomCapitalChance, window.storedValues.capitalizeSentenceStart);
        else clause = generateWords(charList, words, window.storedValues.randomCapitalChance, false);
        if (i < clauses - 1) clause += clauseSep;
        sentenceParts.push(clause);
    }
    const sentenceEnd = sentenceEndings[randomIntFromInterval(0,sentenceEndings.length - 1)];
    let sentence = sentenceParts.join(" ");
    sentence += sentenceEnd;
    return sentence;
}

function generateSentences(charList) {
    const sentenceList = []
    for (let i = 0; i < window.storedValues.sentenceCount; i++) {
        sentenceList.push(generateSentence(charList));
    }
    return sentenceList.join(" ");
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function downloadFile(fileName, fileBlob) {
    const file = new File([fileBlob], `${fileName}.txt`, {type: 'text/plain'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(file);
    link.href = url;
    link.download = file.name;
    link.click();
    window.URL.revokeObjectURL(url);
}

function updateDisplayNum(element) {
    if (element instanceof Event) element = element.target;
    const label = element.closest("label");
    const currentNum = /[\w\s]+\((\d*)[\%]*\):/.exec(label.textContent)[1];
    if (currentNum) label.firstChild.textContent = label.firstChild.textContent.replace(currentNum, element.value);
    else label.firstChild.textContent = label.firstChild.textContent.replace("()", `(${element.value}%)`);
}

function getRandomCharacters() {
    let charList = "";
    let options = "";
    if (window.storedValues.hasLetters) options += "qwertyuiopasdfghjklzxcvbnm";
    if (window.storedValues.hasNumbers) options += "1234567890";
    if (window.storedValues.hasSpecialChars) options += "-=[];',./";
    const maxLetters = window.storedValues.letterCount <= options.length ? window.storedValues.letterCount : options.length;
    while (charList.length < maxLetters && options.length > 0) {
        const randomChar = options[randomIntFromInterval(0, options.length - 1)];
        if (charList.indexOf(randomChar) < 0) charList += randomChar;
    }
    return charList;
}

function updateRandomCharacters() {
    const newList = getRandomCharacters();
    highlightKeys(newList);
}

function updateKeyboardDisplay(element) {
    if (element instanceof Event) element = element.target;
    const charLists = {
        topRow: "qwertyuiop",
        homeRow: "asdfghjkl;'",
        bottomRow: "zxcvbnm,./",
        leftNine: "qweasdzxc",
        rightNine: "iopkl;,./",
        middleTwelve: "rtyufghjvbnm"
    }
    let selectedList = charLists[element.value] || getRandomCharacters();
    highlightKeys(selectedList)
}

function highlightKeys(charList) {
    const allKeys = document.querySelectorAll("div.key");
    for (let key of allKeys) {
        if (charList.indexOf(key.querySelector("p.lower").innerText) >= 0) key.setAttribute("data-selected", "both");
        else key.setAttribute("data-selected", "none");
    }
}

function toggleKey(event) {
    const actualKey = event.target.closest("div.key")
    const hasUpper = actualKey.querySelector("p.upper");
    let values;
    if (hasUpper) values = ["none", "lower", "both"];
    else values = ["none", "both"];
    const currentVal = actualKey.getAttribute("data-selected");
    actualKey.setAttribute("data-selected", values[(values.indexOf(currentVal) + 1) % values.length])
}

function updateDependants(element) {
    if (element instanceof Event) element = element.target;
    const dependantElements = document.querySelectorAll(`[data-depends-on='${element.id}']`);
    for (let dependantElement of dependantElements) {
        const fieldValue = dependantElement.getAttribute("data-depends-value");
        if (fieldValue.split(",").indexOf(element.value) >= 0) dependantElement.style.display = "block";
        else dependantElement.style.display = "none";
    }
}

function updateGlobal(element) {
    if (element instanceof Event) element = element.target;
    let storedValue = element.value;
    if (element.nodeName === "INPUT") {
        if (element.type === "checkbox") storedValue = element.checked;
        if (element.type === "number" || element.type === "range") storedValue = parseInt(element.value);
    }
    window.storedValues[element.id] = storedValue;
}

function registerElements(selector, event, callback, doCallback) {
    const elements = document.querySelectorAll(selector);
    for (let element of elements) {
        if(doCallback) callback(element);
        element.addEventListener(event, callback);
    }
}

function generateList() {
    let charList = "";
    const allKeys = document.querySelectorAll("div.key");
    for (let key of allKeys) {
        let selected = key.getAttribute("data-selected");
        if (selected === "none") continue;
        charList += key.querySelector("p.lower").innerText;
        if (selected === "both" && key.querySelector("p.upper")) charList += key.querySelector("p.upper").innerText;
    }
    if (charList.length < 1) return;
    const generatedResults = window.storedValues.generateType === "sentences" ? generateSentences(charList) : generateWords(charList, window.storedValues.wordCount, window.storedValues.capitalChance, false);

    // console.log(generatedResults);
    downloadFile(window.storedValues.fileName, generatedResults);
}

document.getElementById("generate").addEventListener("click", generateList);
document.getElementById("charList").addEventListener("change", updateKeyboardDisplay);
document.getElementById("regenerate").addEventListener("click", updateRandomCharacters);
updateKeyboardDisplay(document.getElementById("charList"));

registerElements("select", "change", updateDependants, true);
registerElements("input[type='range']", "input", updateDisplayNum, true);
registerElements("div.key", "mouseup", toggleKey, false);
registerElements("input,select", "change", updateGlobal, true);