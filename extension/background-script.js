const DOMAIN = "https://www.old-games.ru"
const FORUM = "https://www.old-games.ru/forum/"
const SMALL_PAGE = "https://www.old-games.ru/forum/misc/contact"
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

const NO_PAGE = "NO_PAGE"

async function getForumPage(myCookie) {
    let myHeaders = new Headers()
    myHeaders.append("Cookie", "xf_user=" + myCookie.value + ";")
    let myInit = {
        method: 'GET',
        headers: myHeaders,
    };
    let myRequest = new Request(SMALL_PAGE, myInit);
    try {
        let response = await fetch(myRequest)
        if (response.ok) {
            return response.text()
        } else {
            return NO_PAGE
        }
    } catch(error) {}
}

const NOTIFICATION_COUNT_CONTAINER_REGEXP = /<\s*strong[^>]*id="VisitorExtraMenu_AlertsCounter">(\s*)(.*?)(\s*)<\s*\/\s*strong>/ms;
const NOTIFICATION_COUNT_REGEXP = /\d+/g;

async function refreshNotifications(alarmInfo) {
    let xf_user_cookie = await getCookie("xf_user");
    if (xf_user_cookie) {
        let forumMainPage = await getForumPage(xf_user_cookie);
        if (forumMainPage !== NO_PAGE) {
            let notificationCountContainer = forumMainPage.match(NOTIFICATION_COUNT_CONTAINER_REGEXP)[2];
            let notificationCount = notificationCountContainer.match(NOTIFICATION_COUNT_REGEXP);
            //console.log("the count is " + notificationCount);
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

browser.browserAction.setBadgeBackgroundColor({color: [217, 0, 0, 255]});
browser.browserAction.onClicked.addListener(openNotificationsPage);

/* browser action logic END */
