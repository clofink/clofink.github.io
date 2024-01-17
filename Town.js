class Town {
    constructor(options) {
        options = options || {};
        // this will take a single options object (which will be collected from UI inputs separately)
        if (options.numberOfFounders) {
            this.setNumberOfFounders(options.numberOfFounders);
        }
        else {
            this.setNumberOfFounders(40);
        }
        if (options.yearOfIncorporation) {
            this.setYearOfIncorporation(parseInt(options.yearOfIncorporation));
        }
        if (options.currentYear) {
            this.setCurrentYear(parseInt(options.yearOfIncorporation));
        }
        else {
            this.setYearOfIncorporation(1000);
            this.setCurrentYear(1000);
        }
    }
    yearOfIncorporation;
    numberOfFounders;
    population = [];
    livingPopulation = [];
    deadPopulation = [];
    orphanage = [];
    currentYear;
    jobMarket = [];
    buildings = [];
    coffers = 0;
    taxRate = 5;
    getOrphanage() {
        return this.orphanage;
    }
    setTaxRate(rate) {
        this.taxRate = rate;
    }
    getTaxRate() {
        return this.taxRate;
    }
    getCoffers() {
        return this.coffers;
    }
    addToCoffers(amount) {
        this.coffers = this.coffers + amount;
    }
    removeFromOrphanage(orphan) {
        let currentOrphans = this.getOrphanage();
        if (currentOrphans.length < 2) {
            this.orphanage.pop();
        }
        for (let t = 0; t < currentOrphans.length; t++) {
            if (currentOrphans[t].getPersonId() == orphan.getPersonId()) {
                this.orphanage.splice(t, 1);
                break;
            }
        }
    }
    getBuildings() {
        return this.buildings;
    }
    addBuilding(building) {
        this.buildings.push(building);
    }
    numberOfJobInMarket(jobTitle) {
        let jobCount = 0;
        if (this.getJobMarket().length < 1) {
            return 0;
        }
        for (let job of this.getJobMarket()) {
            if (job.getTitle() == jobTitle) {
                jobCount += 1;
            }
        }
        return jobCount;
    }
    getJobMarket() {
        return this.jobMarket;
    }
    addJobToMarket(job) {
        this.jobMarket.push(job);
    }
    addOrphan(orphan) {
        this.orphanage.push(orphan);
    }
    getCurrentYear() {
        return this.currentYear;
    }
    setCurrentYear(currentYear) {
        this.currentYear = currentYear;
    }
    getYearOfIncorporation() {
        return this.yearOfIncorporation;
    }
    setYearOfIncorporation(year) {
        this.yearOfIncorporation = year;
    }
    getNumberOfFounders() {
        return this.numberOfFounders;
    }
    setNumberOfFounders(number) {
        this.numberOfFounders = number;
    }
    getLivingPopulation() {
        return this.livingPopulation;
    }
    getDeadPopulation() {
        return this.deadPopulation;
    }
    addToDeadPopulation(deadPerson) {
        this.deadPopulation.push(deadPerson);
    }
    getPopulation() {
        return this.population;
    }
    addToPopulation(person) {
        this.livingPopulation.push(person);
        this.population.push(person);
    }
    removePerson(deadPerson) {
        let currentLivingPopulation = this.getLivingPopulation();
        if (currentLivingPopulation.length < 2) {
            this.livingPopulation.pop();
        }
        else {
            this.livingPopulation.splice(currentLivingPopulation.indexOf(deadPerson), 1);
        }
    }
    incrementCurrentYear() {
        this.currentYear = this.getCurrentYear() + 1;
    }
}