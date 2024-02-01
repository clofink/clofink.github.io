var population = [];
var newTown;

function getPersonById(personId, personList) {
    for (let person of personList) {
        if (person.getPersonId() == personId) {
            return person;
        }
    }
}

function getByAge(age, personList) {
    let results = [];
    for (let person of personList) {
        if (person.getAge() == age && !person.getIsDead()) {
            results.push(person);
        }
    }
    return results;
}

function sortByAge(a, b) {
    if (a.age > b.age) {
        return -1;
    }
    if (b.age > a.age) {
        return 1;
    }
    return 0;
}

function sortByReputation(a, b) {
    if (a.reputation > b.reputation) {
        return -1;
    }
    if (b.reputation > a.reputation) {
        return 1;
    }
    return 0;
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
    seedElem.value = seed;
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
        clearTable('populationTable');
    }
    displayTownInfo(newTown);
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
        clearTable('populationTable');
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
    let job;
    switch(jobName) {
        case 'Mayor':
            job = new Mayor();
            break;
        case 'Farmer':
            job = new Farmer();
            break;
        case 'Guard':
            job = new Guard();
            break;
        case 'Patrol':
            job = new Patrol();
            break;
        case 'Smith':
            job = new Smith();
            break;
        case 'Healer':
            job = new Healer();
            break;
        case 'Baker':
            job = new Baker();
            break;
        case 'Barkeep':
            job = new Barkeep();
            break;
        case 'Innkeeper':
            job = new Innkeeper();
            break;
        case 'Leatherworker':
            job = new Leatherworker();
            break;
        default:
            break;
    }
    return job;
}

function getFamilyMembers(person) {
    let familyMembers = [];
    for (let parent of person.getParents()) {
        familyMembers.push(parent);
        for (let parentSibling of parent.getSiblings()) {
            familyMembers.push(parentSibling);
            for (let cousin of parentSibling.getChildren()) {
                familyMembers.push(cousin);
            }
        }
    }
    return familyMembers.concat(person.getSiblings());
}

