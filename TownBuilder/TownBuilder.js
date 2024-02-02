var population = [];
var newTown;

function getPersonById(personId, personList) {
    for (let person of personList) {
        if (person.getPersonId() == personId) {
            return person;
        }
    }
}

function getPersonByName(name, personList) {
    for (let person of personList) {
        if (person.getFullName() == name) {
            return person;
        }
    }
}

function getRandomPerson(personList) {
    return personList[getRandomNumberInRange(0, personList.length - 1)];
}

function getRandomNumberInRange(min, max) {
    return Math.floor(randomFunction() * (max - min + 1) + min);
}

function doesRandomEventHappen(percentage) {
    let randomNumber = Math.floor(randomFunction() * 1000);
    if (randomNumber < (percentage * 10)) {
        return true;
    }
    return false
}

var randomFunction;

function generateNewTown() {
    const seedElem = qs('[name="randomSeed"]');
    const seed = seedElem.value || Math.random().toString(36).substring(2, 11);
    log(seed);
    randomFunction = new alea(seed);

    newTown = new Town(getUserInputValues());
    populateTown(newTown);
    // need to add jobs to the town. is it worth generating jobs just to check the requirements function?? 
    let startingJobs = ['Mayor'];
    for (let personIndex = 0; personIndex < newTown.getLivingPopulation().length; personIndex++) {
        if (doesRandomEventHappen(90)) {
            if (doesRandomEventHappen(50)) {
                startingJobs.push('Farmer');
                continue;
            }
            if (doesRandomEventHappen(60)) {
                startingJobs.push('Guard');
                continue;
            }
            if (doesRandomEventHappen(20)) {
                startingJobs.push('Smith');
                continue;
            }
            if (doesRandomEventHappen(30)) {
                startingJobs.push('Baker');
                continue;
            }
            if (doesRandomEventHappen(30)) {
                startingJobs.push('Healer');
                continue;
            }
            if (doesRandomEventHappen(30)) {
                startingJobs.push('Innkeeper');
                continue;
            }
        }
    }
    for (let job of startingJobs) {
        let newJob = createJob(job);
        if (newJob.meetsRequirements(newTown)) {
            newTown.addJobToMarket(newJob);
        }
    }
    let yearsToRun = getUserInputValues().currentYear - newTown.getYearOfIncorporation();
    for (let t = 0; t < yearsToRun; t++) {
        yearPasses(newTown);
    }
    log(newTown);
    eById('generate').classList.add('hidden');
    eById('newTown').classList.remove('hidden');
    eById('yearsToAdd').classList.remove('hidden');
    eById('extendTownTime').classList.remove('hidden');
    if (tableExists('populationTable')) {
        clearElement(eById('populationInfo'));
    }
    displayTownInfo(newTown);
    return newTown;
}

function addYears() {
    if (!newTown) {
        return;
    }
    let years = qs('input[name="yearsToAdd"]').value;
    if (!years) {
        years = 50;
    }
    for (let t = 0; t < years; t++) {
        yearPasses(newTown);
    }
    log(newTown);
    if (tableExists('populationTable')) {
        clearElement(eById('populationInfo'));
    }
    displayTownInfo(newTown);
}

function populateTown(town) {
    // this will get the list of races and use it to create the town
    let townRaces = getTownRaces();
    for (let i = 0; i < town.getNumberOfFounders(); i++) {
        // let newPerson = new Human({ageRange: [0,5], currentYear: town.getCurrentYear()});
        let newPerson = createPerson(getRandomItemInList(townRaces), {currentYear: town.getCurrentYear()});
        newPerson.addLifeEvent(newPerson.getBirthYear(), "{P} was born");
        newPerson.setStats(assignStats(rollStats()));
        town.addToPopulation(newPerson)
    }
}

function getTownRaces() {
    let townRaces = [];
    for (let raceSelector of qsa('.raceSelector')) {
        townRaces.push(raceSelector.querySelector('select').value);
    }
    return townRaces;
}

function createJob(jobName) {
    switch(jobName) {
        case 'Mayor':
            return new Mayor();
        case 'Farmer':
            return new Farmer();
        case 'Guard':
            return new Guard();
        case 'Patrol':
            return new Patrol();
        case 'Smith':
            return new Smith();
        case 'Healer':
            return new Healer();
        case 'Baker':
            return new Baker();
        case 'Barkeep':
            return new Barkeep();
        case 'Innkeeper':
            return new Innkeeper();
        case 'Leatherworker':
            return new Leatherworker();
        default:
            break;
    }
}

function createPerson(race, options) {
    options = options || {};
    switch (race) {
        case 'tabaxi':
            return new Tabaxi(options);
        case 'warforged':
            return new Warforged(options);
        case 'tortle':
            return new Tortle(options);
        case 'goliath':
            return new Goliath(options);
        case 'dragonborn':
            return new Dragonborn(options);
        case 'dwarf':
            return new Dwarf(options);
        case 'elf':
            return new Elf(options);
        case 'gnome':
            return new Gnome(options);
        case 'halfling':
            return new Halfling(options);
        case 'halfelf':
            return new Halfelf(options);
        case 'halforc':
            return new Halforc(options);
        case 'human':
            return new Human(options);
        case 'tiefling':
            return new Tiefling(options);
        default:
            return new Human(options);
    }
}

