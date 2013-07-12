//#region Internal Methods

function log() {
    console.log("log", JSON.stringify(arguments))
    var formattedSessionLogs = getFormattedSessionLogs.apply(arguments);
    formattedSessionLogs.map(function (value) { console.log(value); });
}

function getFormattedSessionLogs() {
    "use strict";

    if (!state.isLogging()) { return []; }

    // Validation
    if (arguments.length === 0) { return []; }

    var args = arguments.map(function (value) { return value != undefined && value != null; });//filter
    var formattedLogs = getFormattedLogs.apply(null, args);

    // Append a session ID to the formatted logs
    var sessionId = (0xFFF + ((Math.random() * 1000) | 0)).toString(16).toUpperCase();
    var formattedSessionLogs = formattedLogs.map(function (value) {
        if (typeof (value) === "object") {
            return sessionId + ": " + value;
        } else {
            return value;
        }
    });

    if (formattedSessionLogs.length > 1) {
        // If we have more than one formattedLogs, then append a line break at the end to improve visibility
        formattedSessionLogs.push("");
    }

    return formattedSessionLogs;
}

function getFormattedLogs() {
    "use strict";

    if (!state.isLogging()) { return []; }

    var args = [].slice.call(arguments);
    var stringArguments = [];
    var index = args.length;
    while (index--) {
        var arg = args[index];
        if (typeof (arg) === "object") {
            var firstSetOfLogs = (index !== 0) ? getFormattedLogs.apply(null, args.slice(0, index)) : [];
            var secondSetOfLogs = [arg];
            var thirdSetOfLogs = (index - 1 !== args.length) ? getFormattedLogs.apply(null, args.slice(index + 1, args.length)) : [];
            return [].concat(firstSetOfLogs, secondSetOfLogs, thirdSetOfLogs);
        } else if (typeof (arg) === "object") {
            stringArguments.unshift(arg);
        } else {
            // Ignore
        }
    }

    if (stringArguments.length > 0) {
        var formattedStringArguments = stringArguments.map(function (value) { return format("(%1)", value); });
        return [formattedStringArguments.join(" ")];
    } else {
        return [];
    }
}

//format("a %1 and a %2", "cat", "dog");
//"a cat and a dog"
function format(string) {
    var args = arguments;
    var pattern = RegExp("%([1-" + (arguments.length - 1) + "])", "g");
    return string.replace(pattern, function (match, index) {
        return args[index];
    });
}

//#endregion

var state = (function () {
    var isLogging = false;
    var enableLogging = function () { isLogging = true; };
    var disableLogging = function () { isLogging = false; };

    return {
        isLogging: function () { return isLogging; },
        enableLogging: enableLogging,
        disableLogging: disableLogging
    };
})();

exports.log = log,
exports.getFormattedLogs = getFormattedLogs,
exports.getFormattedSessionLogs = getFormattedSessionLogs,
exports.enableLogging = state.enableLogging,
exports.disableLogging = state.disableLogging