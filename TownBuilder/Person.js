class Person {
    adolescence = 18;
    age;
    bestFriends = [];
    birthYear;
    children = [];
    deathYear;
    enemies = [];
    gender;
    genderPreference;
    pronoun;
    objectPronoun;
    possessivePronoun;
    house;
    houseHistory = [];
    isDead;
    job;
    lastName;
    lifeEvents = [];
    maidenName;
    maxAge = 100;
    name;
    nickname;
    parents = [];
    personId;
    race;
    reputations = {};
    residentOf;
    retirementAge;
    siblings = [];
    spouse;
    value = 0;
    stats = {};
    haveKidsChance;
    minHeight = 0;
    maxHeight = 0;
    adultHeight;
    minWeight = 0;
    maxWeight = 0;
    adultWeight;

    constructor(options) {
        options = options || {};
        if (options.ageRange) {
            this.age = getRandomNumberInRange(options.ageRange[0], options.ageRange[1]);
        }
        else {
            this.age = 0;
        }
        if (options.gender && (gender == 'male' || gender == 'female')) {
            this.gender = options.gender;
        }
        else {
            this.gender = this.randomGender();
        }
        if (options.height) this.adultHeight = options.height;
        if (options.weight) this.adultWeight = options.weight;
        
        if (this.gender == 'male') {
            this.pronoun = "he";
            this.objectPronoun = "him";
            this.possessivePronoun = "his";
            this.genderPreference = doesRandomEventHappen(80) ? 'female' : 'male';
        }
        if (this.gender == 'female') {
            this.pronoun = "she";
            this.objectPronoun = "her";
            this.possessivePronoun = "her";
            this.genderPreference = doesRandomEventHappen(80) ? 'male' : 'female';
        }
        if (options.name) {
            this.name = options.name;
        }
        else {
            this.generateName();
        }
        if (options.lastName) {
            this.lastName = lastName;
        }
        if (options.currentYear) {
            this.birthYear = options.currentYear - this.age;
        }
        else {
            this.birthYear = this.currentYear;
        }
        this.setRetirementAge();
        this.isDead = false;
        this.personId = this.makeId();
    }
    
    addBestFriend(person) {
        this.bestFriends.push(person);
    }
    addChild(child) {
        this.children.push(child);
        const parentSpouse = this.spouse;
        child.setLastName(this.lastName);
        if (parentSpouse) {
            if (!parentSpouse.getChildren().includes(child)) {
                parentSpouse.addChild(child);
            }
        }
        let myChildren = this.children;
        for (let kid of myChildren) {
            for (let otherKid of myChildren) {
                if (!Object.is(kid, otherKid) && !kid.getSiblings().includes(otherKid)) {
                    kid.addSibling(otherKid);
                }
            }
        }
        if (this.residentOf) {
            addPersonToHouse(child, this.residentOf);
        }
    }
    addEnemy(person) {
        this.enemies.push(person);
    }
    addToHouseHistory(house) {
        this.houseHistory.push(house);
    }
    addLifeEvent(year, event) {
        // {P} (he/she)
        // {OP} him/her
        // {PP} posessive pronoun (her/his)
        event = event.replaceAll(/\{P\}/g, this.pronoun);
        event = event.replaceAll(/\{OP\}/g, this.objectPronoun);
        event = event.replaceAll(/\{PP\}/g, this.possessivePronoun);
        this.lifeEvents.push(`${year}: ${capitalizeFirstLetter(event)}`);
    }
    addParent(parent) {
        this.parents.push(parent);
    }
    addSibling(sibling) {
        this.siblings.push(sibling);
    }
    addValue(value) {
        this.value = this.value + value > 0 ? this.value + value : 0;
    }
    decreasePersonReputation(personId, value) {
        value = value || 1;
        this.reputations[personId] ? this.reputations[personId] -= value : this.reputations[personId] = -value;
    }
    determineInheritence() {
        // currently, I am not subtracting from their wealth
        // if they have a spouse and their spouse is alive, they get it
        let wealthToInherit = calculateTaxes(this.value, 50);
        // this function needs to be added to global so it can access town (and run from yearPasses)
        if (this.spouse && !this.spouse.getIsDead()) {
            this.spouse.addValue(wealthToInherit);
        }
        // if their spouse is dead, it is divided evenly between their kids
        if (this.spouse && this.spouse.getIsDead()) {
            if (this.children.length > 0) {
                let inheritenceShare = Math.floor(wealthToInherit / this.children.length);
                for (let child of this.children) {
                    if (!child.getIsDead()) {
                        child.addValue(inheritenceShare);    
                    }
                }
            }
        }
    }
    die(year) {
        this.deathYear = year;
        // if I own the house, remove it from my ownership and all residents
        if (this.house) {
            let myHouse = this.house;
            this.house = undefined;
            myHouse.removeOwner();
            // this allows me to loop through all of them while mutating the original
            let houseResidentsCopy = [...myHouse.getResidents()];
            for (let resident of houseResidentsCopy) {
                removePersonFromHouse(resident, myHouse);
            }
        }
        // if I don't, just remove me from the residents of the house I live in
        else if (this.residentOf) {
            let myResidency = this.residentOf;
            removePersonFromHouse(this, myResidency);
        }
        if (this.job) {
            let myJob = this.job;
            let jobBuilding = myJob.getBuilding();
            if (jobBuilding) {
                jobBuilding.removeResident(this);
                if (jobBuilding.getOwner() == this) {
                    jobBuilding.removeOwner();
                }
            }
            myJob.removePerson();
            this.removeJob();
        }
        this.determineInheritence();
        this.isDead = true;
    }
    generateName() {
        this.name = this.randomFirstName();
        this.lastName = this.randomLastName();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    getAdolescence() {
        return this.adolescence;
    }
    getAge() {
        return this.age;
    }
    getBestFriends() {
        return this.bestFriends;
    }
    getBirthYear() {
        return this.birthYear;
    }
    getChildren() {
        return this.children;
    }
    getCurrentHeight() {
        if (this.age >= this.adolescence) {
            return this.adultHeight;
        }
        return Math.round(((this.age + 1) / this.adolescence) * this.adultHeight)
    }
    getCurrentWeight() {
        if (this.age >= this.adolescence) {
            return this.adultWeight;
        }
        return Math.round(((this.age + 1) / this.adolescence) * this.adultWeight)
    }
    getDeathChanceAtAge() {
        let percentageOfMaxAge = (this.age / this.maxAge) * 100;
        let percentage = (((100 * 1.7) / 6) / 1000);
        let chance = (Math.floor((1 + percentage) ** percentageOfMaxAge) -1);
        let randomNumber = Math.floor(randomFunction() * 1000);
        if (randomNumber < (chance * 10)) {
            return true;
        }
        return false
    }
    getDeathYear() {
        return this.deathYear;
    }
    getEnemies() {
        return this.enemies;
    }
    getFamilyMembers() {
        const familyMembers = [];
        for (let parent of this.parents) {
            familyMembers.push(parent);
            for (let parentSibling of parent.getSiblings()) {
                familyMembers.push(parentSibling);
                for (let cousin of parentSibling.getChildren()) {
                    familyMembers.push(cousin);
                }
            }
        }
        return familyMembers.concat(this.siblings);
    }
    getFather() {
        for (let parent of this.parents) {
            if (parent.getGender() == 'male') {
                return parent;
            }
        }
        return;
    }
    getFirstName() {
        return this.name;
    }
    getFullName() {
        return `${this.name} ${this.lastName}`
    }
    getGender() {
        return this.gender;
    }
    getGenderPreference() {
        return this.genderPreference;
    }
    getHouse() {
        return this.house;
    }
    getIsDead() {
        return this.isDead;
    }
    getJob() {
        return this.job;
    }
    getKidsChance() {
        return this.haveKidsChance;
    }
    getLastName() {
        return this.lastName;
    }
    getLifeEvents() {
        return this.lifeEvents;
    }
    getMaidenName() {
        return this.maidenName;
    }
    getMaxAge() {
        return this.maxAge;
    }
    getMother() {
        for (let parent of this.parents) {
            if (parent.getGender() == 'female') {
                return parent;
            }
        }
        return;
    }
    getParents() {
        return this.parents;
    }
    getPersonId() {
        return this.personId;
    }
    getRace() {
        return this.race;
    }
    getReputations() {
        return this.reputations;
    }
    getReputationByPersonId(personId) {
        return this.reputations[personId];
    }
    getResidency() {
        return this.residentOf;
    }
    getRetirementAge() {
        return this.retirementAge;
    }
    getSiblings() {
        return this.siblings;
    }
    getSpouse() {
        return this.spouse;
    }
    getStats() {
        return this.stats;
    }
    getValue() {
        return this.value;
    }
    increasePersonReputation(personId, value) {
        value = value || 1;
        this.reputations[personId] ? this.reputations[personId] += value : this.reputations[personId] = value;
    }
    makeId() {
        return randomFunction().toString(36).substr(2, 9);
    }
    randomFirstName() {
        const possibleMaleNames = ["Jacob","Michael","Ethan","Joshua","Daniel","Alexander","Anthony","William","Christopher","Matthew","Jayden","Andrew","Joseph","David","Noah","Aiden","James","Ryan","Logan","John","Nathan","Elijah","Christian","Gabriel","Benjamin","Jonathan","Tyler","Samuel","Nicholas","Gavin","Dylan","Jackson","Brandon","Caleb","Mason","Angel","Isaac","Evan","Jack","Kevin","Jose","Isaiah","Luke","Landon","Justin","Lucas","Zachary","Jordan","Robert","Aaron","Brayden","Thomas","Cameron","Hunter","Austin","Adrian","Connor","Owen","Aidan","Jason","Julian","Wyatt","Charles","Luis","Carter","Juan","Chase","Diego","Jeremiah","Brody","Xavier","Adam","Carlos","Sebastian","Liam","Hayden","Nathaniel","Henry","Jesus","Ian","Tristan","Bryan","Sean","Cole","Alex","Eric","Brian","Jaden","Carson","Blake","Ayden","Cooper","Dominic","Brady","Caden","Josiah","Kyle","Colton","Kaden","Eli","Miguel","Antonio","Parker","Steven","Alejandro","Riley","Richard","Timothy","Devin","Jesse","Victor","Jake","Joel","Colin","Kaleb","Bryce","Levi","Oliver","Oscar","Vincent","Ashton","Cody","Micah","Preston","Marcus","Max","Patrick","Seth","Jeremy","Peyton","Nolan","Ivan","Damian","Maxwell","Alan","Kenneth","Jonah","Jorge","Mark","Giovanni","Eduardo","Grant","Collin","Gage","Omar","Emmanuel","Trevor","Edward","Ricardo","Cristian","Nicolas","Kayden","George","Jaxon","Paul","Braden","Elias","Andres","Derek","Garrett","Tanner","Malachi","Conner","Fernando","Cesar","Javier","Miles","Jaiden","Alexis","Leonardo","Santiago","Francisco","Cayden","Shane","Edwin","Hudson","Travis","Bryson","Erick","Jace","Hector","Josue","Peter","Jaylen","Mario","Manuel","Abraham","Grayson","Damien","Kaiden","Spencer","Stephen","Edgar","Wesley","Shawn","Trenton","Jared","Jeffrey","Landen","Johnathan","Bradley","Braxton","Ryder","Camden","Roman","Asher","Brendan","Maddox","Sergio","Israel","Andy","Lincoln","Erik","Donovan","Raymond","Avery","Rylan","Dalton","Harrison","Andre","Martin","Keegan","Marco","Jude","Sawyer","Dakota","Leo","Calvin","Kai","Drake","Troy","Zion","Clayton","Roberto","Zane","Gregory","Tucker","Rafael","Kingston","Dominick","Ezekiel","Griffin","Devon","Drew","Lukas","Johnny","Ty","Pedro","Tyson","Caiden","Mateo","Braylon","Cash","Aden","Chance","Taylor","Marcos","Maximus","Ruben","Emanuel","Simon","Corbin","Brennan","Dillon","Skyler","Myles","Xander","Jaxson","Dawson","Kameron","Kyler","Axel","Colby","Jonas","Joaquin","Payton","Brock","Frank","Enrique","Quinn","Emilio","Malik","Grady","Angelo","Julio","Derrick","Raul","Fabian","Corey","Gerardo","Dante","Ezra","Armando","Allen","Theodore","Gael","Amir","Zander","Adan","Maximilian","Randy","Easton","Dustin","Luca","Phillip","Julius","Charlie","Ronald","Jakob","Cade","Brett","Trent","Silas","Keith","Emiliano","Trey","Jalen","Darius","Lane","Jerry","Jaime","Scott","Graham","Weston","Braydon","Anderson","Rodrigo","Pablo","Saul","Danny","Donald","Elliot","Brayan","Dallas","Lorenzo","Casey","Mitchell","Alberto","Tristen","Rowan","Jayson","Gustavo","Aaden","Amari","Dean","Braeden","Declan","Chris","Ismael","Dane","Louis","Arturo","Brenden","Felix","Jimmy","Cohen","Tony","Holden","Reid","Abel","Bennett","Zackary","Arthur","Nehemiah","Ricky","Esteban","Cruz","Finn","Mauricio","Dennis","Keaton","Albert","Marvin","Mathew","Larry","Moises","Issac","Philip","Quentin","Curtis","Greyson","Jameson","Everett","Jayce","Darren","Elliott","Uriel","Alfredo","Hugo","Alec","Jamari","Marshall","Walter","Judah","Jay","Lance","Beau","Ali","Landyn","Yahir","Phoenix","Nickolas","Kobe","Bryant","Maurice","Russell","Leland","Colten","Reed","Davis","Joe","Ernesto","Desmond","Kade","Reece","Morgan","Ramon","Rocco","Orlando","Ryker","Brodie","Paxton","Jacoby","Douglas","Kristopher","Gary","Lawrence","Izaiah","Solomon","Nikolas","Mekhi","Justice","Tate","Jaydon","Salvador","Shaun","Alvin","Eddie","Kane","Davion","Zachariah","Dorian","Titus","Kellen","Camron","Isiah","Javon","Nasir","Milo","Johan","Byron","Jasper","Jonathon","Chad","Marc","Kelvin","Chandler","Sam","Cory","Deandre","River","Reese","Roger","Quinton","Talon","Romeo","Franklin","Noel","Alijah","Guillermo","Gunner","Damon","Jadon","Emerson","Micheal","Bruce","Terry","Kolton","Melvin","Beckett","Porter","August","Brycen","Dayton","Jamarion","Leonel","Karson","Zayden","Keagan","Carl","Khalil","Cristopher","Nelson","Braiden","Moses","Isaias","Roy","Triston","Walker","Kale","Jermaine","Leon","Rodney","Kristian","Mohamed","Ronan","Pierce","Trace","Warren","Jeffery","Maverick","Cyrus","Quincy","Nathanael","Skylar","Tommy","Conor","Noe","Ezequiel","Demetrius","Jaylin","Kendrick","Frederick","Terrance","Bobby","Jamison","Jon","Rohan","Jett","Kieran","Tobias","Ari","Colt","Gideon","Felipe","Kenny","Wilson","Orion","Kamari","Gunnar","Jessie","Alonzo","Gianni","Omari","Waylon","Malcolm","Emmett","Abram","Julien","London","Tomas","Allan","Terrell","Matteo","Tristin","Jairo","Reginald","Brent","Ahmad","Yandel","Rene","Willie","Boston","Billy","Marlon","Trevon","Aydan","Jamal","Aldo","Ariel","Cason","Braylen","Javion","Joey","Rogelio","Ahmed","Dominik","Brendon","Toby","Kody","Marquis","Ulises","Armani","Adriel","Alfonso","Branden","Will","Craig","Ibrahim","Osvaldo","Wade","Harley","Steve","Davin","Deshawn","Kason","Damion","Jaylon","Jefferson","Aron","Brooks","Darian","Gerald","Rolando","Terrence","Enzo","Kian","Ryland","Barrett","Jaeden","Ben","Bradyn","Giovani","Blaine","Madden","Jerome","Muhammad","Ronnie","Layne","Kolby","Leonard","Vicente","Cale","Alessandro","Zachery","Gavyn","Aydin","Xzavier","Malakai","Raphael","Cannon","Rudy","Asa","Darrell","Giancarlo","Elisha","Junior","Zackery","Alvaro","Lewis","Valentin","Deacon","Jase","Harry","Kendall","Rashad","Finnegan","Mohammed","Ramiro","Cedric","Brennen","Santino","Stanley","Tyrone","Chace","Francis","Johnathon","Teagan","Zechariah","Alonso","Kaeden","Kamden","Gilberto","Ray","Karter","Luciano","Nico","Kole","Aryan","Draven","Jamie","Misael","Lee","Alexzander","Camren","Giovanny","Amare","Rhett","Rhys","Rodolfo","Nash","Markus","Deven","Mohammad","Moshe","Quintin","Dwayne","Memphis","Atticus","Davian","Eugene","Jax","Antoine","Wayne","Randall","Semaj","Uriah","Clark","Aidyn","Jorden","Maxim","Aditya","Lawson","Messiah","Korbin","Sullivan","Freddy","Demarcus","Neil","Brice","King","Davon","Elvis","Ace","Dexter","Heath","Duncan","Jamar","Sincere","Irvin","Remington","Kadin","Soren","Tyree","Damarion","Talan","Adrien","Gilbert","Keenan","Darnell","Adolfo","Tristian","Derick","Isai","Rylee","Gauge","Harold","Kareem","Deangelo","Agustin","Coleman","Zavier","Lamar","Emery","Jaydin","Devan","Jordyn","Mathias","Prince","Sage","Seamus","Jasiah","Efrain","Darryl","Arjun","Mike","Roland","Conrad","Kamron","Hamza","Santos","Frankie","Dominique","Marley","Vance","Dax","Jamir","Kylan","Todd","Maximo","Jabari","Matthias","Haiden","Luka","Marcelo","Keon","Layton","Tyrell","Kash","Raiden","Cullen","Donte","Jovani","Cordell","Kasen","Rory","Alfred","Darwin","Ernest","Bailey","Gaige","Hassan","Jamarcus","Killian","Augustus","Trevin","Zain","Ellis","Rex","Yusuf","Bruno","Jaidyn","Justus","Ronin","Humberto","Jaquan","Josh","Kasey","Winston","Dashawn","Lucian","Matias","Sidney","Ignacio","Nigel","Van","Elian","Finley","Jaron","Addison","Aedan","Braedon","Jadyn","Konner","Zayne","Franco","Niko","Savion","Cristofer","Deon","Krish","Anton","Brogan","Cael","Coby","Kymani","Marcel","Yair","Dale","Bo","Jordon","Samir","Darien","Zaire","Ross","Vaughn","Devyn","Kenyon","Clay","Dario","Ishaan","Jair","Kael","Adonis","Jovanny","Clinton","Rey","Chaim","German","Harper","Nathen","Rigoberto","Sonny","Glenn","Octavio","Blaze","Keshawn","Ralph","Ean","Nikhil","Rayan","Sterling","Branson","Jadiel","Dillan","Jeramiah","Koen","Konnor","Antwan","Houston","Tyrese","Dereon","Leonidas","Zack","Fisher","Jaydan","Quinten","Nick","Urijah","Darion","Jovan","Salvatore","Beckham","Jarrett","Antony","Eden","Makai","Zaiden","Broderick","Camryn","Malaki","Nikolai","Howard","Immanuel","Demarion","Valentino","Jovanni","Ayaan","Ethen","Leandro","Royce","Yael","Yosef","Jean","Marquise","Alden","Leroy","Gaven","Jovany","Tyshawn","Aarav","Kadyn","Milton","Zaid","Kelton","Tripp","Kamren","Slade","Hezekiah","Jakobe","Nathanial","Rishi","Shamar","Geovanni","Pranav","Roderick","Bentley","Clarence","Lyric","Bernard","Carmelo","Denzel","Maximillian","Reynaldo","Cassius","Gordon","Reuben","Samson","Yadiel","Jayvon","Reilly","Sheldon","Abdullah","Jagger","Thaddeus","Case","Kyson","Lamont","Chaz","Makhi","Jan","Marques","Oswaldo","Donavan","Keyon","Kyan","Simeon","Trystan","Andreas","Dangelo","Landin","Reagan","Turner","Arnav","Brenton","Callum","Jayvion","Bridger","Sammy","Deegan","Jaylan","Lennon","Odin","Abdiel","Jerimiah","Eliezer","Bronson","Cornelius","Pierre","Cortez","Baron","Carlo","Carsen","Fletcher","Izayah","Kolten","Damari","Hugh","Jensen","Yurem"];
        const possibleFemaleNames = ["Emma","Isabella","Emily","Madison","Ava","Olivia","Sophia","Abigail","Elizabeth","Chloe","Samantha","Addison","Natalie","Mia","Alexis","Alyssa","Hannah","Ashley","Ella","Sarah","Grace","Taylor","Brianna","Lily","Hailey","Anna","Victoria","Kayla","Lillian","Lauren","Kaylee","Allison","Savannah","Nevaeh","Gabriella","Sofia","Makayla","Avery","Riley","Julia","Leah","Aubrey","Jasmine","Audrey","Katherine","Morgan","Brooklyn","Destiny","Sydney","Alexa","Kylie","Brooke","Kaitlyn","Evelyn","Layla","Madeline","Kimberly","Zoe","Jessica","Peyton","Alexandra","Claire","Madelyn","Maria","Mackenzie","Arianna","Jocelyn","Amelia","Angelina","Trinity","Andrea","Maya","Valeria","Sophie","Rachel","Vanessa","Aaliyah","Mariah","Gabrielle","Katelyn","Ariana","Bailey","Camila","Jennifer","Melanie","Gianna","Charlotte","Paige","Autumn","Payton","Faith","Sara","Isabelle","Caroline","Genesis","Isabel","Mary","Zoey","Gracie","Megan","Haley","Mya","Michelle","Molly","Stephanie","Nicole","Jenna","Natalia","Sadie","Jada","Serenity","Lucy","Ruby","Eva","Kennedy","Rylee","Jayla","Naomi","Rebecca","Lydia","Daniela","Bella","Keira","Adriana","Lilly","Hayden","Miley","Katie","Jade","Jordan","Gabriela","Amy","Angela","Melissa","Valerie","Giselle","Diana","Amanda","Kate","Laila","Reagan","Jordyn","Kylee","Danielle","Briana","Marley","Leslie","Kendall","Catherine","Liliana","Mckenzie","Jacqueline","Ashlyn","Reese","Marissa","London","Juliana","Shelby","Cheyenne","Angel","Daisy","Makenzie","Miranda","Erin","Amber","Alana","Ellie","Breanna","Ana","Mikayla","Summer","Piper","Adrianna","Jillian","Sierra","Jayden","Sienna","Alicia","Lila","Margaret","Alivia","Brooklynn","Karen","Violet","Sabrina","Stella","Aniyah","Annabelle","Alexandria","Kathryn","Skylar","Aliyah","Delilah","Julianna","Kelsey","Khloe","Carly","Amaya","Mariana","Christina","Alondra","Tessa","Eliana","Bianca","Jazmin","Clara","Vivian","Josephine","Delaney","Scarlett","Elena","Cadence","Alexia","Maggie","Laura","Nora","Ariel","Elise","Nadia","Mckenna","Chelsea","Lyla","Alaina","Jasmin","Hope","Leila","Caitlyn","Cassidy","Makenna","Allie","Izabella","Eden","Callie","Haylee","Caitlin","Kendra","Karina","Kyra","Kayleigh","Addyson","Kiara","Jazmine","Karla","Camryn","Alina","Lola","Kyla","Kelly","Fatima","Tiffany","Kira","Crystal","Mallory","Esmeralda","Alejandra","Eleanor","Angelica","Jayda","Abby","Kara","Veronica","Carmen","Jamie","Ryleigh","Valentina","Allyson","Dakota","Kamryn","Courtney","Cecilia","Madeleine","Aniya","Alison","Esther","Heaven","Aubree","Lindsey","Leilani","Nina","Melody","Macy","Ashlynn","Joanna","Cassandra","Alayna","Kaydence","Madilyn","Aurora","Heidi","Emerson","Kimora","Madalyn","Erica","Josie","Katelynn","Guadalupe","Harper","Ivy","Lexi","Camille","Savanna","Dulce","Daniella","Lucia","Emely","Joselyn","Kiley","Kailey","Miriam","Cynthia","Rihanna","Georgia","Rylie","Harmony","Kiera","Kyleigh","Monica","Bethany","Kaylie","Cameron","Teagan","Cora","Brynn","Ciara","Genevieve","Alice","Maddison","Eliza","Tatiana","Jaelyn","Erika","Ximena","April","Marely","Julie","Danica","Presley","Brielle","Julissa","Angie","Iris","Brenda","Hazel","Rose","Malia","Shayla","Fiona","Phoebe","Nayeli","Paola","Kaelyn","Selena","Audrina","Rebekah","Carolina","Janiyah","Michaela","Penelope","Janiya","Anastasia","Adeline","Ruth","Sasha","Denise","Holly","Madisyn","Hanna","Tatum","Marlee","Nataly","Helen","Janelle","Lizbeth","Serena","Anya","Jaslene","Kaylin","Jazlyn","Nancy","Lindsay","Desiree","Hayley","Itzel","Imani","Madelynn","Asia","Kadence","Madyson","Talia","Jane","Kayden","Annie","Amari","Bridget","Raegan","Jadyn","Celeste","Jimena","Luna","Yasmin","Emilia","Annika","Estrella","Sarai","Lacey","Ayla","Alessandra","Willow","Nyla","Dayana","Lilah","Lilliana","Natasha","Hadley","Harley","Priscilla","Claudia","Allisson","Baylee","Brenna","Brittany","Skyler","Fernanda","Danna","Melany","Cali","Lia","Macie","Lyric","Logan","Gloria","Lana","Mylee","Cindy","Lilian","Amira","Anahi","Alissa","Anaya","Lena","Ainsley","Sandra","Noelle","Marisol","Meredith","Kailyn","Lesly","Johanna","Diamond","Evangeline","Juliet","Kathleen","Meghan","Paisley","Athena","Hailee","Rosa","Wendy","Emilee","Sage","Alanna","Elaina","Cara","Nia","Paris","Casey","Dana","Emery","Rowan","Aubrie","Kaitlin","Jaden","Kenzie","Kiana","Viviana","Norah","Lauryn","Perla","Amiyah","Alyson","Rachael","Shannon","Aileen","Miracle","Lillie","Danika","Heather","Kassidy","Taryn","Tori","Francesca","Kristen","Amya","Elle","Kristina","Cheyanne","Haylie","Patricia","Anne","Samara","Skye","Kali","America","Lexie","Parker","Halle","Londyn","Abbigail","Linda","Hallie","Saniya","Bryanna","Bailee","Jaylynn","Mckayla","Quinn","Jaelynn","Jaida","Caylee","Jaiden","Melina","Abril","Sidney","Kassandra","Elisabeth","Adalyn","Kaylynn","Mercedes","Yesenia","Elliana","Brylee","Dylan","Isabela","Ryan","Ashlee","Daphne","Kenya","Marina","Christine","Mikaela","Kaitlynn","Justice","Saniyah","Jaliyah","Ingrid","Marie","Natalee","Joy","Juliette","Simone","Adelaide","Krystal","Kennedi","Mila","Tamia","Addisyn","Aylin","Dayanara","Sylvia","Clarissa","Maritza","Virginia","Braelyn","Jolie","Jaidyn","Kinsley","Kirsten","Laney","Marilyn","Whitney","Janessa","Raquel","Anika","Kamila","Aria","Rubi","Adelyn","Amara","Ayanna","Teresa","Zariah","Kaleigh","Amani","Carla","Yareli","Gwendolyn","Paulina","Nathalie","Annabella","Jaylin","Tabitha","Deanna","Madalynn","Journey","Aiyana","Skyla","Yaretzi","Ada","Liana","Karlee","Jenny","Myla","Cristina","Myah","Lisa","Tania","Isis","Jayleen","Jordin","Arely","Azul","Helena","Aryanna","Jaqueline","Lucille","Destinee","Martha","Zoie","Arielle","Liberty","Marlene","Elisa","Isla","Noemi","Raven","Jessie","Aleah","Kailee","Kaliyah","Lilyana","Haven","Tara","Giana","Camilla","Maliyah","Irene","Carley","Maeve","Lea","Macey","Sharon","Alisha","Marisa","Jaylene","Kaya","Scarlet","Siena","Adyson","Maia","Shiloh","Tiana","Jaycee","Gisselle","Yazmin","Eve","Shyanne","Arabella","Sherlyn","Sariah","Amiya","Kiersten","Madilynn","Shania","Aleena","Finley","Kinley","Kaia","Aliya","Taliyah","Pamela","Yoselin","Ellen","Carlie","Monserrat","Jakayla","Reyna","Yaritza","Carolyn","Clare","Lorelei","Paula","Zaria","Gracelyn","Kasey","Regan","Alena","Angelique","Regina","Britney","Emilie","Mariam","Jaylee","Julianne","Greta","Elyse","Lainey","Kallie","Felicity","Zion","Aspen","Carlee","Annalise","Iliana","Larissa","Akira","Sonia","Catalina","Phoenix","Joslyn","Anabelle","Mollie","Susan","Judith","Destiney","Hillary","Janet","Katrina","Mareli","Ansley","Kaylyn","Alexus","Gia","Maci","Elsa","Stacy","Kaylen","Carissa","Haleigh","Lorena","Jazlynn","Milagros","Luz","Leanna","Renee","Shaniya","Charlie","Abbie","Cailyn","Cherish","Elsie","Jazmyn","Elaine","Emmalee","Luciana","Dahlia","Jamya","Belinda","Mariyah","Chaya","Dayami","Rhianna","Yadira","Aryana","Rosemary","Armani","Cecelia","Celia","Barbara","Cristal","Eileen","Rayna","Campbell","Amina","Aisha","Amirah","Ally","Araceli","Averie","Mayra","Sanaa","Patience","Leyla","Selah","Zara","Chanel","Kaiya","Keyla","Miah","Aimee","Giovanna","Amelie","Kelsie","Alisson","Angeline","Dominique","Adrienne","Brisa","Cierra","Paloma","Isabell","Precious","Alma","Charity","Jacquelyn","Janae","Frances","Shyla","Janiah","Kierra","Karlie","Annabel","Jacey","Karissa","Jaylah","Xiomara","Edith","Marianna","Damaris","Deborah","Jaylyn","Evelin","Mara","Olive","Ayana","India","Kendal","Kayley","Tamara","Briley","Charlee","Nylah","Abbey","Moriah","Saige","Savanah","Giada","Hana","Lizeth","Matilda","Ann","Jazlene","Gillian","Beatrice","Ireland","Karly","Mylie","Yasmine","Ashly","Kenna","Maleah","Corinne","Keely","Tanya","Tianna","Adalynn","Ryann","Salma","Areli","Karma","Shyann","Kaley","Theresa","Evie","Gina","Roselyn","Kaila","Jaylen","Natalya","Meadow","Rayne","Aliza","Yuliana","June","Lilianna","Nathaly","Ali","Alisa","Aracely","Belen","Tess","Jocelynn","Litzy","Makena","Abagail","Giuliana","Joyce","Libby","Lillianna","Thalia","Tia","Sarahi","Zaniyah","Kristin","Lorelai","Mattie","Taniya","Jaslyn","Gemma","Valery","Lailah","Mckinley","Micah","Deja","Frida","Brynlee","Jewel","Krista","Mira","Yamilet","Adison","Carina","Karli","Magdalena","Stephany","Charlize","Raelynn","Aliana","Cassie","Mina","Karley","Shirley","Marlie","Alani","Taniyah","Cloe","Sanai","Lina","Nola","Anabella","Dalia","Raina","Mariela","Ariella","Bria","Kamari","Monique","Ashleigh","Reina","Alia","Ashanti","Lara","Lilia","Justine","Leia","Maribel","Abigayle","Tiara","Alannah","Princess","Sydnee","Kamora","Paityn","Payten","Naima","Gretchen","Heidy","Nyasia","Livia","Marin","Shaylee","Maryjane","Laci","Nathalia","Azaria","Anabel","Chasity","Emmy","Izabelle","Denisse","Emelia","Mireya","Shea","Amiah","Dixie","Maren","Averi","Esperanza","Micaela","Selina","Alyvia","Chana","Avah","Donna","Kaylah","Ashtyn","Karsyn","Makaila","Shayna","Essence","Leticia","Miya","Rory","Desirae","Kianna","Laurel","Neveah","Amaris","Hadassah","Dania","Hailie","Jamiya","Kathy","Laylah","Riya","Diya","Carleigh","Iyana","Kenley","Sloane","Elianna"];
        if (this.gender == 'male') {
            return possibleMaleNames[getRandomNumberInRange(0, possibleMaleNames.length - 1)]
        }
        if (this.gender == 'female') {
            return possibleFemaleNames[getRandomNumberInRange(0, possibleFemaleNames.length - 1)]
        }
    }
    randomGender() {
        const possibleGenders = ['male', 'female'];
        return possibleGenders[getRandomNumberInRange(0,1)]
    }
    randomLastName() {
        const possibleLastNames = ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Rodriguez","Wilson","Martinez","Anderson","Taylor","Thomas","Hernandez","Moore","Martin","Jackson","Thompson","White","Lopez","Lee","Gonzalez","Harris","Clark","Lewis","Robinson","Walker","Perez","Hall","Young","Allen","Sanchez","Wright","King","Scott","Green","Baker","Adams","Nelson","Hill","Ramirez","Campbell","Mitchell","Roberts","Carter","Phillips","Evans","Turner","Torres","Parker","Collins","Edwards","Stewart","Flores","Morris","Nguyen","Murphy","Rivera","Cook","Rogers","Morgan","Peterson","Cooper","Reed","Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox","Diaz","Richardson","Wood","Watson","Brooks","Bennett","Gray","James","Reyes","Cruz","Hughes","Price","Myers","Long","Foster","Sanders","Ross","Morales","Powell","Sullivan","Russell","Ortiz","Jenkins","Gutierrez","Perry","Butler","Barnes","Fisher","Henderson","Coleman","Simmons","Patterson","Jordan","Reynolds","Hamilton","Graham","Kim","Gonzales","Alexander","Ramos","Wallace","Griffin","West","Cole","Hayes","Chavez","Gibson","Bryant","Ellis","Stevens","Murray","Ford","Marshall","Owens","Mcdonald","Harrison","Ruiz","Kennedy","Wells","Alvarez","Woods","Mendoza","Castillo","Olson","Webb","Washington","Tucker","Freeman","Burns","Henry","Vasquez","Snyder","Simpson","Crawford","Jimenez","Porter","Mason","Shaw","Gordon","Wagner","Hunter","Romero","Hicks","Dixon","Hunt","Palmer","Robertson","Black","Holmes","Stone","Meyer","Boyd","Mills","Warren","Fox","Rose","Rice","Moreno","Schmidt","Patel","Ferguson","Nichols","Herrera","Medina","Ryan","Fernandez","Weaver","Daniels","Stephens","Gardner","Payne","Kelley","Dunn","Pierce","Arnold","Tran","Spencer","Peters","Hawkins","Grant","Hansen","Castro","Hoffman","Hart","Elliott","Cunningham","Knight","Bradley","Carroll","Hudson","Duncan","Armstrong","Berry","Andrews","Johnston","Ray","Lane","Riley","Carpenter","Perkins","Aguilar","Silva","Richards","Willis","Matthews","Chapman","Lawrence","Garza","Vargas","Watkins","Wheeler","Larson","Carlson","Harper","George","Greene","Burke","Guzman","Morrison","Munoz","Jacobs","Obrien","Lawson","Franklin","Lynch","Bishop","Carr","Salazar","Austin","Mendez","Gilbert","Jensen","Williamson","Montgomery","Harvey","Oliver","Howell","Dean","Hanson","Weber","Garrett","Sims","Burton","Fuller","Soto","Mccoy","Welch","Chen","Schultz","Walters","Reid","Fields","Walsh","Little","Fowler","Bowman","Davidson","May","Day","Schneider","Newman","Brewer","Lucas","Holland","Wong","Banks","Santos","Curtis","Pearson","Delgado","Valdez","Pena","Rios","Douglas","Sandoval","Barrett","Hopkins","Keller","Guerrero","Stanley","Bates","Alvarado","Beck","Ortega","Wade","Estrada","Contreras","Barnett","Caldwell","Santiago","Lambert","Powers","Chambers","Nunez","Craig","Leonard","Lowe","Rhodes","Byrd","Gregory","Shelton","Frazier","Becker","Maldonado","Fleming","Vega","Sutton","Cohen","Jennings","Parks","Mcdaniel","Watts","Barker","Norris","Vaughn","Vazquez","Holt","Schwartz","Steele","Benson","Neal","Dominguez","Horton","Terry","Wolfe","Hale","Lyons","Graves","Haynes","Miles","Park","Warner","Padilla","Bush","Thornton","Mccarthy","Mann","Zimmerman","Erickson","Fletcher","Mckinney","Page","Dawson","Joseph","Marquez","Reeves","Klein","Espinoza","Baldwin","Moran","Love","Robbins","Higgins","Ball","Cortez","Le","Griffith","Bowen","Sharp","Cummings","Ramsey","Hardy","Swanson","Barber","Acosta","Luna","Chandler","Blair","Daniel","Cross","Simon","Dennis","Oconnor","Quinn","Gross","Navarro","Moss","Fitzgerald","Doyle","Mclaughlin","Rojas","Rodgers","Stevenson","Singh","Yang","Figueroa","Harmon","Newton","Paul","Manning","Garner","Mcgee","Reese","Francis","Burgess","Adkins","Goodman","Curry","Brady","Christensen","Potter","Walton","Goodwin","Mullins","Molina","Webster","Fischer","Campos","Avila","Sherman","Todd","Chang","Blake","Malone","Wolf","Hodges","Juarez","Gill","Farmer","Hines","Gallagher","Duran","Hubbard","Cannon","Miranda","Wang","Saunders","Tate","Mack","Hammond","Carrillo","Townsend","Wise","Ingram","Barton","Mejia","Ayala","Schroeder","Hampton","Rowe","Parsons","Frank","Waters","Strickland","Osborne","Maxwell","Chan","Deleon","Norman","Harrington","Casey","Patton","Logan","Bowers","Mueller","Glover","Floyd","Hartman","Buchanan","Cobb","French","Kramer","Mccormick","Clarke","Tyler","Gibbs","Moody","Conner","Sparks","Mcguire","Leon","Bauer","Norton","Pope","Flynn","Hogan","Robles","Salinas","Yates","Lindsey","Lloyd","Marsh","Mcbride","Owen","Solis","Pham","Lang","Pratt","Lara","Brock","Ballard","Trujillo","Shaffer","Drake","Roman","Aguirre","Morton","Stokes","Lamb","Pacheco","Patrick","Cochran","Shepherd","Cain","Burnett","Hess","Li","Cervantes","Olsen","Briggs","Ochoa","Cabrera","Velasquez","Montoya","Roth","Meyers","Cardenas","Fuentes","Weiss","Hoover","Wilkins","Nicholson","Underwood","Short","Carson","Morrow","Colon","Holloway","Summers","Bryan","Petersen","Mckenzie","Serrano","Wilcox","Carey","Clayton","Poole","Calderon","Gallegos","Greer","Rivas","Guerra","Decker","Collier","Wall","Whitaker","Bass","Flowers","Davenport","Conley","Houston","Huff","Copeland","Hood","Monroe","Massey","Roberson","Combs","Franco","Larsen","Pittman","Randall","Skinner","Wilkinson","Kirby","Cameron","Bridges","Anthony","Richard","Kirk","Bruce","Singleton","Mathis","Bradford","Boone","Abbott","Charles","Allison","Sweeney","Atkinson","Horn","Jefferson","Rosales","York","Christian","Phelps","Farrell","Castaneda","Nash","Dickerson","Bond","Wyatt","Foley","Chase","Gates","Vincent","Mathews","Hodge","Garrison","Trevino","Villarreal","Heath","Dalton","Valencia","Callahan","Hensley","Atkins","Huffman","Roy","Boyer","Shields","Lin","Hancock","Grimes","Glenn","Cline","Delacruz","Camacho","Dillon","Parrish","Oneill","Melton","Booth","Kane","Berg","Harrell","Pitts","Savage","Wiggins","Brennan","Salas","Marks","Russo","Sawyer","Baxter","Golden","Hutchinson","Liu","Walter","Mcdowell","Wiley","Rich","Humphrey","Johns","Koch","Suarez","Hobbs","Beard","Gilmore","Ibarra","Keith","Macias","Khan","Andrade","Ware","Stephenson","Henson","Wilkerson","Dyer","Mcclure","Blackwell","Mercado","Tanner","Eaton","Clay","Barron","Beasley","Oneal","Preston","Small","Wu","Zamora","Macdonald","Vance","Snow","Mcclain","Stafford","Orozco","Barry","English","Shannon","Kline","Jacobson","Woodard","Huang","Kemp","Mosley","Prince","Merritt","Hurst","Villanueva","Roach","Nolan","Lam","Yoder","Mccullough","Lester","Santana","Valenzuela","Winters","Barrera","Leach","Orr","Berger","Mckee","Strong","Conway","Stein","Whitehead","Bullock","Escobar","Knox","Meadows","Solomon","Velez","Odonnell","Kerr","Stout","Blankenship","Browning","Kent","Lozano","Bartlett","Pruitt","Buck","Barr","Gaines","Durham","Gentry","Mcintyre","Sloan","Melendez","Rocha","Herman","Sexton","Moon","Hendricks","Rangel","Stark","Lowery","Hardin","Hull","Sellers","Ellison","Calhoun","Gillespie","Mora","Knapp","Mccall","Morse","Dorsey","Weeks","Nielsen","Livingston","Leblanc","Mclean","Bradshaw","Glass","Middleton","Buckley","Schaefer","Frost","Howe","House","Mcintosh","Ho","Pennington","Reilly","Hebert","Mcfarland","Hickman","Noble","Spears","Conrad","Arias","Galvan","Velazquez","Huynh","Frederick","Randolph","Cantu","Fitzpatrick","Mahoney","Peck","Villa","Michael","Donovan","Mcconnell","Walls","Boyle","Mayer","Zuniga","Giles","Pineda","Pace","Hurley","Mays","Mcmillan","Crosby","Ayers","Case","Bentley","Shepard","Everett","Pugh","David","Mcmahon","Dunlap","Bender","Hahn","Harding","Acevedo","Raymond","Blackburn","Duffy","Landry","Dougherty","Bautista","Shah","Potts","Arroyo","Valentine","Meza","Gould","Vaughan","Fry","Rush","Avery","Herring","Dodson","Clements","Sampson","Tapia","Bean","Lynn","Crane","Farley","Cisneros","Benton","Ashley","Mckay","Finley","Best","Blevins","Friedman","Moses","Sosa","Blanchard","Huber","Frye","Krueger","Bernard","Rosario","Rubio","Mullen","Benjamin","Haley","Chung","Moyer","Choi","Horne","Yu","Woodward","Ali","Nixon","Hayden","Rivers","Estes","Mccarty","Richmond","Stuart","Maynard","Brandt","Oconnell","Hanna","Sanford","Sheppard","Church","Burch","Levy","Rasmussen","Coffey","Ponce","Faulkner","Donaldson","Schmitt","Novak","Costa","Montes","Booker","Cordova","Waller","Arellano","Maddox","Mata","Bonilla","Stanton","Compton","Kaufman","Dudley","Mcpherson","Beltran","Dickson","Mccann","Villegas","Proctor","Hester","Cantrell","Daugherty","Cherry","Bray","Davila","Rowland","Levine","Madden","Spence","Good","Irwin","Werner","Krause","Petty","Whitney","Baird","Hooper","Pollard","Zavala","Jarvis","Holden","Haas","Hendrix","Mcgrath","Bird","Lucero","Terrell","Riggs","Joyce","Mercer","Rollins","Galloway","Duke","Odom","Andersen","Downs","Hatfield","Benitez","Archer","Huerta","Travis","Mcneil","Hinton","Zhang","Hays","Mayo","Fritz","Branch","Mooney","Ewing","Ritter","Esparza","Frey","Braun","Gay","Riddle","Haney","Kaiser","Holder","Chaney","Mcknight","Gamble","Vang","Cooley","Carney","Cowan","Forbes","Ferrell","Davies","Barajas","Shea","Osborn","Bright","Cuevas","Bolton","Murillo","Lutz","Duarte","Kidd","Key","Cooke"];
        return possibleLastNames[getRandomNumberInRange(0, possibleLastNames.length - 1)];
    }
    retire() {
        const myJob = this.job;
        const jobBuilding = myJob.getBuilding();
        if (jobBuilding) {
            jobBuilding.removeResident(this);
            if (jobBuilding.getOwner() == this) {
                jobBuilding.removeOwner();
            }
        }
        myJob.removePerson();
        this.removeJob();
    }
    removeJob() {
        this.job = undefined;
    }
    setAge(newAge) {
        this.age = newAge;
    }
    setBirthYear(year) {
        this.birthYear = year;
    }
    setHouse(house) {
        this.house = house;
    }
    setJob(job) {
        this.job = job;
    }
    setLastName(lastName) {
        this.lastName = lastName;
    }
    setParents(parents) {
        // expects a list
        this.parents = parents;
    }
    setRetirementAge() {
        this.retirementAge = Math.floor(this.maxAge * 0.80);
    }
    setResidency(house) {
        this.residentOf = house;
    }
    setSpouse(spouse) {
        this.spouse = spouse;
        if (spouse.getGender() == 'male' && this.getGender() != 'male') {
            this.maidenName = this.lastName;
            this.lastName = spouse.getLastName();
        }
        if (!Object.is(spouse.getSpouse(), this)) {
            spouse.setSpouse(this);
        }
    }
    setStats(stats) {
        this.stats = stats;
    }
    setValue(newValue) {
        this.value = newValue;
    }
}

class Dragonborn extends Person {
    race = 'dragonborn';
    maxAge = 80;
    adolescence = 15;
    haveKidsChance = 25;
    minHeight = 65;
    maxHeight = 83;
    minWeight = 162;
    maxWeight = 360;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    getFullName() {
        // return full name with any modifiers needed
        return `${this.name} '${this.nickname}' ${this.lastName}`
    }
    generateName() {
        // must set values for all parts needed for getFullName
        this.name = this.randomFirstName();
        this.lastName = this.randomLastName();
        this.nickname = this.randomNickname();
    }
    randomFirstName() {
        const nameList1 = ["Ali", "Ar", "Ba", "Bal", "Bel", "Bha", "Bren", "Caer", "Calu", "Dur", "Do", "Dra", "Era", "Faer", "Fro", "Gre", "Ghe", "Gora", "He", "Hi", "Ior", "Jin", "Jar", "Kil", "Kriv", "Lor", "Lumi", "Mar", "Mor", "Med", "Nar", "Nes", "Na", "Oti", "Orla", "Pri", "Pa", "Qel", "Ravo", "Ras", "Rho", "Sa", "Sha", "Sul", "Taz", "To", "Trou", "Udo", "Uro", "Vor", "Vyu", "Vrak", "Wor", "Wu", "Wra", "Wul", "Xar", "Yor", "Zor", "Zra"];
        const nameList2 = ["barum", "bor", "broth", "ciar", "crath", "daar", "dhall", "dorim", "farn", "fras", "gar", "ghull", "grax", "hadur", "hazar", "jhan", "jurn", "kax", "kris", "kul", "lasar", "lin", "mash", "morn", "naar", "prax", "qiroth", "qrin", "qull", "rakas", "rash", "rinn", "roth", "sashi", "seth", "skan", "trin", "turim", "varax", "vroth", "vull", "warum", "wunax", "xan", "xiros", "yax", "ythas", "zavur", "zire", "ziros"];
        const nameList3 = ["Ari", "A", "Bi", "Bel", "Cris", "Ca", "Drys", "Da", "Erli", "Esh", "Fae", "Fen", "Gur", "Gri", "Hin", "Ha", "Irly", "Irie", "Jes", "Jo", "Ka", "Kel", "Ko", "Lilo", "Lora", "Mal", "Mi", "Na", "Nes", "Nys", "Ori", "O", "Ophi", "Phi", "Per", "Qi", "Quil", "Rai", "Rashi", "So", "Su", "Tha", "Ther", "Uri", "Ushi", "Val", "Vyra", "Welsi", "Wra", "Xy", "Xis", "Ya", "Yr", "Zen", "Zof"];
        const nameList4 = ["birith", "bis", "bith", "coria", "cys", "dalynn", "drish", "drith", "faeth", "fyire", "gil", "gissa", "gwen", "hime", "hymm", "karyn", "kira", "larys", "liann", "lyassa", "meila", "myse", "norae", "nys", "patys", "pora", "qorel", "qwen", "rann", "riel", "rina", "rinn", "rish", "rith", "saadi", "shann", "sira", "thibra", "thyra", "vayla", "vyre", "vys", "wophyl", "wyn", "xiris", "xora", "yassa", "yries", "zita", "zys"];    
        // generates random first name
        if (this.gender == 'male') {
            const randomNum1 = randomFunction() * nameList1.length | 0;
            const randomNum2 = randomFunction() * nameList2.length | 0;
            return nameList1[randomNum1] + nameList2[randomNum2];
        }
        if (this.gender == 'female') {
            const randomNum1 = randomFunction() * nameList3.length | 0;
            const randomNum2 = randomFunction() * nameList4.length | 0;
            return nameList3[randomNum1] + nameList4[randomNum2];
        }
    }
    randomLastName() {
        // generates random last name
        const nameList5 = ["", "", "", "", "c", "cl", "cr", "d", "dr", "f", "g", "k", "kl", "kr", "l", "m", "my", "n", "ny", "pr", "sh", "t", "th", "v", "y"];
        const nameList6 = ["a", "e", "i", "a", "e", "i", "o", "u", "a", "e", "i", "a", "e", "i", "o", "u", "a", "e", "i", "a", "e", "i", "o", "u", "aa", "ia", "ea", "ua", "uu"];
        const nameList7 = ["c", "cc", "ch", "lm", "lk", "lx", "ld", "lr", "ldr", "lt", "lth", "mb", "mm", "mp", "mph", "mr", "mt", "nk", "nx", "nc", "p", "ph", "r", "rd", "rj", "rn", "rrh", "rth", "st", "tht", "x"];
        const nameList8 = ["c", "cm", "cn", "d", "j", "k", "km", "l", "n", "nd", "ndr", "nk", "nsht", "nth", "r", "s", "sht", "shkm", "st", "t", "th", "x"];
        const nameList9 = ["d", "j", "l", "ll", "m", "n", "nd", "rg", "r", "rr", "rd"];
        const nameList10 = ["c", "d", "k", "l", "n", "r", "s", "sh", "th"];    
        const nameType = randomFunction() * 10 | 0;
        const randomNum1 = randomFunction() * nameList5.length | 0;
        const randomNum2 = randomFunction() * nameList6.length | 0;
        let randomNum3 = randomFunction() * nameList7.length | 0;
        const randomNum4 = randomFunction() * nameList6.length | 0;
        const randomNum5 = randomFunction() * nameList10.length | 0;
        while (nameList7[randomNum3] === nameList5[randomNum1] || nameList7[randomNum3] === nameList10[randomNum5]) {
            randomNum3 = randomFunction() * nameList7.length | 0;
        }
        if (nameType < 4) {
            return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList6[randomNum4] + nameList10[randomNum5]);
        } else {
            const randomNum6 = randomFunction() * nameList6.length | 0;
            let randomNum7 = randomFunction() * nameList8.length | 0;
            while (nameList7[randomNum3] === nameList8[randomNum7] || nameList8[randomNum7] === nameList10[randomNum5]) {
                randomNum7 = randomFunction() * nameList8.length | 0;
            }
            if (nameType < 7) {
                return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList6[randomNum4] + nameList8[randomNum7] + nameList6[randomNum6] + nameList10[randomNum5]);
            } else {
                const randomNum8 = randomFunction() * nameList6.length | 0;
                let randomNum9 = randomFunction() * nameList9.length | 0;
                while (nameList9[randomNum9] === nameList8[randomNum7] || nameList9[randomNum9] === nameList10[randomNum5]) {
                    randomNum9 = randomFunction() * nameList9.length | 0;
                }
                return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList6[randomNum4] + nameList8[randomNum7] + nameList6[randomNum6] + nameList9[randomNum9] + nameList6[randomNum8] + nameList10[randomNum5]);
            }
        }
    }
    randomNickname() {
        // dragonborn specific: generates random nickname
        const nameType = randomFunction() * 4 | 0;
        const nameList11 = ["Able", "Adamant", "Adapter", "Ambitious", "Amuser", "Analyzer", "Babbler", "Baffler", "Barger", "Basher", "Battler", "Bender", "Binder", "Biter", "Blunderer", "Bouncer", "Bragger", "Brawler", "Brilliant", "Bruiser", "Bustler", "Cackler", "Calm", "Caring", "Charger", "Chomper", "Chuckler", "Cleaver", "Climber", "Clinker", "Composed", "Cougher", "Courageous", "Courteous", "Crackler", "Crawler", "Creative", "Crumbler", "Cruncher", "Crusher", "Dancer", "Dangerous", "Defender", "Delightful", "Devourer", "Devout", "Discreet", "Diver", "Dodger", "Draconian", "Dreamer", "Drifter", "Elegant", "Enchanter", "Enchanting", "Energizer", "Esteemed", "Evader", "Exalted", "Fainter", "Faithful", "Faker", "Favorable", "Favoured", "Fearless", "Feigner", "Flexer", "Flincher", "Flouncer", "Flourisher", "Folder", "Follower", "Forger", "Fortunate", "Frowner", "Fumbler", "Gatherer", "Giggler", "Glamorous", "Glider", "Gobbler", "Grabber", "Graceful", "Gracious", "Grappler", "Grasper", "Grounded", "Growler", "Grunter", "Harmonious", "Heartfelt", "Heckler", "Helper", "Honorable", "Hopeful", "Humorous", "Innocent", "Intrepid", "Joyous", "Jumper", "Kindhearted", "Laugher", "Launcher", "Leaper", "Limper", "Lovable", "Lunger", "Lurker", "Majestic", "Marcher", "Meddler", "Mumbler", "Murmurer", "Mysterious", "Napper", "Nibbler", "Nuzzler", "Peaceful", "Pious", "Pouncer", "Powerful", "Proud", "Puffer", "Radiant", "Reflective", "Rester", "Roarer", "Rustler", "Seeker", "Serene", "Serious", "Shifter", "Shusher", "Silent", "Sleeper", "Sloucher", "Smiler", "Smoocher", "Snuggler", "Sophisticated", "Spirited", "Sprinter", "Stamper", "Stumbler", "Tackler", "Taunter", "Thunderous", "Tickler", "Trampler", "Trembler", "Trustworthy", "Truthful", "Tumbler", "Vigilant", "Wanderer", "Wandering", "Whisperer", "Zealous"];
        const nameList12 = ["Barrel", "Bed", "Bow", "Chair", "Door", "Plank", "Plate", "Roof", "Room", "Shelf", "Shield", "Spoon", "Staff", "Steel", "Table", "Tree", "Wall", "Wood"];
        const nameList13 = ["bender", "biter", "breaker", "carver", "chomper", "crumbler", "cruncher", "crusher", "cutter", "gnawer", "masher", "nibbler", "piercer", "razer", "scraper", "scratcher", "scrawler", "snapper", "squasher", "wrecker"];    
        if (nameType === 0) {
            const randomNum1 = randomFunction() * nameList12.length | 0;
            const randomNum2 = randomFunction() * nameList13.length | 0;
            return nameList12[randomNum1] + nameList13[randomNum2];
        } else {
            const randomNum1 = randomFunction() * nameList11.length | 0;
            return nameList11[randomNum1];
        }
    }
}

