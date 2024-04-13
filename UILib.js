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

        return this.container;
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

    changePage(pageChange) {
        this.currentPage += pageChange;

        this.updateTable();
        this.updateButtons();
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

            valueA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(valueA) ? new Date(valueA) : valueA;
            valueB = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(valueB) ? new Date(valueB) : valueB;

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