//  Config
const accountId = "hrl.testnet";
const networkId = "testnet"

// Local storage names
const subnearIsInstalled = "subnearIsInstalled";
const subnearKeystore = "near-api-js:keystore:" + accountId + ":" + networkId;

var refreshInterval;

// Create NEAR config
const nearConfig = new nearApi.Near({
    keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
    networkId: networkId,
    nodeUrl: 'https://rpc.'+networkId+'.near.org',
    walletUrl: 'https://wallet.'+networkId+'.near.org'
});
// Connect to the NEAR Wallet
const wallet = new nearApi.WalletConnection(nearConfig, 'my-app');
// Get NEAR account
const account = wallet.account();

function setActualStep(step) {
    showStep(step);
}

function showStep(step) {
    const steps = document.querySelectorAll(".step");
    for(var i = 0; i < steps.length; i++){
        steps[i].style.display = "none";
    }
    const stepName = "step-" + step;
    document.getElementById(stepName).style.display = "block";
}

function initSignin() {
    if (!wallet.isSignedIn()) {
        wallet.requestSignIn(
            accountId,
            "Subnear",
            "http://127.0.0.1:8887/landing/",
            "http://127.0.0.1:8887/error/"
        );
    }
}

function signOut() {
    if (wallet.isSignedIn()) {
        wallet.signOut();
        localStorage.removeItem([subnearKeystore]);
        localStorage.removeItem(["accountId"]);
        localStorage.removeItem(["networkId"]);
        restoreActualStep();
    }
}

function linkAccount() {
    localStorage.setItem(["accountId"], accountId);
    localStorage.setItem(["networkId"], networkId);
    restoreActualStep();
}

function restoreActualStep() {
    // Check if extension is installed
    const isInstalled = localStorage.getItem([subnearIsInstalled]);
    // Check if signed in
    const isSignedIn = wallet.isSignedIn();
    // Check if account is linked
    var isLinked = true;

    if ((localStorage.getItem(["accountId"]) == null) || (localStorage.getItem(["networkId"]) == null)) {
        isLinked = false;
    }

    if (isSignedIn == false || isSignedIn == null) {
        showStep(0);
    } else if (isInstalled == false || isInstalled == null) {
        refreshInterval = setInterval(function () {
            window.location.reload(true);
        }, 5000);
        showStep(2);
    } else if (isLinked == false || isLinked == null) {
        clearInterval(refreshInterval);
        showStep(3);
    } else {
        document.getElementById("accountName").textContent = account.accountId;
        showStep(4);
    }
}

restoreActualStep();

document.getElementById("getStarted").addEventListener("click", function () {
    showStep(1);
})

document.getElementById("signIn").addEventListener("click", function () {
    initSignin();
})

document.getElementById("linkAccount").addEventListener("click", function () {
    linkAccount();
})

document.getElementById("signout").addEventListener("click", function () {
    signOut();
})