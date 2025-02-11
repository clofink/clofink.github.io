class ExternalContactsTab extends Tab {
    tabName = "External Contacts";

    schemas;
    contactFields = {
        // "ID": "id",
        "First Name": "firstName",
        "Middle Name": "middleName",
        "Last Name": "lastName",
        "Salutation": "salutation",
        "Title": "title",
        "Work Phone": "workPhone.display",
        "Cell Phone": "cellPhone.display",
        "Home Phone": "homePhone.display",
        "Other Phone": "otherPhone.display",
        "Work Email": "workEmail",
        "Personal Email": "personalEmail",
        "Other Email": "otherEmail",
        "Address Line 1": "address.address1",
        "Address Line 2": "address.address2",
        "City": "address.city",
        "State": "address.state",
        "Postal Code": "address.postalCode",
        "Country Code": "address.countryCode",
        "Survey Opt Out": "surveyOptOut",
        "Schema ID": "schema.id",
        "Schema Version": "schema.version" // required to import with the schema
    }

    render() {
        window.requiredFields = ["First Name", "Last Name"];
        window.allValidFields = ["Queue Name", "Wrap-Up Codes"];

        this.container = newElement('div', { id: "userInputs" });
        const label = newElement('label', { innerText: "External Contacts CSV: " });
        const fileInput = newElement('input', { type: "file", accept: ".csv" });
        addElement(fileInput, label);
        registerElement(fileInput, "change", loadFile);
        const importButton = newElement('button', { innerText: "Import" });
        registerElement(importButton, "click", () => {
            showLoading(async () => { return this.importContacts() }, this.container);
        });
        const exportButton = newElement('button', { innerText: "Export" });
        registerElement(exportButton, "click", () => {
            showLoading(async () => { return this.exportContacts() }, this.container);
        });
        const logoutButton = newElement("button", { innerText: "Logout" });
        registerElement(logoutButton, "click", logout);
        const helpSection = addHelp([
            `Must have "routing" scope`,
            `Required CSV columns "Queue Name" and "Wrap-Up Codes"`,
            `Wrap-Up Codes column is a comma-separated list of wrap-up codes`,
            `If the code does not exist, it will be created`,
            `Wrap-Up Codes are only added. If there are already codes on a queue, they will not be removed.`
        ]);
        const exampleLink = createDownloadLink("Wrapup Codes Example.csv", Papa.unparse([window.allValidFields]), "text/csv");
        addElements([label, importButton, exportButton, logoutButton, helpSection, exampleLink], this.container);
        return this.container;
    }

    async exportContacts() {
        const contacts = await getAllGenesysItems("/api/v2/externalcontacts/contacts?sortOrder=lastName:asc,firstName:asc,middleName:asc", 100, "entities");
        this.schemas = this.schemas || await makeGenesysRequest("/api/v2/externalcontacts/contacts/schemas");

        const possibleCustomFields = {};
        for (const schema of this.schemas.entities) {
            for (const property in schema.jsonSchema.properties) {
                possibleCustomFields[`Custom: ${schema.jsonSchema.properties[property].title}`] = `customFields.${property}`;
            }
        }

        const data = [];
        for (let contact of contacts) {
            const contactData = [];
            for (let field in this.contactFields) {
                contactData.push(this.addIfProperty(contact, this.contactFields[field]));
            }
            for (let field in possibleCustomFields) {
                contactData.push(this.addIfProperty(contact, possibleCustomFields[field]));
            }
            data.push(contactData);
        }

        const download = createDownloadLink("External Contacts.csv", Papa.unparse([Object.keys({ ...this.contactFields, ...possibleCustomFields }), ...data]), "text/csv");
        download.click();
    }

    async importContacts() {
        if (!fileContents) throw "No valid file selected";
        this.schemas = this.schemas || await makeGenesysRequest("/api/v2/externalcontacts/contacts/schemas");

        const possibleCustomFields = {};
        for (const schema of this.schemas.entities) {
            for (const property in schema.jsonSchema.properties) {
                possibleCustomFields[`Custom: ${schema.jsonSchema.properties[property].title}`] = `customFields.${property}`;
            }
        }
        const fields = { ...this.contactFields, ...possibleCustomFields };

        const results = [];
        const newContacts = [];
        for (let row of fileContents.data) {
            if (Object.keys(row).length < 2) continue;
            newContacts.push(this.parseInput(this.resolveMapping(row, fields), fields));
        }

        await this.addContacts(newContacts, results);
        return results;
    }

    async addContacts(contacts, results) {
        while (contacts.length > 0) {
            const subGroup = contacts.splice(0, 50);
            const response = await makeGenesysRequest("/api/v2/externalcontacts/bulk/contacts/add", "POST", {entities: subGroup});
            for (let result of response.results) {
                const resultName = `${result.entity?.firstName || ""} ${result.entity?.lastName || ""}`
                if (result.hasOwnProperty('error')) {
                    results.push({name: resultName, type: "External Contact", status: "failed", error: result.error?.message || ""});
                }
                else {
                    results.push({name: resultName, type: "External Contact", status: "success"});
                }
            }
        }
    }

    parseInput(inputObj) {
        const newObj = {};
        for (const key in inputObj) {
            if (inputObj[key] === undefined || inputObj[key] === null) continue; // skips empty values
            let currentLevel = newObj;
            const parts = key.split(".");
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!currentLevel.hasOwnProperty(part)) {
                    if (i === parts.length - 1) {
                        currentLevel[part] = inputObj[key];
                    }
                    else {
                        currentLevel[part] = {};
                        currentLevel = currentLevel[part];
                    }
                }
                else {
                    currentLevel = currentLevel[part];
                }
            }
        }
        return newObj;
    }

    resolveMapping(inputObj, validConfigProperties) {
        const newObj = {};
        for (let key in inputObj) {
            if (validConfigProperties.hasOwnProperty(key)) {
                newObj[validConfigProperties[key]] = inputObj[key];
            }
        }
        return newObj;
    }

    addIfProperty(object, path, orValue = "") {
        const pathParts = path.split(".");
        let currentPiece = object;
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (Array.isArray(currentPiece)) {
                const displayList = [];
                for (let item of currentPiece) {
                    const hasPart = item.hasOwnProperty(part);
                    if (hasPart) {
                        if (typeof item[part] === "object") {
                            displayList.push(JSON.stringify(item[part]));
                            continue;
                        }
                        displayList.push(item[part])
                    }
                }
                return displayList.join("\n")
            }
            const hasPart = currentPiece.hasOwnProperty(part);
            if (hasPart && i + 1 < pathParts.length) {
                currentPiece = currentPiece[part];
                continue;
            }
            if (hasPart) {
                if (Array.isArray(currentPiece[part])) {
                    const displayList = [];
                    for (let item of currentPiece[part]) {
                        if (typeof item === "object") {
                            displayList.push(JSON.stringify(item));
                            continue;
                        }
                        displayList.push(item)
                    }
                    return displayList.join("\n")
                }
                if (typeof currentPiece[part] === "object") {
                    return JSON.stringify(currentPiece[part])
                }
                return currentPiece[part]
            }
            else return orValue;
        }
        return orValue;
    }
}