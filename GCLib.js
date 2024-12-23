async function makeGenesysRequest(path, method, body, isEmptyResponse) {
    let needsRepeating = true;
    while (needsRepeating) {
        const url = `https://api.${window.localStorage.getItem('environment')}${path}`;
        const result = await fetch(url, { method: method, body: JSON.stringify(body), headers: { 'Authorization': `bearer ${getToken()}`, 'Content-Type': 'application/json' } });
        if (result.status === 429) {
            const retryWait = result.headers.get("Retry-After");
            const waitSeconds = isNaN(parseInt(retryWait, 10)) ? 1 : parseInt(retryWait, 10);
            await wait(waitSeconds);
        }
        else {
            needsRepeating = false;
            const contentType = result.headers.has("Content-Type") ? result.headers.get("Content-Type") : "";
            if (result.ok && contentType === "application/json" && !isEmptyResponse) {
                const resultJson = await result.json();
                resultJson.status = resultJson.status || result.status;
                return resultJson
            }
            else if (!isEmptyResponse && contentType === "application/json") {
                const resultJson = await result.json();
                resultJson.status = resultJson.status || result.status;
                return resultJson
            }
            else if (result.ok && isEmptyResponse) {
                return result;
            }
            else {
                throw result;
            }
        }
    }
}

async function getAllGenesysItems(path, pageSize = 100, entitiesKey = "entities") {
    const items = [];
    let pageNum = 0;
    let totalPages = 1;
    while (pageNum < totalPages) {
        pageNum++;
        const results = await makeGenesysRequest(`${path}${path.includes('?') ? "&" : "?"}pageNumber=${pageNum}&pageSize=${pageSize}`);
        items.push(...results[entitiesKey]);
        totalPages = results.pageCount;
    }
    return items;
}

async function getAllCursoredGenesysItems(path, pageSize = 100, entitiesKey = "entities") {
    const items = [];
    let morePages = true;
    let url = `${path}${path.includes('?') ? "&" : "?"}pageSize=${pageSize}`
    while (morePages) {
        const results = await makeGenesysRequest(url);
        items.push(...results[entitiesKey]);
        if (results.cursor) {
            url = `${path}${path.includes('?') ? "&" : "?"}pageSize=${pageSize}&cursor=${results.cursor}`
        }
        else {
            morePages = false;
        }
    }
    return items;
}

async function getPagedGenesysItems(path, entitiesKey = "entities") {
    const items = [];
    while (path) {
        const results = await makeGenesysRequest(path);
        items.push(...results[entitiesKey]);
        path = results.nextUri;
    }
    return items;
}

async function pollStatus(getFunc, getFuncArgs, resultKey, successes, failures, interval) {
    return new Promise((resolve, reject) => {
        const repeater = setInterval(async () => {
            const result = await getFunc(...getFuncArgs);
            if (successes.includes(result[resultKey])) {
                clearInterval(repeater);
                resolve();
            }
            else if (failures.includes(result[resultKey])) {
                clearInterval(repeater);
                reject();
            }
        }, interval);
    })
}

async function wait(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function login() {
    const environment = storeAndReturnValue("environment", qs('[name="environment"]').value);
    const clientId = storeAndReturnValue("clientId", qs('[name="clientId"]').value);
    const redirectUri = storeAndReturnValue("redirectUri", location.origin + location.pathname);
    const codeVerifier = storeAndReturnValue("codeVerifier", generateCodeVerifier());
    const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);
    window.localStorage.setItem('environment', environment);
    window.location.replace(`https://login.${environment}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`);

    // GENERATING CODE VERIFIER
    function dec2hex(dec) {
        return ("0" + dec.toString(16)).substr(-2);
    }

    function generateCodeVerifier() {
        var array = new Uint32Array(56 / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec2hex).join("");
    }

    function sha256(plain) {
        // returns promise ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest("SHA-256", data);
    }

    function base64urlencode(a) {
        var str = "";
        var bytes = new Uint8Array(a);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    async function generateCodeChallengeFromVerifier(v) {
        var hashed = await sha256(v);
        var base64encoded = base64urlencode(hashed);
        return base64encoded;
    }

    function storeAndReturnValue(key, value) {
        const currentValue = window.localStorage.getItem(key);
        if (currentValue && currentValue === value) return currentValue;
        window.localStorage.setItem(key, value);
        return value;
    }
}

function getToken() {
    const authToken = window.localStorage.getItem('auth');
    if (authToken) {
        return authToken;
    }
    return "";
}

function runLoginProcess(loginPageFunc, nextPageFunc) {
    if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        window.localStorage.setItem("code", (searchParams.get("code")));
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (window.localStorage.getItem('auth') || canGetToken()) {
        loginAndShowPage();
    }
    else {
        loginPageFunc();
    }

    function canGetToken() {
        if (window.localStorage.getItem('code') &&
            window.localStorage.getItem('redirectUri') &&
            window.localStorage.getItem('clientId') &&
            window.localStorage.getItem('codeVerifier') &&
            window.localStorage.getItem('environment')
        ) {
            return true;
        }
        return false
    }

    async function loginAndShowPage() {
        if (!window.localStorage.getItem('auth')) {
            const auth = await getAuthToken();
            window.localStorage.setItem("auth", auth.access_token);
        }
        nextPageFunc();
    }

    async function getAuthToken() {
        const url = `https://login.${window.localStorage.getItem('environment')}/oauth/token`;
        const formData = new URLSearchParams();
        formData.append("grant_type", "authorization_code");
        formData.append("code", window.localStorage.getItem("code"));
        formData.append("redirect_uri", window.localStorage.getItem("redirectUri"));
        formData.append("client_id", window.localStorage.getItem("clientId"));
        formData.append("code_verifier", window.localStorage.getItem("codeVerifier"));
        formData.append("code_challenge_method", "S256");
        const result = await fetch(url, { method: "POST", body: formData });
        if (!result.ok) {
            console.log(result);
            logout();
            return;
        }
        const resultJson = await result.json();
        return resultJson;
    }
}

function logout() {
    window.flows = undefined;
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('code');
    window.localStorage.removeItem('environment');
    window.localStorage.removeItem("clientId");
    window.localStorage.removeItem("redirectUri");
    window.localStorage.removeItem("codeVerifier");
    eById('header') ? eById('header').innerText = `Current Org Name: \nCurrent Org ID:` : false;
    showLoginPage();
}