function getUserInputValues() {
    let userInputElements = qsa('#inputs input');
    let inputValues = {};
    for (let inputElement of userInputElements) {
        inputValues[inputElement.name] = inputElement.value;
    }
    return inputValues;
}

function displayTownInfo(town) {
    if (tableExists('townTable')) {
        clearElement(eById('townInfo'));
    }
    let townInfoDiv = eById('townInfo');
    let headers = [
        {displayName: 'Population Type'},
        {displayName: 'Number of People'}
    ];
    let table = createTable(headers);
    table.id = 'townTable';
    let totalPopRow = createDataRow(['Total Population', town.getPopulation().length])
    let livingPopRow = createDataRow(['Living Population', town.getLivingPopulation().length])
    let deadPopRow = createDataRow(['Dead Population', town.getDeadPopulation().length]);
    totalPopRow.addEventListener('click', swapSelectedPopulation);
    livingPopRow.addEventListener('click', swapSelectedPopulation);
    deadPopRow.addEventListener('click', swapSelectedPopulation);
    totalPopRow.id = 'total';
    livingPopRow.id = 'living';
    deadPopRow.id = 'dead';
    table.appendChild(totalPopRow);
    table.appendChild(livingPopRow);
    table.appendChild(deadPopRow);
    townInfoDiv.appendChild(table);
}

function swapSelectedPopulation(event) {
    let popType = event.target.closest('tr').id;
    switch(popType) {
        case 'total':
            window.population = newTown.getPopulation();
            break;
        case 'living':
            window.population = newTown.getLivingPopulation();
            break;
        case 'dead':
            window.population = newTown.getDeadPopulation();
            break;
        default:
            widnow.population = newTown.getLivingPopulation();
            break;
    }
    displayPopulationInfo(population);
}

function displayPopulationInfo(peopleList) {
    if (tableExists('populationTable')) {
        clearElement(eById('populationInfo'));
    }
    const populationInfoDiv = eById('populationInfo');

    const headers = [
        {displayName: 'Name', sortBy: "name"}, 
        {displayName: 'Age', sortBy: "age"},
        {displayName: 'Race', sortBy: "race"},
        {displayName: 'Birth Year', sortBy: "birthYear"},
        {displayName: 'Death Year', sortBy: "deathYear"},
        {displayName: 'Gender', sortBy: "gender"},
        {displayName: 'Gender Preference', sortBy: "genderPreference"},
        {displayName: '# Children', sortBy: "children"},
        {displayName: 'Worth', sortBy: "value"},
        {displayName: 'Job Title', sortBy: "title"},
        {displayName: 'Years in Job', sortBy: "yearsInPos"},
        {displayName: 'Strength', sortBy: "STR"},
        {displayName: 'Dexterity', sortBy: "DEX"},
        {displayName: 'Constitution', sortBy: "CON"},
        {displayName: 'Intelligence', sortBy: "INT"},
        {displayName: 'Wisdom', sortBy: "WIS"},
        {displayName: 'Charisma', sortBy: "CHA"},
    ]
    const table = createTable(headers, true);
    table.id = 'populationTable'
    addElement(fillPeopleTable(peopleList, table), populationInfoDiv);
}

function fillPeopleTable(peopleList, table) {
    for (let person of peopleList) {
        const rowData = [];
        rowData.push(person.getFullName());
        rowData.push(person.getAge());
        rowData.push(person.getRace());
        rowData.push(person.getBirthYear());
        rowData.push(person.getDeathYear() ? person.getDeathYear() : '-');
        rowData.push(person.getGender());
        rowData.push(person.getGenderPreference());
        rowData.push(person.getChildren().length);
        rowData.push(person.getValue() ? person.getValue() : 0);
        rowData.push(person.getJob() ? person.getJob().getTitle() : '-');
        rowData.push(person.getJob() ? person.getJob().getYearsInPosition() : 0);
        const personStats = person.getStats();
        rowData.push(personStats.STR);
        rowData.push(personStats.DEX);
        rowData.push(personStats.CON);
        rowData.push(personStats.INT);
        rowData.push(personStats.WIS);
        rowData.push(personStats.CHA);
        const dataRow = createDataRow(rowData);
        registerElement(dataRow, "click", logMorePersonInfo);
        dataRow.id = person.getPersonId();
        addElement(dataRow, table);
    }
    return table;
}

function logMorePersonInfo(event) {
    if (population.length < 1) {
        population = newTown.getLivingPopulation();
    }
    highlightFamily(event);
    let parentRow = event.target.closest('tr');
    let nameElement = parentRow.getElementsByTagName('td')[0];
    let thisPerson = getPersonByName(nameElement.innerText, population);
    log(formatBiography(thisPerson.getLifeEvents()));
    log(thisPerson);
}

function formatBiography(lifeEvents) {
    return lifeEvents.join('\n');
}