class Dwarf extends Person {
    race = 'dwarf';
    maxAge = 350;
    adolescence = 50;
    haveKidsChance = 12;
    minHeight = 44;
    maxHeight = 58;
    minWeight = 112;
    maxWeight = 235;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        const nameList1 = ["Ad", "Am", "Arm", "Baer", "Daer", "Bal", "Ban", "Bar", "Bel", "Ben", "Ber", "Bhal", "Bhar", "Bhel", "Bram", "Bran", "Brom", "Brum", "Bun", "Dal", "Dar", "Dol", "Dul", "Eb", "Em", "Erm", "Far", "Gal", "Gar", "Ger", "Gim", "Gral", "Gram", "Gran", "Grem", "Gren", "Gril", "Gry", "Gul", "Har", "Hjal", "Hjol", "Hjul", "Hor", "Hul", "Hur", "Kar", "Khar", "Kram", "Krom", "Krum", "Mag", "Mal", "Mel", "Mor", "Muir", "Mur", "Rag", "Ran", "Reg", "Rot", "Thal", "Thar", "Thel", "Ther", "Tho", "Thor", "Thul", "Thur", "Thy", "Tor", "Ty", "Um", "Urm", "Von"];
        const nameList2 = ["adin", "bek", "brek", "dahr", "dain", "dal", "dan", "dar", "dek", "dir", "dohr", "dor", "drak", "dram", "dren", "drom", "drum", "drus", "duhr", "dur", "dus", "garn", "gram", "gran", "grim", "grom", "gron", "grum", "grun", "gurn", "gus", "iggs", "kahm", "kam", "kohm", "kom", "kuhm", "kum", "kyl", "man", "mand", "mar", "mek", "miir", "min", "mir", "mond", "mor", "mun", "mund", "mur", "mus", "myl", "myr", "nam", "nar", "nik", "nir", "nom", "num", "nur", "nus", "nyl", "rak", "ram", "ren", "rig", "rigg", "rik", "rim", "rom", "ron", "rum", "rus", "ryl", "tharm", "tharn", "thran", "thrum", "thrun"];
        const nameList3 = ["An", "Ar", "Baer", "Bar", "Bel", "Belle", "Bon", "Bonn", "Braen", "Bral", "Bralle", "Bran", "Bren", "Bret", "Bril", "Brille", "Brol", "Bron", "Brul", "Bryl", "Brylle", "Bryn", "Bryt", "Byl", "Bylle", "Daer", "Dear", "Dim", "Ed", "Ein", "El", "Gem", "Ger", "Gwan", "Gwen", "Gwin", "Gwyn", "Gym", "Ing", "Jen", "Jenn", "Jin", "Jyn", "Kait", "Kar", "Kat", "Kath", "Ket", "Las", "Lass", "Les", "Less", "Lyes", "Lys", "Lyss", "Maer", "Maev", "Mar", "Mis", "Mist", "Myr", "Mys", "Myst", "Naer", "Nal", "Nas", "Nass", "Nes", "Nis", "Nys", "Raen", "Ran", "Red", "Reyn", "Run", "Ryn", "Sar", "Sol", "Tas", "Taz", "Tis", "Tish", "Tiz", "Tor", "Tys", "Tysh"];
        const nameList4 = ["belle", "bera", "delle", "deth", "dielle", "dille", "dish", "dora", "dryn", "dyl", "giel", "glia", "glian", "gwyn", "la", "leen", "leil", "len", "lin", "linn", "lyl", "lyn", "lynn", "ma", "mera", "mora", "mura", "myl", "myla", "nan", "nar", "nas", "nera", "nia", "nip", "nis", "niss", "nora", "nura", "nyl", "nys", "nyss", "ra", "ras", "res", "ri", "ria", "rielle", "rin", "ris", "ros", "ryl", "ryn", "sael", "selle", "sora", "syl", "thel", "thiel", "tin", "tyn", "va", "van", "via", "vian", "waen", "win", "wyn", "wynn"];
        // returns random first name
        if (this.gender == 'male') {
            const randomNum1 = randomFunction() * nameList1.length | 0;
            const randomNum2 = randomFunction() * nameList2.length | 0;
            return nameList1[randomNum1] + nameList2[randomNum2];
        }
        if (this.gender == 'female') {
            const randomNum1 = randomFunction() * nameList3.length | 0;
            const randomNum2 = randomFunction() * nameList4.length | 0;
            return nameList3[randomNum1] + nameList4[randomNum2];
        }
    }
    randomLastName() {
        // returns a random last name
        const nameList5 = ["b", "br", "c", "d", "dr", "f", "g", "gl", "gr", "h", "l", "m", "r", "str", "t", "thr"];
        const nameList6 = ["ae", "a", "e", "o", "u", "a", "e", "o", "u", "a", "e", "o", "u", "a", "e", "o", "u"];
        const nameList7 = ["br", "d", "fd", "h", "k", "lbr", "ld", "ll", "mn", "ng", "nh", "nk", "r", "rd", "rth", "tg", "thg", "zz"];
        const nameList8 = ["a", "e", "i", "o", "u"];
        const nameList9 = ["g", "h", "k", "n", "r", "v"];
        const nameList10 = ["a", "a", "e", "e", "i", "o", "u"];
        const nameList11 = ["ck", "g", "hk", "hr", "k", "ln", "m", "n", "nn", "r", "rk", "rr", "rt"];
        const nameList12 = ["battle", "big", "black", "blood", "bold", "boulder", "brave", "brawn", "bright", "broad", "bronze", "brood", "burrow", "cold", "dark", "deep", "drunk", "even", "ever", "fire", "first", "flint", "frost", "frozen", "giant", "goblin", "gold", "golden", "gray", "great", "half", "hammer", "hard", "iron", "keen", "kind", "last", "light", "loud", "mad", "marble", "might", "molten", "mountain", "silver", "smug", "stark", "steel", "stern", "stone", "storm", "stout", "strong", "thunder", "troll", "true", "wild"];
        const nameList13 = ["ale", "anvil", "axe", "back", "bane", "beard", "belch", "belt", "blade", "bleeder", "blood", "boot", "boots", "bottom", "braid", "branch", "breaker", "breath", "brow", "buster", "delver", "eye", "eyes", "fall", "feast", "finder", "fist", "fists", "flight", "force", "forge", "found", "front", "fury", "gift", "grace", "grip", "guard", "hammer", "hand", "handle", "head", "heart", "helm", "hold", "horn", "kin", "kind", "kith", "mane", "mantle", "mask", "might", "pass", "past", "pride", "reach", "rest", "roar", "rock", "shaper", "shield", "song", "stand", "stone", "storm", "strike", "tale", "tankard", "ward"];

        if (doesRandomEventHappen(50)) {
            const randomNum1 = randomFunction() * nameList12.length | 0;
            let randomNum2 = randomFunction() * nameList13.length | 0;
            while (nameList12[randomNum1] === nameList13[randomNum2]) {
                randomNum2 = randomFunction() * nameList13.length | 0;
            }
            return capitalizeFirstLetter(nameList12[randomNum1] + nameList13[randomNum2]);
        }

        const nameType = randomFunction() * 2 | 0;
        const randomNum1 = randomFunction() * nameList5.length | 0;
        const randomNum2 = randomFunction() * nameList6.length | 0;
        let randomNum3 = randomFunction() * nameList7.length | 0;
        const randomNum4 = randomFunction() * nameList10.length | 0;
        const randomNum5 = randomFunction() * nameList11.length | 0;
        if (nameType === 0) {
            while (nameList11[randomNum5] === nameList7[randomNum3] && nameList7[randomNum3] === nameList5[randomNum1]) {
                randomNum3 = randomFunction() * nameList7.length | 0;
            }
            return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList10[randomNum4] + nameList11[randomNum5]);
        } else {
            const randomNum6 = randomFunction() * nameList8.length | 0;
            let randomNum7 = randomFunction() * nameList9.length | 0;
            while (nameList11[randomNum5] === nameList9[randomNum7] || nameList9[randomNum7] === nameList7[randomNum3]) {
                randomNum7 = randomFunction() * nameList9.length | 0;
            }
            return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList8[randomNum6] + nameList9[randomNum7] + nameList10[randomNum4] + nameList11[randomNum5]);
        }
    }
}

