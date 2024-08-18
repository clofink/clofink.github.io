class Building {
    type; // residential or professional
    owner;
    population;
    residents = []; //list of people living in the building
    buildingName;
    ownerHistory = [];
    cost;

    constructor(buildingInfo) {
        this.buildingName = buildingInfo.name;
        this.population = buildingInfo.population;
        this.type = buildingInfo.type;
        this.cost = getRandomNumberInRange(buildingInfo.minCost, buildingInfo.maxCost);

        return this;
    }

    getOwner() {
        // this will return a person
        return this.owner;
    }
    setCost(cost) {
        this.cost = cost;
    }
    getCost() {
        return this.cost;
    }
    setOwner(person) {
        this.ownerHistory.push(person);
        this.owner = person;
    }
    getBuildingName() {
        return this.buildingName;
    }
    removeOwner() {
        this.owner = undefined;
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
    getPopulation() {
        return this.population;
    }
    getResidents() {
        return this.residents;
    }
    addResident(newResident) {
        this.residents.push(newResident);
    }
    // to be called when someone dies to remove them from any of their buildings residents lists
    removeResident(residentToRemove) {
        let currentResidents = this.getResidents();
        if (currentResidents.length < 2) {
            this.residents.pop();
        }
        else {
            this.residents.splice(currentResidents.indexOf(residentToRemove), 1);
        }
    }
}