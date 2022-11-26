(function() {
    function getExtensionApi() {
        if (isFirefox()) {
            return browser;
        } else if (isChrome()) {
            return chrome;
        }
    }

    function isChrome() {
        return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined";
    }
    
    function isFirefox() {
        return (
            typeof browser !== "undefined" && typeof browser.runtime !== "undefined"
        );
    }

    function myConsoleLog(log) {
        console.log(`ogruNotifier: ${log}`);
    }    

    // map of options with default values
    const OPTION_IDS = {
        refreshPeriod: {
            type: "radio",
            defaultValue: "5",
        },
        includeInboxAlerts: {
            type: "checkbox",
            defaultValue: false,
        },
    };

    function restoreOptions() {
        let api = getExtensionApi();
        let optionIdsKeys = Object.keys(OPTION_IDS);
        api.storage.local.get(optionIdsKeys, function(result) {
            optionIdsKeys.forEach(optionId => {
                const value = result[optionId] || OPTION_IDS[optionId].defaultValue;
                switch(OPTION_IDS[optionId].type) {
                    case "radio":
                        myConsoleLog(`restoring radio ${optionId} as ${value}`);
                        document.getElementById(optionId).value = value;
                        break;
                    case "checkbox":
                        myConsoleLog(`restoring checkbox ${optionId} as ${value}`);
                        document.getElementById(optionId).checked = value;
                        break;
                    default:
                        myConsoleLog("restoring default");
                }
            });
        });
    }

    function save(event) {
        let api = getExtensionApi();
        const optionId = event.target.getAttribute("id");
        let value;
        switch(OPTION_IDS[optionId].type) {
            case "radio":
                myConsoleLog(`saving radio ${optionId} as ${event.target.value}`);
                value = event.target.value;
                break;
            case "checkbox":
                myConsoleLog(`saving checkbox ${optionId} as ${event.target.checked}`);
                value = event.target.checked;
                break;
            default:
                myConsoleLog("saving default");
        }

        api.storage.local.set({[optionId]: value}, function() {
            restoreOptions();
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        restoreOptions();
        document.querySelectorAll("input,select").forEach(
            element => {
                element.addEventListener('change', save);
            }
        );
    });

})();