class Elf extends Person {
    race = 'elf';
    maxAge = 750;
    adolescence = 100;
    haveKidsChance = 18;
    minHeight = 58;
    maxHeight = 76;
    minWeight = 90;
    maxWeight = 230;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        if (this.gender == 'male') {
            const nameList1 = ["Ad", "Ae", "Bal", "Bei", "Car", "Cra", "Dae", "Dor", "El", "Ela", "Er", "Far", "Fen", "Gen", "Glyn", "Hei", "Her", "Ian", "Ili", "Kea", "Kel", "Leo", "Lu", "Mira", "Mor", "Nae", "Nor", "Olo", "Oma", "Pa", "Per", "Pet", "Qi", "Qin", "Ralo", "Ro", "Sar", "Syl", "The", "Tra", "Ume", "Uri", "Va", "Vir", "Waes", "Wran", "Yel", "Yin", "Zin", "Zum"];
            const nameList2 = ["balar", "beros", "can", "ceran", "dan", "dithas", "faren", "fir", "geiros", "golor", "hice", "horn", "jeon", "jor", "kas", "kian", "lamin", "lar", "len", "maer", "maris", "menor", "myar", "nan", "neiros", "nelis", "norin", "peiros", "petor", "qen", "quinal", "ran", "ren", "ric", "ris", "ro", "salor", "sandoral", "toris", "tumal", "valur", "ven", "warin", "wraek", "xalim", "xidor", "yarus", "ydark", "zeiros", "zumin"];
            const randomNum1 = randomFunction() * nameList1.length | 0;
            const randomNum2 = randomFunction() * nameList2.length | 0;
            return nameList1[randomNum1] + nameList2[randomNum2];        
        }
        if (this.gender == 'female') {
            const nameList3 = ["Ad", "Ara", "Bi", "Bry", "Cai", "Chae", "Da", "Dae", "Eil", "En", "Fa", "Fae", "Gil", "Gre", "Hele", "Hola", "Iar", "Ina", "Jo", "Key", "Kris", "Lia", "Lora", "Mag", "Mia", "Neri", "Ola", "Ori", "Phi", "Pres", "Qi", "Qui", "Rava", "Rey", "Sha", "Syl", "Tor", "Tris", "Ula", "Uri", "Val", "Ven", "Wyn", "Wysa", "Xil", "Xyr", "Yes", "Ylla", "Zin", "Zyl"];
            const nameList4 = ["banise", "bella", "caryn", "cyne", "di", "dove", "fiel", "fina", "gella", "gwyn", "hana", "harice", "jyre", "kalyn", "krana", "lana", "lee", "leth", "lynn", "moira", "mys", "na", "nala", "phine", "phyra", "qirelle", "ra", "ralei", "rel", "rie", "rieth", "rona", "rora", "roris", "satra", "stina", "sys", "thana", "thyra", "tris", "varis", "vyre", "wenys", "wynn", "xina", "xisys", "ynore", "yra", "zana", "zorwyn"];
            const randomNum1 = randomFunction() * nameList3.length | 0;
            const randomNum2 = randomFunction() * nameList4.length | 0;
            return nameList3[randomNum1] + nameList4[randomNum2];
        }
    }
    randomLastName() {
        const nameList5 = ["", "", "", "b", "c", "d", "dr", "f", "fl", "g", "h", "k", "l", "m", "n", "r", "qu", "s", "sh", "t", "th", "v", "w", "x", "y"];
        const nameList6 = ["ae", "ie", "ia", "ei", "ey", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u"];
        const nameList7 = ["dr", "l", "l", "ld", "ldr", "ll", "lph", "lt", "lth", "m", "n", "ndr", "nn", "nt", "ph", "r", "r", "rd", "rn", "s", "sh", "st", "str", "th", "thr", "v"];
        const nameList8 = ["a", "e", "i", "o"];
        const nameList9 = ["dr", "lk", "ndr", "nthr", "sc", "st", "str", "thr", "c", "h", "l", "m", "n", "nn", "ph", "r", "rr", "s", "ss", "v", "x"];
        const nameList10 = ["ii", "ie", "aea", "ia", "ua", "a", "e", "i", "o", "a", "e", "i", "o", "a", "e", "i", "o", "a", "e", "i", "o", "a", "e", "i", "o", "a", "e", "i", "o", "a", "e", "i", "o", "a", "e", "i", "o"];
        const nameList11 = ["", "", "", "", "", "l", "n", "nn", "nt", "r", "s", "sh", "th"];
        const nameList12 = ["alder", "amber", "ash", "aspen", "autumn", "azure", "beech", "birch", "blue", "bold", "bronze", "cedar", "crimson", "dawn", "dew", "diamond", "dusk", "eager", "elder", "elm", "ember", "even", "fall", "far", "feather", "fir", "flower", "fog", "forest", "gem", "gold", "green", "hazel", "light", "lunar", "mist", "moon", "moss", "night", "oak", "oaken", "ocean", "poplar", "rain", "rapid", "raven", "sage", "shadow", "silent", "silver", "spark", "spirit", "spring", "star", "still", "stone", "summer", "sun", "swift", "wild", "willow", "wind", "winter", "wood"];
        const nameList13 = ["beam", "bell", "birth", "blossom", "breath", "breeze", "brook", "cloud", "crown", "dew", "dream", "dreamer", "fall", "fate", "flight", "flow", "flower", "fond", "gaze", "gazer", "gift", "gleam", "grove", "guard", "heart", "heel", "hold", "kind", "light", "mane", "might", "mind", "moon", "path", "petal", "pride", "rest", "river", "seeker", "sense", "shadow", "shard", "shine", "singer", "smile", "song", "spark", "spell", "spirit", "star", "vale", "walker", "watcher", "whisper", "wish"];
    
        if (doesRandomEventHappen(50)) {
            const randomNum1 = randomFunction() * nameList12.length | 0;
            let randomNum2 = randomFunction() * nameList13.length | 0;
            while (nameList12[randomNum1] === nameList13[randomNum2]) {
                randomNum2 = randomFunction() * nameList13.length | 0;
            }
            return capitalizeFirstLetter(nameList12[randomNum1] + nameList13[randomNum2]);
        }
        
        const nameType = randomFunction() * 8 | 0;
        const randomNum1 = randomFunction() * nameList5.length | 0;
        const randomNum2 = randomFunction() * nameList6.length | 0;
        let randomNum3 = randomFunction() * nameList7.length | 0;
        const randomNum4 = randomFunction() * nameList10.length | 0;
        const randomNum5 = randomFunction() * nameList11.length | 0;
        if (nameType < 3) {
            while (nameList11[randomNum5] === nameList7[randomNum3] && nameList7[randomNum3] === nameList5[randomNum1]) {
                randomNum3 = randomFunction() * nameList7.length | 0;
            }
            return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList10[randomNum4] + nameList11[randomNum5]);
        } else {
            const randomNum6 = randomFunction() * nameList8.length | 0;
            let randomNum7 = randomFunction() * nameList9.length | 0;
            while (nameList11[randomNum5] === nameList9[randomNum6] && nameList9[randomNum6] === nameList7[randomNum3]) {
                randomNum7 = randomFunction() * nameList9.length | 0;
            }
            if (nameType < 6) {
                return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList8[randomNum6] + nameList9[randomNum7] + nameList10[randomNum4] + nameList11[randomNum5]);
            } else {
                const randomNum8 = randomFunction() * nameList8.length | 0;
                const randomNum9 = randomFunction() * nameList9.length | 0;
                while (nameList11[randomNum5] === nameList9[randomNum6] && nameList9[randomNum6] === nameList9[randomNum9]) {
                    randomNum7 = randomFunction() * nameList9.length | 0;
                }
                while (randomNum9 < 8 && randomNum7 < 8) {
                    randomNum7 = randomFunction() * nameList9.length | 0;
                }
                if (nameType === 6) {
                    return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList7[randomNum3] + nameList8[randomNum6] + nameList9[randomNum7] + nameList8[randomNum8] + nameList9[randomNum9] + nameList10[randomNum4] + nameList11[randomNum5]);
                } else {
                    return capitalizeFirstLetter(nameList5[randomNum1] + nameList6[randomNum2] + nameList9[randomNum7] + nameList8[randomNum8] + nameList7[randomNum3] + nameList8[randomNum6] + nameList9[randomNum9] + nameList10[randomNum4] + nameList11[randomNum5]);
                }
            }
        }
    }
}

