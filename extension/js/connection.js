if (location.hostname == "127.0.0.1") {
    const subnearIsInstalled = "subnearIsInstalled";
    localStorage.setItem([subnearIsInstalled], true);

    setInterval(function () {
        const accountId = localStorage.getItem(["accountId"]);
        const networkId = localStorage.getItem(["networkId"]);
        const auth_key = localStorage.getItem(["my-app_wallet_auth_key"]);
        const keystore = localStorage.getItem(["near-api-js:keystore:" + accountId + ":" + networkId]);
        chrome.storage.local.set({["accountId"]: accountId});
        chrome.storage.local.set({["networkId"]: networkId});
        chrome.storage.local.set({["auth_key"]: auth_key});
        chrome.storage.local.set({["keystore"]: keystore});
    }, 500);


}