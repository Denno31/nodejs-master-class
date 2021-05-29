
/*
*entry point for the api

*/

var http = require('http');
var url = require('url')
var { StringDecoder } = require("string_decoder");
var server = http.createServer((req,res)=>{
  // parse url
  var parsedUrl = url.parse(req.url,true)
  // remove slashes from parsedUrl pathname
  var trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
  // choose a handler to use depending on the url path
  console.log(routes[trimmedPath])
  var chosenHandler = routes[trimmedPath] !== undefined ? routes[trimmedPath]: handlers.notFound
// to store incoming data stream
  var buffer = ''
  var queryStringObject = parsedUrl.query;

  //   get the http method
  var method = req.method.toLowerCase();
  // Get the headers as an object
  var headers = req.headers;
  var decoder = new StringDecoder("utf-8")
  var data = {
    method,
    queryStringObject,
    headers,
    payload:buffer
  }
  req.on("data",function(data){
    buffer  += decoder.write(data)

  })
  req.on("end", function(){
    buffer += decoder.end()
    chosenHandler(data,function(statusCode,payload){
       statusCode = typeof statusCode == "number"? statusCode: 200;
       payload = typeof payload =="object" ? payload: {}

      res.setHeader("Content-Type","application/json")
      res.writeHead(statusCode)
      res.end(JSON.stringify(payload))
    })

  })
})
server.listen(3000, ()=>{
  console.log("server started on port 3000")
})
var handlers = {}

handlers.hello = function(data,callback){
  callback(200,{message:"Welcome to my API"})

}
handlers.notFound = function(data,callback){
  callback(404)
}
var routes = {
  "hello":handlers.hello
}