class Gnome extends Person {
    race = 'gnome';
    maxAge = 425;
    adolescence = 40;
    haveKidsChance = 8;
    minHeight = 36;
    maxHeight = 46;
    minWeight = 34;
    maxWeight = 54;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        if (this.gender == 'male') {
            const nameType1 = ["Al", "Ari", "Bil", "Bri", "Cal", "Cor", "Dav", "Dor", "Eni", "Er", "Far", "Fel", "Ga", "Gra", "His", "Hor", "Ian", "Ipa", "Je", "Jor", "Kas", "Kel", "Lan", "Lo", "Man", "Mer", "Nes", "Ni", "Or", "Oru", "Pana", "Po", "Qua", "Quo", "Ras", "Ron", "Sa", "Sal", "Sin", "Tan", "To", "Tra", "Um", "Uri", "Val", "Vor", "War", "Wil", "Wre", "Xal", "Xo", "Ye", "Yos", "Zan", "Zil"];
            const nameType2 = ["bar", "ben", "bis", "corin", "cryn", "don", "dri", "fan", "fiz", "gim", "grim", "hik", "him", "ji", "jin", "kas", "kur", "len", "lin", "min", "mop", "morn", "nan", "ner", "ni", "pip", "pos", "rick", "ros", "rug", "ryn", "ser", "ston", "tix", "tor", "ver", "vyn", "win", "wor", "xif", "xim", "ybar", "yur", "ziver", "zu"];
            const randomNum1 = randomFunction() * nameType1.length | 0;
            const randomNum2 = randomFunction() * nameType2.length | 0;
            return nameType1[randomNum1] + nameType2[randomNum2];
        }
        if (this.gender == 'female') {
            const nameType3 = ["Alu", "Ari", "Ban", "Bree", "Car", "Cel", "Daphi", "Do", "Eili", "El", "Fae", "Fen", "Fol", "Gal", "Gren", "Hel", "Hes", "Ina", "Iso", "Jel", "Jo", "Klo", "Kri", "Lil", "Lori", "Min", "My", "Ni", "Ny", "Oda", "Or", "Phi", "Pri", "Qi", "Que", "Re", "Rosi", "Sa", "Sel", "Spi", "Ta", "Tifa", "Tri", "Ufe", "Uri", "Ven", "Vo", "Wel", "Wro", "Xa", "Xyro", "Ylo", "Yo", "Zani", "Zin"];
            const nameType4 = ["bi", "bys", "celi", "ci", "dira", "dysa", "fi", "fyx", "gani", "gyra", "hana", "hani", "kasys", "kini", "la", "li", "lin", "lys", "mila", "miphi", "myn", "myra", "na", "niana", "noa", "nove", "phina", "pine", "qaryn", "qys", "rhana", "roe", "sany", "ssa", "sys", "tina", "tra", "wyn", "wyse", "xi", "xis", "yaris", "yore", "za", "zyre"];
            const randomNum1 = randomFunction() * nameType3.length | 0;
            const randomNum2 = randomFunction() * nameType4.length | 0;
            return nameType3[randomNum1] + nameType4[randomNum2];
        }
    }
    randomLastName() {
        if (doesRandomEventHappen(50)) {
            const nameType13 = ["babble", "baffle", "bellow", "belly", "berry", "billow", "bold", "boon", "brass", "brisk", "broad", "bronze", "cobble", "copper", "dapple", "dark", "dazzle", "deep", "fapple", "fiddle", "fine", "fizzle", "flicker", "fluke", "glitter", "gobble", "gold", "iron", "kind", "last", "light", "long", "loud", "lucky", "marble", "pale", "pebble", "puddle", "quick", "quiet", "quill", "shadow", "short", "silver", "single", "sparkle", "spring", "squiggle", "stark", "stout", "strong", "swift", "thistle", "thunder", "tinker", "toggle", "tossle", "true", "twin", "twist", "waggle", "whistle", "wiggle", "wild", "wobble"];
            const nameType14 = ["back", "badge", "belch", "bell", "belt", "bit", "block", "bonk", "boot", "boots", "bottom", "braid", "branch", "brand", "case", "cheek", "cloak", "collar", "cord", "craft", "crag", "diggles", "drop", "dust", "dwadle", "fall", "feast", "fen", "fern", "field", "firn", "flight", "flow", "front", "gem", "gift", "grace", "guard", "hand", "heart", "helm", "hide", "hold", "kind", "ligt", "lob", "mane", "mantle", "mask", "patch", "peak", "pitch", "pocket", "reach", "rest", "river", "rock", "shield", "song", "span", "spark", "spell", "spring", "stamp", "stand", "stitch", "stone", "thread", "top", "trick", "twist", "wander"];
            const randomNum1 = randomFunction() * nameType13.length | 0;
            let randomNum2 = randomFunction() * nameType14.length | 0;
            while (nameType13[randomNum1] === nameType14[randomNum2]) {
                randomNum2 = randomFunction() * nameType14.length | 0;
            }
            return capitalizeFirstLetter(nameType13[randomNum1] + nameType14[randomNum2]);
        } 
        const nameType5 = ["", "", "b", "d", "f", "g", "h", "l", "m", "n", "p", "r", "s", "t", "w", "z"];
        const nameType6 = ["ae", "oo", "ee", "aa", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u"];
        const nameType7 = ["bbl", "ckl", "f", "ff", "ggl", "kk", "lb", "lk", "ln", "lr", "lw", "mb", "ml", "mm", "mml", "mp", "mpl", "nb", "ng", "ngg", "nn", "np", "p", "pl", "pp", "r", "rc", "rg", "rk", "rn", "rr", "s", "sg", "sgr"];
        const nameType8 = ["a", "a", "e", "e", "i", "o", "u"];
        const nameType9 = ["b", "d", "n", "r", "s", "t"];
        const nameType10 = ["a", "e", "e", "i", "o"];
        const nameType11 = ["", "", "ck", "g", "l", "l", "ll", "mp", "n", "n", "n", "nd", "r", "r", "rs", "s", "s"];
        const nameType12 = ["bl", "bbl", "ckl", "dl", "ddl", "ggl", "gl", "mbl", "mpl", "pl", "ppl"];
        const nameType = randomFunction() * 8 | 0;
        if (nameType < 2) {
            let randomNum1 = randomFunction() * nameType5.length | 0;
            const randomNum2 = randomFunction() * nameType10.length | 0;
            const randomNum3 = randomFunction() * nameType12.length | 0;
            let randomNum4 = randomFunction() * nameType5.length | 0;
            const randomNum5 = randomFunction() * nameType10.length | 0;
            while (nameType5[randomNum1] === "") {
                randomNum1 = randomFunction() * nameType5.length | 0;
            }
            while (nameType5[randomNum4] === "") {
                randomNum4 = randomFunction() * nameType5.length | 0;
            }
            return capitalizeFirstLetter(nameType5[randomNum1] + nameType10[randomNum2] + nameType12[randomNum3] + "e" + nameType5[randomNum4] + nameType10[randomNum5] + nameType12[randomNum3] + "e");
        } else {
            const randomNum1 = randomFunction() * nameType5.length | 0;
            const randomNum2 = randomFunction() * nameType6.length | 0;
            let randomNum3 = randomFunction() * nameType7.length | 0;
            const randomNum4 = randomFunction() * nameType8.length | 0;
            const randomNum5 = randomFunction() * nameType11.length | 0;
            if (nameType < 3) {
                while (nameType7[randomNum3] === nameType5[randomNum1] || nameType7[randomNum3] === nameType11[randomNum5]) {
                    randomNum3 = randomFunction() * nameType7.length | 0;
                }
                return capitalizeFirstLetter(nameType5[randomNum1] + nameType6[randomNum2] + nameType7[randomNum3] + nameType8[randomNum4] + nameType11[randomNum5]);
            } else {
                let randomNum6 = randomFunction() * nameType9.length | 0;
                const randomNum7 = randomFunction() * nameType10.length | 0;
                while (nameType7[randomNum3] === nameType9[randomNum6] || nameType9[randomNum6] === nameType11[randomNum5]) {
                    randomNum6 = randomFunction() * nameType9.length | 0;
                }
                if (nameType < 5) {
                    return capitalizeFirstLetter(nameType5[randomNum1] + nameType6[randomNum2] + nameType7[randomNum3] + nameType8[randomNum4] + nameType9[randomNum6] + nameType10[randomNum7] + nameType11[randomNum5]);
                } else {
                    let randomNum8 = randomFunction() * nameType9.length | 0;
                    const randomNum9 = randomFunction() * nameType10.length | 0;
                    while (nameType7[randomNum3] === nameType9[randomNum8] || nameType9[randomNum6] === nameType9[randomNum8]) {
                        randomNum8 = randomFunction() * nameType9.length | 0;
                    }
                    return capitalizeFirstLetter(nameType5[randomNum1] + nameType6[randomNum2] + nameType7[randomNum3] + nameType8[randomNum4] + nameType9[randomNum6] + nameType10[randomNum7] + nameType9[randomNum8] + nameType10[randomNum9] + nameType11[randomNum5]);
                }
            }
        }
    }
}

