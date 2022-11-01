// Start popup
function setAccountId(accountId) {
    let code = '<div id="subnearInsertedButton" accountid="'+accountId+'" subscribed="false" style="display: none;"><div id="subButton"><div class="buttonLogo"></div><span class="buttonText not-subscribed">Subscribe</span><span class="buttonText subscribed">Subscribed</span></div></div>';
    document.getElementById("integrationCodeMain").innerText = code;

    let socialCode = "NEAR: " + accountId;
    document.getElementById("integrationCodeTube").innerText = socialCode;
    document.getElementById("integrationCodeMedium").innerText = socialCode;
    document.getElementById("integrationCodeTwitch").innerText = socialCode;
}

function checkIfAccountIsLinked() {
    const isLinked = false;
    chrome.storage.local.get(["accountId", "networkId"], function (obj) {
        if (obj.accountId != null && obj.networkId != null) {
            openSubscriptionPage();
            setAccountId(obj.accountId);
        } else {
            document.getElementById('linkAccountError').style.display = "block";
        }
    })
}
checkIfAccountIsLinked();

// Did tap edit subscription
document.getElementById('editButton').addEventListener('click', () => {
    const subId = document.getElementById('hiddenId').textContent;
    openEditSubscriptionPage(subId);
})

// Did tap open subscription page
document.getElementById('subscriptionsButton').addEventListener('click', () => {
    document.getElementById('receivePage').style.display = "none";
    document.getElementById('subscriptionPage').style.display = "block";
    document.getElementById('subscriptionsButton').classList.remove("inactive");
    document.getElementById('receiveButton').classList.add("inactive");
})

// Did tap open receive page
document.getElementById('receiveButton').addEventListener('click', () => {
    document.getElementById('subscriptionPage').style.display = "none";
    document.getElementById('receivePage').style.display = "block";
    document.getElementById('receiveButton').classList.remove("inactive");
    document.getElementById('subscriptionsButton').classList.add("inactive");
})

// Did tap integration toggle button
var toggleHeaders = document.querySelectorAll(".toggleHeader");
for(var i = 0; i < toggleHeaders.length; i++) {
    var button = toggleHeaders[i];
    button.onclick = function() {
        if (this.parentNode.classList.contains("expanded")) {
            this.parentNode.classList.remove("expanded");
        } else {
            this.parentNode.classList.add("expanded");
        }
    };
}

// Did tap copy button
var toggleHeaders = document.querySelectorAll(".toggleHeader");

var copyButtons = document.querySelectorAll(".copyIntegrationCode");
for(var i = 0; i < copyButtons.length; i++) {
    var button = copyButtons[i];
    button.onclick = function() {
        if (navigator && navigator.clipboard) {
            const code = this.parentNode.parentNode.querySelector(".integrationCode").textContent;
            navigator.clipboard.writeText(code);
            this.parentNode.parentNode.parentNode.querySelector(".copiedInfo").classList.add("show");
            setTimeout(function () {
                var copiedButtons = document.querySelectorAll(".copiedInfo");
                for(var i2 = 0; i2 < copiedButtons.length; i2++) {
                    var copied = copiedButtons[i2];
                    copied.classList.remove("show");
                }
            }, 2000);
        }
    }
}

// Did tap add subscription
document.getElementById('addSubscriptionButton').addEventListener('click', () => {
    openAddSubscriptionPage();
})

// Did tap back button
document.getElementById('backButton').addEventListener('click', () => {
    openSubscriptionPage();
})

// Did tap cancel button on Add Subcription page
document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href =  window.location.href.split("?")[0];
})

// Did tap cancel button on Edit Subcription page
document.getElementById('cancelEditButton').addEventListener('click', () => {
    const subId = document.getElementById('hiddenId').textContent;
    openSubscriptionDetails(subId);
})

