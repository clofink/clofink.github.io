var movieList, fileContents;
const MAX_RETRIES = 10;

var requiredFields = ["Title"];

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
                if (fileContents.meta.fields.length < window.requiredFields.length) {
                    fileContents = undefined;
                    throw `${file.name} does not have required fields ${JSON.stringify(window.requiredFields)}`
                }
                for (let field of window.requiredFields) {
                    if (!fileContents.meta.fields.includes(field)) {
                        fileContents = undefined;
                        throw `${file.name} does not have required fields ${JSON.stringify(window.requiredFields)}`    
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
    event.target.value = "";
}

// from https://github.com/moroshko/elo.js
function getRatingDelta(myRating, opponentRating, myGameResult) {
    if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
        return null;
    }

    var myChanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - myRating) / 400));

    return Math.round(32 * (myGameResult - myChanceToWin));
}

function getNewRating(myRating, opponentRating, myGameResult) {
    return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
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

function updateRating(movie, newRating) {
    movie.ELO = newRating;
}

function makeSelectUi(movie1, movie2, container) {
    const movieOptions = newElement("div", { id: "options" });
    const movie1Elems = makeMovieSelect(movie1, "left");
    const movie2Elems = makeMovieSelect(movie2, "right");
    registerElement(movie1Elems, "click", () => {vote(movie1, movie2); showOptions()});
    registerElement(movie2Elems, "click", () => {vote(movie2, movie1); showOptions()});
    addElements([movie1Elems, movie2Elems], movieOptions);

    const controls = newElement("div", { id: "controls" });
    const vote1Button = newElement("button", { "data-movie-title": movie1.Title, innerText: "Vote" });
    registerElement(vote1Button, "click", () => {vote(movie1, movie2); showOptions()});
    const mark1UnseenButton = newElement("button", { "data-movie-title": movie1.Title, innerText: "Mark Unseen" });
    registerElement(mark1UnseenButton, "click", () => {markUnseen(movie1); showOptions()});
    const vote2Button = newElement("button", { "data-movie-title": movie2.Title, innerText: "Vote" });
    registerElement(vote2Button, "click", () => {vote(movie2, movie1); showOptions()});
    const mark2UnseenButton = newElement("button", { "data-movie-title": movie2.Title, innerText: "Mark Unseen" });
    registerElement(mark2UnseenButton, "click", () => {markUnseen(movie2); showOptions()});
    const skipButton = newElement("button", { innerText: "Skip" });
    registerElement(skipButton, showOptions);
    addElements([mark1UnseenButton, vote1Button, skipButton, vote2Button, mark2UnseenButton], controls);

    addElements([movieOptions, controls], container);
}

function showOptions() {
    if (!fileContents || fileContents.data.length < 2) return;

    const missingEloMovies = fileContents.data.filter((e) => (!e.hasOwnProperty("ELO") || !e.ELO) && (!e.hasOwnProperty("Seen") || e.Seen !== "FALSE"));
    if (missingEloMovies.length > 0) {
        const selectContainer = eById("selections");
        clearElement(selectContainer);
        const currentMovie = missingEloMovies.shift();
        const rater = makeMovieRater(currentMovie);
        addElement(rater, selectContainer);
        return;
    }

    const movie1 = getRandomMovie(fileContents.data);
    let movie2 = getRandomMovie(fileContents.data);
    let tries = 0;
    while (movie1 === movie2 && tries < MAX_RETRIES) {
        tries++;
        movie2 = getRandomMovie(fileContents.data);
    }
    if (tries === MAX_RETRIES) throw `Unable to find a non duplicate movie`;
    movie1.ELO = parsedNumOrDefault(movie1.ELO, 1500);
    movie2.ELO = parsedNumOrDefault(movie2.ELO, 1500);
    const selectContainer = eById("selections");
    clearElement(selectContainer);
    makeSelectUi(movie1, movie2, selectContainer);
}

function parsedNumOrDefault(numString, fallback) {
    let parsedNum = parseInt(numString, 10);
    return Number.isNaN(parsedNum) ? fallback : parsedNum;
}

function vote(winner, loser) {
    const winnerRating = winner.ELO
    const loserRating = loser.ELO
    updateRating(winner, getNewRating(winnerRating, loserRating, 1));
    updateRating(loser, getNewRating(loserRating, winnerRating, 0));
    console.log(`"${winner.Title}" (${winnerRating} -> ${winner.ELO}) beat "${loser.Title}" (${loserRating} -> ${loser.ELO})`);
}

function start() {
    // get the ones withouth an ELO property or no value for the ELO property
    showOptions();
}

function markUnseen(movie) {
    movie.Seen = "FALSE";
}

function makeMovieSelect(movie, side) {
    const movieContainer = newElement("div", { class: ["movieOption"], "data-title": movie.Title });
    if (side) movieContainer.classList.add(side);
    const title = newElement("div", { class: ["title"], innerText: movie.Title });
    addElement(title, movieContainer);
    if (movie.Director) {
        const director = newElement("div", { class: ["director"], innerText: `Dir: ${movie.Director}` });
        addElement(director, movieContainer)
    }
    if (movie.Year) {
        const year = newElement("div", { class: ["year"], innerText: `(${movie.Year})` });
        addElement(year, movieContainer);
    }
    return movieContainer;
}

/** Download contents as a file
 * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 */
function downloadBlob(content) {
    // Create a blob
    var blob = new Blob([Papa.unparse(content)]);
    var url = URL.createObjectURL(blob);
  
    // Create a link to download it
    var pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', 'Ranked Movie List.csv');
    pom.click();
}  

function checkKey(event) {
    if (!event) return;
    if (!qs("left") && !qs("right")) return;
    if (event.shiftKey && event.code === "ArrowRight") {
        const rightOption = fileContents.data.find((e) => e.Title === qs(".right").dataset.title)
        markUnseen(rightOption);
        showOptions();
    }
    else if (event.shiftKey && event.code === "ArrowLeft") {
        const leftOption = fileContents.data.find((e) => e.Title === qs(".left").dataset.title)
        markUnseen(leftOption);
        showOptions();
    }
    else if (event.code === "ArrowRight") {
        const leftOption = fileContents.data.find((e) => e.Title === qs(".left").dataset.title)
        const rightOption = fileContents.data.find((e) => e.Title === qs(".right").dataset.title)
        vote(rightOption, leftOption);
        showOptions();
    }
    else if (event.code === "ArrowLeft") {
        const leftOption = fileContents.data.find((e) => e.Title === qs(".left").dataset.title)
        const rightOption = fileContents.data.find((e) => e.Title === qs(".right").dataset.title)
        vote(leftOption, rightOption);
        showOptions();
    }
    else if (event.code === "ArrowDown") {
        console.log("skipped")
        showOptions();
    }
}

// filter for ones with no ELO score
// go through those first to give a "star" rating (1-5)
// use that to set an initial ELO
// 700 1100 1500 1900 2300

function makeMovieRater(movie) {
    const starEloMapping = ["700", "1100", "1500", "1900", "2300"];
    const ratingContainer = newElement("div", { class: ["ratingContainer"]});
    const controls = newElement("div", { id: "controls" });
    const movieCard = makeMovieSelect(movie, "");

    const markUnseenButton = newElement("button", {innerText: "Mark Unseen"});
    registerElement(markUnseenButton, "click", () => {markUnseen(movie); showOptions()})

    const starButtonContainer = newElement("div", {id: "starButtons"})
    for (let i = 0; i < 5; i++) {
        const starButton = newElement("span", { class: ["star"] });
        registerElement(starButton, "click", () => {movie.ELO = starEloMapping[i]; showOptions()});
        addElement(starButton, starButtonContainer);
    }
    addElement(markUnseenButton, controls);
    addElements([movieCard, controls, starButtonContainer], ratingContainer);
    
    return ratingContainer;
}

const importField = document.getElementById('import');
importField.addEventListener("change", loadFile);
const exportButton = document.getElementById('export');
exportButton.addEventListener("click", ()=>{if(!fileContents) return; downloadBlob(fileContents.data)});
document.addEventListener('keyup', checkKey);