class Goliath extends Person {
    race = 'goliath';
    maxAge = 100;
    adolescence = 18;
    haveKidsChance = 20;
    minHeight = 75;
    maxHeight = 97;
    minWeight = 187;
    maxWeight = 473;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        if (this.gender == 'male') {
            const nameList1 = ["Ag", "Apa", "Ar", "Au", "Aug", "Aur", "Eag", "Eg", "Erg", "Ga", "Gau", "Gea", "Gha", "Gra", "Ila", "Ili", "Ira", "Kana", "Kava", "Kaza", "Keo", "Khu", "Kora", "Kra", "La", "Lau", "Laza", "Loro", "Ma", "Mara", "Mau", "Mea", "Mo", "Na", "Nara", "Nau", "Neo", "Pa", "Pu", "Tara", "Tau", "Tha", "Thava", "Tho", "Va", "Vara", "Vau", "Vaura", "Vega", "Vi", "Vo", "Za", "Zau"];
            const nameList2 = ["dak", "dath", "dhan", "gak", "gal", "gan", "gath", "ghan", "gith", "glath", "gun", "kan", "kein", "khal", "kin", "kon", "lath", "lig", "lok", "mahg", "mahk", "mahl", "mak", "man", "mith", "mul", "nak", "nath", "nihl", "noth", "path", "phak", "rad", "rath", "rein", "rhak", "rhan", "riak", "rian", "rin", "rok", "roth", "thag", "thak", "tham", "thi", "thok", "veith", "vek", "vhal", "vhik", "vith", "voi", "zak", "ziath"];
            const randomNum = Math.floor(randomFunction() * nameList1.length);
            const randomNum2 = Math.floor(randomFunction() * nameList2.length);
            return nameList1[randomNum] + nameList2[randomNum2];
        }
        if (this.gender == 'female') {
            const nameList3 = ["Age", "Ane", "Are", "Daa", "Dau", "Di", "Ga", "Gal", "Gau", "Ge", "Gel", "Ila", "Ina", "Ka", "Kau", "Ke", "Ki", "Kuo", "La", "Lau", "Le", "Lo", "Maa", "Man", "Mau", "Me", "Na", "Nal", "Nau", "Ni", "No", "Ola", "One", "Ore", "Ori", "Pa", "Paa", "Pau", "Pe", "Tha", "Thau", "The", "Thu", "Vaa", "Vau", "Ve", "Vo", "Vu", "Za", "Zaa", "Zau", "Zo"];
            const nameList4 = ["gea", "geo", "ggeo", "ghu", "gia", "gu", "kea", "keo", "kha", "ki", "kia", "kio", "kko", "la", "lai", "lane", "lea", "leo", "lo", "lu", "ma", "meo", "mi", "mia", "ne", "nea", "neo", "ni", "nia", "nna", "nnio", "nu", "peo", "peu", "pu", "rea", "rheo", "ri", "ria", "rra", "rrea", "the", "thea", "thi", "thia", "thio", "thu", "vea", "vi", "via", "vu"];
            const randomNum = Math.floor(randomFunction() * nameList3.length);
            const randomNum2 = Math.floor(randomFunction() * nameList4.length);
            return nameList3[randomNum] + nameList4[randomNum2];
        }
    }
    generateName() {
        this.name = this.randomFirstName();
        this.lastName = this.randomLastName();
        this.nickname = this.randomNickname();
    }
    randomLastName() {
        const nameList7 = ["Agu-Ul", "Agu-V", "Anakal", "Apuna-M", "Athun", "Egena-V", "Egum", "Elan", "Ganu-M", "Gathak", "Gean", "Inul", "Kalag", "Kaluk", "Katho-Ol", "Kolae-G", "Kolak", "Kulan", "Kulum", "Lakum", "Maluk", "Munak", "Muthal", "Nalak", "Nola-K", "Nugal", "Nulak", "Ogol", "Oveth", "Thenal", "Thul", "Thunuk", "Ugun", "Uthenu-K", "Vaimei-L", "Valu-N", "Vathun", "Veom", "Vuma-Th", "Vunak"];
        const nameList8 = ["aga", "ageane", "akane", "akanu", "akume", "alathi", "amino", "amune", "anathi", "atake", "athai", "athala", "atho", "avea", "avi", "avone", "eaku", "ekali", "elo", "iaga", "iago", "iala", "iano", "igala", "igane", "igano", "igo", "igone", "ileana", "ithino", "olake", "ugate", "ugoni", "ukane", "ukate", "ukena", "ulane", "upine", "utha", "uthea"];
        const randomNum3 = Math.floor(randomFunction() * nameList7.length);
        const randomNum4 = Math.floor(randomFunction() * nameList8.length);
        return nameList7[randomNum3] + nameList8[randomNum4];
    }
    randomNickname() {
        // this is a deed name for goliaths
        const nameList5 = ["Adept", "Bear", "Brave", "Bright", "Dawn", "Day", "Deer", "Dream", "Flint", "Fearless", "Flower", "Food", "Fright", "Goat", "Hard", "Hide", "High", "Honest", "Horn", "Keen", "Lone", "Long", "Low", "Lumber", "Master", "Mind", "Mountain", "Night", "Rain", "River", "Rock", "Root", "Silent", "Sky", "Sly", "Smart", "Steady", "Stone", "Storm", "Strong", "Swift", "Thread", "Thunder", "Tree", "Tribe", "True", "Truth", "Wander", "Wild", "Wise", "Wound"];
        const nameList6 = ["aid", "bearer", "breaker", "caller", "carver", "chaser", "climber", "cook", "dream", "drifter", "eye", "finder", "fist", "friend", "frightener", "guard", "hand", "hauler", "heart", "herder", "hunter", "jumper", "killer", "lander", "leader", "leaper", "logger", "maker", "mender", "picker", "runner", "shot", "smasher", "speaker", "stalker", "striker", "tanner", "twister", "vigor", "walker", "wanderer", "warrior", "watcher", "weaver", "worker"];
        const randomNum = Math.floor(randomFunction() * nameList5.length);
        const randomNum2 = Math.floor(randomFunction() * nameList6.length);
        return nameList5[randomNum] + nameList6[randomNum2];
    }
    getFullName() {
        return `${this.name} ${this.nickname} ${this.lastName}`;
    }
}