function highlightFamily(event) {
    let personId = event.target.closest('tr').id;
    let personElement = event.target.closest('tr');
    let allTableRows = document.getElementsByTagName('tr');
    if (!personElement.classList.contains('highlightSelf')) {
        for (let tableRow of allTableRows) {
            tableRow.classList.remove('highlightSelf', 'highlightParent', 'highlightSibling', 'highlightSpouse', 'highlightChild');
        }
    }
    if (personElement.classList.contains('highlightSelf')) {
        personElement.classList.remove('highlightSelf');
    }
    else {
        personElement.classList.add('highlightSelf');
    }    

    let thisPerson = getPersonById(personId, population);
    if (thisPerson.getParents()) {
        for (let parent of thisPerson.getParents()) {
            let parentElement = eById(parent.getPersonId());
            if (parentElement) {
                if (parentElement.classList.contains('highlightParent')) {
                    parentElement.classList.remove('highlightParent');
                }
                else {
                    parentElement.classList.add('highlightParent');
                }
            }
        }
    }
    if (thisPerson.getSiblings()) {
        for (let sibling of thisPerson.getSiblings()) {
            let siblingElement = eById(sibling.getPersonId());
            if (siblingElement) {
                if (siblingElement.classList.contains('highlightSibling')) {
                    siblingElement.classList.remove('highlightSibling');
                }
                else {
                    siblingElement.classList.add('highlightSibling');
                }
            }
        }
    }
    if (thisPerson.getSpouse()) {
        let spouseElement = eById(thisPerson.getSpouse().getPersonId());
        if (spouseElement) {
            if (spouseElement.classList.contains('highlightSpouse')) {
                spouseElement.classList.remove('highlightSpouse');
            }
            else {
                spouseElement.classList.add('highlightSpouse');
            }
        }
    }
    if (thisPerson.getChildren()) {
        for (let child of thisPerson.getChildren()) {
            let childElement = eById(child.getPersonId());
            if (childElement) {
                if (childElement.classList.contains('highlightChild')) {
                    childElement.classList.remove('highlightChild');
                }
                else {
                    childElement.classList.add('highlightChild');
                }
            }
        }
    }
}

/**
 * Creates a table and calls the functions needed to populate it
*/
function createTable(headers, sortBy) {
    const chatTable = newElement('table');
    const headerRow = createHeaderRow(headers, sortBy);
    addElement(headerRow, chatTable);
    return chatTable;
}

/**
 * Checks if the table element exists
 * @returns boolean table status
 */
 function tableExists(selector) {
    if (eById(selector)) {
        return true;
    }
    return false;
}

/**
 * Creates table header row from array of header names
 * @param {Array} headers - list of header names
 * @returns {HTMLElement} header row
 */
function createHeaderRow(headers, sortBy) {
    const headerRow = newElement('tr');
    for (let header of headers) {
        const tableValue = newElement('th', {innerHTML: header.displayName, "data-sort-direction": "asc", "data-sort-by": header.sortBy});
        if (sortBy) registerElement(tableValue, "click", sortByHeader);
        addElement(tableValue, headerRow);
    }
    return (headerRow);
}

/**
 * Sortby lambda that handles the table sorting
 * @param {} event - automatically provided by event handler
 */
function sortByHeader(event) {
    let sortedPopulation = [...population];
    const sortBy = event.target.dataset.sortBy || "personId";
    const sortDirection = event.target.dataset.sortDirection;

    if (sortDirection === 'asc') {
        sortedPopulation.sort(customSortAsc);
        event.target.setAttribute('data-sort-direction', 'desc');
    }
    else if (sortDirection === 'desc') {
        sortedPopulation.sort(customSortDesc);
        event.target.setAttribute('data-sort-direction', 'asc');
    }
    rebuildTableRows(sortedPopulation);

    function customSortAsc(a, b) {
        let valueA;
        let valueB;
        if (sortBy == 'children') {
            valueA = a.getChildren().length;
            valueB = b.getChildren().length;
        }
        else if (['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'].indexOf(sortBy) > -1) {
            valueA = parseInt(a.getStats()[sortBy]);
            valueB = parseInt(b.getStats()[sortBy]);
        }
        else if (sortBy == 'title') {
            valueA = a.getJob() ? a.getJob().getTitle() : "";
            valueB = b.getJob() ? b.getJob().getTitle() : "";
        }
        else if (sortBy == 'yearsInPos') {
            valueA = a.getJob() ? a.getJob().getYearsInPosition() : 0;
            valueB = b.getJob() ? b.getJob().getYearsInPosition() : 0;
        }
        else {
            valueA = a[sortBy] ? a[sortBy] : '';
            valueB = b[sortBy] ? b[sortBy] : '';
        }
        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }
        return 0;
    }

    function customSortDesc(a, b) {
        let valueA;
        let valueB;
        if (sortBy == 'children') {
            valueA = a.getChildren().length;
            valueB = b.getChildren().length;
        }
        else if (['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'].indexOf(sortBy) > -1) {
            valueA = parseInt(a.getStats()[sortBy]);
            valueB = parseInt(b.getStats()[sortBy]);
        }
        else if (sortBy == 'title') {
            valueA = a.getJob() ? a.getJob().getTitle() : "";
            valueB = b.getJob() ? b.getJob().getTitle() : "";
        }
        else if (sortBy == 'yearsInPos') {
            valueA = a.getJob() ? a.getJob().getYearsInPosition() : 0;
            valueB = b.getJob() ? b.getJob().getYearsInPosition() : 0;
        }
        else {
            valueA = a[sortBy] ? a[sortBy] : '';
            valueB = b[sortBy] ? b[sortBy] : '';
        }
        if (valueB < valueA) {
          return -1;
        }
        if (valueB > valueA) {
          return 1;
        }
        return 0;
    }
}

