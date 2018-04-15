var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var config = require("./config.json");

process.title = "BungeeCP Server";
console.log("BungeeCP Starting...");

app.listen(config.port, function () {
    console.log("BungeeCP Started on Port " + config.port);
});