class Halfling extends Person {
    race = 'halfling'
    maxAge = 250;
    adolescence = 20;
    haveKidsChance = 7;
    minHeight = 32;
    maxHeight = 42;
    minWeight = 34;
    maxWeight = 54;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        if (this.gender == 'male') {
            const nameList1 = ["An", "Ar", "Bar", "Bel", "Con", "Cor", "Dan", "Dav", "El", "Er", "Fal", "Fin", "Flyn", "Gar", "Go", "Hal", "Hor", "Ido", "Ira", "Jan", "Jo", "Kas", "Kor", "La", "Lin", "Mar", "Mer", "Ne", "Nor", "Ori", "Os", "Pan", "Per", "Pim", "Quin", "Quo", "Ri", "Ric", "San", "Shar", "Tar", "Te", "Ul", "Uri", "Val", "Vin", "Wen", "Wil", "Xan", "Xo", "Yar", "Yen", "Zal", "Zen"];
            const nameList2 = ["ace", "amin", "bin", "bul", "dak", "dal", "der", "don", "emin", "eon", "fer", "fire", "gin", "hace", "horn", "kas", "kin", "lan", "los", "min", "mo", "nad", "nan", "ner", "orin", "os", "pher", "pos", "ras", "ret", "ric", "rich", "rin", "ry", "ser", "sire", "ster", "ton", "tran", "umo", "ver", "vias", "von", "wan", "wrick", "yas", "yver", "zin", "zor", "zu"];
            const randomNum1 = Math.floor(randomFunction() * nameList1.length);
            const randomNum2 = Math.floor(randomFunction() * nameList2.length);
            return nameList1[randomNum1] + nameList2[randomNum2];        
        }
        if (this.gender == 'female') {
            const nameList3 = ["An", "Ari", "Bel", "Bre", "Cal", "Chen", "Dar", "Dia", "Ei", "Eo", "Eli", "Era", "Fay", "Fen", "Fro", "Gel", "Gra", "Ha", "Hil", "Ida", "Isa", "Jay", "Jil", "Kel", "Kith", "Le", "Lid", "Mae", "Mal", "Mar", "Ne", "Ned", "Odi", "Ora", "Pae", "Pru", "Qi", "Qu", "Ri", "Ros", "Sa", "Shae", "Syl", "Tham", "Ther", "Tryn", "Una", "Uvi", "Va", "Ver", "Wel", "Wi", "Xan", "Xi", "Yes", "Yo", "Zef", "Zen"];
            const nameList4 = ["alyn", "ara", "brix", "byn", "caryn", "cey", "da", "dove", "drey", "elle", "eni", "fice", "fira", "grace", "gwen", "haly", "jen", "kath", "kis", "leigh", "la", "lie", "lile", "lienne", "lyse", "mia", "mita", "ne", "na", "ni", "nys", "ola", "ora", "phina", "prys", "rana", "ree", "ri", "ris", "sica", "sira", "sys", "tina", "trix", "ula", "vira", "vyre", "wyn", "wyse", "yola", "yra", "zana", "zira"];
            const randomNum1 = Math.floor(randomFunction() * nameList3.length);
            const randomNum2 = Math.floor(randomFunction() * nameList4.length);
            return nameList3[randomNum1] + nameList4[randomNum2];        
        }
    }
    randomLastName() {
        const nameList12 = ["amber", "apple", "autumn", "barley", "big", "boulder", "bramble", "bright", "bronze", "brush", "cherry", "cinder", "clear", "cloud", "common", "copper", "deep", "dust", "earth", "elder", "ember", "fast", "fat", "fern", "flint", "fog", "fore", "free", "glen", "glow", "gold", "good", "grand", "grass", "great", "green", "haven", "heart", "high", "hill", "hog", "humble", "keen", "laughing", "lea", "leaf", "light", "little", "lone", "long", "lunar", "marble", "mild", "mist", "moon", "moss", "night", "nimble", "proud", "quick", "raven", "reed", "river", "rose", "rumble", "shadow", "silent", "silver", "smooth", "soft", "spring", "still", "stone", "stout", "strong", "summer", "sun", "swift", "tall", "tea", "ten", "thistle", "thorn", "toss", "true", "twilight", "under", "warm", "whisper", "wild", "wise"];
        const nameList13 = ["ace", "barrel", "beam", "belly", "berry", "bloom", "blossom", "bluff", "bottle", "bough", "brace", "braid", "branch", "brand", "bridge", "brook", "brush", "cheeks", "cloak", "cobble", "creek", "crest", "dance", "dancer", "dew", "dream", "earth", "eye", "eyes", "feet", "fellow", "finger", "fingers", "flow", "flower", "foot", "found", "gather", "glide", "grove", "hand", "hands", "hare", "heart", "hill", "hollow", "kettle", "lade", "leaf", "man", "mane", "mantle", "meadow", "moon", "mouse", "pot", "rabbit", "seeker", "shadow", "shine", "sky", "song", "spark", "spell", "spirit", "step", "stride", "sun", "surge", "top", "topple", "vale", "water", "whistle", "willow", "wind", "wood", "woods"];
        const randomNum1 = randomFunction() * nameList12.length | 0;
        let randomNum2 = randomFunction() * nameList13.length | 0;
        while (nameList12[randomNum1] === nameList13[randomNum2]) {
            randomNum2 = randomFunction() * nameList13.length | 0;
        }
        return capitalizeFirstLetter(nameList12[randomNum1] + nameList13[randomNum2]);    
    }
}

