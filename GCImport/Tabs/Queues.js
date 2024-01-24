addTab("Queues", showQueuesPage);

function showQueuesPage() {
    window.requiredFields = [];

    const container = newElement('div', {id: "userInputs"});
    const label = newElement('label');
    label.innerText = "Queues CSV: ";
    const fileInput = newElement('input', {type: "file", accept: ".csv"});
    addElement(fileInput, label);
    registerElement(fileInput, "change", loadFile);
    const startButton = newElement('button');
    startButton.innerText = "Start";
    registerElement(startButton, "click", importSkills);
    const logoutButton = newElement("button");
    logoutButton.innerText = "Logout";
    registerElement(logoutButton, "click", logout);
    addElements([label, startButton, logoutButton], container);
    return container;
}

async function importQueues() {

}
