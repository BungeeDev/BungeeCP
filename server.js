process.title = "BungeeCP Server";
console.log("BungeeCP Starting...");
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const config = require("./config.json");
const bodyParser = require('body-parser');
const logger = require("morgan");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(config.port, function () {
    console.log("BungeeCP Started on Port " + config.port);
});