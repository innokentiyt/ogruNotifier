const DOMAIN = "https://www.old-games.ru"
const FORUM = "https://www.old-games.ru/forum/"
const NOTIFICATIONS_PAGE = "https://www.old-games.ru/forum/account/alerts"

/* periodic refresh logic START */

const INITIAL_DELAY = 0.1; // min
const PERIOD = 5; // min

function getCookie(name) {
    return browser.cookies.get({
        url: DOMAIN,
        name: name,
    });
}

async function getForumMainPage(myCookie) {
    let myHeaders = new Headers()
    myHeaders.append("Cookie", "xf_user=" + myCookie.value + ";")
    let myInit = {
        method: 'GET',
        headers: myHeaders,
    };
    let myRequest = new Request(FORUM, myInit);
    try {
        let response = await fetch(myRequest)
        if (response.ok) {
            //console.log(response.headers.get("content-length"))
            return response.text()
        } else {
            //console.log(response.headers)
            return "NO_PAGE"
        }
    } catch(error) {
        //console.error('getForumMainPage error:', error);
    }
}

async function refreshNotifications(alarmInfo) {
    //console.log("on alarm: " + alarmInfo.name);
    var xf_user_cookie = await getCookie("xf_user");
    if (xf_user_cookie) {
        //console.log(xf_user_cookie.expirationDate);
        let forumMainPage = await getForumMainPage(xf_user_cookie);
        if (forumMainPage === "NO_PAGE") {
            //console.log(forumMainPage);
        } else {
            //console.log("page got!");
            let notificationCountContainerRegexp = /<\s*strong[^>]*id="VisitorExtraMenu_AlertsCounter">(\s*)(.*?)(\s*)<\s*\/\s*strong>/ms;
            let notificationCountContainer = forumMainPage.match(notificationCountContainerRegexp)[2];
            let notificationCountRegexp = /\d+/g;
            let notificationCount = notificationCountContainer.match(notificationCountRegexp);
            //console.log("the container is " + notificationCountContainer);
            console.log("the count is " + notificationCount);
            if (notificationCount > 0) {
                browser.browserAction.setBadgeText({text: notificationCount.toString()});
            }
        }
    }
}

browser.alarms.create("refreshNotifications", {
    delayInMinutes: INITIAL_DELAY,
    periodInMinutes: PERIOD
});

browser.alarms.onAlarm.addListener(refreshNotifications);

/* periodic refresh logic END */


/* browser action logic START */

function openNotificationsPage() {
    browser.tabs.create({url: NOTIFICATIONS_PAGE});
    browser.browserAction.setBadgeText({text: ""});
}

browser.browserAction.onClicked.addListener(openNotificationsPage);

/* browser action logic END */