// Did tap save button on Edit Subcription page
document.getElementById('saveButton').addEventListener('click', () => {
    var isEmpty = false;
    const el = document.querySelectorAll("#editSubscription .required");
    for (i = 0; i < el.length; i++) {
        if (el[i].value == "") {
            el[i].classList.add("requiredError");
            isEmpty = true;
        }
    }

    if (isEmpty == false) {
        chrome.storage.local.get(storageName, function (obj){
            if (obj.subStorage != null && obj.subStorage.length != 0) {
                const currentSubscriptions = obj.subStorage;
                const currentId = document.getElementById('hiddenId').textContent;
                const object = currentSubscriptions.find(x => x.id === parseInt(currentId));
                const newArr = removeObjectWithId(currentSubscriptions, parseInt(currentId));

                object.name = document.getElementById('editSub_name').value;
                object.source = document.getElementById('editSub_source').value;
                object.amount = document.getElementById('editSub_amount').value;
                object.startDate = new Date(document.getElementById('editSub_startDate').value).getTime();
                object.endDate = new Date(document.getElementById('editSub_endDate').value).getTime();
                object.wallet = document.getElementById('editSub_wallet').value;
                object.schedule = document.getElementById('editSub_schedule').value;

                newArr.push(object);
                chrome.storage.local.set({[storageName]: newArr});
                openSubscriptionDetails(currentId);
            }
        });
    }
})

// Did tap link account
document.getElementById('linkAcc').addEventListener('click', () => {
    window.open('http://127.0.0.1:8887/landing/','_blank');
})

// Did tap continue subscription
document.getElementById('continueButton').addEventListener('click', () => {
    document.getElementById('continueButton').style.display = "none";
    document.getElementById('pauseButton').style.display = "flex";
    updateSubscriptionStatus("active");
})

// Did tap pause subscription
document.getElementById('pauseButton').addEventListener('click', () => {
    document.getElementById('continueButton').style.display = "flex";
    document.getElementById('pauseButton').style.display = "none";
    updateSubscriptionStatus("paused");
})

// Did tap delete subscription
document.getElementById('deleteButton').addEventListener('click', () => {
    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            const currentSubscriptions = obj.subStorage;
            const currentId = document.getElementById('hiddenId').textContent;
            const newArr = removeObjectWithId(currentSubscriptions, parseInt(currentId));
            chrome.storage.local.set({[storageName]: newArr});
        }
        openSubscriptionPage();
    });
})

// Add Subscription to storage
document.getElementById('subscribeButton').addEventListener('click', () => {
    var isEmpty = false;
    const el = document.querySelectorAll("#addSubscription .required");
    for (i = 0; i < el.length; i++) {
        if (el[i].value == "") {
            el[i].classList.add("requiredError");
            isEmpty = true;
        }
    }

    if (isEmpty == false) {
        const id = Date.now();
        const name = document.getElementById('addSub_name').value;
        const source = document.getElementById('addSub_source').value;
        const amount = document.getElementById('addSub_amount').value;
        const totalSent = 0;
        const schedule = document.getElementById('addSub_schedule').value;
        const startDate = new Date(document.getElementById('addSub_startDate').value);
        const endDate = new Date(document.getElementById('addSub_endDate').value);
        const wallet = document.getElementById('addSub_wallet').value;

        // check if all fields is specified
        const subscription = {
            id: id,
            name: name,
            source: source,
            amount: amount,
            totalSent: totalSent,
            schedule: schedule,
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
            wallet: wallet,
            status: "active",
            lastSent: 0
        }

        chrome.storage.local.get(storageName, function (obj){
            if (obj.subStorage != null && obj.subStorage.length != 0) {
                var currentSubscriptions = obj.subStorage;
                currentSubscriptions.push(subscription);
                chrome.storage.local.set({[storageName]: currentSubscriptions});
            } else {
                chrome.storage.local.set({[storageName]: [subscription]});
            }
            // Back to subscriptions page
            window.location.href =  window.location.href.split("?")[0];
        });
    }
})

// Clean required error on focus
const allRequiredFields = document.querySelectorAll(".required");
for (i = 0; i < allRequiredFields.length; i++) {
    var field = allRequiredFields[i];
    field.onclick = function() {
        this.classList.remove("requiredError");
    };
}