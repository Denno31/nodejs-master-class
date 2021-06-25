/**
 *
 *
 * primary file for the API
 *
 */
//Dependencies

var http = require("http");
var https = require('https')
var url = require("url");
const { StringDecoder } = require("string_decoder");
var config = require('./config');
var fs = require('fs')
var handlers = require('./lib/handlers')

var helpers = require('./lib/helpers')
// The server should respond to all requests with a string
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req,res)
});
// instantiate http server
httpServer.listen(config.httpPort, function () {

  console.log("The server is listening on port "+config.httpPort);
});

// instantiate HTTPS createServer
var httpsServerOptions ={
  'key': fs.readFileSync('./https/key-pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res)
})
// start HTTPS server
httpsServer.listen(config.httpsPort, function () {

  console.log("The server is listening on port "+config.httpsPort);
});

// All the server ogic for both http and https server
var unifiedServer = function(req,res){
  // get the url and parse it
  var parsedUrl = url.parse(req.url, true);
  // get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");
  //   get the qurey string as an object
  var queryStringObject = parsedUrl.query;

  //   get the http method
  var method = req.method.toLowerCase();
  // Get the headers as an object
  var headers = req.headers;
  //Get the payload if any
  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
    buffer += decoder.end();
    // choose the handler this request should go to.

    var chosenHandler =
       typeof router[trimmedPath] !== 'undefined'
        ? router[trimmedPath]
        : handlers.notFound;

    // construct a data object to send to the handler
    var data = {
      "trimmedPath": trimmedPath,
      "queryStringObject": queryStringObject,
      "method": method,
      "headers": headers,
      "payload": helpers.parseJsonToObject(buffer),
    };

    //Route the request to the chosen handler
    chosenHandler(data, function (statusCode, payload) {
      // Use the status coded called back by the handler, or default 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      //   use the payload called back by the handler, or default to
      payload = typeof payload == "object" ? payload : {};
      // convert the payload to a string
      var payload = JSON.stringify(payload);
      // return the response
      res.setHeader('Content-Type','application/json')
      res.writeHead(statusCode);
      res.end(payload);
      console.log("Returning this response ", statusCode, payload);
    });

    // send the response

    // log the request path
  });
}

// Define a request router
var router = {
  "ping": handlers.ping,
  "users":handlers.users,
  "tokens":handlers.tokens,
  "checks":handlers.checks
};
