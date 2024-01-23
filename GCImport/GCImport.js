function showLoginPage() {
    const conversationPage = `
    <div id="userInputs">
        <label>Client ID: 
            <input type="text" name="clientId">
        </label>
        <label>Environment: 
            <select name="environment">
                <option>mypurecloud.com</option>
                <option>use2.us-gov-pure.cloud</option>
                <option selected>usw2.pure.cloud</option>
                <option>cac1.pure.cloud</option>
                <option>mypurecloud.ie</option>
                <option>euw2.pure.cloud</option>
                <option>mypurecloud.de</option>
                <option>aps1.pure.cloud</option>
                <option>mypurecloud.jp</option>
                <option>apne2.pure.cloud</option>
                <option>mypurecloud.com.au</option>
                <option>sae1.pure.clou</option>
            </select>
        </label>
        <button id="login">Log In</button>
    </div>`;
    document.getElementById('page').innerHTML = conversationPage;
    document.getElementById('login').addEventListener('click', login);
}

function showMainMenu() {
    const mainBody = `
    <div id="userInputs">
        <label>Import Item: 
            <select id="option">
                <option value="cannedResponse">Canned Responses</option>
                <option value="skills">Skills</option>
            </select>
        </label>
        <button id="start">Start</button>
        <button id="logout">Log Out</button>
    </div>`;
    document.getElementById('page').innerHTML = mainBody;
    getOrgDetails().then(function(result) {
        document.getElementById("header").innerText = `${result.name} (${result.thirdPartyOrgName}): ${result.id}`
    }).catch(function(error) {console.error(error)})
    document.getElementById('start').addEventListener("click", function() {
        showPage(document.getElementById('option').value);
    });
    document.getElementById('logout').addEventListener("click", logout);
}

function showPage(pageName) {
    switch (pageName) {
        case "login":
            showLoginPage();
            break;
        case "main":
            showMainMenu();
            break;
        case "cannedResponse":
            showCannedResponsePage();
            break;
        case "skills":
            showSkillsPage();
            break;
        case "queues":
            showQueuesPage();
            break;
        default:
            console.log("invalid page: ", pageName);
            break;
    }
}

function login() {
    window.localStorage.setItem('environment', document.querySelector('[name="environment"]').value);
    window.location.replace(`https://login.${window.localStorage.getItem('environment')}/oauth/authorize?response_type=token&client_id=${document.querySelector('[name="clientId"]').value}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}`);
}

function logout() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('environment');
    document.getElementById('header').innerText = "";
    showPage("login");
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
    results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function storeToken(token) {
    window.localStorage.setItem('auth', token);
}

function getToken() {
    if (window.localStorage.getItem('auth')) {
        return window.localStorage.getItem('auth');
    }
    return '';
}

async function getUserDetails() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/users/me`;
    const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json(); 
}

async function getOrgDetails() {
    const url = `https://api.${window.localStorage.getItem('environment')}/api/v2/organizations/me`;
    const result = await fetch(url, {headers: {'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json'}});
    return result.json(); 
}

function loadFile(event) {
    try {
        if (event.target.files.length < 1) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', function(data) {
            try {
                fileContents = Papa.parse(data.target.result, {header: true});
                if (fileContents.meta.fields.length != window.requiredFields.length) {
                    fileContents = undefined;
                    throw `${file.name} does not have required fields ${JSON.stringify(window.requiredFields)}`
                }
                for (let field of fileContents.meta.fields) {
                    if (window.requiredFields.indexOf(field) < 0) {
                        fileContents = undefined;
                        throw `${file.name} does not have required fields ${JSON.stringify(window.requiredFields)}`
                    }
                }
                console.log(fileContents);
            }
            catch (error) {
                throw `${file.name} does not contain valid CSV.`
            }
        })
        reader.readAsText(file);
    }
    catch (error) {
        handleError(error);
    }
}

var fileContents;

if (window.location.hash) {
    storeToken(getParameterByName('access_token'));
    let now = new Date().valueOf();
    let expireTime = parseInt(getParameterByName('expires_in')) * 1000;
    console.log(new Date(now + expireTime));
    location.hash = ''
}
if (!getToken()) {
    showPage("login");
}
else {
    showPage("main");
}