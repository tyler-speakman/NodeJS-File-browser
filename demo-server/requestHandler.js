var qs = require("querystring"),
    logServices = require("./logServices"),
    fileSystemTraverseServices = require("./fileSystemTraverseServices");

var isDebug = true;

var readDir = function (response, request) {
    //#region Internal Methods

    function parametersAreValid(path, name, depth) {
        return path.lastIndexOf("\\") == path.length - 1;
    }

    //#endregion

    logServices.log("readDir()", request.url);

    var parameters = qs.parse(request.url.split("?")[1]);
    var path = parameters.path || "", name = parameters.name || "\\", depth = parameters.depth || 0;

    if (!path || path === "") {
        path = name + "\\";
        name = "";
    }

    // Validate parameters
    if (!parametersAreValid(path, name, depth)) {
        response.writeHead(500, { "Content-Type": "text/json" });
        response.end(JSON.stringify({ error: "Invalid path. Must end with backslash" }));
    }

    // Process request
    fileSystemTraverseServices.readdirRecursive({ path: path, name: name }, depth, null, function (err, result) {
        logServices.log("readdirRecursive()", "COMPLETE", err, result);
        response.writeHead(200, { "Content-Type": "text/json" });
        response.end(JSON.stringify(result));
    });
};

var start = function (response) {
    logServices.log("start()", response, request);
    var body = "<!doctype html>\n<html>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html\" charset=UTF-8 />\n</head>\n<body></body>\n</html>";
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(body);
    return response.end();
};

exports.start = start;

exports.readDir = readDir;