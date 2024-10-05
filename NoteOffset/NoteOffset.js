var notes = 'ABCDEFG';
var timings = [];

function getRandomNote() {
    return window.notes.charAt(randomIntFromInterval(0, notes.length - 1));
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
    let currentOffset, currentNote, correctAnswer, currentTiming;
    eById('result').innerText = "";
    const buttonContainer = eById("options");
    for (let note of window.notes) {
        const button = newElement('button', {innerText: note});
        registerElement(button, "click", submitAnswer);
        addElement(button, buttonContainer);
    }

    registerElement(eById('offset'), "change", newRound);

    newRound();

    function newRound() {
        const selectedOffset = parseInt(eById("offset").value, 10);
        if (isNaN(selectedOffset)) {
            console.error("Must have a number selected");
            return;
        }
        const isOffsetPos = randomIntFromInterval(0,1) > 0;
        currentOffset = isOffsetPos ? selectedOffset : 0 - selectedOffset;
        currentNote = getRandomNote();
        eById("displayNote").innerText = currentNote;
        eById("displayOffset").innerText = currentOffset;
        currentTiming = {start: performance.now(), note: currentNote, offset: currentOffset};
        correctAnswer = getCorrectAnswer();
    }

    function getCorrectAnswer() {
        let tempNotes = window.notes;
        // if it's negative, just reverse the notes and do the same process
        if (currentOffset < 0) tempNotes = tempNotes.split("").reverse().join("");
        return tempNotes[(tempNotes.indexOf(currentNote) + Math.abs(currentOffset)) % tempNotes.length];
    }

    function submitAnswer(event) {
        currentTiming.end = performance.now();
        if (event.target.textContent === correctAnswer) {
            currentTiming.result = "success";
            eById("result").innerText = `That is correct! ${correctAnswer} is ${currentOffset} away from ${currentNote}`;
        }
        else {
            currentTiming.result = "fail";
            eById("result").innerText = `That is not correct. ${correctAnswer} is ${currentOffset} away from ${currentNote}`;
        }
        timings.push(currentTiming);
        newRound();
    }
}

function stopGame() {
    const timingsReport = reportTimings();
    eById("result").innerText = timingsReport;
}

function millisecondsToReadable(millis) {
    const seconds = millis / 1000;
    return `${roundTo(seconds, 3)}`
}

function roundTo(num, digits) {
    const mult = Math.pow(10, digits);
    return Math.round(num * mult) / mult;
}

function reportTimings() {
    let correctTime = 0;
    let correctCount = 0;
    let incorrectTime = 0;
    let incorrectCount = 0;
    for (let timing of window.timings) {
        const diff = timing.end - timing.start;
        if (timing.result === "success") {
            correctCount++;
            correctTime += diff;
        }
        else {
            incorrectCount++;
            incorrectTime += diff;
        }
    }
    return (`Correct Answers: ${correctCount}\nAverage Time to Answer: ${isNaN(correctTime / correctCount) ? 0 : millisecondsToReadable(correctTime / correctCount)} seconds\nIncorrect Answers: ${incorrectCount}\nAverage Time to Answer: ${isNaN(incorrectTime / incorrectCount) ? 0 : millisecondsToReadable(incorrectTime / incorrectCount)} seconds`)
}

registerElement(eById('start'), "click", startGame);
registerElement(eById('stop'), "click", stopGame);