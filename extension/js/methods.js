const storageName = "subStorage";

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createSubItem(subObject) {
    const subItem =
        `<div class="subItem" sub-id="${subObject.id}">
                    <div class="subIcon ${subObject.source.toLowerCase()}"></div>
                    <div class="subInfo">
                        <span class="name">${subObject.name}</span>
                        <span class="payInfo">
                            <span class="amount">${subObject.amount} NEAR</span>
                            <span class="schedule">${subObject.schedule}</span>
                        </span>
                    </div>
                    <div class="subStatus">
                        <span class="status ${subObject.status.toLowerCase()}">${capitalizeFirstLetter(subObject.status)}</span>
                    </div>
                    <div class="subMore"></div>
                </div>`;
    document.getElementById('subList').innerHTML += subItem;
}

function removeObjectWithId(arr, id) {
    return arr.filter((obj) => obj.id !== id);
}

function openSubscriptionDetails(subId) {
    document.getElementById('header').style.display = "none";
    document.getElementById('headerNav').style.display = "flex";
    document.getElementById('subscriptionPage').style.display = "none";
    document.getElementById('detailsPage').style.display = "block";
    document.getElementById('backButton').style.display = "flex";
    document.getElementById('editButton').style.display = "flex";
    document.getElementById('editSubscription').style.display = "none";
    document.getElementById('hiddenId').textContent = subId;

    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            const subscriptionObjects = obj.subStorage;
            const object = subscriptionObjects.find(x => x.id === parseInt(subId));
            document.getElementById('detailsStatus').textContent = capitalizeFirstLetter(object.status);
            if (object.status == "active") {
                document.getElementById('detailsStatus').classList.remove("paused");
                document.getElementById('detailsStatus').classList.add("active");
                document.getElementById('continueButton').style.display = "none";
                document.getElementById('pauseButton').style.display = "flex";
            } else {
                document.getElementById('detailsStatus').classList.add("paused");
                document.getElementById('detailsStatus').classList.remove("active");
                document.getElementById('continueButton').style.display = "flex";
                document.getElementById('pauseButton').style.display = "none";
            }

            document.getElementById('detailsSource').textContent = object.source;
            document.getElementById('detailsSchedule').textContent = object.schedule;
            document.getElementById('detailsAmount').textContent = object.amount;
            document.getElementById('detailsTotalSent').textContent = object.totalSent;
            document.getElementById('detailsWallet').textContent = object.wallet;
            document.getElementById('headerNavTitle').textContent = object.name;

            if(new Date(object.endDate).toLocaleDateString() == "Invalid Date") {
                document.getElementById('detailsEndDate').textContent = "";
            } else {
                document.getElementById('detailsEndDate').textContent = new Date(object.endDate).toLocaleDateString();
            }
            document.getElementById('detailsStartDate').textContent = new Date(object.startDate).toLocaleDateString();
        }
    })
}

function openAddSubscriptionPage(source, domain, accountId) {
    document.getElementById('addSubscription').style.display = "block";
    document.getElementById('subscriptionPage').style.display = "none";
    document.getElementById('header').style.display = "none";
    document.getElementById('headerNav').style.display = "flex";

    document.getElementById('backButton').style.display = "none";
    document.getElementById('editButton').style.display = "none";
    document.getElementById('headerNavTitle').textContent = "New Subscription";

    // Clean all fields
    if (source != null) {
        document.getElementById('addSub_name').value = source;
    } else {
        document.getElementById('addSub_name').value = "";
    }

    if (domain != null) {
        document.getElementById('addSub_source').value = domain;
    } else {
        document.getElementById('addSub_source').value = "";
    }

    document.getElementById('addSub_amount').value = "";
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('addSub_startDate').value = now.toISOString().slice(0,16);
    document.getElementById('addSub_endDate').value = "";

    if (accountId != null) {
        document.getElementById('addSub_wallet').value = accountId;
    } else {
        document.getElementById('addSub_wallet').value = "";
    }

}

function openSubscriptionPage() {
    document.getElementById('linkAccountError').style.display = "none";
    document.getElementById('header').style.display = "flex";
    document.getElementById('headerNav').style.display = "none";
    document.getElementById('subscriptionPage').style.display = "block";
    document.getElementById('detailsPage').style.display = "none";
    document.getElementById('addSubscription').style.display = "none";

    // Update subscriprtions list
    document.getElementById('subList').innerHTML = "";
    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            document.getElementById('noSubs').style.display = "none";
            document.getElementById('subList').style.display = "block";
            const subscriptionObjects = obj.subStorage.sort((a, b) => (a.id < b.id) ? 1 : -1);
            for (let subObject of subscriptionObjects) {
                createSubItem(subObject);
            }
            var openSubButton = document.querySelectorAll(".subMore");
            for(var i = 0; i < openSubButton.length; i++) {
                var button = openSubButton[i];
                button.onclick = function() {
                    const subId = this.parentElement.getAttribute('sub-id');
                    openSubscriptionDetails(subId);
                };
            }
        } else {
            document.getElementById('noSubs').style.display = "block";
            document.getElementById('subList').style.display = "none";
        }
    });

    // Check if have urls
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const source = urlParams.get('source')
    const domain = urlParams.get('domain')
    const accountId = urlParams.get('accountId')
    if (source != null) {
        openAddSubscriptionPage(domain, source, accountId);
    } else if (accountId != null) {
        chrome.storage.local.get(storageName, function (obj) {
            if (obj.subStorage != null && obj.subStorage.length != 0) {
                const object = obj.subStorage.find(x => x.wallet === accountId);
                window.history.pushState({}, document.title, "/");
                openSubscriptionDetails(object.id);
            }
        })
    }
}

function openEditSubscriptionPage(subId) {
    document.getElementById('backButton').style.display = "none";
    document.getElementById('editButton').style.display = "none";
    document.getElementById('detailsPage').style.display = "none";
    document.getElementById('editSubscription').style.display = "block";
    document.getElementById('headerNavTitle').textContent = "Edit Subscription";

    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            const subscriptionObjects = obj.subStorage;
            const object = subscriptionObjects.find(x => x.id === parseInt(subId));

            document.getElementById('editSub_endDate').value = "";
            document.getElementById('editSub_schedule').value = object.schedule;
            document.getElementById('editSub_amount').value = object.amount;
            document.getElementById('editSub_wallet').value = object.wallet;
            document.getElementById('editSub_name').value = object.name;

            document.getElementById('editSub_source').value = object.source;
            var fomattedSDate = new Date(new Date(object.startDate).toString().split('GMT')[0]+' UTC').toISOString().split('.')[0]
            document.getElementById('editSub_startDate').value = fomattedSDate;

            if (object.endDate != "") {
                var fomattedEDate = new Date(new Date(object.endDate).toString().split('GMT')[0]+' UTC').toISOString().split('.')[0]
                document.getElementById('editSub_endDate').value = fomattedEDate;
            } else {
                document.getElementById('editSub_endDate').value = "";
            }
        }
    })
}

function updateSubscriptionStatus(status) {
    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            const currentSubscriptions = obj.subStorage;
            const currentId = document.getElementById('hiddenId').textContent;
            const object = currentSubscriptions.find(x => x.id === parseInt(currentId));
            const newArr = removeObjectWithId(currentSubscriptions, parseInt(currentId));
            object.status = status;
            newArr.push(object);
            chrome.storage.local.set({[storageName]: newArr});
            openSubscriptionDetails(currentId);
        }
    });
}