function rebuildTableRows(sortedPopulation) {
    const table = qs('#populationTable');
    const dataRows = qsa('#populationTable tr td:first-of-type');
    for (let dataRow of dataRows) {
        table.removeChild(dataRow.parentElement);
    }
    fillPeopleTable(sortedPopulation, table);
}

function createDataRow(data) {
    const dataRow = newElement('tr');
    for (let row of data) {
        const tableValue = newElement('td', {innerText: row});
        addElement(tableValue, dataRow);
    }
    return (dataRow)
}

function processLifeEvents(person, town, currentYear) {
    const lifeEvents = [
        {check: needsAJob, action: findAJob, type: "job"},
        {check: wantsABetterJob, action: lookForBetterJob, type: "job"},
        {check: wantsToGetMarried, action: tryToGetMarried, type: "spouse"},
        {check: canBuyHouse, action: houseHunt, type: "house"},
        {check: canHaveKids, action: haveKid},
        {check: wantsToAdopt, action: adoptKid},
        {check: canRetire, action: retire, type: "job"},
        {check: canLeaveOrphanage, action: leaveOrphanage}
    ]

    // removing this for now. It seems to cause an issue where people remain in their job after they die
    // shuffleArray(lifeEvents);

    const currentAge = person.getAge();
    const gender = person.getGender();
    let spouse = person.getSpouse();
    let currentJob = person.getJob();
    let house = person.getHouse();
    // list of life events and handlers for them

    // pay/make money
    personalFinances(person, house, currentJob, town);
    // meet people
    let meetChance = currentJob ? currentJob.getMeetChance() : 36;
    for (let p = 0; p < meetChance; p++) {
        meetOtherPeople(person, town.getLivingPopulation(), currentYear);
    }

    shuffleArray(lifeEvents);

    for (let event of lifeEvents) {
        if (event.check()) {
            const result = event.action();
            switch (event.type) {
                case "job":
                    currentJob = result;
                    break;
                case "spouse":
                    spouse = result;
                    break;
                case "house":
                    house = result;
                    break;
                default:
                    break;
            }
        }
    }

    // die
    if (person.getDeathChanceAtAge()) {
        passAway(person, town);
    }
    // age
    person.setAge(currentAge + 1);


    function wantsToGetMarried() {
        if (currentAge < person.getAdolescence()) return false;
        if (spouse) return false;
        return true;
    }
    function canLeaveOrphanage() {
        if (currentAge < person.getAdolescence()) return false;
        if (!getPersonById(person.personId, town.getOrphanage())) return false;
        return true;
    }
    function canRetire() {
        if (!currentJob) return false;
        if (currentAge <= person.getRetirementAge()) return false;
        return true;
    }
    function needsAJob() {
        if (currentJob) return false;
        if (currentAge < person.getAdolescence() || currentAge > person.getRetirementAge()) return false;
        return true;
    }
    function wantsABetterJob() {
        if (!currentJob) return false;
        return doesRandomEventHappen(25);
    }
    function canHaveKids() {
        if (!gender === "female") return false;
        if (!spouse || spouse.getIsDead() || spouse.getGender() !== "male") return false;
        if (currentAge < person.getAdolescence() || currentAge > person.getRetirementAge()) return false;
        return true;
    }
    
    function wantsToAdopt() {
        if (!spouse || spouse.getIsDead()) return false;
        if (gender !== spouse.getGender()) return false;
        if (currentAge < person.getAdolescence() || currentAge > person.getRetirementAge()) return false;
        if (person.getChildren().length > 4) return false;
        return doesRandomEventHappen(50);
    }
    function canBuyHouse() {
        if (currentAge <= person.getAdolescence()) return false;
        if (house) return false;
        if (spouse && spouse.getHouse()) return false;
        return true;
    }
    
    function leaveOrphanage() {
        town.removeFromOrphanage(person);
    }
    function retire() {
        person.addLifeEvent(currentYear, `{P} retired from {PP} job as a ${currentJob.getTitle()}`);
        person.retire();
    }
    function haveKid() {
        let haveKidsChance = person.getKidsChance();
        const currentChildren = person.getChildren().length;
        if (currentChildren >= 3) {
            haveKidsChance = Math.floor(haveKidsChance / 5);
        }
        if (currentChildren >= 5) {
            haveKidsChance = Math.floor(haveKidsChance / 10);
        }
        if (doesRandomEventHappen(haveKidsChance)) {
            const newChild = createPerson(person.getRace(), {currentYear: currentYear})
            town.addToPopulation(newChild);
            newChild.setParents([person, spouse]);
            newChild.setStats(calculateAverateStats(person.getStats(), spouse.getStats()));
            person.addChild(newChild);
            newChild.addLifeEvent(currentYear, "{P} was born");
            person.addLifeEvent(currentYear, `{P} had a ${newChild.getGender() === "male" ? "son" : "daughter"} named ${newChild.getFullName()}`);
            spouse.addLifeEvent(currentYear, `{P} had a ${newChild.getGender() === "male" ? "son" : "daughter"} named ${newChild.getFullName()}`);
        }
    }
    function adoptKid() {
        const availableOrphans = town.getOrphanage();
        if (availableOrphans.length > 0) {
            for (let orphan of availableOrphans) {
                if (orphan.getIsDead()) continue;
                town.removeFromOrphanage(orphan);
                orphan.setParents([person, spouse]);
                // FIXME: this doesn't deal with siblings???
                person.addChild(orphan);
                orphan.addLifeEvent(currentYear, `{P} was adopted by ${person.getFullName()} and ${spouse.getFullName()}`);
                person.addLifeEvent(currentYear, `{P} adopted ${orphan.getFullName()}`);
                spouse.addLifeEvent(currentYear, `{P} adopted ${orphan.getFullName()}`);
                break;
            }
        }
    }
    function houseHunt() {
        let newHouse;
        for (let building of town.getBuildings()) {
            if (building.getBuildingName() !== 'Home' || building.getOwner()) {
                continue;
            }
            newHouse = building;
            person.addLifeEvent(town.getCurrentYear(), "{P} bought a house");
            break;
        }
        // check for house again after trying to get one from the existing houses
        if (!newHouse) {
            newHouse = new Home();
            town.addBuilding(newHouse);
            person.addLifeEvent(town.getCurrentYear(), "{P} built a house");
        }
        makePersonHouseOwner(person, newHouse);
        // pay for the house
        person.addValue(-newHouse.getCost());
    
        // now we can add spouse and children to the house
        if (spouse && !spouse.getIsDead()) {
            const currentSpouseHouse = spouse.getHouse();
            if (currentSpouseHouse) {
                currentSpouseHouse.removeOwner();
                spouse.setHouse(undefined);
            }
            addPersonToHouse(spouse, newHouse);
        }
        for (let child of person.getChildren()) {
            if (!child.getIsDead() && !child.getHouse()) {
                addPersonToHouse(child, newHouse);
            }
        }
        return newHouse;
    }
    function findAJob() {
        for (let job of town.getJobMarket()) {
            // make sure the job isn't already done by someone
            if (job.getPerson()) {
                continue;
            }
            // if they don't meet the requirements for the job, skip it
            if (!job.meetQualifications(person.getStats())) {
                continue;
            }
            // reset if the job has re-entered the market after death or retirement
            job.setYearsInPosition(0);
            person.setJob(job);
            job.setPerson(person);
            person.addLifeEvent(town.getCurrentYear(), `{P} became a ${job.getTitle()}`);
            if (job.getBuildingRequired() && !job.getBuilding()) {
                // if you're getting a job that requires a building and doesn't have one
                // create one
                job.createBuilding();
                const jobBuilding = job.getBuilding();
                town.addBuilding(jobBuilding);
                jobBuilding.setOwner(person);
                jobBuilding.addResident(person);
            }
            if (job.getBuildingRequired() && job.getBuilding()) {
                const jobBuilding = job.getBuilding();
                if (!jobBuilding.getOwner()) {
                    jobBuilding.setOwner(person);
                }
                jobBuilding.addResident(person);
            }
            return job;
        }
    }
    function lookForBetterJob() {
        for (let prospectiveJob of town.getJobMarket()) {
            // make sure the job isn't already done by someone
            if (prospectiveJob.getPerson()) {
                continue;
            }
            // if they don't meet the requirements for the job, skip it
            if (!prospectiveJob.meetQualifications(person.getStats())) {
                continue;
            }
            // don't take a job with the same title
            if (prospectiveJob.getTitle() == currentJob.getTitle()) {
                continue;
            }
            // don't take if if the job makes less than their current job
            if (prospectiveJob.getSalary() <= currentJob.getSalary()) {
                continue;
            }
            // reset if the job has re-entered the market after death or retirement
            prospectiveJob.setYearsInPosition(0);
            person.setJob(prospectiveJob);
            // if we take a new job, we need to be removed from the old one
            currentJob.removePerson();
            const currentJobBuilding = currentJob.getBuilding();
            if (currentJobBuilding) {
                currentJobBuilding.removeResident(person);
                if(currentJobBuilding.getOwner() === person) {
                    currentJobBuilding.removeOwner();
                }
            }
            prospectiveJob.setPerson(person);
            person.addLifeEvent(town.getCurrentYear(), `{P} became a ${prospectiveJob.getTitle()}`);
            if (prospectiveJob.getBuildingRequired() && !prospectiveJob.getBuilding()) {
                // if you're getting a job that requires a building and doesn't have one
                // create one
                prospectiveJob.createBuilding();
                let jobBuilding = prospectiveJob.getBuilding();
                town.addBuilding(jobBuilding);
                jobBuilding.setOwner(person);
                jobBuilding.addResident(person);
            }
            if (prospectiveJob.getBuildingRequired() && prospectiveJob.getBuilding()) {
                let jobBuilding = prospectiveJob.getBuilding();
                if (!jobBuilding.getOwner()) {
                    jobBuilding.setOwner(person);
                }
                jobBuilding.addResident(person);
            }
            return prospectiveJob;
        }
        return currentJob;
    }
    function tryToGetMarried() {
        const newSpouse = findAPartner(person, town.getLivingPopulation(), gender);
        if (newSpouse) {
            person.setSpouse(newSpouse);
            person.addLifeEvent(town.getCurrentYear(), `{P} married ${newSpouse.getFullName()}`);
            newSpouse.addLifeEvent(town.getCurrentYear(), `{P} married ${person.getFullName()}`);
            // if they have a house
            const currentHouse = person.getHouse();
            const spouseHouse = newSpouse.getHouse();
            if (currentHouse) {
                // and their spouse has a house
                if (spouseHouse) {
                    // remove the spouse's house
                    spouseHouse.removeOwner();
                    newSpouse.setHouse(undefined);
                }
                // then add their spouse to their house
                addPersonToHouse(newSpouse, currentHouse);
            }
            // if they do not have a house and their spouse does
            else if (spouseHouse) {
                // then add them to their spouses house
                addPersonToHouse(person, spouseHouse);
            }
        }
        return newSpouse;
    }
}

