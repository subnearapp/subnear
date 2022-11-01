function setupSubButton() {
    // Show subscribe button if exists
    var insertedButtonWrapper = document.getElementById("subnearInsertedButton");
    if (insertedButtonWrapper != null) {
        document.getElementById("subnearInsertedButton").style.display = "block";
    }

    var subButton = document.getElementById("subButton");
    if (subButton != null) {
        document.getElementById("subButton").addEventListener("click", () => {
            const accId = document.getElementById("subnearInsertedButton").getAttribute('accountid');
            const subscribeStatus = document.getElementById("subnearInsertedButton").getAttribute("subscribed");
            if (subscribeStatus == "true") {
                chrome.runtime.sendMessage({accountId: accId});
            } else if (window.location.hostname == "www.youtube.com") {
                const channelName = document.querySelector("#text.ytd-channel-name").textContent;
                chrome.runtime.sendMessage({source: "YouTube", domain: channelName, accountId: accId});
            } else if (window.location.hostname == "medium.com") {
                const mediumAccName = document.querySelector(".pw-author-name span").textContent;
                chrome.runtime.sendMessage({source: "Medium", domain: mediumAccName, accountId: accId});
            } else if (window.location.hostname == "github.com") {
                const channelName = document.querySelector(".url.fn").textContent;
                chrome.runtime.sendMessage({source: "Github", domain: channelName, accountId: accId});
            } else {
                chrome.runtime.sendMessage({source: "Website", domain: window.location.hostname, accountId: accId});
            }
        })
    }
}

function setupYoutube() {
    // Check if Youtube contain NEAR: code then insert button and paste wallet to account id
    const path = window.location.pathname;

    // Check if path contains channel
    if (path.includes("channel") || path.includes("watch")) {
        const channelId = document.querySelector('meta[itemprop="channelId"]').content;

        fetch('https://api.codetabs.com/v1/proxy?quest=https://www.youtube.com/channel/' + channelId + '/about')
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.text().then(function(data) {
                        // Add button
                        if (path.includes("channel")) {
                            var youtubeButtonsSection = document.querySelector("#inner-header-container #buttons #other-buttons");
                            if (youtubeButtonsSection != null) {
                                document.querySelector("#inner-header-container #buttons #other-buttons").innerHTML += buttonHtml;
                            }
                        }

                        if (path.includes("watch")) {
                            var youtubeButtonsSection = document.querySelector("#subscribe-button");
                            if (youtubeButtonsSection != null) {
                                document.querySelector("#subscribe-button").insertAdjacentHTML('beforeend', buttonHtml);
                            }
                        }

                        document.body.classList.add('bodyYoutube');
                        
                        // data contains all the plain html of the url you previously set,
                        // you can use it as you want, it is typeof string
                        const html = new DOMParser().parseFromString(data, "text/html");
                        const description = html.querySelector('meta[itemprop="description"]').content;
                        var lines = description.split("\n");
                        for (var i = 0; i < lines.length; i++)
                        {
                            var line = lines[i];
                            if (line.includes("NEAR: ")) {
                                const wallet = line.replace("NEAR: ","");
                                document.querySelector("#subnearInsertedButton").setAttribute("accountid", wallet);
                                setupSubButton();
                                checkIfSubscribed();
                            }
                        }
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }
}

function setupMedium() {
    const path = window.location.pathname;
    document.body.classList.add('bodyMedium');

    // Check if path contains channel
    if (path.includes("@")) {
        const channelName = document.querySelector(".pw-author-name span").textContent;
        const accoutnId = path.replace("/@","");
        console.log(accoutnId)
        const channelId = path.split('/')[2];
        fetch('https://api.codetabs.com/v1/proxy?quest=https://medium.com/@' + accoutnId + '/about')
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.text().then(function(data) {
                        // Add button
                        var mediumButtonsSection = document.querySelector(".pw-author-name");
                        if (mediumButtonsSection != null) {
                            document.querySelector(".pw-author-name").innerHTML += buttonHtml;
                        }
                        // data contains all the plain html of the url you previously set,
                        // you can use it as you want, it is typeof string
                        const html = new DOMParser().parseFromString(data, "text/html");
                        const lines = html.querySelectorAll('[data-slate-string="true"]');

                        //var lines = description.split("\n");
                        for (var i = 0; i < lines.length; i++)
                        {
                            var line = lines[i].textContent;
                            if (line.includes("NEAR: ")) {
                                const wallet = line.replace("NEAR: ","");
                                document.querySelector("#subnearInsertedButton").setAttribute("accountid", wallet);
                                setupSubButton();
                                checkIfSubscribed();
                            }
                        }
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }
}

function setupGithub() {
    const path = window.location.pathname;
    document.body.classList.add('bodyGithub');

        const channelName = document.querySelector(".url.fn").textContent;
        fetch('https://api.codetabs.com/v1/proxy?quest=https://github.com/' + channelName + '/')
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.text().then(function(data) {
                        // Add button
                        var githubButtonsSection = document.querySelector(".Layout-sidebar");

                        if (githubButtonsSection != null) {
                            console.log(githubButtonsSection);
                            document.querySelector(".Layout-sidebar").innerHTML = buttonHtml + document.querySelector(".Layout-sidebar").innerHTML;
                        }

                        // data contains all the plain html of the url you previously set,
                        // you can use it as you want, it is typeof string
                        const html = new DOMParser().parseFromString(data, "text/html");
                        const description = html.querySelector('.js-user-profile-bio div').textContent;
                        var lines = description.split("\n");
                        for (var i = 0; i < lines.length; i++)
                        {
                            var line = lines[i];
                            if (line.includes("NEAR: ")) {
                                const wallet = line.replace("NEAR: ","");
                                document.querySelector("#subnearInsertedButton").setAttribute("accountid", wallet);
                                setupSubButton();
                                checkIfSubscribed();
                            }
                        }
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
}

// Insert on Youtube
const buttonHtml = '<div id="subnearInsertedButton" accountid="" subscribed="false" style="display: none;"><div id="subButton"><div class="buttonLogo"></div><span class="buttonText not-subscribed">Subscribe</span><span class="buttonText subscribed">Subscribed</span></div></div>';
window.onload = function () {
    setTimeout(function () {
        if (window.location.hostname == "www.youtube.com") {
            setupYoutube();
        } else if (window.location.hostname == "medium.com") {
            setupMedium();
        } else if (window.location.hostname == "github.com") {
            setupGithub();
        } else {
            configureButton();
        }
    }, 500)
}

function configureButton() {
    setupSubButton();
    checkIfSubscribed();
}

// Check if already subscribed
function checkIfSubscribed() {
    const storageName = "subStorage";
    chrome.storage.local.get(storageName, function (obj){
        if (obj.subStorage != null && obj.subStorage.length != 0) {
            for(var i = 0; i < obj.subStorage.length; i++) {
                if (obj.subStorage[i].wallet == document.querySelector("#subnearInsertedButton").getAttribute("accountid")) {
                    document.getElementById("subnearInsertedButton").setAttribute("subscribed", true);
                    document.body.classList.add('subscribedSubnear');
                }
            }
        }
    })
}

function getHtmlFromUrl(url) {
    fetch('https://api.codetabs.com/v1/proxy?quest=' + url)
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }

                // Examine the text in the response
                response.text().then(function(data) {
                    // data contains all the plain html of the url you previously set,
                    // you can use it as you want, it is typeof string
                    return data;
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
}

