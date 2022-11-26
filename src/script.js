const DOMAIN = "https://www.old-games.ru"
const FORUM = "https://www.old-games.ru/forum/"
const SMALL_PAGE = "https://www.old-games.ru/forum/misc/contact"
const NOTIFICATIONS_PAGE = "https://www.old-games.ru/forum/account/alerts"

const ACTIVE_BADGE_COLOR = [217, 0, 0, 255]
const STRANGE_BADGE_COLOR = "gray"

/* extension api selector START */

let api;
let apiBrowserAction;

if (isFirefox()) {
    api = browser;
    apiBrowserAction = browser.browserAction;
} else if (isChrome()) {
    api = chrome;
    apiBrowserAction = chrome.action;
}

function isFirefox() {
    return (
        typeof browser !== "undefined" && typeof browser.runtime !== "undefined"
    );
}

function isChrome() {
    return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined";
}

/* extension api selector END */


/* periodic refresh logic START */

const INITIAL_DELAY = 0.1; // min
const PERIOD = 5; // min

function getCookie(name) {
    return api.cookies.get({
        url: DOMAIN,
        name: name,
    });
}

const NO_PAGE = "NO_PAGE";

async function getForumPage(myCookie) {
    let myHeaders = new Headers();
    myHeaders.append("Cookie", "xf_user=" + myCookie.value + ";");
    let myInit = {
        method: 'GET',
        headers: myHeaders,
    };
    let myRequest = new Request(SMALL_PAGE, myInit);
    try {
        let response = await fetch(myRequest);
        if (response.ok) {
            return response.text();
        } else {
            return NO_PAGE;
        }
    } catch(error) {}
}

function setStrangeBadge() {
    apiBrowserAction.setBadgeBackgroundColor({color: STRANGE_BADGE_COLOR});
    apiBrowserAction.setBadgeText({text: "?"});
}

function setActiveBadge(count) {
    apiBrowserAction.setBadgeBackgroundColor({color: ACTIVE_BADGE_COLOR});
    apiBrowserAction.setBadgeText({text: count.toString()});
}

function setInactiveBadge() {
    apiBrowserAction.setBadgeText({text: ""});
}

const NOTIFICATION_COUNT_CONTAINER_REGEXP = /<\s*strong[^>]*id="VisitorExtraMenu_AlertsCounter">(\s*)(.*?)(\s*)<\s*\/\s*strong>/m;
const NOTIFICATION_COUNT_REGEXP = /\d+/g;

async function refreshNotifications(alarmInfo) {
    let xf_user_cookie = await getCookie("xf_user");
    if (xf_user_cookie) {
        let forumPage = await getForumPage(xf_user_cookie);
        if (forumPage !== NO_PAGE) {
            let notificationCountContainer = forumPage.match(NOTIFICATION_COUNT_CONTAINER_REGEXP)[2];
            try {
                let notificationCount = notificationCountContainer.match(NOTIFICATION_COUNT_REGEXP)[0];
                //console.log("the count is " + notificationCount);
                if (notificationCount != 0) {
                    setActiveBadge(notificationCount);
                } else {
                    setInactiveBadge();
                }
            } catch(error) {
                // the counter is not a number
                setStrangeBadge();
            }
        } else {
            // didn't receive forum page
            setStrangeBadge();
        }
    } else {
        // no user's login cookie found
        setStrangeBadge();
    }
}

api.alarms.create("refreshNotifications", {
    delayInMinutes: INITIAL_DELAY,
    periodInMinutes: PERIOD
});

api.alarms.onAlarm.addListener(refreshNotifications);

/* periodic refresh logic END */


/* browser/chrome action logic START */

function openNotificationsPage() {
    api.tabs.create({url: NOTIFICATIONS_PAGE});
}

apiBrowserAction.onClicked.addListener(openNotificationsPage);

/* browser/chrome action logic END */


/* auto reset badge logic START */

function autoResetBadgeCallback(responseDetails) {
    if (responseDetails.statusCode === 200) {
        setInactiveBadge();
    }
}

const ALERTS_POPUP_ENDPOINT = "https://www.old-games.ru/forum/account/alerts-popup*";

api.webRequest.onCompleted.addListener(autoResetBadgeCallback, {
    urls: [NOTIFICATIONS_PAGE, ALERTS_POPUP_ENDPOINT]
});

/* auto reset badge logic END */