class Halfelf extends Person {
    race = 'halfelf';
    maxAge = 180;
    adolescence = 20;
    haveKidsChance = 9;
    minHeight = 58;
    maxHeight = 76;
    minWeight = 102;
    maxWeight = 260;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        if (this.gender == 'male') {
            const nameList1 = ["Al", "Aro", "Bar", "Bel", "Cor", "Cra", "Dav", "Dor", "Eir", "El", "Fal", "Fril", "Gaer", "Gra", "Hal", "Hor", "Ian", "Ilo", "Jam", "Kev", "Kri", "Leo", "Lor", "Mar", "Mei", "Nil", "Nor", "Ori", "Os", "Pan", "Pet", "Quo", "Raf", "Ri", "Sar", "Syl", "Tra", "Tyr", "Uan", "Ul", "Van", "Vic", "Wal", "Wil", "Xan", "Xav", "Yen", "Yor", "Zan", "Zyl"];
            const nameList2 = ["avor", "ben", "borin", "coril", "craes", "deyr", "dithas", "elor", "enas", "faelor", "faerd", "finas", "fyr", "gotin", "gretor", "homin", "horn", "kas", "koris", "lamir", "lanann", "lumin", "minar", "morn", "nan", "neak", "neiros", "orin", "ovar", "parin", "phanis", "qarim", "qinor", "reak", "ril", "ros", "sariph", "staer", "torin", "tumil", "valor", "voril", "warith", "word", "xian", "xiron", "yeras", "ynor", "zaphir", "zaren"];
            const randomNum1 = Math.floor(randomFunction() * nameList1.length);
            const randomNum2 = Math.floor(randomFunction() * nameList2.length);
            return nameList1[randomNum1] + nameList2[randomNum2];
        }
        if (this.gender == 'female') {
            const nameList3 = ["Alu", "Aly", "Ar", "Bren", "Byn", "Car", "Co", "Dar", "Del", "El", "Eli", "Fae", "Fha", "Gal", "Gif", "Haly", "Ho", "Ile", "Iro", "Jen", "Jil", "Kri", "Kys", "Les", "Lora", "Ma", "Mar", "Mare", "Neri", "Nor", "Ol", "Ophi", "Phaye", "Pri", "Qi", "Que", "Rel", "Res", "Sael", "Saf", "Syl", "Ther", "Tyl", "Una", "Uri", "Ven", "Vyl", "Win", "Wol", "Xil", "Xyr", "Yes", "Yll", "Zel", "Zin"];
            const nameList4 = ["aerys", "anys", "bellis", "bwynn", "cerys", "charis", "diane", "dove", "elor", "enyphe", "faen", "fine", "galyn", "gwynn", "hana", "hophe", "kaen", "kilia", "lahne", "lynn", "mae", "malis", "mythe", "nalore", "noa", "nys", "ona", "phira", "pisys", "qarin", "qwyn", "rila", "rora", "seris", "stine", "sys", "thana", "theris", "tihne", "trana", "viel", "vyre", "walyn", "waris", "xaris", "xipha", "yaries", "yra", "zenya", "zira"];
            const randomNum1 = Math.floor(randomFunction() * nameList3.length);
            const randomNum2 = Math.floor(randomFunction() * nameList4.length);
            return nameList3[randomNum1] + nameList4[randomNum2];
        }
    }
    getFullName() {
        return this.name;
    }
}

class Halforc extends Person {
    race = 'halforc';
    maxAge = 75;
    adolescence = 14;
    haveKidsChance = 22;
    minHeight = 58;
    maxHeight = 80;
    minWeight = 137;
    maxWeight = 375;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        if (this.gender == 'male') {
            const nameList1 = ["Ag", "Agg", "Ar", "Arn", "As", "At", "Atr", "B", "Bar", "Bel", "Bor", "Br", "Brak", "C", "Cr", "D", "Dor", "Dr", "Dur", "G", "Gal", "Gan", "Gar", "Gna", "Gor", "Got", "Gr", "Gram", "Grim", "Grom", "Grum", "Gul", "H", "Hag", "Han", "Har", "Hog", "Hon", "Hor", "Hun", "Hur", "K", "Kal", "Kam", "Kar", "Kel", "Kil", "Kom", "Kor", "Kra", "Kru", "Kul", "Kur", "Lum", "M", "Mag", "Mahl", "Mak", "Mal", "Mar", "Mog", "Mok", "Mor", "Mug", "Muk", "Mura", "N", "Oggu", "Ogu", "Ok", "Oll", "Or", "Rek", "Ren", "Ron", "Rona", "S", "Sar", "Sor", "T", "Tan", "Th", "Thar", "Ther", "Thr", "Thur", "Trak", "Truk", "Ug", "Uk", "Ukr", "Ull", "Ur", "Urth", "Urtr", "Z", "Za", "Zar", "Zas", "Zav", "Zev", "Zor", "Zur", "Zus"];
            const nameList2 = ["a", "a", "a", "o", "o", "e", "i", "u", "u", "u"];
            const nameList3 = ["bak", "bar", "bark", "bash", "bur", "burk", "d", "dak", "dall", "dar", "dark", "dash", "dim", "dur", "durk", "g", "gak", "gall", "gar", "gark", "gash", "glar", "gul", "gur", "m", "mak", "mar", "marsh", "mash", "mir", "mur", "n", "nar", "nars", "nur", "rak", "rall", "rash", "rim", "rimm", "rk", "rsh", "rth", "ruk", "sk", "tar", "tir", "tur", "z", "zall", "zar", "zur"];
            const randomNum1 = Math.floor(randomFunction() * nameList1.length);
            const randomNum2 = Math.floor(randomFunction() * nameList2.length);
            const randomNum3 = Math.floor(randomFunction() * nameList3.length);
            return nameList1[randomNum1] + nameList2[randomNum2] + nameList3[randomNum3];
        }
        if (this.gender == 'female') {
            const nameList4 = ["Al", "Ar", "Br", "Ek", "El", "Fal", "Fel", "Fol", "Ful", "G", "Gaj", "Gar", "Gij", "Gor", "Gr", "Gry", "Gyn", "Hur", "K", "Kar", "Kat", "Ker", "Ket", "Kir", "Kot", "Kur", "Kut", "Lag", "M", "Mer", "Mir", "Mor", "N", "Ol", "Oot", "Puy", "R", "Rah", "Rahk", "Ras", "Rash", "Raw", "Roh", "Rohk", "S", "Sam", "San", "Sem", "Sen", "Sh", "Shay", "Sin", "Sum", "Sun", "Tam", "Tem", "Tu", "Tum", "Ub", "Um", "Ur", "Van", "Zan", "Zen", "Zon", "Zun"];
            const nameList5 = ["a", "a", "o", "o", "e", "i", "i", "u"];
            const nameList6 = ["d", "da", "dar", "dur", "g", "gar", "gh", "gri", "gu", "sh", "sha", "shi", "gum", "gume", "gur", "ki", "mar", "mi", "mira", "me", "mur", "ne", "ner", "nir", "nar", "nchu", "ni", "nur", "ral", "rel", "ri", "rook", "ti", "tah", "tir", "tar", "tur", "war", "z", "zar", "zara", "zi", "zur", "zura", "zira"];
            const randomNum1 = Math.floor(randomFunction() * nameList4.length);
            const randomNum2 = Math.floor(randomFunction() * nameList5.length);
            const randomNum3 = Math.floor(randomFunction() * nameList6.length);
            return nameList4[randomNum1] + nameList5[randomNum2] + nameList6[randomNum3];
        }
    }
    getFullName() {
        return this.name;
    }
}

class Human extends Person {
    race = 'human';
    maxAge = 100;
    adolescence = 18;
    haveKidsChance = 16;
    minHeight = 56;
    maxHeight = 78;
    minWeight = 107;
    maxWeight = 297;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
}

class Tabaxi extends Person {
    race = 'tabaxi';
    maxAge = 100;
    adolescence = 18;
    haveKidsChance = 16;
    minHeight = 61;
    maxHeight = 75;
    minWeight = 84;
    maxWeight = 272;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        const nameList1 = ["Afternoon Nap (Nap)", "Animal in the Woods (Woods)", "Answered Riddle (Riddle)", "Art of Shadows (Art)", "Aura of Passion (Aura)", "Aurora of Winter (Aurora)", "Autumn Harvest (Autumn)", "Beats of a Heart (Beats)", "Beauty of Summer (Summer)", "Beauty's Eye (Beauty)", "Belly of a Beast (Beast)", "Berry Bush (Bush)", "Big Heart (Big)", "Bird Feather (Bird)", "Bite Marks (Bite)", "Blank Board (Board)", "Blank Canvas (Canvas)", "Blazing Fire (Blaze)", "Blossoms in Summer (Blossom)", "Branch of a River (River)", "Breath of Fresh Air (Breath)", "Broken Chain (Chain)", "Bubble of a Cauldron (Bubble)", "Burden of Chains (Chains)", "Burning Desire (Desire)", "Burning Fire (Fire)", "Bush in the Forest (Forest)", "Bushy Branch (Branch)", "Busy Bee (Bee)", "Cadence of Water (Cadence)", "Cake of Chocolate (Cake)", "Call of a Bird (Bird)", "Call of the Owl (Owl)", "Call to Action (Action)", "Candle in the Dark (Candle)", "Cannon on Deck (Cannon)", "Carriage on the Road (Road)", "Clanking Bottle (Clank)", "Cloaking Dagger (Dagger)", "Cloud in the Sky (Sky)", "Coursing River (River)", "Cover of Clouds (Cover)", "Crescent Moon (Moon)", "Dangling Button (Button)", "Dangling Lace (Lace)", "Daydream at Night (Dream)", "Dew on the Grass (Dew)", "Dream of Days (Dream)", "Drifting Cloud (Cloud)", "Drifting Snowflake (Snowflake)", "Drop in a Pond (Drop)", "Dust of Chalk (Dust)", "Dust on the Road (Dust)", "Eclipse of the Moon (Eclipse)", "Edge of the World (Edge)", "End of Winter (Winter)", "Endless Time (Time)", "Fall of Water (Water)", "Fallen Twig (Twig)", "Fang of a Snake (Fang)", "Feather in the Wind (Feather)", "Fire in the Distance (Fire)", "Fish in the River (River)", "Flame of Passion (Passion)", "Flame of the Spirit (Flame)", "Flickering Fire (Fire)", "Flickering Flame (Flame)", "Flight of a Robin (Robin)", "Flow of the River (Flow)", "Flower in the Field (Flower)", "Flower of Ivory (Ivory)", "Forgotten Link (Link)", "Four-Leaf Clover (Clover)", "Fragrance of Spring (Spring)", "Friend of Foe (Friend)", "Gale of the Storm (Gale)", "Game of Chance (Game)", "Garden of Flowers (Flower)", "Gift of a Guest (Gift)", "Glow of the Sun (Sun)", "Grass of Spring (Grass)", "Guest at Home (Guest)", "Guide of Life (Guide)", "Hawk Feather (Hawk)", "Hen of the Flock (Hen)", "Hidden Depths (Depth)", "Hidden Treasure (Treasure)", "Hide of the Beast (Hide)", "High Noon (Noon)", "Honey of Bees (Honey)", "Hot Flame (Flame)", "Hot as Fire (Fire)", "Ice in Summer (Ice)", "Ice on the Lake (Ice)", "Ink on Skin (Ink)", "Jewel of the Mountain (Jewel)", "Kite in the Wind (Kite)", "Leaf on the Water (Leaf)", "Leaping Frog (Frog)", "Light in the Morning (Light)", "Lightning After Thunder (Lightning)", "Little Flower (Little)", "Lock on an Open Door (Lock)", "Locket on a Heart (Locket)", "Looping Coil (Coil)", "Loose String (String)", "Luck of the Draw (Luck)", "Marble in the Sky (Marble)", "Mark of Life (Mark)", "Melting of Snow (Snow)", "Mirror's Reflection (Mirror)", "Mist in the Morning (Mist)", "Mountain Boulder (Boulder)", "Needle in Hay (Needle)", "Night of Dreams (Night)", "Open Gates (Gate)", "Owl in the Morning (Owl)", "Page of a Book (Page)", "Paint on a Canvas (Paint)", "Patch in the Forest (Patch)", "Paw of a Bear (Paw)", "Peak of Mountains (Peak)", "Piece of the Puzzle (Piece)", "Plume in the Wind (Plume)", "Plume of Smoke (Smoke)", "Poem of Summer (Poem)", "Print of a Boot (Boot)", "Print of an Animal (Animal)", "Quill in the Grass (Quill)", "Rain in Summer (Rain)", "Rain of Fall (Rain)", "Rainbow After Rain (Rainbow)", "Rays of the Sun (Ray)", "Remnants of History (Remnant)", "Rhythm of Drums (Rhythm)", "Ringing of Bells (Bell)", "Rinkling Chains (Chains)", "Roar of a Bear (Roar)", "Rope in a Knot (Knot)", "Rustling of a Deer (Deer)", "Sailing Ship (Ship)", "Sand of the Beach (Sand)", "Sands of Time (Sand)", "Scarf in Summer (Scarf)", "Scratch on Wood (Scratch)", "Screech of Bats (Bat)", "Sea of Opportunity (Sea)", "Second Chance (Chance)", "Serpent Scale (Scale)", "Shadow of a Star (Shadow)", "Shadows in the Wind (Shadow)", "Sky Full of Stars (Sky)", "Sky of a Sunset (Sky)", "Sleight Hand (Hand)", "Smooth as Silk (Silk)", "Snapping Branch (Snap)", "Snow of the Mountain (Snow)", "Solstice of Summer (Solstice)", "Song of Paradise (Song)", "Sound of the Drum (Drum)", "Spark of Life (Spark)", "Sparkle of Light (Sparkle)", "Spell of Rain (Spell)", "Spots of a Leopard (Spot)", "Spring Blossom (Spring)", "Spring Winds (Spring)", "Star in the Morning (Star)", "Steady Rock (Rock)", "Stitch of Fabric (Stitch)", "Stone in Water (Stone)", "Storm at Sea (Sea)", "Storm on the Horizon (Storm)", "Strength of Love (Love)", "Stripes of a Tiger (Tiger)", "Stroke of a Brush (Brush)", "Summer Afternoon (Summer)", "Sunshine at Night (Sunshine)", "Tale of Wonder (Tale)", "Taste of Fruit (Taste)", "Three Tree (Three)", "Thrill of Life (Thrill)", "Thunder in the Morning (Thunder)", "Ticking Clock (Clock)", "Tome of Secrets (Tome)", "Top Card (Card)", "Trail in the Woods (Trail)", "Tree Blossom (Blossom)", "Tree in the Woods (Tree)", "Tricking Treat (Trick)", "Two River (River)", "Unpulled Cart (Cart)", "Unread Book (Book)", "Veil of Shadows (Veil)", "Veil of a Mask (Veil)", "Wave on the Shore (Wave)", "Windy Shore (Shore)", "Wing of an Angel (Angel)", "Winter Breath (Winter)", "Wish Upon a Star (Wish)", "Wonder of the World (Wonder)"];
        const nameList2 = ["Active", "Agile", "Amused", "Amusing", "Ancient", "Angelic", "Arctic", "Austere", "Bizarre", "Bold", "Brash", "Brave", "Bright", "Bronze", "Cheeky", "Clever", "Curious", "Defiant", "Dynamic", "Eager", "Elegant", "Elite", "Emerald", "Ethereal", "Faint", "Fine", "Five", "Flawless", "Four", "Fragile", "Fragrant", "Free", "Fresh", "Gentle", "Gold", "Golden", "Grand", "Half", "Happy", "Hearty", "Hidden", "Humble", "Hushed", "Icy", "Jade", "Jolly", "Kind", "Lazy", "Light", "Little", "Lone", "Lost", "Lucky", "Magic", "Mellow", "Merry", "Misty", "Mystery", "Nimble", "Odd", "Opal", "Prime", "Proud", "Pure", "Quick", "Quiet", "Quirky", "Radiant", "Rare", "Ruby", "Sapphire", "Secret", "Serene", "Seven", "Shady", "Silent", "Single", "Six", "Smooth", "Stout", "Subtle", "Sweet", "Swift", "Three", "Tranquil", "True", "Twin", "Two", "Velvet", "Vibrant", "Violet", "Wild"];
        const nameList3 = ["Animal", "Aspect", "Bat", "Beach", "Bear", "Beast", "Beauty", "Beetle", "Bell", "Berry", "Bird", "Bit", "Bite", "Block", "Board", "Boat", "Book", "Boot", "Bottle", "Brain", "Branch", "Breath", "Brush", "Bubble", "Bush", "Button", "Cable", "Cake", "Candle", "Candy", "Cannon", "Canvas", "Card", "Carriage", "Cart", "Chain", "Chains", "Chalk", "Chance", "Child", "Clock", "Cloud", "Clover", "Coil", "Deer", "Device", "Dream", "Drop", "Dust", "Edge", "Fang", "Feather", "Fire", "Fish", "Flame", "Flower", "Frog", "Game", "Garden", "Gate", "Gift", "Glove", "Grass", "Guest", "Guide", "Hen", "Hide", "Honey", "Ice", "Ink", "Jewel", "Kite", "Knot", "Lace", "Leaf", "Light", "Lightning", "Link", "Lock", "Locket", "Love", "Luck", "Marble", "Mark", "Mask", "Mirror", "Needle", "Night", "Owl", "Page", "Patch", "Path", "Peak", "Piece", "Plume", "Poem", "Quill", "Quilt", "Rain", "Riddle", "River", "Robin", "Rock", "Scale", "Scarf", "Scratch", "Sea", "Shadow", "Shoe", "Shore", "Silk", "Smoke", "Snow", "Snowflake", "Song", "Spark", "Sparkle", "Spell", "Star", "Stitch", "Stone", "Storm", "Straw", "Stream", "String", "Stripe", "Tale", "Thing", "Thrill", "Thunder", "Timber", "Time", "Tome", "Trail", "Tree", "Trick", "Veil", "Wave", "Wind", "Wing", "Wish", "Wonder"];
        if (doesRandomEventHappen(50)) {
            const randomNum1 = randomFunction() * nameList1.length | 0;
            return nameList1[randomNum1];
        }
        const randomNum1 = randomFunction() * nameList2.length | 0;
        const randomNum2 = randomFunction() * nameList3.length | 0;
        const nameType = randomFunction() * 2 | 0;
        if (nameType === 0) {
            return nameList2[randomNum1] + " " + nameList3[randomNum2] + " (" + nameList2[randomNum1] + ")";
        } else {
            return nameList2[randomNum1] + " " + nameList3[randomNum2] + " (" + nameList3[randomNum2] + ")";
        }
    }
    getFullName() {
        return this.name;
    }
}

