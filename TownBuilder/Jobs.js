class Job {
    title;
    level;
    salary;
    yearsInPosition;
    requiresBuilding;
    building;
    meetChance;
    person;
    buildingName;

    constructor(options) {
        options = options || {};
        if (!options.title) {
            this.setTitle(this.getRandomTitle());
        }
        else {
            this.setTitle(options.title);
        }
        if (!options.level) {
            this.setLevel(1);
        }
        else {
            this.setLevel(options.level);
        }
        this.setSalary(this.getRandomSalaryInRange());
        this.yearsInPosition = 0;
    }
    getBuildingRequired() {
        return this.requiresBuilding;
    }
    getBuildingName() {
        // this returns the name of the building that is required for the position
        return this.buildingName;
    }
    setPerson(person) {
        this.person = person;
    }
    getPerson() {
        return this.person;
    }
    removePerson() {
        this.person = undefined;
    }
    setTitle(title) {
        this.title = title;
    }
    getTitle() {
        return this.title;
    }
    getMeetChance() {
        return this.meetChance;
    }
    getBuilding() {
        return this.building;
    }
    setBuilding(building) {
        this.building = building;
    }
    setLevel(level) {
        if (typeof(level) != "number") {
            return;
        }
        this.level = level;
    }
    getLevel() {
        return this.level;
    }
    getMinSalary() {
        return this.minSalary;
    }
    getMaxSalary() {
        return this.maxSalary;
    }
    increaseLevel() {
        // maxes the level out at 8?
        if (this.getLevel() == 8) {
            return;
        }
        this.setLevel(this.getLevel() + 1);
    }
    setSalary(salary) {
        this.salary = salary;
    }
    getSalary() {
        return this.salary;
    }
    getYearsInPosition() {
        return this.yearsInPosition;
    }
    setYearsInPosition(newYears) {
        this.yearsInPosition = newYears;
    }
    getRandomSalaryInRange() {
        let maxSalary =  40000;
        let minSalary = 10000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    getRandomTitle() {
        const possibleTitles = ["Accountant","Actor","Actuary","Food Scientist","Anthropologist","Architect","Art Director","Artist","Auto Mechanic","Automotive mechanic","Bookkeeping clerk","Budget analyst","Bus Driver","Carpenter","Cashier","Chef","Chemist","Childcare worker","Civil Engineer","Clinical Laboratory Technician","Coach","College Professor","Compliance Officer","Computer Hardware Engineer","Computer Programmer","Computer Support Specialist","Computer Systems Administrator","Computer Systems Analyst","Construction Manager","Cost Estimator","Court Reporter","Customer Service Representative","Dancer","Database administrator","Dental Hygienist","Dentist","Designer","Desktop publisher","Diagnostic Medical Sonographer","Drafter","Economist","Editor","Educator","Electrical Engineer","Electrician","Elementary School Teacher","Environmental scientist","Epidemiologist","Event Planner","Executive Assistant","Farmer","Financial Advisor","Firefighter","Fitness Trainer","Hairdresser","High School Teacher","Historian","Housekeeper","HR Specialist","Human Resources Assistant","Insurance Agent","Interpreter & Translator","IT Manager","Janitor","Judge","Landscape Architect","Landscaper & Groundskeeper","Lawyer","Librarian","Loan Officer","Logistician","Maintenance & Repair Worker","Market Research Analyst","Marketing Manager","Marriage & Family Therapist","Mason","Massage Therapist","Mathematician","Mechanical Engineer","Medical Assistant","Medical Secretary","Microbiologist","Middle School Teacher","Musician","Occupational Therapist","Painter","Paralegal","Paramedic","Patrol Officer","Personal Care Aide","Pharmacist","Photographer","Physical Therapist","Physician","Physicist","Plumber","Police Officer","Preschool Teacher","Professional athlete","Psychologist","Public Relations Specialist","Radiologic Technologist","Real Estate Agent","Receptionist","Recreation & Fitness Worker","Recreational Therapist","Referee","Registered Nurse","Reporter","Respiratory Therapist","School Counselor","School Psychologist","Secretary","Security Guard","Social Worker","Software Developer","Speech-Language Pathologist","Sports Coach","Statistician","Substance Abuse Counselor","Surveyor","Systems Analyst","Teacher Assistant","Telemarketer","Truck Driver","Urban Planner","Veterinarian","Web Developer","Writer","Zoologist"];
        return possibleTitles[getRandomNumberInRange(0, possibleTitles.length - 1)];
    }
}

// 'barber', 'cobbler', 'grocer'

// need a way to check how many of the job are in the job market
// method on the town?

class Mayor extends Job {
    title = 'Mayor';
    meetChance = 50;
    requiresBuilding = false;
    getRandomSalaryInRange() {
        let maxSalary = 30000;
        let minSalary = 20000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        // every town needs a mayor unless they already have one
        if (town.numberOfJobInMarket('Mayor') < 1) {
            return true;
        }
        return false;
    }
    meetQualifications(personStats) {
        // a mayor must be charismatic, intelligent, and wise
        if (personStats.CHA > 13 && personStats.INT > 14 && personStats.WIS > 13) {
            return true;
        }
        return false;
    }
}

class Guard extends Job {
    title = 'Guard';
    meetChance = 30;
    requiresBuilding = true;
    buildingName = 'Barracks';

    getRandomSalaryInRange() {
        let maxSalary = 5000;
        let minSalary = 3000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 10) {
            if (town.numberOfJobInMarket('Guard') <= Math.floor(livingPopCount / 10)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        // a building is not created when the job is, rather it is created for the job when the job is taken
        this.building = new Barracks();
    }
    meetQualifications(personStats) {
        // guard must be strong (and not too smart)
        if (personStats.STR > 13 && personStats.INT < 12) {
            return true;
        }
        return false;
    }
}

class Patrol extends Job {
    title = 'Patrol';
    meetChance = 25;
    requiresBuilding = false;

    getRandomSalaryInRange() {
        let maxSalary = 4000;
        let minSalary = 1000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 30) {
            if (town.numberOfJobInMarket('Patrol') <= Math.floor(livingPopCount / 15)) {
                return true;
            }
        }
        return false;
    }
    meetQualifications(personStats) {
        // patrol needs strength and wisdom (perception)
        if (personStats.STR > 12 && personStats.WIS > 13) {
            return true;
        }
        return false;
    }
}

class Barkeep extends Job {
    title = 'Barkeep';
    meetChance = 60;
    requiresBuilding = true;
    buildingName = 'Bar';

    getRandomSalaryInRange() {
        let maxSalary = 10000;
        let minSalary = 8000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 10) {
            if (town.numberOfJobInMarket('Barkeep') <= Math.floor(livingPopCount / 50)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        this.building = new Bar();
    }
    meetQualifications(personStats) {
        // barkeep neesd charisma
        if (personStats.CHA > 13) {
            return true;
        }
        return false;
    }
}

class Healer extends Job {
    title = 'Healer';
    meetChance = 15;
    requiresBuilding = true;
    buildingName = 'Apothecary';

    getRandomSalaryInRange() {
        let maxSalary = 10000;
        let minSalary = 6000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 10) {
            // only need 1 healer per 100 people
            if (town.numberOfJobInMarket('Healer') <= Math.floor(livingPopCount / 100)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        this.building = new Apothecary();
    }
    meetQualifications(personStats) {
        // healer needs wisdom (medicine)
        if (personStats.WIS > 14) {
            return true;
        }
        return false;
    }
}

class Smith extends Job {
    title = 'Smith';
    meetChance = 12;
    requiresBuilding = true;
    buildingName = 'Smithery';

    getRandomSalaryInRange() {
        let maxSalary = 25000;
        let minSalary = 10000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        // 1 smith for every 30 people?
        if (livingPopCount > 10) {
            if (town.numberOfJobInMarket('Smith') <= Math.floor(livingPopCount / 30)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        this.building = new Smithery();
    }
    meetQualifications(personStats) {
        // smith needs strength and constitution and dexterity
        if (personStats.STR > 13 && personStats.CON > 13 && personStats.DEX > 13) {
            return true;
        }
        return false;
    }
}

class Innkeeper extends Job {
    title = 'Innkeeper';
    meetChance = 30;
    requiresBuilding = true;
    buildingName = 'Inn';

    getRandomSalaryInRange() {
        let maxSalary = 15000;
        let minSalary = 10000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 30) {
            if (town.numberOfJobInMarket('Innkeeper') <= Math.floor(livingPopCount / 50)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        this.building = new Inn();
    }
    meetQualifications(personStats) {
        // innkeeper needs charisma?
        if (personStats.CHA > 12) {
            return true;
        }
        return false;
    }
}

class Baker extends Job {
    title = 'Baker';
    meetChance = 25;
    requiresBuilding = true;
    buildingName = 'Bakery';

    getRandomSalaryInRange() {
        let maxSalary = 12000;
        let minSalary = 9000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 10) {
            if (town.numberOfJobInMarket('Baker') <= Math.floor(livingPopCount / 15)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        this.building = new Bakery();
    }
    meetQualifications(personStats) {
        // baker needs something? Wisdom?
        if (personStats.WIS > 11) {
            return true;
        }
        return false;
    }
}

class Farmer extends Job {
    title = 'Farmer';
    meetChance = 15;
    requiresBuilding = false;

    getRandomSalaryInRange() {
        let maxSalary = 8000;
        let minSalary = 2000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 10) {
            if (town.numberOfJobInMarket('Farmer') <= Math.floor(livingPopCount / 10)) {
                return true;
            }
        }
        return false;
    }
    meetQualifications(personStats) {
        // farmer needs strength and constitution
        if (personStats.STR > 12 && personStats.CON > 13) {
            return true;
        }
        return false;
    }
}

class Leatherworker extends Job {
    title = 'Leatherworker';
    meetChance = 20;
    requiresBuilding = true;
    buildingName = 'Leatherworkers';

    getRandomSalaryInRange() {
        let maxSalary = 20000;
        let minSalary = 15000;
        return getRandomNumberInRange(minSalary * this.getLevel(), maxSalary * this.getLevel());
    }
    meetsRequirements(town) {
        const livingPopCount = town.getLivingPopulationCount();
        if (livingPopCount > 10) {
            if (town.numberOfJobInMarket('Leatherworker') <= Math.floor(livingPopCount / 40)) {
                return true;
            }
        }
        return false;
    }
    createBuilding() {
        this.building = new Leatherworkers();
    }
    meetQualifications(personStats) {
        // leatherworker needs dexterity
        if (personStats.DEX > 14) {
            return true;
        }
        return false;
    }
}