function personalFinances(person, house, currentJob, town) {
    if (currentJob) {
        person.addValue(currentJob.getSalary());
        currentJob.setYearsInPosition(currentJob.getYearsInPosition() + 1);
    }
    const taxes = calculateTaxes(person.getValue(), town.getTaxRate());
    person.addValue(-taxes);
    town.addToCoffers(taxes);
    const expenses = calculateExpenses(person, house);
    person.addValue(-expenses);
}

function yearPasses(town) {
    town.incrementCurrentYear();
    const currentYear = town.getCurrentYear();
    // check for adding new jobs to the job market here?
    // try to add up to 5 jobs every year as long as the number of jobs in the marker is less than 60% of people (to account for people too young/old to work)
    if (town.getJobMarket().length < Math.round(town.getLivingPopulation().length * 0.6)) {
        for (let y = 0; y < 5; y++) {
            if (doesRandomEventHappen(50)) {
                const newJob = createJob(getRandomJobName());
                if (newJob.meetsRequirements(town)) {
                    town.addJobToMarket(newJob);
                }
            }
        }    
    }
    if (doesRandomEventHappen(10)) {
        // new random adult stranger comes to town (how to tell if they're an adult since the race will be random?)
        newVisitorArrives(town, currentYear);
    }
    // make a copy of living population so I can remove people who die from it without messing up the loop
    let currentLivingPeople = [...town.getLivingPopulation()];
    for (let person of currentLivingPeople) {
        processLifeEvents(person, town, currentYear);
    }
}

