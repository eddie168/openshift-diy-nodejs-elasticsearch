#!/bin/env node
//  OpenShift sample Node application

var express = require('express');
var fs      = require('fs');
var http = require('http');

var esServer = "http://"+process.env.OPENSHIFT_DIY_IP+":"+process.env.ES_PORT+"/";
console.log('esServer:%s',esServer);
var checkESServer = function () {
  http.get(esServer, function (res) {
    console.log('>>>ElasticSearch<<<');
    res.setEncoding('utf8');
    res.on('data', function (data) {
      console.log('BODY: %s',data);
    });
  }).on('error', function (err) {
    console.log('ES ERROR: %s', err);
    console.log('ES: Retry in 3s');
    setTimeout(checkESServer, 3000);
  });
};
checkESServer();

//  Local cache for static content [fixed and loaded at startup]
var zcache = { 'index.html': '' };
zcache['index.html'] = fs.readFileSync('./index.html'); //  Cache index.html

// Create "express" server.
var app  = express.createServer();


/*  =====================================================================  */
/*  Setup route handlers.  */
/*  =====================================================================  */

// Handler for GET /health
app.get('/health', function(req, res){
    res.send('1');
});

// Handler for GET /asciimo
app.get('/asciimo', function(req, res){
    var link="https://a248.e.akamai.net/assets.github.com/img/d84f00f173afcf3bc81b4fad855e39838b23d8ff/687474703a2f2f696d6775722e636f6d2f6b6d626a422e706e67";
    res.send("<html><body><img src='" + link + "'></body></html>");
});

// Handler for GET /
app.get('/', function(req, res){
    res.send(zcache['index.html'], {'Content-Type': 'text/html'});
});


//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_DIY_IP;
var port    = process.env.OPENSHIFT_DIY_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_DIY_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node (version: %s) %s started on %s:%d ...', Date(Date.now() ), process.version, process.argv[1], ipaddr, port);
});
