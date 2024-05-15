class TabContainer {
    tabs = [];
    tabHeaders = [];
    currentIndex = 0;

    constructor(tabs) {
        this.tabContainer = newElement('div', { id: "tabContainer" });
        this.tabList = newElement('div', { id: "tabList" });
        this.tabContent = newElement('div', { id: "tabContent" });
        addElements([this.tabList, this.tabContent], this.tabContainer);
        this.addTabs(tabs);
        return this;
    }

    getTabContainer() {
        return this.tabContainer;
    }
    addTab(tab) {
        if (!tab instanceof Tab) {
            throw "Tab must be instance of Tab";
        }
        this.tabs.push(tab);
        const tabHeader = newElement("div", { class: ["tabHeader"], innerText: tab.getName() });
        registerElement(tabHeader, "click", (event) => { this.selectTab(this.tabHeaders.indexOf(event.target)) });
        this.tabHeaders.push(tabHeader);
        addElement(tabHeader, this.tabList);
        if (this.tabs.length === 1) {
            this.selectTab(0);
        }
    }
    addTabs(tabs) {
        for (let tab of tabs) {
            this.addTab(tab);
        }
    }
    renderTab(tab) {
        clearElement(this.tabContent);
        addElement(tab.render(), this.tabContent);
    }
    selectTab(index) {
        this.unmarkAllHeaders();
        this.markSelected(this.tabHeaders[index]);
        this.renderTab(this.tabs[index]);
    }
    markSelected(tabHeader) {
        tabHeader.classList.add("selected");
    }
    unmarkAllHeaders() {
        for (let tabHeader of this.tabHeaders) {
            tabHeader.classList.remove("selected");
        }
    }
}

class Tab {
    tabName;

    constructor(tabName) {
        this.tabName = tabName;
    }
    render() {
        const container = newElement("div", { innerText: "This is: " + this.tabName });
        return container;
    }
    getName() {
        return this.tabName;
    }
}

class PagedTable {
    headers;
    fullData;
    pageSize;
    emptyValue;
    currentPage;
    pageCount;
    filteredData;
    sortable;
    filtered;
    filters = [];

    constructor(headers, dataRows, pageSize, tableInfo, sortable, filtered, emptyValue) {
        this.headers = headers || [];
        this.fullData = dataRows || [];
        this.pageSize = pageSize || 0;
        this.filteredData = this.fullData;
        this.currentPage = 0;
        this.sortable = sortable !== undefined ? sortable : false;
        this.filtered = filtered !== undefined ? filtered : false;
        this.emptyValue = emptyValue !== undefined ? emptyValue : "";

        this.container = newElement('div', { class: ["tableContainer"] });
        this.table = newElement("table", tableInfo);
        if (this.sortable) this.table.classList.add('sortable');

        this.headerRow = this.createHeaderRow(headers);
        addElement(this.headerRow, this.table);

        this.buttonContainer = newElement("div", { class: ["pageButtons"] });
        this.updateTable();
        this.updateButtons();

        addElements([this.table, this.buttonContainer], this.container);

        return this;
    }

    applyFilters() {
        let filteredRows = this.fullData;
        for (let i = 0; i < this.filters.length; i++) {
            const currentFilter = this.filters[i];
            if (!currentFilter) continue;
            const newFiltered = []
            for (let row of filteredRows) {
                let currentValue = row[i].toString().toLowerCase().trim();
                if (row[i] instanceof Element) currentValue = row[i].innerText.toLowerCase().trim();

                if (currentValue.indexOf(currentFilter) >= 0) {
                    newFiltered.push(row);
                }
            }
            filteredRows = newFiltered;
        }
        this.filteredData = filteredRows;
        this.setPage(0);
    }

    getContainer() {
        return this.container;
    }

    setPageSize(newSize) {
        if (newSize === this.pageSize) return;
        this.pageSize = newSize;
        this.setPage(0);
    }

    changePage(pageChange) {
        this.currentPage += pageChange;

        this.updateButtons();
        this.updateTable();
    }

    getHeaders() {
        return this.headers;
    }
    
    getFullData() {
        return this.fullData;
    }

    getFilteredData() {
        return this.filteredData;
    }

    updateTable() {
        clearElement(this.table, "tr:has(td)");
        const startIndex = this.pageSize * this.currentPage;
        const dataLength = this.filteredData.length;
        const endIndex = startIndex + this.pageSize < dataLength ? startIndex + this.pageSize : dataLength;
        for (let i = startIndex; i < endIndex; i++) {
            const tableRow = this.createRow(this.filteredData[i]);
            addElement(tableRow, this.table);
        }
    }

    setPage(pageNum) {
        this.currentPage = pageNum;
        this.updateButtons();
        this.updateTable();
    }

