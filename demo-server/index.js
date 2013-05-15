 var reqHandler = require("./requestHandler"),
     router = require("./router"),
     server = require("./server");


 var handle = {
     "/": reqHandler.start,
     "/start": reqHandler.start,
     "/readDir": reqHandler.readDir
 };

 server.start(router.route, handle);