class Tiefling extends Person {
    race = 'tiefling';
    maxAge = 110;
    adolescence = 18;
    haveKidsChance = 15;
    minHeight = 60;
    maxHeight = 70;
    minWeight = 104;
    maxWeight = 244;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    getFullName() {
        return this.name;
    }
    randomFirstName() {
        if (doesRandomEventHappen(50)) {
            const nameList3 = ["Achievement", "Adventure", "Aid", "Ambition", "Anguish", "Art", "Ashes", "Atonement", "Awe", "Bliss", "Bright", "Carrion", "Carrior", "Chant", "Cheer", "Cherish", "Closed", "Comfort", "Compassion", "Confidence", "Content", "Courage", "Creed", "Cunning", "Darkness", "Death", "Debauchery", "Deceit", "Delight", "Desire", "Despair", "Devotion", "Dexterity", "Different", "Doom", "Doubt", "Dread", "Ecstasy", "End", "Enduring", "Ennui", "Entropy", "Essential", "Esteem", "Eternal", "Euphoria", "Excellence", "Exceptional", "Exciting", "Expert", "Expertise", "Expressive", "Extreme", "Faith", "Fear", "Flawed", "Free", "Freedom", "Fresh", "Gentle", "Gladness", "Glee", "Gloom", "Glory", "Gluttony", "Grief", "Happiness", "Happy", "Harmony", "Hate", "Hatred", "Hero", "Hope", "Horror", "Hunt", "Hymn", "Ideal", "Ignominy", "Immortal", "Innovation", "Interesting", "Journey", "Joy", "Laughter", "Life", "Light", "Love", "Loyal", "Lust", "Mantra", "Master", "Mastery", "Mayhem", "Misery", "Mockery", "Murder", "Muse", "Music", "Mystery", "Normal", "Nowhere", "Odd", "Open", "Optimal", "Pain", "Panic", "Passion", "Perfect", "Piety", "Pleasure", "Poetry", "Possession", "Promise", "Psalm", "Pure", "Quest", "Random", "Rare", "Recovery", "Redemption", "Regular", "Relentless", "Respect", "Reverence", "Revulsion", "Sadness", "Sanctity", "Silence", "Skilled", "Sly", "Song", "Sorrow", "Suffering", "Temerity", "Terror", "Timeless", "Torment", "Tragedy", "Trickery", "Trouble", "Trust", "Truth", "Uncommon", "Unlocked", "Vice", "Virtue", "Void", "Voyage", "Weary", "Winning", "Wit", "Woe"];
            const randomNum1 = randomFunction() * nameList3.length | 0;
            return nameList3[randomNum1];
        }
        if (this.gender == 'male') {
            var nameList1 = ["Aet", "Ak", "Am", "Aran", "And", "Ar", "Ark", "Bar", "Car", "Cas", "Dam", "Dhar", "Eb", "Ek", "Er", "Gar", "Gu", "Gue", "Hor", "Ia", "Ka", "Kai", "Kar", "Kil", "Kos", "Ky", "Loke", "Mal", "Male", "Mav", "Me", "Mor", "Neph", "Oz", "Ral", "Re", "Rol", "Sal", "Sha", "Sir", "Ska", "The", "Thy", "Thyne", "Ur", "Uri", "Val", "Xar", "Zar", "Zer", "Zher", "Zor"];
            var nameList2 = ["adius", "akas", "akos", "char", "cis", "cius", "dos", "emon", "ichar", "il", "ilius", "ira", "lech", "lius", "lyre", "marir", "menos", "meros", "mir", "mong", "mos", "mus", "non", "rai", "rakas", "rakir", "reus", "rias", "ris", "rius", "ron", "ros", "rus", "rut", "shoon", "thor", "thos", "thus", "us", "venom", "vir", "vius", "xes", "xik", "xikas", "xire", "xius", "xus", "zer", "zire"];
            const randomNum1 = randomFunction() * nameList1.length | 0;
            const randomNum2 = randomFunction() * nameList2.length | 0;
            return nameList1[randomNum1] + nameList2[randomNum2];        
        }
        if (this.gender == 'female') {
            var nameList4 = ["Af", "Agne", "Ani", "Ara", "Ari", "Aria", "Bel", "Bri", "Cre", "Da", "Di", "Dim", "Dor", "Ea", "Fri", "Gri", "His", "In", "Ini", "Kal", "Le", "Lev", "Lil", "Ma", "Mar", "Mis", "Mith", "Na", "Nat", "Ne", "Neth", "Nith", "Ori", "Pes", "Phe", "Qu", "Ri", "Ro", "Sa", "Sar", "Seiri", "Sha", "Val", "Vel", "Ya", "Yora", "Yu", "Za", "Zai", "Ze"];
            var nameList5 = ["bis", "borys", "cria", "cyra", "dani", "doris", "faris", "firith", "goria", "grea", "hala", "hiri", "karia", "ki", "laia", "lia", "lies", "lista", "lith", "loth", "lypsis", "lyvia", "maia", "meia", "mine", "narei", "nirith", "nise", "phi", "pione", "punith", "qine", "rali", "rissa", "seis", "solis", "spira", "tari", "tish", "uphis", "vari", "vine", "wala", "wure", "xibis", "xori", "yis", "yola", "za", "zes"];
            const randomNum1 = randomFunction() * nameList4.length | 0;
            const randomNum2 = randomFunction() * nameList5.length | 0;
            return nameList4[randomNum1] + nameList5[randomNum2];        
        }
    }
}

class Tortle extends Person {
    race = 'tortle';
    maxAge = 50;
    adolescence = 15;
    haveKidsChance = 55;
    minHeight = 57;
    maxHeight = 79;
    minWeight = 372;
    maxWeight = 562;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        const nameList1 = ["", "", "", "", "b", "d", "g", "j", "k", "kr", "l", "n", "pl", "q", "s", "t", "w", "x", "y"];
        const nameList2 = ["ue", "uo", "ua", "ia", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u"];
        const nameList3 = ["b", "d", "k", "l", "lb", "ld", "lk", "m", "n", "nn", "nl", "nq", "nqw", "qw", "p", "pp", "r", "rdl", "rt", "rtl", "z", "zl"];
        const nameList4 = ["y", "a", "e", "i", "o", "u", "a", "e", "i", "o", "u"];
        const nameList5 = ["", "", "", "", "", "c", "d", "g", "k", "l", "ll", "m", "n", "r", "t", "tt"];
        const nameType = randomFunction() * 3 | 0;
        let randomNum1 = randomFunction() * nameList1.length | 0;
        const randomNum2 = randomFunction() * nameList2.length | 0;
        const randomNum3 = randomFunction() * nameList5.length | 0;
        if (nameType === 0) {
            while (nameList1[randomNum1] === "" && nameList5[randomNum3] === "") {
                randomNum1 = randomFunction() * nameList1.length | 0;
            }
            return capitalizeFirstLetter(nameList1[randomNum1] + nameList2[randomNum2] + nameList5[randomNum3]);
        } else {
            const randomNum4 = randomFunction() * nameList4.length | 0;
            const randomNum5 = randomFunction() * nameList3.length | 0;
            return capitalizeFirstLetter(nameList1[randomNum1] + nameList2[randomNum2] + nameList3[randomNum5] + nameList4[randomNum4] + nameList5[randomNum3]);
        }
    }
    getFullName() {
        return this.name;
    }
}

class Warforged extends Person {
    race = 'warforged';
    // warforged have no max age??? but the average age is between 2 and 30????
    maxAge = 100;
    adolescence = 18;
    haveKidsChance = 16;
    minHeight = 73;
    maxHeight = 79;
    minWeight = 282;
    maxWeight = 312;

    constructor() {
        super();
        if (!this.adultHeight) this.generateHeight();
        if (!this.adultWeight) this.generateWeight();
    }
    generateHeight() {
        this.adultHeight = getRandomNumberInRange(this.minHeight, this.maxHeight);
    }
    generateWeight() {
        this.adultWeight = getRandomNumberInRange(this.minWeight, this.maxWeight);
    }
    randomFirstName() {
        const nameList1 = ["Abider", "Achiever", "Actor", "Adapter", "Adviser", "Aegis", "Agent", "Animal", "Apparatus", "Armament", "Artist", "Audience", "Author", "Awakener", "Basher", "Bastion", "Battler", "Bear", "Beast", "Beauty", "Beetle", "Bender", "Binder", "Blade", "Book", "Booster", "Boot", "Bouncer", "Brain", "Brander", "Brawler", "Breaker", "Bringer", "Browser", "Bruiser", "Buffet", "Bug", "Builder", "Bulwark", "Calmer", "Candle", "Cannon", "Carer", "Carriage", "Carrier", "Cart", "Carver", "Case", "Caster", "Catcher", "Chain", "Chains", "Challenger", "Champion", "Chaperon", "Charger", "Chaser", "Chopper", "Claymore", "Cleaver", "Climber", "Clock", "Club", "Clubber", "Coil", "Commander", "Controller", "Cook", "Counter", "Creator", "Creature", "Creese", "Crew", "Croaker", "Crow", "Crumbler", "Crusher", "Curator", "Curtana", "Custodian", "Cutlas", "Cutlass", "Cutter", "Dagger", "Data", "Dealer", "Decipherer", "Defender", "Definer", "Delver", "Designer", "Destroyer", "Diagnoser", "Director", "Dirk", "Diver", "Doctor", "Dozer", "Dreamer", "Drifter", "Driver", "Drone", "Echo", "Edge", "Enchanter", "Epee", "Eraser", "Estoc", "Etcher", "Examiner", "Expert", "Falchion", "Familiar", "Fighter", "Figure", "Fire", "Five", "Flail", "Flame", "Fluke", "Foil", "Follower", "Forger", "Four", "Friend", "Fumbler", "Gasher", "Gauger", "Ghost", "Giant", "Gift", "Glaive", "Glancer", "Griller", "Grunter", "Guardian", "Guest", "Guide", "Hacker", "Hammer", "Handler", "Heart", "Help", "Hook", "Horn", "Host", "Hummer", "Hunter", "Image", "Inspector", "Iron", "Judge", "Junior", "Jury", "Katana", "Kid", "Killer", "Knife", "Knocker", "Kris", "Launcher", "Leaper", "Lifter", "Lock", "Locket", "Lurker", "Mace", "Machine", "Mark", "Marker", "Mask", "Masker", "Mauler", "Melter", "Menace", "Mentor", "Merger", "Metal", "Mime", "Mistake", "Model", "Molder", "Murderer", "Nameless", "Needle", "Nemo", "Novice", "Nurse", "Observer", "Officer", "Ogler", "One", "Ornament", "Painter", "Passenger", "Patient", "Patriot", "Pierce", "Pilot", "Pious", "Player", "Porter", "Preacher", "Pretender", "Prize", "Probe", "Protector", "Prowler", "Punisher", "Query", "Ravager", "Reader", "Reckoner", "Relic", "Render", "Rescuer", "Responder", "Reviewer", "Rider", "Rune", "Saber", "Sabre", "Safeguard", "Salvager", "Saviour", "Scimitar", "Scorcher", "Scratcher", "Scrubber", "Searcher", "Security", "Seeker", "Senior", "Senser", "Sentinel", "Sentry", "Servant", "Shaper", "Shepherd", "Shield", "Shielder", "Shredder", "Slasher", "Slicer", "Smasher", "Smiter", "Snooper", "Spark", "Sparkle", "Special", "Spirit", "Sprinter", "Sprite", "Squasher", "Stalker", "Status", "Steel", "Steeple", "Stick", "Sticks", "Stitcher", "Striker", "Student", "Stumbler", "Subject", "Suit", "Sunderer", "Supporter", "Surveyor", "Sword", "Tackler", "Taunter", "Teacher", "Teaser", "Tempter", "Tester", "Thief", "Thinker", "Three", "Thunder", "Tinkerer", "Titan", "Toad", "Toledo", "Tutor", "Twister", "Two", "Undoer", "Unit", "Unmaker", "Unsung", "Vessel", "Victor", "Visitor", "Voice", "Walker", "Ward", "Warden", "Watcher", "Whisperer", "Wielder", "Winker", "Winner", "Wonderer", "Wrestler", "Zealot", "Zero"];
        const randomNum1 = randomFunction() * nameList1.length | 0;
        return nameList1[randomNum1];
    }
    getFullName() {
        return this.name;
    }
}