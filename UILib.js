// tab container
// tab
// sort/filter table
// filtered list


class TabContainer {
    tabs = [];
    tabHeaders = [];
    currentIndex = 0;

    constructor(tabs) {
        this.tabContainer = newElement('div', {id: "tabContainer"});
        this.tabList = newElement('div', {id: "tabList"});
        this.tabContent = newElement('div', {id: "tabContent"});
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
        const tabHeader = newElement("div", {class: ["tabHeader"], innerText: tab.getName()});
        registerElement(tabHeader, "click", (event) => {this.selectTab(this.tabHeaders.indexOf(event.target))});
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
        const container = newElement("div", {innerText: "This is: " + this.tabName});
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
    currentPage;
    pageCount;
    filteredData;
    sortable;
    filtered;
    filters = [];

    constructor(headers, dataRows, pageSize, tableInfo, sortable, filtered) {
        this.headers = headers || [];
        this.fullData = dataRows || [];
        this.pageSize = pageSize || 0;
        this.filteredData = this.fullData;
        this.currentPage = 0;
        this.sortable = sortable !== undefined ? sortable : false;
        this.filtered = filtered !== undefined ? filtered : false;

        this.container = newElement('div', {class: ["tableContainer"]});
        this.table = newElement("table", tableInfo);
        if (this.sortable) this.table.classList.add('sortable');

        this.headerRow = this.createHeaderRow(headers);
        addElement(this.headerRow, this.table);

        this.buttonContainer = newElement("div", {class: ["pageButtons"]});
        this.updateTable();
        this.updateButtons();

        addElements([this.table, this.buttonContainer], this.container);

        return this.container;
    }

    applyFilters() {
        let filteredRows = this.fullData;
        for (let i = 0; i < this.filters.length; i++) {
            const currentFilter = this.filters[i];
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
        this.updateTable();
        this.updateButtons();
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
            const tableData = newElement('td', {innerText: data});
            addElement(tableData, tableRow);
        }
        return tableRow;
    }

    createHeaderRow(headerData) {
        const headerRow = newElement('tr');
        for (let header of headerData) {
            const headerData = {innerText: header};
            if (this.sortable) headerData['data-sort-direction'] = "asc"
            const tableHeader = newElement('th', headerData);
            if (this.filtered) this.addHeaderFiltering(tableHeader);
            if (this.sortable) this.addHeaderSorting(tableHeader);
            addElement(tableHeader, headerRow);
        }
        return headerRow;
    }

    addHeaderSorting(element) {
        registerElement(element, "click", (event) => {
            if (event.target.nodeName === "INPUT") return;
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

    sortTable(event, headerNames, data) {
        const sortBy = event.target.innerText;
        const sortDirection = event.target.dataset.sortDirection;
        if (sortDirection === 'asc') {
            event.target.dataset.sortDirection = 'desc';
        }
        else if (sortDirection === 'desc') {
            event.target.dataset.sortDirection = 'asc';
        }
    
        data.sort(customSort);
        
        function customSort(a, b) {
            const headerIndex = headerNames.indexOf(sortBy);
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
    
            valueA = !isNaN(parseInt(valueA)) ? parseInt(valueA) : valueA;
            valueB = !isNaN(parseInt(valueB)) ? parseInt(valueB) : valueB;
    
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
}