    createRow(rowData) {
        const tableRow = newElement('tr');
        for (let data of rowData) {
            const tableData = newElement('td', { innerText: data });
            addElement(tableData, tableRow);
        }
        return tableRow;
    }

    createHeaderRow(headerData) {
        const headerRow = newElement('tr');
        for (let header of headerData) {
            const headerData = {};
            const headerLabel = newElement('span', { innerText: header });
            if (this.sortable) {
                headerLabel.dataset.sortDirection = "desc";
                headerLabel.dataset.currentSort = "false";
            }
            const tableHeader = newElement('th', headerData);
            addElement(headerLabel, tableHeader);
            if (this.filtered) this.addHeaderFiltering(tableHeader);
            if (this.sortable) this.addHeaderSorting(headerLabel);
            addElement(tableHeader, headerRow);
        }
        return headerRow;
    }

    addHeaderSorting(element) {
        registerElement(element, "click", (event) => {
            this.sortTable(event, this.headers, this.filteredData);
            this.updateTable();
            this.setPage(0);
        });
    }

    addHeaderFiltering(element) {
        const tableSearchBar = newElement("input");
        registerElement(tableSearchBar, "input", (event) => {
            const headerIndex = this.headers.indexOf(element.innerText);
            const newSearchString = event.target.value.toLowerCase().trim();
            this.filters[headerIndex] = newSearchString;
            this.applyFilters();
        })
        addElement(tableSearchBar, element);
    }

    updateButtons() {
        this.pageCount = Math.ceil(this.filteredData.length / this.pageSize);

        clearElement(this.buttonContainer);
        const previousAll = newElement("button", { innerText: "<<" });
        registerElement(previousAll, "click", () => { this.setPage(0) });
        addElement(previousAll, this.buttonContainer);
        if (this.currentPage <= 1) {
            previousAll.setAttribute("disabled", true);
        }
        const previousButton = newElement("button", { innerText: "<" });
        registerElement(previousButton, "click", () => { this.changePage(-1) });
        addElement(previousButton, this.buttonContainer);
        if (this.currentPage === 0) {
            previousButton.setAttribute("disabled", true);
        }
        const pageCount = newElement("span", { innerText: `${this.currentPage + 1}/${this.pageCount}` })
        addElement(pageCount, this.buttonContainer);
        const nextButton = newElement("button", { innerText: ">" });
        registerElement(nextButton, "click", () => { this.changePage(1) });
        addElement(nextButton, this.buttonContainer);
        if (this.currentPage >= this.pageCount - 1) {
            nextButton.setAttribute("disabled", true);
        }
        const nextAll = newElement("button", { innerText: ">>" });
        registerElement(nextAll, "click", () => { this.setPage(this.pageCount - 1) });
        addElement(nextAll, this.buttonContainer);
        if (this.currentPage >= this.pageCount - 2) {
            nextAll.setAttribute("disabled", true);
        }
        const pageSizeToggle = newElement("select");
        for (let size of [25, 50, 100, 250]) {
            const pageSizeOption = newElement("option", {value: size, innerText: size});
            if (size === this.pageSize) {
                pageSizeOption.setAttribute("selected", true);
            }
            addElement(pageSizeOption, pageSizeToggle);
        }
        registerElement(pageSizeToggle, "change", () => { this.setPageSize(parseInt(pageSizeToggle.value, 10)) });
        addElements([previousAll, previousButton, nextButton, nextAll, pageSizeToggle], this.buttonContainer);
        return this.buttonContainer;
    }

    sortTable(event) {
        const sortBy = event.target.innerText;
        const sortDirection = event.target.dataset.sortDirection;
        const headers = this.headers;
        const emptyValue = this.emptyValue;
        // this header is the one currently sorted by
        if (event.target.dataset.currentSort !== "true") {
            for (let header of qsa("th span", this.headerRow)) {
                header.dataset.currentSort = "false";
            }
            event.target.dataset.currentSort = "true";
        }
        if (sortDirection === 'asc') {
            event.target.dataset.sortDirection = 'desc';
        }
        else if (sortDirection === 'desc') {
            event.target.dataset.sortDirection = 'asc';
        }

        this.filteredData.sort(customSort);

        function customSort(a, b) {
            const headerIndex = headers.indexOf(sortBy);
            let valueA;
            let valueB;
            if (a[headerIndex] instanceof Element) {
                valueA = a[headerIndex].innerText;
            }
            else {
                valueA = a[headerIndex];
            }
            if (b[headerIndex] instanceof Element) {
                valueB = b[headerIndex].innerText;
            }
            else {
                valueB = b[headerIndex];
            }

            valueA = /^[\d\.]+$/.test(valueA) && !isNaN(parseInt(valueA)) ? parseInt(valueA) : valueA;
            valueB = /^[\d\.]+$/.test(valueA) && !isNaN(parseInt(valueB)) ? parseInt(valueB) : valueB;

            valueA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3}){0,1}Z$/.test(valueA) ? new Date(valueA) : valueA;
            valueB = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3}){0,1}Z$/.test(valueB) ? new Date(valueB) : valueB;

            if (sortDirection === "asc") {
                if (valueA === emptyValue) return 1;
                if (valueB === emptyValue) return -1;
                if (valueA < valueB) {
                    return 1;
                }
                if (valueA > valueB) {
                    return -1;
                }
            }
            else {
                if (valueA === emptyValue) return 1;
                if (valueB === emptyValue) return -1;
                if (valueA > valueB) {
                    return 1;
                }
                if (valueA < valueB) {
                    return -1;
                }
            }
            return 0;
        }
    }
}

