const express = require('express');
const keys = require('./config/keys.js');

const app = express();

// Setting up DB
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);
// Setup database models
require('./model/Account');

// Routes
app.get('/account', async(req, res) => {

    console.log(req.query);
    const {username, password} = req.query;
    console.log(username);
    console.log(password);
    res.send('hello');

});

app.listen(keys.port, () => {
    console.log("Listeting on " + keys.port);
});