function newVisitorArrives(town, currentYear) {
    const newPersonRace = qs('[name="allowVisitors"]').checked ? getRandomRace() : getRandomItemInList(getTownRaces());
    const newPerson = createPerson(newPersonRace, {ageRange: [16, 50], currentYear: currentYear});
    newPerson.setStats(assignStats(rollStats()));
    newPerson.addLifeEvent(newPerson.getBirthYear(), "{P} was born");
    newPerson.addLifeEvent(currentYear, "{P} entered town");
    town.addToPopulation(newPerson);
}

function meetOtherPeople(person, population, currentYear) {
    let meetPerson = getRandomPerson(population);
    // can't meet dead people
    if (meetPerson.getIsDead()) {
        return;
    }
    // only get the meetPerson's person ID once
    const meetPersonId = meetPerson.getPersonId();
    const personId = person.getPersonId();
    const personName = person.getFullName();
    const meetPersonName = meetPerson.getFullName();
    const personAge = person.getAge();
    const meetPersonAge = meetPerson.getAge();
    // can't meet yourself
    if (meetPersonId == personId) {
        return;
    }
    let currentReputation = person.getReputationByPersonId(meetPersonId);
    let positiveInteractionChance = 50;
    if (currentReputation > 0) {
        positiveInteractionChance = 55;
    }
    if (currentReputation >= 5) {
        positiveInteractionChance = 60;
    }
    if (currentReputation >= 10) {
        positiveInteractionChance = 70;
    }
    if (currentReputation >= 20) {
        // once you become best friends, hard to decrease
        positiveInteractionChance = 95;
    }
    if (currentReputation < 0) {
        positiveInteractionChance = 45
    }
    if (currentReputation <= -5) {
        positiveInteractionChance = 40;
    }
    if (currentReputation <= -10) {
        positiveInteractionChance = 30;
    }
    if (currentReputation <= -20) {
        // once you become an enemy, hard to improve
        positiveInteractionChance = 5;
    }
    if (doesRandomEventHappen(positiveInteractionChance)) {
        let value = 1;
        if (personAge > person.getAdolescence() && meetPersonAge > meetPerson.getAdolescence() && doesRandomEventHappen(2)) {
            value = 3;
            const positiveInteractions = [
                {to: "{P} gave a gift to", from: "{P} recevied a gift from"},
                {to: "{P} did a favor for", from: "{P} had a favor done for {OP} by"},
            ]
            const positiveInteraction = getRandomItemInList(positiveInteractions);
            // person.addLifeEvent(currentYear, `${positiveInteraction.to} ${meetPersonName}`);
            // meetPerson.addLifeEvent(currentYear, `${positiveInteraction.from} ${personName}`);
        }
        person.increasePersonReputation(meetPersonId, value);
        meetPerson.increasePersonReputation(personId, value);
    }
    else {
        let value = 1;
        if (personAge > person.getAdolescence() && meetPersonAge > meetPerson.getAdolescence() && doesRandomEventHappen(2)) {
            value = 3;
            const negativeInteractions = [
                {to: "{P} got in a fight with", from: "{P} got in a fight with"},
                {to: "{P} got caught telling a lie about", from: "{P} caught a lie told about {OP} by"},
                {to: "{P} got caught stealing from", from: "{P} was stolen from by"},
            ]
            const negativeInteraction = getRandomItemInList(negativeInteractions);
            // person.addLifeEvent(currentYear, `${negativeInteraction.to} ${meetPersonName}`);
            // meetPerson.addLifeEvent(currentYear, `${negativeInteraction.from} ${personName}`);
        }
        person.decreasePersonReputation(meetPersonId, value);
        meetPerson.decreasePersonReputation(personId, value);
    }
    let newReputation = person.getReputationByPersonId(meetPersonId);
    // only add this event if their reputation just became this value
    if (newReputation >= 20 && person.getBestFriends().indexOf(meetPerson) === -1) {
        person.addBestFriend(meetPerson);
        meetPerson.addBestFriend(person);
        person.addLifeEvent(currentYear, `{P} became best friends with ${meetPersonName}`);
        meetPerson.addLifeEvent(currentYear, `{P} became best friends with ${personName}`);
    }
    if (newReputation <= -20 && person.getEnemies().indexOf(meetPerson) === -1) {
        person.addEnemy(meetPerson);
        meetPerson.addEnemy(person);
        person.addLifeEvent(currentYear, `{P} became enemies with ${meetPersonName}`);
        meetPerson.addLifeEvent(currentYear, `{P} became enemies with ${personName}`);
    }
}


