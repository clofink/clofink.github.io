class Building {
    type; // residential or professional
    owner;
    population;
    residents = []; //list of people living in the building
    buildingName;
    ownerHistory = [];
    cost;

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

class Home extends Building {
    buildingName = 'Home';
    population;
    type = 'residential';
    cost = getRandomNumberInRange(10000,25000);
}

class Barracks extends Building {
    buildingName = 'Barracks';
    population = 10;
    type = 'professional';
}

class Bar extends Building {
    buildingName = 'Bar';
    population = 3;
    type = 'professional';
}

class Apothecary extends Building {
    buildingName = 'Apothecary';
    population = 1;
    type = 'professional';
}

class Smithery extends Building {
    buildingName = 'Smithery';
    population = 2;
    type = 'professional';
}

class Inn extends Building {
    buildingName = 'Inn';
    population = 2;
    type = 'professional';
}

class Bakery extends Building {
    buildingName = 'Bakery';
    population = 5;
    type = 'professional';
}

class Leatherworkers extends Building {
    buildingName = 'Leatherworkers';
    population = 2;
    type = 'professional';
}