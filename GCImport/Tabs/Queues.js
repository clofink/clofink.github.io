function showQueuesPage() {
    const mainBody = `
    <div id="userInputs">
        <label>CSV File: 
            <input id="import" type="file" accept=".csv">
        </label>
        <button id="start">Start</button>
        <button id="back">Back</button>
        <button id="logout">Log Out</button>
    </div>`;
    document.getElementById('page').innerHTML = mainBody;
    window.requiredFields = [];
    document.getElementById('import').addEventListener("change", loadFile);
    document.getElementById('start').addEventListener('click', importQueues);
    document.getElementById('back').addEventListener("click", function() {showPage("main")});
    document.getElementById('logout').addEventListener("click", logout);
}

async function importQueues() {

}