function passAway(person, town) {
    const personName = person.getFullName();
    person.addLifeEvent(town.getCurrentYear(), "{P} died");
    if (getPersonById(person.personId, town.getOrphanage())) {
        town.removeFromOrphanage(person);
    }
    const spouse = person.getSpouse();
    if (spouse && !spouse.getIsDead()) {
        spouse.addLifeEvent(town.getCurrentYear(), `{PP} ${person.getGender() === "male" ? "husband": "wife"} ${personName} died`);
    }
    if (person.getChildren()) {
        for (let child of person.getChildren()) {
            if (!child.getIsDead()) {
                child.addLifeEvent(town.getCurrentYear(), `{PP} ${person.getGender() == 'male' ? 'father' : 'mother'} ${personName} died`);
            }
        }
    }
    if (person.getParents()) {
        for (let parent of person.getParents()) {
            if (!parent.getIsDead()) {
                parent.addLifeEvent(town.getCurrentYear(), `{PP} ${person.getGender() === "male" ? "son" : "daughter"} ${personName} died`);
            }
        }
    }
    for (let bestFriend of person.getBestFriends()) {
        if (!bestFriend.getIsDead()) {
            bestFriend.addLifeEvent(town.getCurrentYear(), `{PP} best friend ${personName} died`);
        }
    }
    const currentjob = person.getJob();
    if (currentjob) {
        currentjob.removePerson();
    }
    town.removePerson(person);
    town.addToDeadPopulation(person);
    person.die(town.getCurrentYear());
    if (person.getSpouse() && person.getSpouse().getIsDead()) {
        if (person.getChildren().length > 0) {
            for (let child of person.getChildren()) {
                if (child.getAge() < child.getAdolescence()) {
                    child.addLifeEvent(town.getCurrentYear(), `{P} was put up for adoption`);
                    town.addOrphan(child);
                }
            }
        }
    }
}

function calculateTaxes(value, taxRate) {
    return Math.floor(taxRate * (value / 100));
}

function addPersonToHouse(person, house) {
    // if they are already a resident somewhere, remove them from the residence
    const currentResidency = person.getResidency();
    if (currentResidency && currentResidency !== house) {
        currentResidency.removeResident(person);
    }
    // only add them as a resident if they are not already in the list of residents
    if (house.getResidents().indexOf(person) === -1) {
        house.addResident(person);
    }
    person.setResidency(house);
}

function removePersonFromHouse(person, house) {
    person.setResidency(undefined);
    house.removeResident(person);
}

function makePersonHouseOwner(person, house) {
    person.addToHouseHistory(house);
    const currentHouse = person.getHouse();
    if (currentHouse) {
        currentHouse.removeOwner();
        person.setHouse(undefined);
    }
    if (house.getOwner()) {
        house.removeOwner();
    }
    person.setHouse(house);
    house.setOwner(person);
    addPersonToHouse(person, house);
}

