var fs = require("fs"),
    qs = require("querystring");

var isDebug = true;

var
 readDir = function (response, request) {
     var parameters = qs.parse(request.url.split("?")[1]);
     log("Request handler 'readDir' was called. " + "(" + parameters + ")");

     if (parameters.path.lastIndexOf("\\") != parameters.path.length - 1) {
         response.writeHead(200, { "Content-Type": "text/json" });
         response.end(JSON.stringify({ error: "Invalid path. Must end with backslash" }));
     }

     var path = parameters.path || "", name = parameters.name || "\\", depth = parameters.depth || 0;
     var parent = { path: path, name: name, isDirectory: true, isAccessible: true };
     readdirRecursive(parent, depth, function () {
         log("Complete");
         response.statusCode = 200;
         response.setHeader("Content-Type", "text/json");
         response.end(JSON.stringify(parent));
     });

     //#region Internal Methods

     function readdirRecursive(parent, depth, callback) {
         log(logParent);
         if (depth-- >= 0 && parent.isDirectory && parent.isAccessible) {
             var fullParentPath = parent.path + parent.name + "\\";
             fs.readdir(fullParentPath, function (err, files) {
                 if (err) {
                     parent.isAccessible = false;
                     callback();
                 }
                 else {
                     parent.children = parent.children || [];
                     var numberOfRequests = files.length;
                     log(logQueuedChildren);
                     if (numberOfRequests === 0) {
                         // If there are no children, then exit.
                         callback();
                     }
                     else {
                         // If there are children, then process them
                         var index = files.length;
                         while (index--) {
                             var fileName = files[index];
                             var child = { path: fullParentPath, name: fileName };
                             parent.children.push(child);
                             processChild(child);
                         }

                         //#region Internal Methods

                         function processChild(child) {
                             child.isUpDir = false;
                             fs.stat(child.path + child.name, function (err, stats) {
                                 if (err) {
                                     child.isAccessible = false;
                                     child.isDirectory = true;
                                 } else {
                                     child.isAccessible = true;
                                     child.isDirectory = false;
                                     child.isFile = false;
                                     if (stats.isFile()) {
                                         child.size = formatFileSize(stats.size);
                                         child.isFile = true;
                                         child.lastModifiedDate = stats.mtime;
                                     } else if (stats.isDirectory()) {
                                         child.isDirectory = true;
                                     } else {
                                     }
                                 }

                                 readdirRecursive(child, depth, trackRequests);
                             });

                             function formatFileSize(size) {
                                 var unitOfSize = "B";
                                 while ((size / 1024 | 0) > 0) {
                                     if (unitOfSize === "B") {
                                         unitOfSize = "kB";
                                     } else if (unitOfSize === "kB") {
                                         unitOfSize = "MB";
                                     } else if (unitOfSize === "MB") {
                                         unitOfSize = "GB";
                                     } else {
                                         break;
                                     }
                                     size = size / 1024 | 0;
                                 }

                                 return size + " " + unitOfSize;
                             }

                             //#endregion
                         }
                     }

                     //#region Internal Methods

                     function trackRequests() {
                         numberOfRequests--;
                         if (numberOfRequests === 0) {
                             callback();
                         }
                         log(logProcessedChildren);
                     }

                     function logQueuedChildren() {
                         return pad("    ", depth) + " " + "Queued children (" + numberOfRequests + ") (" + fullParentPath + ")";
                     }

                     function logProcessedChildren() {
                         return pad("    ", depth) + " " + "Processed children (" + numberOfRequests + ") (" + fullParentPath + ")";
                     }

                     //#endregion
                 }
             });
         }
         else {
             callback();
         }

         //#region Internal Methods

         function logParent() {
             return pad("    ", depth) + " " + JSON.stringify(parent);
         }

         //#endregion
     }

     //#endregion
 }, start = function (response) {
     var body;
     log("Request handler 'start' was called");
     body = "<!doctype html>\n<html>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html\" charset=UTF-8 />\n</head>\n<body></body>\n</html>";
     response.writeHead(200, {
         "Content-Type": "text/html"
     });
     response.write(body);
     return response.end();
 };

function pad(string, count) {
    return (new Array(count + 2)).join(string)
}

function log(message, isDebug) {
    if (isDebug) {
        if ((typeof message == "function")) {
            // Allow the "message" to be a function. Ideally this avoids unneccessary execution -- does it??
            console.log(message());
        }
        else {
            console.log(message);
        }
    }
}

exports.start = start;

exports.readDir = readDir;