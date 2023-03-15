const express = require('express');
const keys = require('./config/keys.js');

const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');

// Routes
app.get('/auth', async(req, res) => {
console.log(req.query);
res.send("Hello World! It is " + Date.now());
});

app.listen(keys.port, () => {
    console.log("Listeting on " + keys.port);
});