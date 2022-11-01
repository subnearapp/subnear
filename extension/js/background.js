chrome.runtime.onMessage.addListener(request => {
    if (request.source != null) {
        window.open('popup.html?source='+request.source+'&accountId='+request.accountId+'&domain=' + request.domain, "extension_popup", "width=365,height=620,status=no,scrollbars=yes,resizable=no");
    } else {
        window.open('popup.html?accountId='+request.accountId, "extension_popup", "width=365,height=620,status=no,scrollbars=yes,resizable=no");
    }
})

// Get all subscriptipns
const storageName = "subStorage";

// Transaction Manager
function removeObjectWithId(arr, id) {
    return arr.filter((obj) => obj.id !== id);
}

function updateSubscriptionInfo(subscription, lastSent, iterationDebt) {
    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            const currentSubscriptions = obj.subStorage;
            const currentId = subscription.id;
            const object = currentSubscriptions.find(x => x.id === parseInt(currentId));
            object.lastSent = lastSent;
            object.totalSent = object.totalSent + iterationDebt * object.amount;
            const newArr = removeObjectWithId(currentSubscriptions, parseInt(currentId));
            newArr.push(object);
            chrome.storage.local.set({[storageName]: newArr});
        }
    });
}

const near = new nearApi.Near({
    keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org'
});

const wallet = new nearApi.WalletConnection(near, 'my-app');
const account = wallet.account();

function setAccessKeys() {
    chrome.storage.local.get(["accountId", "networkId", "auth_key", "keystore"], function (obj){
        account.accountId = obj.accountId
        localStorage.setItem("my-app_wallet_auth_key", obj.auth_key);
        localStorage.setItem("my-app_wallet_auth_key", obj.auth_key);
        localStorage.setItem("near-api-js:keystore:"+obj.accountId+":"+obj.networkId, obj.keystore);
    })
}
setAccessKeys();

// Check access key update
setInterval(function () {
    setAccessKeys();
},10000)

function sendTransaction(subscription) {
    const amountInYocto = nearApi.utils.format.parseNearAmount(subscription.amount);
    account.sendMoney(subscription.wallet, amountInYocto);
    console.log(subscription.id + " sent!");
}

setInterval(function () {
    chrome.storage.local.get([storageName], function (obj) {
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            const allSubscriptions = obj.subStorage;

            for(var i = 0; i < allSubscriptions.length; i++) {
                const subscription = allSubscriptions[i];
                if (subscription.status == "active") {
                    const currentDatePoint = Date.now();

                    // Get last transaction date
                    var lastSentDatePoint = subscription.lastSent;
                    if (lastSentDatePoint == 0) {
                        lastSentDatePoint = subscription.startDate;
                    }

                    // Get schedule interval in miliseconds
                    var scheduleInDatePoints = 0;
                    if (subscription.schedule == "each second") {
                        scheduleInDatePoints = 1000;
                    } else if (subscription.schedule == "each minute") {
                        scheduleInDatePoints = 60000;
                    } else if (subscription.schedule == "each hour") {
                        scheduleInDatePoints = 3600000;
                    } else if (subscription.schedule == "each day") {
                        scheduleInDatePoints = 86400000;
                    } else if (subscription.schedule == "each week") {
                        scheduleInDatePoints = 604800000;
                    } else if (subscription.schedule == "each month") {
                        scheduleInDatePoints = 2629800000;
                    } else if (subscription.schedule == "each year") {
                        scheduleInDatePoints = 31556926000;
                    }
                    
                    // Get number of missed transactions
                    var nowAndLastSentInterval = currentDatePoint - lastSentDatePoint;
                    var sentIterationDebt = parseInt(nowAndLastSentInterval / scheduleInDatePoints);

                    // Make transactions
                    for (var y = 0; y < sentIterationDebt; y++) {
                        setTimeout(function() {
                            sendTransaction(subscription);
                        },10)
                    }

                    // Update subscription object
                    if (sentIterationDebt >= 1) {
                        updateSubscriptionInfo(subscription, Date.now(), sentIterationDebt);
                    }
                }
            }
        }
    })
}, 1000)