function findAPartner(person, population, gender) {
    // only looping through people they have met and eliminating based on reputation quick
    // log(`Checking for ${person.getFullName()}`);
    for (let potentialPartnerId in person.getReputations()) {
        if (person.getReputationByPersonId(potentialPartnerId) < 5) {
            continue;
        }
        const potentialPartner = getPersonById(potentialPartnerId, population);
        if (!potentialPartner) {
            continue;
        }
        if (potentialPartner.getIsDead()) {
            continue;
        }
        if (person.getRace() !== potentialPartner.getRace()) {
            // 10% chance that they end up married anyway (can adjust)
            if (doesRandomEventHappen(90)) {
                continue;
            }
        }
        // make sure they're not already married
        if (potentialPartner.getSpouse()) {
            continue;
        }
        // make sure they're a matching gender preference
        if (potentialPartner.getGender() !== person.getGenderPreference()) {
            continue;
        }
        if (gender !== potentialPartner.getGenderPreference()) {
            continue;
        }
        // makes sure they are not a cousin or sibling (or aunt/uncle)
        // this is better than just checking last name (and removes issues with accidental same last names)
        if (person.getFamilyMembers().indexOf(potentialPartner) != -1) {
            continue;
        }
        // make sure the partner is over their age of adolescence
        if (potentialPartner.getAge() < potentialPartner.getAdolescence()) {
            continue;
        }
        // make sure they are within 15 years age difference
        const permissiveAgeDiff = Math.floor((person.getMaxAge() - person.getAdolescence()) / 5);
        if (!(Math.abs(potentialPartner.getAge() - person.getAge()) <= permissiveAgeDiff)) {
            continue;
        }
        return potentialPartner;
    }
}

function calculateExpenses(person, house) {
    let expenses = 0;
    const children = person.getChildren();

    if (children.length > 0) {
        // if they have kids, only count the alive ones who are under 18
        for (let child of children) {
            if (!child.getIsDead() && child.getAge() < child.getAdolescence()) {
                expenses += getRandomNumberInRange(500, 1000);
            }
        }
    }
    if (house) {
        expenses += Math.floor(house.getCost() * 0.1);
    }
    return expenses;
}

function getRandomJobName() {
    let jobsList = ['Mayor', 'Guard', 'Patrol', 'Barkeep', 'Healer', 'Smith', 'Innkeeper', 'Baker', 'Farmer', 'Leatherworker'];
    return jobsList[getRandomNumberInRange(0, jobsList.length -1)];
}

function getRandomRace() {
    let raceList = ['dragonborn', 'dwarf', 'elf', 'gnome', 'halfling', 'halfelf', 'halforc', 'human', 'tiefling', 'tabaxi', 'tortle', 'goliath', 'warforged'];
    return raceList[getRandomNumberInRange(0, raceList.length -1)];
}

function getRandomItemInList(list) {
    return list[getRandomNumberInRange(0, list.length -1)];
}

function addRace() {
    const template = qs('#newRace');
    const clonedTemplate = template.content.cloneNode(true);
    const button = clonedTemplate.querySelector('.removeRace');
    registerElement(button, "click", removeRace);
    addElement(clonedTemplate, eById('races'));
}

function removeRace(event) {
    // if it is the last one, do not let it get removed
    if (qsa('.raceSelector').length < 2) {
        log('Cannot remove the last race. Must have at least one');
        return;
    }
    let elementToRemove = event.target.closest('.raceSelector');
    elementToRemove.parentElement.removeChild(elementToRemove);
}

function capitalizeFirstLetter(name) {
    return name[0].toUpperCase() + name.substring(1);
}

registerElement(eById('generate'), "click", generateNewTown);
registerElement(eById('newTown'), "click", generateNewTown);
registerElement(eById('extendTownTime'), "click", addYears);
registerElement(eById('addRace'), "click", addRace);
addRace();

function rollStats() {
    let stats = [];
    for (let t = 0; t < 6; t++) {
        let rolls = [];
        rolls.push(getRandomNumberInRange(1,6));
        rolls.push(getRandomNumberInRange(1,6));
        rolls.push(getRandomNumberInRange(1,6));
        rolls.push(getRandomNumberInRange(1,6));
        rolls.sort(); // sorts them lowest to highest
        rolls.reverse(); // reverses that sorting
        rolls.pop(); // removes the last item
        let sum = 0;
        for (let i = 0; i < rolls.length; i++) {
            sum += rolls[i];
        }
        stats.push(sum);
    }
    return stats;
}

function calculateAverateStats(person1Stats, person2Stats) {
    const attributes = ['STR', 'CON', 'WIS', 'INT', 'CHA', 'DEX'];
    averagedStats = {};
    for (const attribute of attributes) {
        // let newAverageStat = (person1Stats[attribute] + person2Stats[attribute]) / 2;
        let newAverageStat = getRandomNumberInRange(person1Stats[attribute], person2Stats[attribute]);
        const chance = getRandomNumberInRange(0,99)
        if (chance >= 0 && chance < 10) {
            // make sure it is never above 20
            (newAverageStat + 1) < 20 ? newAverageStat += 1 : newAverageStat = 20;
        }
        if (chance >= 10 && chance < 25) {
            // make sure it is never below 0
            (newAverageStat - 1) > 0 ? newAverageStat -= 1 : newAverageStat = 0;
        }
        averagedStats[attribute] = Math.round(newAverageStat);
    }
    return averagedStats;
}

function assignStats(stats) {
    let attributes = shuffleArray(['STR', 'CON', 'WIS', 'INT', 'CHA', 'DEX']);
    let assignedStats = {};
    for (let i = 0; i < stats.length; i++) {
        assignedStats[attributes[i]] = stats[i];
    }
    return assignedStats;
}
 // from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(randomFunction() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateTestTowns(count) {
    const populations = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
        let town = generateNewTown();
        const pop = town.getLivingPopulation().length;
        populations.push(pop);
        total += pop;
    }
    return total / populations.length;
}