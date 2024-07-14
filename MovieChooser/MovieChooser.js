var fileContents, currentRound = 0, currentMovies = [], nextRoundMovies = [];
const MAX_RETRIES = 10;
const ROUND_CHOICES = [5, 3, 1];
const REQUIRED_FIELDS = ["Title"];

function loadFile(event) {
    try {
        if (event.target.files.length < 1) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', function(data) {
            try {
                fileContents = Papa.parse(data.target.result, {header: true});
                log(fileContents);
                if (fileContents.meta.fields.length < REQUIRED_FIELDS.length) {
                    fileContents = undefined;
                    throw `${file.name} does not have required fields ${JSON.stringify(REQUIRED_FIELDS)}`
                }
                for (let field of REQUIRED_FIELDS) {
                    if (!fileContents.meta.fields.includes(field)) {
                        fileContents = undefined;
                        throw `${file.name} does not have required fields ${JSON.stringify(REQUIRED_FIELDS)}`
                    }
                }
                start();
            }
            catch (error) {
                console.error(error);
                throw `${file.name} does not contain valid CSV.`
            }
        })
        reader.readAsText(file);
    }
    catch (error) {
        handleError(error);
    }
    window.unratedMovies = undefined;
    event.target.value = "";
}

function getRandomMovie(movieList) {
    let movieChoice = movieList[Math.floor(Math.random() * (movieList.length))];
    let tries = 0;
    while ((movieChoice.Seen && movieChoice.Seen === "FALSE") && tries < MAX_RETRIES) {
        tries++;
        movieChoice = movieList[Math.floor(Math.random() * (movieList.length))];
    }
    if (tries === MAX_RETRIES) throw `Unable to find a movie you've seen`;
    return movieChoice
}

function makeSelectUi(container) {
    clearElement(container);

    const movieOptions = newElement("div", { id: "options" });
    showOptions(movieOptions);

    const controls = newElement("div", { id: "controls" });
    const nextRoundButton = newElement("button", { innerText: "Next Round" });
    registerElement(nextRoundButton, "click", nextRound);
    const restartButton = newElement("button", { innerText: "Restart" });
    registerElement(restartButton, "click", restart);

    addElements([nextRoundButton, restartButton], controls);

    addElements([movieOptions, controls], container);
}

function nextRound() {
    window.currentRound++;
    window.currentMovies = window.nextRoundMovies;
    window.nextRoundMovies = [];
    showCurrentMovies(eById("options"));
}

function restart() {
    window.currentRound = 0;
    window.currentMovies = [];
    window.nextRoundMovies = [];
    showOptions(eById("options"));
}

function showCurrentMovies(container) {
    clearElement(container);
    for (let movie of window.currentMovies) {
        const movieChoice = makeMovieSelect(movie);
        registerElement(movieChoice, "click", (e) => {
            if (e.target.nodeName === "BUTTON") return;
            if (window.nextRoundMovies.includes(movie)) {
                window.nextRoundMovies.splice(window.nextRoundMovies.indexOf(movie), 1);
                movieChoice.classList.remove("chosen");
                return;
            }
            movieChoice.classList.add("chosen");
            window.nextRoundMovies.push(movie);
        });
        if (window.nextRoundMovies.includes(movie)) movieChoice.classList.add("chosen");
        addElement(movieChoice, container);
    }
}

function showOptions(container) {
    if (!fileContents || fileContents.data.length < 2) return;

    window.currentMovies = [];
    while (window.currentMovies.length < ROUND_CHOICES[window.currentRound]) {
        let tries = 0;
        let movie;
        while (!window.currentMovies.includes(movie) && tries < MAX_RETRIES) {
            tries++;
            movie = getRandomMovie(fileContents.data);
            if (!window.currentMovies.includes(movie)) {
                window.currentMovies.push(movie);
            }
        }
        if (tries === MAX_RETRIES) throw `Unable to find a non duplicate movie`;
    }
    showCurrentMovies(container);
}

function parsedNumOrDefault(numString, fallback) {
    let parsedNum = parseInt(numString, 10);
    return Number.isNaN(parsedNum) ? fallback : parsedNum;
}

async function start() {
    window.currentMovies = [];
    makeSelectUi(eById("selections"));
}

function makeMovieSelect(movie) {
    const movieContainer = newElement("div", { class: ["movieOption"] });
    const movieInfo = newElement("div", { class: ["movieInfo"] });
    const title = newElement("div", { class: ["title"], innerText: movie.Title });
    addElement(title, movieInfo);
    if (movie.Director) {
        const director = newElement("div", { class: ["director"], innerText: `Dir: ${movie.Director}` });
        addElement(director, movieInfo)
    }
    if (movie.Year) {
        const year = newElement("div", { class: ["year"], innerText: `(${movie.Year})` });
        addElement(year, movieInfo);
    }
    const buttonsContainer = newElement("div", { class: ["buttons"] })
    if (currentRound === 0) {
        const rerollButton = newElement("button", { innerText: "Reroll" });
        registerElement(rerollButton, "click", () => {
            const replaceIndex = window.currentMovies.indexOf(movie);
            if (window.nextRoundMovies.includes(movie)) {
                window.nextRoundMovies.splice(window.nextRoundMovies.indexOf(movie), 1);
            }
            let tries = 0;
            let newMovie;
            while (!window.currentMovies.includes(newMovie) && tries < MAX_RETRIES) {
                tries++;
                newMovie = getRandomMovie(fileContents.data);
                if (!window.currentMovies.includes(newMovie)) {
                    window.currentMovies.splice(replaceIndex, 1, newMovie);
                }
            }
            if (tries === MAX_RETRIES) throw `Unable to find a non duplicate movie`;
            showCurrentMovies(eById("options"));
        });
        addElement(rerollButton, buttonsContainer);
    }
    addElements([movieInfo, buttonsContainer], movieContainer);
    return movieContainer;
}

registerElement(eById('import'), "change", loadFile);