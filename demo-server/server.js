// reference the http module so we can create a webserver
var http = require("http");
var url = require("url");

process = process || {};
process.env = process.env || {};
process.env.PORT = process.env.PORT || 8000;
process.env.IP = process.env.IP || "127.0.0.1";

function start(route, handle) {
    var onRequest = function(req, res) {
	
        
        if (req.method.toUpperCase() === "OPTIONS"){
// CORS (Cross-Origin Resource Sharing)        
var origin = (req.headers.origin || "*");
		res.writeHead(
                "204",
                "No Content",
                {
                    "access-control-allow-origin": origin,
                    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "access-control-allow-headers": "content-type, accept, X-Requested-With",
                    "access-control-max-age": 10, // Seconds.
                    "content-length": 0
                }
            );
 
            // End the response - we're not sending back any content.
            return( res.end() );
 
 
        }	
	
	
	res.setHeader("access-control-allow-origin", "*");
	res.setHeader("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("access-control-allow-headers", "content-type, accept, X-Requested-With");

	
      var pathname, postData;
      postData = "";
      pathname = url.parse(req.url).pathname;
      console.log("Request for " + pathname + " received.");
      return route(handle, pathname, res, req);
    };

    // create a server
    http.createServer(onRequest).listen(process.env.PORT, process.env.IP);
    console.log("Server has started.");
}

exports.start = start;

// Note: when spawning a server on Cloud9 IDE, 
// listen on the process.env.PORT and process.env.IP environment variables

// Click the 'Run' button at the top to start your server,
// then click the URL that is emitted to the Output tab of the console