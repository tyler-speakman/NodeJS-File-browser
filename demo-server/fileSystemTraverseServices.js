var fs = require("fs"),
    path = require('path'),
    async = require("async"),
    logServices = require("./logServices"),
    fileSystemFormatServices = require("./fileSystemFormatServices"),
    stringFormatServices = require("./stringFormatServices");

function readdirRecursive(parentEntity, depth, err, callback) {
    "use strict";
    logServices.log(stringFormatServices.pad(">> ", 0), 0, "readdirRecursive()", (err == undefined || err == null), parentEntity, depth, err);

    if (err) { callback(err, null); return; }

    if (depth < 0) {
        logServices.log(stringFormatServices.pad(">> ", 2), 2, "readdirRecursive()", "PAST DEPTH");

        // If we have reached our maximum depth, then return immediately with an empty "empty" traversal
        callback(null, parentEntity); return;
    }

    depth--;
    var fullPathOfParent = path.join(parentEntity.path, parentEntity.name);
    fs.readdir(fullPathOfParent, function (err, entities) {
        logServices.log(stringFormatServices.pad(">> ", 2), 2, "fs.readdir()", "CALLBACK", (err == undefined || err == null), err, entities, fullPathOfParent);
        if (err && !(err.code == "ENOTDIR" || err.code === "EPERM" || err.code === "ENOENT")) {
            callback(err, null); return;
        }

        // If we have children, then traverse them
        if (entities) {
            parentEntity.children = entities.map(function (nameOfChild) { return { path: fullPathOfParent + "\\", name: nameOfChild }; });
        }

        var applyEntityUpDirFunction = function (entity, done) { applyEntityUpDir(entity, done); };
        var applyEntityStatsFunction = function (entity, done) { applyEntityStats(entity, done); };
        var applyEntityChildrenFunction = function (entity, done) { applyEntityChildren(entity, depth, done); };
        async.parallelLimit(
            [
                applyEntityUpDirFunction.bind(null, parentEntity),
                applyEntityStatsFunction.bind(null, parentEntity),
                applyEntityChildrenFunction.bind(null, parentEntity)
            ],
            1,
            function (err, results) {
                logServices.log(stringFormatServices.pad(">> ", 4), 4, "readdirRecursive()", "PROCESSING", (err == undefined || err == null), err, results);
                if (err) { callback(err, null); return; }

                callback(null, parentEntity); return;
            }
        );
    });
      
}

function applyEntityChildren(entity, depth, callback) {
    "use strict";
    logServices.log(stringFormatServices.pad(">> ", 6), 6, "applyEntityChildren()", entity);
    if (!entity || !entity.children) { callback(null, entity); return; }

    async.map(
        entity.children,
        function (childEntity, done) {
            readdirRecursive(childEntity, depth, null, done);
        },
        function (err, results) {
            logServices.log(stringFormatServices.pad(">> ", 8), 8, "applyEntityChildren()", "CALLBACK", (err == undefined || err == null), err, results);
            if (err) { callback(err, null); return; }

            callback(null, entity);
        }
    );
}

function applyEntityUpDir(entity, callback) {
    "use strict";
    logServices.log(stringFormatServices.pad(">> ", 6), 6, "applyEntityUpDir()", entity);
    if (!entity || !entity.children || (path.normalize(entity.path) === path.join(entity.path, entity.name))) { callback(null, entity); return; }

    entity.children.push({
        path: path.join(entity.path, entity.name) + "\\",
        name: "..",
        isFile: false,
        isDirectory: true,
        isAccessible: true,
        isUpDir: true
    });

    callback(null, entity); return;
}

function applyEntityStats(entity, callback) {
    "use strict";
    logServices.log(stringFormatServices.pad(">> ", 6), 6, "applyEntityStats()", entity);

    fs.stat(
        entity.path + entity.name,
        function (err, stat) {
            logServices.log(stringFormatServices.pad(">> ", 8), 8, "applyEntityStats()", "CALLBACK", (err == undefined || err == null), err, stat);
            if (err && !stat) { // (err.code === "ENOTDIR" || err.code === "EPERM" || err.code === "ENOENT" || err.code === "EBUSY")) {
                // If an error is encountered, then assume the directory is inaccessible
                entity.isAccessible = false;
                callback(null, entity); return;
            } else if (err) {
                callback(err, null); return;
            }

            // Append the stat info to the entity
            //entity.stat = stat;
            entity.isFile = stat.isFile();
            entity.isDirectory = stat.isDirectory();
            entity.isAccessible = true;
            if (stat.isFile()) {
                entity.size = fileSystemFormatServices.formatFileSize(stat.size);
                entity.lastModifiedDate = stat.mtime;
            }

            callback(null, entity); return;
        }
    );
}

exports.readdirRecursive = readdirRecursive;
exports.applyEntityChildren = applyEntityChildren;
exports.applyEntityStats = applyEntityStats;