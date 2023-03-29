const express = require('express');
const keys = require('./config/keys.js');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}))

// Setting up DB
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);
// Setup database models
require('./model/Account');

// Setup the routes
require('./routes/authenticationRoutes')(app);

app.listen(keys.port, () => {
    console.log("Listeting on " + keys.port);
});