function createPerson(race, options) {
    options = options || {};
    let person;
    switch (race) {
        case 'tabaxi':
            person = new Tabaxi(options);
            break;
        case 'warforged':
            person = new Warforged(options);
            break;
        case 'tortle':
            person = new Tortle(options);
            break;
        case 'goliath':
            person = new Goliath(options);
            break;
        case 'dragonborn':
            person = new Dragonborn(options);
            break;
        case 'dwarf':
            person  = new Dwarf(options);
            break;
        case 'elf':
            person = new Elf(options);
            break;
        case 'gnome':
            person = new Gnome(options);
            break;
        case 'halfling':
            person = new Halfling(options);
            break;
        case 'halfelf':
            person = new Halfelf(options);
            break;
        case 'halforc':
            person = new Halforc(options);
            break;
        case 'human':
            person = new Human(options);
            break;
        case 'tiefling':
            person = new Tiefling(options);
            break;
        default:
            person = new Human(options);
            break;
    }
    return person;
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
        clearTable('townTable');
    }
    let townInfoDiv = eById('townInfo');
    let headers = ['Population Type', 'Number of People'];
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
        clearTable('populationTable');
    }
    const populationInfoDiv = eById('populationInfo');
    const headers = ['Name', 'Age', 'Race', 'Birth Year', 'Death Year', 'Gender', 'Gender Preference', 'Number of Children', 'Worth', 'Job Title', 'Years in Job', 'Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
    const table = createTable(headers);
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
function createTable(headers) {
    const chatTable = newElement('table');
    const headerRow = createHeaderRow(headers);
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
 * Clears the elements from within the maintable
*/
function clearTable(selector) {
    let oldChild = eById(selector);
    oldChild.parentNode.removeChild(oldChild);
}

/**
 * Creates table header row from array of header names
 * @param {Array} headers - list of header names
 * @returns {HTMLElement} header row
 */
function createHeaderRow(headers) {
    const headerRow = newElement('tr');
    for (i = 0; i < headers.length; i++) {
        const tableValue = newElement('th', {innerHTML: headers[i], sortDirection: "asc"});
        registerElement(tableValue, "click", sortByHeader);
        addElement(tableValue, headerRow);
    }
    return (headerRow);
}

/**
 * Sortby lambda that handles the table sorting
 * @param {} event - automatically provided by event handler
 */
function sortByHeader(event) {
    let sortBy = event.target.innerText;
    let sortedPopulation = [...population];
    let sortDirection = event.target.getAttribute('sortDirection');
    switch(sortBy) {
        case "Name":
            sortBy = 'name';
            break;
        case "Age":
            sortBy = 'age';
            break;
        case "Birth Year":
            sortBy = 'birthYear';
            break;
        case "Gender":
            sortBy = 'gender';
            break;
        case "Gender Preference":
            sortBy = 'genderPreference';
            break;
        case "Death Year":
            sortBy = 'deathYear';
            break;
        case "Number of Children":
            sortBy = 'children';
            break;
        case 'Worth':
            sortBy = 'value';
            break;
        case 'Job Title':
            sortBy = 'title';
            break;
        case 'Years in Job':
            sortBy = 'yearsInPos';
            break;
        case 'Race':
            sortBy = 'race';
            break;
        case 'Strength':
            sortBy = 'STR';
            break;
        case 'Constitution':
            sortBy = 'CON';
            break;
        case 'Dexterity':
            sortBy = 'DEX';
            break;
        case 'Intelligence':
            sortBy = 'INT';
            break;
        case 'Wisdom':
            sortBy = 'WIS';
            break;
        case 'Charisma':
            sortBy = 'CHA';
            break;
        default:
            sortBy = 'personId';
            break;
    }
    if (sortDirection == 'asc') {
        sortedPopulation.sort(customSortAsc);
        event.target.setAttribute('sortDirection', 'desc');
    }
    else if (sortDirection == 'desc') {
        sortedPopulation.sort(customSortDesc);
        event.target.setAttribute('sortDirection', 'asc');
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
    const currentAge = person.getAge();
    const personId = person.id;
    const gender = person.getGender();
    let spouse = person.getSpouse();
    let currentJob = person.getJob();
    let house = person.getHouse();
    // list of life events and handlers for them

    // pay/make money
    personalFinances(person, town, house);
    // meet people
    let meetChance = currentJob ? currentJob.getMeetChance() : 36;
    for (let p = 0; p < meetChance; p++) {
        meetOtherPeople(person, town.getLivingPopulation(), currentYear);
    }
    // job/promotion search
    currentJob = jobSearch(person, town, currentAge, currentJob);
    // marriage
    if (currentAge >= person.getAdolescence() && !spouse) {
        spouse = tryToGetMarried(person, town, gender);
    }
    // buy a house
    house = houseHunt(person, town, currentAge, spouse, house);
    // have kids
    haveOrAdoptKids(person, town, spouse, gender);
    // retire
    if (currentAge > person.getRetirementAge() && currentJob) {
        person.addLifeEvent(town.getCurrentYear(), `{P} retired from {PP} job as a ${currentJob.getTitle()}`);
        person.retire();
    }
    // if a person is in the orphanage when they are 18, they leave
    if (getPersonById(personId, town.getOrphanage()) && currentAge > person.getAdolescence()) {
        town.removeFromOrphanage(person);
    }
    // die
    if (person.getDeathChanceAtAge()) {
        passAway(person, town);
    }
    // age
    person.setAge(currentAge + 1);
}

function personalFinances(person, town, house) {
    const currentValue = person.getValue();
    if (currentValue > 0) {
        const taxes = calculateTaxes(currentValue, town.getTaxRate());
        person.setValue(currentValue - taxes);
        town.addToCoffers(taxes);
    }
    const valueAfterTaxes = person.getValue();
    const expenses = calculateExpenses(person, house);
    if ((valueAfterTaxes - expenses) < 0) {
        person.setValue(0);
    }
    else {
        person.setValue(valueAfterTaxes - expenses);
    }
}

function jobSearch(person, town, currentAge, myJob) {
    if (myJob) {
        person.addValue(myJob.getSalary());
        myJob.setYearsInPosition(myJob.getYearsInPosition() + 1);
        if (doesRandomEventHappen(25)) lookForBetterJob(person, town);
    }
    // if they don't have a job, let them find one
    else if (currentAge > person.getAdolescence() && currentAge <= person.getRetirementAge()) {
        myJob = findAJob(person, town);
    }
    return myJob;
}

function haveOrAdoptKids(person, town, spouse, personGender) {
    const currentYear = town.getCurrentYear();
    if (spouse && !spouse.getIsDead()) {
        // if they're a same-sex couple, check for available adoptions
        const spouseGender = spouse.getGender();
        if (personGender == spouseGender) {
            // make sure there are people in the orphanage
            const availableOrphans = town.getOrphanage();
            if (availableOrphans.length > 0 && person.getChildren().length < 4) {
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
        // this is to check that the couple can have kids together, will work out a system for same sex couples
        else {
            // only the mother can have the baby
            const mother = personGender == 'female' ? person : spouse;
            const motherAge = mother.getAge();
            if (motherAge >= mother.getAdolescence() && motherAge < mother.getRetirementAge()) {
                let haveKidsChance = 15;
                const currentChildren = mother.getChildren().length;
                if (currentChildren > 1) {
                    haveKidsChance = 7.5;
                }
                if (currentChildren > 3) {
                    haveKidsChance = 1.5;
                }
                if (currentChildren > 5) {
                    haveKidsChance = 0.1;
                }
                if (doesRandomEventHappen(haveKidsChance)) {
                    const newChild = createPerson(mother.getRace(), {currentYear: currentYear})
                    town.addToPopulation(newChild);
                    newChild.setParents([person, spouse]);
                    newChild.setStats(calculateAverateStats(person.getStats(), spouse.getStats()));
                    person.addChild(newChild);
                    newChild.addLifeEvent(currentYear, "{P} was born");
                    person.addLifeEvent(currentYear, `{P} had a child named ${newChild.getFullName()}`);
                    spouse.addLifeEvent(currentYear, `{P} had a child named ${newChild.getFullName()}`);
                } 
            }
        }
    }
}

function houseHunt(person, town, currentAge, spouse, currentHouse) {
    if (currentAge > person.getAdolescence() && !currentHouse) {
        if (spouse && !spouse.getHouse()) {
            let newHouse;
            for (let building of town.getBuildings()) {
                if (building.getBuildingName() !== 'Home' || building.getOwner()) {
                    continue;
                }
                newHouse = building;
                makePersonHouseOwner(person, newHouse);
                break;
            }
            // check for house again after trying to get one from the existing houses
            if (!newHouse) {
                newHouse = new Home();
                town.addBuilding(newHouse);
                makePersonHouseOwner(person, newHouse);
            }
            // pay for the house
            if ((person.getValue() - newHouse.getCost()) < 0) {
                person.setValue(0);
            }
            else {
                person.setValue(person.getValue() - newHouse.getCost());
            }

            person.addLifeEvent(town.getCurrentYear(), "{P} bought a house");
            // now we can add spouse and children to the house
            const theirNewHouse = person.getHouse();
            if (theirNewHouse) {
                if (spouse && !spouse.getIsDead()) {
                    if (spouse.getHouse()) {
                        spouse.getHouse().removeOwner();
                        log(`somehow their spouse has a house`);
                    }
                    addPersonToHouse(spouse, theirNewHouse);
                }
                for (let child of person.getChildren()) {
                    if (!child.getIsDead() && !child.getHouse()) {
                        addPersonToHouse(child, theirNewHouse);
                    }
                }
            }
            currentHouse = newHouse;
        }
    }
    return currentHouse;
}

function yearPasses(town) {
    town.incrementCurrentYear();
    const currentYear = town.getCurrentYear();
    // check for adding new jobs to the job market here?
    // try to add up to 5 jobs every year as long as the number of jobs in the marker is less than 60% of people (to account for people too young/old to work)
    if (town.getJobMarket().length < Math.round(town.getLivingPopulation().length * 0.6)) {
        for (let y = 0; y < 5; y++) {
            // only has a 60% chance of actually happening
            if (doesRandomEventHappen(40)) {
                let newJob = createJob(getRandomJobName());
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
    let newPerson;
    if (qs('[name="allowVisitors"]').checked == true) {
        newPerson = createPerson(getRandomRace(), {ageRange: [16, 50], currentYear: currentYear});
    }
    else {
        let townRaces = getTownRaces();
        newPerson = createPerson(getRandomItemInList(townRaces), {ageRange: [16, 50], currentYear: currentYear});
    }
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
        if (doesRandomEventHappen(2)) {
            value = 3;
            const positiveInteractions = [
                {to: "{P} gave a gift to", from: "{P} recevied a gift from"},
                {to: "{P} did a favor for", from: "{P} had a favor done for {OP} by"},
            ]
            const positiveInteraction = getRandomItemInList(positiveInteractions);
            person.addLifeEvent(currentYear, `${positiveInteraction.to} ${meetPersonName}`);
            meetPerson.addLifeEvent(currentYear, `${positiveInteraction.from} ${personName}`);
        }
        person.increasePersonReputation(meetPersonId, value);
        meetPerson.increasePersonReputation(personId, value);
    }
    else {
        let value = 1;
        if (doesRandomEventHappen(2)) {
            value = 3;
            const negativeInteractions = [
                {to: "{P} got in a fight with", from: "{P} got in a fight with"},
                {to: "{P} got caught telling a lie about", from: "{P} caught a lie told about {OP} by"},
                {to: "{P} got caught stealing from", from: "{P} was stolen from by"},
            ]
            const negativeInteraction = getRandomItemInList(negativeInteractions);
            person.addLifeEvent(currentYear, `${negativeInteraction.to} ${meetPersonName}`);
            meetPerson.addLifeEvent(currentYear, `${negativeInteraction.from} ${personName}`);
        }
        person.decreasePersonReputation(meetPersonId, value);
        meetPerson.decreasePersonReputation(personId, value);
    }
    let newReputation = person.getReputationByPersonId(meetPersonId);
    // only add this event if their reputation just became this value
    if (newReputation == 20 && person.getBestFriends().indexOf(meetPerson) == -1) {
        person.addBestFriend(meetPerson);
        meetPerson.addBestFriend(person);
        person.addLifeEvent(currentYear, `{P} became best friends with ${meetPersonName}`);
        meetPerson.addLifeEvent(currentYear, `{P} became best friends with ${personName}`);
    }
    if (newReputation == -20 && person.getEnemies().indexOf(meetPerson) == -1) {
        person.addEnemy(meetPerson);
        meetPerson.addEnemy(person);
        person.addLifeEvent(currentYear, `{P} became enemies with ${meetPersonName}`);
        meetPerson.addLifeEvent(currentYear, `{P} became enemies with ${personName}`);
    }
}

function tryToGetMarried(person, town, gender) {
    let newSpouse = findAPartner(person, town.getLivingPopulation(), gender);
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

function passAway(person, town) {
    const personName = person.getFullName();
    person.addLifeEvent(town.getCurrentYear(), "{P} died");
    if (getPersonById(person.id, town.getOrphanage())) {
        town.removeFromOrphanage(person);
    }
    if (person.getSpouse() && !person.getSpouse().getIsDead()) {
        person.getSpouse().addLifeEvent(town.getCurrentYear(), `{PP} spouse ${personName} died`);
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
                parent.addLifeEvent(town.getCurrentYear(), `{PP} child ${personName} died`);
            }
        }
    }
    for (let bestFriend of person.getBestFriends()) {
        if (!bestFriend.getIsDead()) {
            bestFriend.addLifeEvent(town.getCurrentYear(), `{PP} best friend ${personName} died`);
        }
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
    if (person.getResidency() && person.getResidency() != house) {
        person.getResidency().removeResident(person);
        person.setResidency(undefined);
    }
    // only add them as a resident if they are not already in the list of residents
    if (house.getResidents().indexOf(person) == -1) {
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
        if (getFamilyMembers(person).indexOf(potentialPartner) != -1) {
            continue;
        }
        // make sure the partner is over their age of adolescence
        if (potentialPartner.getAge() < potentialPartner.getAdolescence()) {
            continue;
        }
        // make sure they are within 15 years age difference
        let permissiveAgeDiff = Math.floor((person.getMaxAge() - person.getAdolescence()) / 5);
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

function findAJob(person, town) {
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
            let jobBuilding = job.getBuilding();
            town.addBuilding(jobBuilding);
            jobBuilding.setOwner(person);
            jobBuilding.addResident(person);
        }
        if (job.getBuildingRequired() && job.getBuilding()) {
            let jobBuilding = job.getBuilding();
            if (!jobBuilding.getOwner()) {
                jobBuilding.setOwner(person);
            }
            jobBuilding.addResident(person);
        }
        return job;
    }
}

function lookForBetterJob(person, town) {
    const currentJob = person.getJob()
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
        break;
    }
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