class PagedView {
    fullData;
    pageSize;
    pageCount;
    currentPage;
    currentPageData;

    constructor(pagesData, pageRenderFunc, leavePageFunc) {
        this.pageSize = 1;
        this.fullData = pagesData;
        this.currentPage = 0;
        this.currentPageData = pagesData[this.currentPage];
        this.render = pageRenderFunc || this.renderPage;
        this.leave = leavePageFunc || this.leavePage;

        this.container = newElement('div', { class: ["pagesContainer"] });
        this.pageContainer = newElement('div', { class: ["pageContainer"] });

        this.buttonContainer = newElement("div", { class: ["pageButtons"] });
        this.updatePage();
        this.updateButtons();

        addElements([this.pageContainer, this.buttonContainer], this.container);

        return this;
    }

    renderPage(pageData) {
        return newElement("div", {innerText: JSON.stringify(pageData, null, 4)});
    }

    leavePage(pageData) {
        log("leaving page");
    }

    addPage(newPageData) {
        this.fullData.push(newPageData);
        this.updateButtons();
    }

    updatePageData(newPageData) {
        this.fullData[this.currentPage] = newPageData;
        this.updatePage();
    }

    getContainer() {
        return this.container;
    }

    getCurrentPageData() {
        return this.currentPageData;
    }

    setPageSize(newSize) {
        if (newSize === this.pageSize) return;
        this.pageSize = newSize;
        this.setPage(0);
    }

    changePage(pageChange) {
        this.leave(this.currentPageData);
        this.currentPage += pageChange;
        this.currentPageData = this.fullData[this.currentPage];
        this.updateButtons();
        this.updatePage();
    }

    updatePage() {
        clearElement(this.pageContainer);
        addElement(this.render(this.currentPageData), this.pageContainer);
    }

    setPage(pageNum) {
        this.currentPage = pageNum;
        this.currentPageData = this.fullData[pageNum];
        this.updateButtons();
        this.updatePage();
    }

    updateButtons() {
        this.pageCount = Math.ceil(this.fullData.length / this.pageSize);

        clearElement(this.buttonContainer);
        const previousAll = newElement("button", { innerText: "<<" });
        registerElement(previousAll, "click", () => { this.setPage(0) });
        addElement(previousAll, this.buttonContainer);
        if (this.currentPage <= 1) {
            previousAll.setAttribute("disabled", true);
        }
        const previousButton = newElement("button", { innerText: "<" });
        registerElement(previousButton, "click", () => { this.changePage(-1) });
        addElement(previousButton, this.buttonContainer);
        if (this.currentPage === 0) {
            previousButton.setAttribute("disabled", true);
        }
        const pageCount = newElement("span", { innerText: `${this.currentPage + 1}/${this.pageCount}` })
        const nextButton = newElement("button", { innerText: ">" });
        registerElement(nextButton, "click", () => { this.changePage(1) });
        addElement(nextButton, this.buttonContainer);
        if (this.currentPage >= this.pageCount - 1) {
            nextButton.setAttribute("disabled", true);
        }
        const nextAll = newElement("button", { innerText: ">>" });
        registerElement(nextAll, "click", () => { this.setPage(this.pageCount - 1) });
        addElement(nextAll, this.buttonContainer);
        if (this.currentPage >= this.pageCount - 2) {
            nextAll.setAttribute("disabled", true);
        }
        addElements([previousAll, previousButton, pageCount, nextButton, nextAll], this.buttonContainer);
        return this.buttonContainer;
    }

}

