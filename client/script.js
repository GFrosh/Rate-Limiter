// Get UI elements
const requestBtn = document.getElementById('requestBtn');

const statusText = document.getElementById('statusText');

const tokensText = document.getElementById('tokensText');

const retryText = document.getElementById('retryText');

const logList = document.getElementById('logList');




// Add click listener
requestBtn.addEventListener('click', sendRequest);




// Send request to backend
async function sendRequest() {
    try {
        const response = await fetch('/request');
        const data = await response.json();

        updateStatus(data);
        addLog(data);
    }
    catch (error) {
        console.error(error);
        statusText.textContent = 'Error';
    }
}




// Update status display
function updateStatus(data) {
    if (data.status === 'allowed') {
        statusText.textContent = 'Allowed ✅';
        statusText.className = 'allowed';
    }
    else {
        statusText.textContent = 'Blocked ❌';
        statusText.className = 'blocked';
    }

    tokensText.textContent = `${data.tokensRemaining} / ${data.maxTokens}`;


    retryText.textContent = data.retryAfter > 0 ? `${data.retryAfter} seconds` : '-';
}




// Add entry to log
function addLog(data) {
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString();

    if (data.status === 'allowed') {
        li.textContent = `[${time}] Allowed (${data.tokensRemaining} tokens left)`;
    }
    else {
        li.textContent = `[${time}] Blocked (retry in ${data.retryAfter}s)`;
    }

    // Add newest on top
    logList.prepend(li);
}

