var population = [];
var tabs = [];
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
    showTownInfo();
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
    showTownInfo();
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

function logMorePersonInfo(event) {
    const parentRow = event.target.closest('tr');
    const person = getPersonById(parentRow.id, newTown.getPopulation());
    highlightFamily(parentRow, person);
    log(formatBiography(person.getLifeEvents()));
    log(person);
}

function formatBiography(lifeEvents) {
    return lifeEvents.join('\n');
}

function highlightPerson(element, highlightClass) {
    if (!element) return;
    if (element.classList.contains(highlightClass)) {
        element.classList.remove(highlightClass);
    }
    else {
        element.classList.add(highlightClass);
    }
}

function highlightFamily(personElement, person) {
    const allTableRows = document.getElementsByTagName('tr');
    if (!personElement.classList.contains('highlightSelf')) {
        for (let tableRow of allTableRows) {
            tableRow.classList.remove('highlightSelf', 'highlightParent', 'highlightSibling', 'highlightSpouse', 'highlightChild');
        }
    }
    highlightPerson(personElement, 'highlightSelf');

    if (person.getParents()) {
        for (let parent of person.getParents()) {
            const parentElement = eById(parent.getPersonId());
            highlightPerson(parentElement, 'highlightParent');
        }
    }
    if (person.getSiblings()) {
        for (let sibling of person.getSiblings()) {
            const siblingElement = eById(sibling.getPersonId());
            highlightPerson(siblingElement, 'highlightSibling');
        }
    }
    if (person.getSpouse()) {
        const spouseElement = eById(person.getSpouse().getPersonId());
        highlightPerson(spouseElement, 'highlightSpouse');
    }
    if (person.getChildren()) {
        for (let child of person.getChildren()) {
            const childElement = eById(child.getPersonId());
            highlightPerson(childElement, 'highlightChild');
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
        const tableValue = newElement('th', header);
        if (sortBy) registerElement(tableValue, "click", sortByHeader);
        addElement(tableValue, headerRow);
    }
    return (headerRow);
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

    shuffleArray(lifeEvents);

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
        passAway();
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
        if (gender !== "female") return false;
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
            newChild.setStats(calculateAverageStats(person.getStats(), spouse.getStats()));
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
    function passAway() {
        const personName = person.getFullName();
        person.addLifeEvent(currentYear, "{P} died");
        if (getPersonById(person.personId, town.getOrphanage())) {
            town.removeFromOrphanage(person);
        }
        if (spouse && !spouse.getIsDead()) {
            spouse.addLifeEvent(currentYear, `{PP} ${person.getGender() === "male" ? "husband": "wife"} ${personName} died`);
        }
        if (person.getChildren()) {
            for (let child of person.getChildren()) {
                if (!child.getIsDead()) {
                    child.addLifeEvent(currentYear, `{PP} ${person.getGender() == 'male' ? 'father' : 'mother'} ${personName} died`);
                }
            }
        }
        if (person.getParents()) {
            for (let parent of person.getParents()) {
                if (!parent.getIsDead()) {
                    parent.addLifeEvent(currentYear, `{PP} ${person.getGender() === "male" ? "son" : "daughter"} ${personName} died`);
                }
            }
        }
        for (let bestFriend of person.getBestFriends()) {
            if (!bestFriend.getIsDead()) {
                bestFriend.addLifeEvent(currentYear, `{PP} best friend ${personName} died`);
            }
        }
        if (currentJob) {
            currentJob.removePerson();
        }
        town.removePerson(person);
        town.addToDeadPopulation(person);
        person.die(currentYear);
        if (spouse && spouse.getIsDead()) {
            if (person.getChildren().length > 0) {
                for (let child of person.getChildren()) {
                    if (child.getAge() < child.getAdolescence()) {
                        child.addLifeEvent(currentYear, `{P} was put up for adoption`);
                        town.addOrphan(child);
                    }
                }
            }
        }
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
            if (doesRandomEventHappen(90)) {
                continue;
            }
        }
        if (potentialPartner.getSpouse()) {
            continue;
        }
        if (potentialPartner.getGender() !== person.getGenderPreference()) {
            continue;
        }
        if (gender !== potentialPartner.getGenderPreference()) {
            continue;
        }
        if (person.getFamilyMembers().indexOf(potentialPartner) >= 0) {
            continue;
        }
        if (potentialPartner.getAge() < potentialPartner.getAdolescence()) {
            continue;
        }
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
    const stats = [];
    for (let t = 0; t < 6; t++) {
        const rolls = [];
        rolls.push(getRandomNumberInRange(1,6));
        rolls.push(getRandomNumberInRange(1,6));
        rolls.push(getRandomNumberInRange(1,6));
        rolls.push(getRandomNumberInRange(1,6));
        rolls.sort();
        rolls.shift();
        let sum = 0;
        for (let i = 0; i < rolls.length; i++) {
            sum += rolls[i];
        }
        stats.push(sum);
    }
    return stats;
}

function calculateAverageStats(person1Stats, person2Stats) {
    const attributes = ['STR', 'CON', 'WIS', 'INT', 'CHA', 'DEX'];
    const averagedStats = {};
    for (const attribute of attributes) {
        let newAverageStat = getRandomNumberInRange(person1Stats[attribute], person2Stats[attribute]);
        const chance = getRandomNumberInRange(0,99)
        if (chance >= 0 && chance < 10) {
            (newAverageStat + 1) < 20 ? newAverageStat += 1 : newAverageStat = 20;
        }
        if (chance >= 10 && chance < 25) {
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

function createModal(person) {
    const modal = newElement("dialog", {"data-person-id": person.getPersonId()});
    const name = newElement("h2", {innerText: person.getFullName()});
    const closeButton = newElement("button", {innerText: "Close", class: ["modal-close"]});
    const content = newElement("div", {innerText: formatBiography(person.getLifeEvents())});
    registerElement(closeButton, "click", function() {modal.close()})
    addElements([closeButton, name, content], modal);
    return modal;
}

function showTabs() {
    const tabList = eById('tabList');
    clearElement(tabList);

    for (let i = 0; i < window.tabs.length; i++) {
        addElement(tabs[i], tabList);
        if (i === 0) tabs[i].click();
    }
}

function showTownInfo() {
    const page = eById('page');
    clearElement(page);
    const tabList = newElement('div', {id: "tabList"});
    const tabContent = newElement('div', {id: "tabContent"});
    addElements([tabList, tabContent], page);
    showTabs();
}

function addTab(tabName, renderCallback) {
    const tabSelected = function() {
        for (let tab of qsa(".tabHeader")) {
            tab.classList.remove("selected");
        }
        newTab.classList.add("selected");
        const tabContainer = eById("tabContent");
        clearElement(tabContainer);
        addElement(renderCallback(), tabContainer);
    }
    const newTab = newElement("div", {class: ["tabHeader"], innerText: tabName});
    registerElement(newTab, "click", tabSelected);
    tabs.push(newTab);
    if (eById("tabList")) showTabs();
}

addTab("Town Stats", showTownInfoTab);
addTab("Living Population", showLivingPopulationTab);
addTab("Dead Population", showDeadPopulationTab);
addTab("Full Population", showFullPopulationTab);
addTab("Buildings", showBuildingsTab);
addTab("Jobs", showJobsTab);

function showLivingPopulationTab() {
    const headers = [
        {innerText: "Name", "data-sort-direction": "asc", "data-sort-by": "name"},
        {innerText: "Age", "data-sort-direction": "asc", "data-sort-by": "age"},
        {innerText: "Race", "data-sort-direction": "asc", "data-sort-by": "race"},
        {innerText: "Birth Year", "data-sort-direction": "asc", "data-sort-by": "birthYear"},
        {innerText: "Death Year", "data-sort-direction": "asc", "data-sort-by": "deathyear"},
        {innerText: "Gender", "data-sort-direction": "asc", "data-sort-by": "gender"},
        {innerText: "Gender Preference", "data-sort-direction": "asc", "data-sort-by": "genderPreference"},
        {innerText: "# Children", "data-sort-direction": "asc", "data-sort-by": "children"},
        {innerText: "Worth", "data-sort-direction": "asc", "data-sort-by": "value"},
        {innerText: "Job Title", "data-sort-direction": "asc", "data-sort-by": "title"},
        {innerText: "Years in Job", "data-sort-direction": "asc", "data-sort-by": "yearsInPos"},
        {innerText: "Strength", "data-sort-direction": "asc", "data-sort-by": "STR"},
        {innerText: "Dexterity", "data-sort-direction": "asc", "data-sort-by": "DEX"},
        {innerText: "Constitution", "data-sort-direction": "asc", "data-sort-by": "CON"},
        {innerText: "Intelligence", "data-sort-direction": "asc", "data-sort-by": "INT"},
        {innerText: "Wisdom", "data-sort-direction": "asc", "data-sort-by": "WIS"},
        {innerText: "Charisma", "data-sort-direction": "asc", "data-sort-by": "CHA"},
    ]

    return new PagedTable(headers, getPopulationData(newTown.getLivingPopulation()), 100, sortPersonTable, {class: ["sortable"], "data-population": "dead"});
}

function showFullPopulationTab() {
    const headers = [
        {innerText: "Name", "data-sort-direction": "asc", "data-sort-by": "name"},
        {innerText: "Age", "data-sort-direction": "asc", "data-sort-by": "age"},
        {innerText: "Race", "data-sort-direction": "asc", "data-sort-by": "race"},
        {innerText: "Birth Year", "data-sort-direction": "asc", "data-sort-by": "birthYear"},
        {innerText: "Death Year", "data-sort-direction": "asc", "data-sort-by": "deathyear"},
        {innerText: "Gender", "data-sort-direction": "asc", "data-sort-by": "gender"},
        {innerText: "Gender Preference", "data-sort-direction": "asc", "data-sort-by": "genderPreference"},
        {innerText: "# Children", "data-sort-direction": "asc", "data-sort-by": "children"},
        {innerText: "Worth", "data-sort-direction": "asc", "data-sort-by": "value"},
        {innerText: "Job Title", "data-sort-direction": "asc", "data-sort-by": "title"},
        {innerText: "Years in Job", "data-sort-direction": "asc", "data-sort-by": "yearsInPos"},
        {innerText: "Strength", "data-sort-direction": "asc", "data-sort-by": "STR"},
        {innerText: "Dexterity", "data-sort-direction": "asc", "data-sort-by": "DEX"},
        {innerText: "Constitution", "data-sort-direction": "asc", "data-sort-by": "CON"},
        {innerText: "Intelligence", "data-sort-direction": "asc", "data-sort-by": "INT"},
        {innerText: "Wisdom", "data-sort-direction": "asc", "data-sort-by": "WIS"},
        {innerText: "Charisma", "data-sort-direction": "asc", "data-sort-by": "CHA"},
    ]

    return new PagedTable(headers, getPopulationData(newTown.getPopulation()), 100, sortPersonTable, {class: ["sortable"], "data-population": "dead"});
}

function showDeadPopulationTab() {
    const headers = [
        {innerText: "Name", "data-sort-direction": "asc", "data-sort-by": "name"},
        {innerText: "Age", "data-sort-direction": "asc", "data-sort-by": "age"},
        {innerText: "Race", "data-sort-direction": "asc", "data-sort-by": "race"},
        {innerText: "Birth Year", "data-sort-direction": "asc", "data-sort-by": "birthYear"},
        {innerText: "Death Year", "data-sort-direction": "asc", "data-sort-by": "deathyear"},
        {innerText: "Gender", "data-sort-direction": "asc", "data-sort-by": "gender"},
        {innerText: "Gender Preference", "data-sort-direction": "asc", "data-sort-by": "genderPreference"},
        {innerText: "# Children", "data-sort-direction": "asc", "data-sort-by": "children"},
        {innerText: "Worth", "data-sort-direction": "asc", "data-sort-by": "value"},
        {innerText: "Job Title", "data-sort-direction": "asc", "data-sort-by": "title"},
        {innerText: "Years in Job", "data-sort-direction": "asc", "data-sort-by": "yearsInPos"},
        {innerText: "Strength", "data-sort-direction": "asc", "data-sort-by": "STR"},
        {innerText: "Dexterity", "data-sort-direction": "asc", "data-sort-by": "DEX"},
        {innerText: "Constitution", "data-sort-direction": "asc", "data-sort-by": "CON"},
        {innerText: "Intelligence", "data-sort-direction": "asc", "data-sort-by": "INT"},
        {innerText: "Wisdom", "data-sort-direction": "asc", "data-sort-by": "WIS"},
        {innerText: "Charisma", "data-sort-direction": "asc", "data-sort-by": "CHA"},
    ]

    return new PagedTable(headers, getPopulationData(newTown.getDeadPopulation()), 100, sortPersonTable, {class: ["sortable"], "data-population": "dead"});
}

function getPopulationData(population) {
    const dataRows = [];
    for (let person of population) {
        const personId = person.getPersonId();
        const nameElem = newElement('td', {innerText: person.getFullName()});
        registerElement(nameElem, "click", () => {
            let existingModal = qs(`[data-person-id="${personId}"]`);
            if (!existingModal) {
                existingModal = createModal(person);
                document.body.appendChild(existingModal);
            }
            existingModal.showModal();
        })
        const personStats = person.getStats();
        dataRows.push([
            nameElem,
            person.getAge(),
            person.getRace(),
            person.getBirthYear(),
            person.getDeathYear() ? person.getDeathYear() : '-',
            person.getGender(),
            person.getGenderPreference(),
            person.getChildren().length,
            person.getValue() ? person.getValue() : 0,
            person.getJob() ? person.getJob().getTitle() : '-',
            person.getJob() ? person.getJob().getYearsInPosition() : 0,
            personStats.STR,
            personStats.DEX,
            personStats.CON,
            personStats.INT,
            personStats.WIS,
            personStats.CHA,
        ])
    }
    return dataRows;
}

function showBuildingsTab() {
    const headers = [
        {innerText: "Name"},
        {innerText: "Owner"},
        {innerText: "Residents"},
    ];
    const dataRows = [];
    const buildings = newTown.getBuildings();
    for (let building of buildings) {
        dataRows.push([
            building.getBuildingName(),
            building.getOwner() ? building.getOwner().getFullName() : "-",
            building.getResidents().length
        ]);
    }
    return new PagedTable(headers, dataRows, 50);
}

function showJobsTab() {
    const headers = [
        {innerText: 'Job'},
        {innerText: 'Person'},
        {innerText: 'Salary'},
        {innerText: 'Building'}
    ];
    const jobs = newTown.getJobMarket();
    const dataRows = [];
    for (let job of jobs) {
        dataRows.push([
            job.getTitle(),
            job.getPerson() ? job.getPerson().getFullName() : "-",
            job.getSalary(),
            job.getBuilding() ? job.getBuilding().getBuildingName() : "-"
        ])
    }
    return new PagedTable(headers, dataRows, 50);
}

function showTownInfoTab() {
    const container = newElement('div');

    const popHeaders = [
        {innerText: 'Population', 'colspan': 2},
    ];
    const populationTable = createTable(popHeaders);
    const livingPopulation = newTown.getLivingPopulation();
    const totalPopRow = createDataRow(['Total Population', newTown.getPopulation().length])
    const livingPopRow = createDataRow(['Living Population', livingPopulation.length])
    const deadPopRow = createDataRow(['Dead Population', newTown.getDeadPopulation().length]);

    const startingYearRow = createDataRow(['Starting Year', newTown.getYearOfIncorporation()]);
    const currentYearRow = createDataRow(['Current Year', newTown.getCurrentYear()]);
    addElements([totalPopRow, livingPopRow, deadPopRow, startingYearRow, currentYearRow], populationTable);

    const jobHeaders = [
        {innerText: 'Jobs', 'colspan': 2},
    ];
    const jobsTable = createTable(jobHeaders);
    const jobs = newTown.getJobMarket();
    const jobMarket = createDataRow(["Total Jobs", jobs.length]);
    let staffedJobs = 0;
    for (let job of jobs) {
        if (job.getPerson()) staffedJobs++;
    }
    const staffed = createDataRow(["Staffed Jobs", staffedJobs]);
    const staffedRate = createDataRow(["Employment Rate", `${Math.round((staffedJobs / jobs.length) * 100)}%`]);
    const employmentRate = createDataRow(["Employment Rate", `${Math.round((staffedJobs / newTown.getLivingPopulation().length) * 100)}%`]);
    addElements([jobMarket, staffed, staffedRate, employmentRate], jobsTable);

    const buildingHeaders = [
        {innerText: 'Buildings', 'colspan': 2},
    ];
    const buildingTable = createTable(buildingHeaders);
    let homelessCount = 0;
    for (let person of livingPopulation) {
        if (!person.getResidency()) homelessCount++;
    }
    const buildings = newTown.getBuildings();
    const townBuildings = createDataRow(["Buildings", buildings.length]);
    let occupied = 0;
    let owned = 0;
    for (let building of buildings) {
        if (building.getOwner()) owned++;
        if (building.getResidents().length > 0) occupied++;
    }
    const ownedBuildings = createDataRow(["Owned Buildings", owned]);
    const occupiedBuildings = createDataRow(["Occupied Buildings", occupied]);
    const homelessnessRate = createDataRow(["Homelessness Rate", `${Math.round((homelessCount / newTown.getLivingPopulation().length) * 100)}%`]);
    addElements([townBuildings, ownedBuildings, occupiedBuildings, homelessnessRate], buildingTable);

    addElements([populationTable, jobsTable, buildingTable], container);
    return container;
}

function fillPeopleTable(peopleList, table) {
    for (let person of peopleList) {
        const rowData = [];
        const personId = person.getPersonId();
        const nameElem = newElement('td', {innerText: person.getFullName()});
        registerElement(nameElem, "click", () => {
            let existingModal = qs(`[data-person-id="${personId}"]`);
            if (!existingModal) {
                existingModal = createModal(person);
                document.body.appendChild(existingModal);
            }
            existingModal.showModal();
        })
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
        addElement(nameElem, dataRow, "afterbegin");
        registerElement(dataRow, "click", logMorePersonInfo);
        dataRow.id = personId;
        addElement(dataRow, table);
    }
    return table;
}

function createPersonKey() {
    const keyContainer = newElement("div", {id: "personChatKey"});
    
    const selectedSpan = createSection("self", "Selected Person");
    const spouseSpan = createSection("spouse", "Their Spouse");
    const childSpan = createSection("children", "Their Children");
    const parentSpan = createSection("parent", "Their Parents");
    const siblingsSpan = createSection("sibling", "Their Siblings");

    addElements([selectedSpan, spouseSpan, childSpan, parentSpan, siblingsSpan], keyContainer);
    return keyContainer;

    function createSection(id, text) {
        const span = newElement('span');
        const person = newElement("div", {id: id});
        const label = newElement("div", {innerText: text});
        addElements([person, label], span);
        return span;
    }
}

class PagedTable {
    headers;
    dataRows;
    pageSize;
    currentPage;
    pageCount;

    constructor(headers, dataRows, pageSize, sortFunc, tableInfo) {
        this.headers = headers || [];
        this.dataRows = dataRows || [];
        this.pageSize = pageSize || 0;
        this.currentPage = 0;
        if (sortFunc) this.sortFunc = sortFunc;
        this.pageCount = Math.ceil(dataRows.length / pageSize);

        this.container = newElement('div', {class: ["tableContainer"]});
        this.table = newElement("table", tableInfo);

        const headerNames = [];
        for (let header of headers) {
            headerNames.push(header.innerText);
        }

        this.headerRow = newElement('tr');
        for (let header of headers) {
            const tableHeader = newElement('th', header);
            if (this.sortFunc) registerElement(tableHeader, "click", (event) => {
                this.sortFunc(event, headerNames, this.dataRows);
                this.updateTable();
                this.setPage(0);
            });
            addElement(tableHeader, this.headerRow);
        }
        addElement(this.headerRow, this.table);

        this.buttonContainer = newElement("div", {class: ["pageButtons"]});
        this.updateTable();
        this.updateButtons();

        addElements([this.table, this.buttonContainer], this.container);

        return this.container;
    }

    changePage(pageChange) {
        this.currentPage += pageChange;

        this.updateTable();
        this.updateButtons();
    }

    updateTable() {
        clearElement(this.table);
        addElement(this.headerRow, this.table);

        const startIndex = this.pageSize * this.currentPage;
        const dataLength = this.dataRows.length;
        const endIndex = startIndex + this.pageSize < dataLength ? startIndex + this.pageSize : dataLength;
        for (let i = startIndex; i < endIndex; i++) {
            const row = this.dataRows[i];
            const tableRow = newElement('tr');
            for (let data of row) {
                if (data instanceof Element) addElement(data, tableRow);
                else {
                    const tableData = newElement('td', {innerText: data});
                    addElement(tableData, tableRow);
                };
            }
            addElement(tableRow, this.table);
        }
    }

    setPage(pageNum) {
        this.currentPage = pageNum;
        this.updateButtons();
        this.updateTable();
    }

    updateButtons() {
        clearElement(this.buttonContainer);
        if (this.currentPage > 1) {
            const previousAll = newElement("button", {innerText: "<<"});
            registerElement(previousAll, "click", () => {this.setPage(0)});
            addElement(previousAll, this.buttonContainer);
        }
        if (this.currentPage > 0) {
            const previousButton = newElement("button", {innerText: "<"});
            registerElement(previousButton, "click", () => {this.changePage(-1)});
            addElement(previousButton, this.buttonContainer);
        }
        if (this.pageCount > 1) {
            const pageCount = newElement("span", {innerText: `${this.currentPage + 1}/${this.pageCount}`})
            addElement(pageCount, this.buttonContainer);
        }
        if (this.currentPage < this.pageCount - 1 && this.pageCount > 1) {
            const nextButton = newElement("button", {innerText: ">"});
            registerElement(nextButton, "click", () => {this.changePage(1)});
            addElement(nextButton, this.buttonContainer);
        }
        if (this.currentPage < this.pageCount - 2 && this.pageCount > 2) {
            const nextAll = newElement("button", {innerText: ">>"});
            registerElement(nextAll, "click", () => {this.setPage(this.pageCount - 1)});
            addElement(nextAll, this.buttonContainer);
        }
        return this.buttonContainer;
    }
}

function sortPersonTable(event, headers, tableData) {
    const sortBy = event.target.innerText;
    const sortDirection = event.target.dataset.sortDirection;

    if (sortDirection === 'asc') {
        event.target.dataset.sortDirection = 'desc';
    }
    else if (sortDirection === 'desc') {
        event.target.dataset.sortDirection = 'asc';
    }

    tableData.sort(customSort);
    
    function customSort(a, b) {
        const headerIndex = headers.indexOf(sortBy);
        let valueA = !isNaN(parseInt(a[headerIndex])) ? parseInt(a[headerIndex]) : a[headerIndex];
        let valueB = !isNaN(parseInt(b[headerIndex])) ? parseInt(b[headerIndex]) : b[headerIndex];

        if (sortDirection === "asc") {
            if (valueA < valueB) {
              return -1;
            }
            if (valueA > valueB) {
              return 1;
            }
        }
        else {
            if (valueA > valueB) {
                return -1;
              }
              if (valueA < valueB) {
                return 1;
              }  
        }
        return 0;
    }
}