class DependentForm {
    // fields can only depend on other fields in the same form
    // forms can only depend on fields in parent form?
    container;
    fieldsContainer;
    childFormsContainer;
    formInfo;
    constructor(structure) {
        this.formInfo = structure;
        this.container = newElement('div', { class: ["formContainer"] });
        this.fieldsContainer = newElement('div', { class: ["fieldsContainer"] });
        this.childFormsContainer = newElement('div', { class: ["childFormContainer"] });
        addElements([this.fieldsContainer, this.childFormsContainer], this.container);
        this.createForm(structure);
        return this;
    }
    getContainer() {
        return this.container;
    }
    createForm(form) {
        for (let field of form.fields) {
            addElement(this.createField(field), this.fieldsContainer);
        }
        if (form.hasOwnProperty('children') && form.children.length > 0) {
            for (let child of form.children) {
                const childForm = new DependantForm(child);
                addElement(childForm.getContainer(), this.childFormsContainer);
            }
        }
        if (form.hasOwnProperty('isMultiple') && form.isMultiple) {
            const addNewButton = newElement("button", { innerText: "+", title: "Add New" });
            registerElement(addNewButton, "click")
            const removeButton = newElement("button", { innerText: "x", title: "Remove" });
            registerElement(removeButton, "click");
            addElements([addNewButton, removeButton], this.container)
        }
    }
    createField(fieldItem) {
        const fieldContainer = newElement('div', { class: ["fieldContainer"], "data-field-name": fieldItem.name });
        switch(fieldItem.type) {
            case "select":
                addElement(this.createSelect(fieldItem), fieldContainer, "afterbegin");
                break;
            case "input":
                addElement(this.createInput(fieldItem), fieldContainer, "afterbegin");
                break;
            case "button":
                addElement(this.createButton(fieldItem), fieldContainer, "afterbegin");
                break;
            default:
                log(`Unknown field type [${fieldItem.type}]`, "warn");
                break;
        }
        return fieldContainer;
    }
    createSelect(selectItem) {
        const selectElem = newElement('select', selectItem.properties || {});
        const boundChange = function() {
            this.updateChildForms(selectItem.name, selectElem.value);
            this.updateFields(selectItem.name, selectElem.value);
        }.bind(this);
        registerElement(selectElem, "change", boundChange);
        for (let option of selectItem.options) {
            const optionElem = newElement('option', { innerText: option.name, value: option.value });
            addElement(optionElem, selectElem);
        }
        if (selectItem.hasOwnProperty("initialValue") && selectItem.initialValue) {
            selectElem.value = selectItem.initialValue;
        }
        return this.labelField(selectElem, selectItem.label);
    }
    createButton(buttonItem) {}
    createInput(inputItem) {
        const inputElem = newElement('input', inputItem.properties || {});
        return this.labelField(inputElem, inputItem.label);
    }
    removeForm() {
    }
    addNewForm() {
    }
    labelField(fieldElem, label) {
        if (!label) return fieldElem;
        const labelElem = newElement('label', { innerText: label });
        addElement(fieldElem, labelElem);
        return labelElem;
    }
    updateChildForms(fieldName, fieldValue) {
        // if a child form depends on the value of this field, update it
        // this includes adding any child form that does not currently exist
        // check every child form (even if it doesn't exist) to see if it relies on this fieldname
        const existingChildren = this.childFormsContainer.children;
    }
    updateFields(fieldName, fieldValue) {
        // if a field on this form depends on a value of this field, update it
        // this includes adding any field that does not currently exist
        // check every form field to see if it relies on this fieldname
        const existingFields = this.fieldsContainer.children;
        let lastExistingField;
        for (let field of this.formInfo.fields) {
            let fieldExists = false;
            let currentField;
            for (let existingField of existingFields) {
                if (existingField.dataset.fieldName === field.name) {
                    fieldExists = true;
                    currentField = existingField;
                    break;
                }
            }
            if (field.hasOwnProperty("dependsOn") && field.dependsOn.fieldName === fieldName) {
                const shouldExist = field.dependsOn.fieldValues.indexOf(fieldValue) >= 0;
                if (fieldExists && !shouldExist) {
                    if (field.type === "select") this.updateFields(field.name, "");
                    currentField.remove();
                    continue;
                }
                if (!fieldExists && shouldExist) {
                    const newField = this.createField(field);
                    if (lastExistingField) addElement(newField, lastExistingField, "afterend");
                    else addElement(newField, this.fieldsContainer, "afterbegin");
                    if (field.type === "select") this.updateFields(field.name, field.initalValue || field.options[0]);
                    lastExistingField = newField;
                    continue;
                }
            }
            if (fieldExists) {
                lastExistingField = currentField;
            }
        }
    }
}

const formStructure = {
    isMultiple: false,
    children: [],
    dependsOn: {
        fieldName: "",
        fieldValues: [
            ""
        ]
    },
    fields: [
        {
            name: "",
            label: "",
            initalValue: "",
            type: "", // "select", "input", "button", "checkbox"
            options: [], // only valid for type "select"
            properties: {},
            dependsOn: {
                fieldName: "",
                fieldValues: [
                    ""
                ]
            },
        }
    ]
}