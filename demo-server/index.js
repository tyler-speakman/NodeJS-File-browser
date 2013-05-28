var reqHandler = require("./requestHandler"),
    router = require("./router"),
    server = require("./server");

var handle = {
    "/": reqHandler.start,
    "/start": reqHandler.start,
    "/readDir": reqHandler.readDir
};

server.start(router.route, handle);

//http://127.0.0.1:8000/readDir?path=c:\&name=New%20folder