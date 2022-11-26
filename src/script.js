const DOMAIN = "https://www.old-games.ru";
const FORUM = "https://www.old-games.ru/forum/";
const SMALL_PAGE = "https://www.old-games.ru/forum/misc/contact";
const NOTIFICATIONS_PAGE = "https://www.old-games.ru/forum/account/alerts";
const CONVERSATIONS_PAGE = "https://www.old-games.ru/forum/conversations/";

const ACTIVE_BADGE_COLOR = [217, 0, 0, 255];
const STRANGE_BADGE_COLOR = "gray";
const DEFAULT_BADGE_TITLE = "Old-Games.RU Notifier";

function myConsoleLog(log) {
    console.log(`ogruNotifier: ${log}`);
}

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

const INITIAL_DELAY = 0.1; // minutes
const DEFAULT_PERIOD = 5; // minutes
const DEFAULT_INCLUDE_INBOX_ALERTS = false;
let includeInboxAlerts;

let notificationCount = 0;
let newConversationsCount = 0;

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
    apiBrowserAction.setTitle({title: "Error occured while trying to refresh notifications. Please, check if you logged in or wait if it's a network error."})
}

function updateBadgeValue() {
    const newValue = notificationCount + newConversationsCount;
    if (newValue != 0) {
        let badgeTitle = `Forum notifications: ${notificationCount}`;
        if (newConversationsCount > 0) {
            badgeTitle = `${badgeTitle}\nUnread conversations: ${newConversationsCount}`;
        }
        apiBrowserAction.setBadgeBackgroundColor({color: ACTIVE_BADGE_COLOR});
        apiBrowserAction.setBadgeText({text: newValue.toString()});
        apiBrowserAction.setTitle({title: badgeTitle});
    } else {
        apiBrowserAction.setBadgeText({text: ""});
        apiBrowserAction.setTitle({title: DEFAULT_BADGE_TITLE});
    }
}

const NOTIFICATION_COUNT_CONTAINER_REGEXP = /<\s*strong[^>]*id="VisitorExtraMenu_AlertsCounter">(\s*)(.*?)(\s*)<\s*\/\s*strong>/m;
const NEW_CONVERSATIONS_COUNT_CONTAINER_REGEXP = /<\s*strong[^>]*id="VisitorExtraMenu_ConversationsCounter">(\s*)(.*?)(\s*)<\s*\/\s*strong>/m;
const COUNT_REGEXP = /\d+/g;

async function refreshNotifications() {
    let xf_user_cookie = await getCookie("xf_user");
    if (xf_user_cookie) {
        let forumPage = await getForumPage(xf_user_cookie);
        if (forumPage !== NO_PAGE) {
            let notificationCountContainer = forumPage.match(NOTIFICATION_COUNT_CONTAINER_REGEXP)[2];
            let newConversationsCountContainer = forumPage.match(NEW_CONVERSATIONS_COUNT_CONTAINER_REGEXP)[2];
            try {
                notificationCount = Number(notificationCountContainer.match(COUNT_REGEXP)[0]);
                if (includeInboxAlerts) {
                    newConversationsCount = Number(newConversationsCountContainer.match(COUNT_REGEXP)[0]);
                } else {
                    newConversationsCount = 0;
                }
                myConsoleLog("notification count is " + notificationCount);
                myConsoleLog("newConversations count is " + newConversationsCount);
                updateBadgeValue();
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

api.storage.local.get(["refreshPeriod", "includeInboxAlerts"], function(result) {
    const period = Number(result["refreshPeriod"]) || DEFAULT_PERIOD;
    includeInboxAlerts = result["includeInboxAlerts"] || DEFAULT_INCLUDE_INBOX_ALERTS;

    myConsoleLog(`creating FIRST alarm with period ${period}`);
    api.alarms.create("refreshNotifications", {
        delayInMinutes: INITIAL_DELAY,
        periodInMinutes: period
    });

    api.alarms.onAlarm.addListener(refreshNotifications);
});

api.storage.onChanged.addListener(function(changes, namespace) {
    for (let [optionId, { oldValue, newValue }] of Object.entries(changes)) {
        if (optionId == "refreshPeriod" && newValue !== oldValue) {
            api.alarms.clear("refreshNotifications", () => {
                myConsoleLog(`cleared old alarm with period ${oldValue || DEFAULT_PERIOD} and creating new alarm with period ${newValue}`);
                api.alarms.create("refreshNotifications", {
                    delayInMinutes: Number(newValue),
                    periodInMinutes: Number(newValue)
                });
            });
        }

        if (optionId == "includeInboxAlerts" && newValue !== oldValue) {
            myConsoleLog(`includeInboxAlerts oldValue ${oldValue || DEFAULT_INCLUDE_INBOX_ALERTS} changed to ${newValue}`);
            includeInboxAlerts = newValue;
            refreshNotifications();
        }
    }
});

/* periodic refresh logic END */


/* browser/chrome action logic START */

function openNotificationsPage() {
    let urlToOpen = NOTIFICATIONS_PAGE;
    if (newConversationsCount > 0 && notificationCount == 0) {
        urlToOpen = CONVERSATIONS_PAGE;
    }
    api.tabs.create({url: urlToOpen});
}

apiBrowserAction.onClicked.addListener(openNotificationsPage);

/* browser/chrome action logic END */


/* auto reset badge logic START */

function resetNotificationCount(responseDetails) {
    if (responseDetails.statusCode === 200) {
        notificationCount = 0;
        updateBadgeValue();
    }
}

function tryToResetNewConversationsCount(responseDetails) {
    myConsoleLog("redirect detected");
    const isUnreadConversationOpened = responseDetails.url.endsWith("/unread");
    if (responseDetails.statusCode === 307 && isUnreadConversationOpened) {
        myConsoleLog("a conversation read, decrementing newConversationsCount");
        newConversationsCount--;
        if (newConversationsCount < 0) {
            newConversationsCount = 0;
        }
        updateBadgeValue();
    }
}

const ALERTS_POPUP_ENDPOINT = "https://www.old-games.ru/forum/account/alerts-popup*";
const OPEN_UNREAD_CONVERSATION = "https://www.old-games.ru/forum/conversations/*/unread";

api.webRequest.onCompleted.addListener(resetNotificationCount, {
    urls: [NOTIFICATIONS_PAGE, ALERTS_POPUP_ENDPOINT]
});

api.webRequest.onBeforeRedirect.addListener(tryToResetNewConversationsCount, {
    urls: [OPEN_UNREAD_CONVERSATION]
});

/* auto reset badge logic END */
