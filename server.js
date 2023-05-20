//Mathieu Chabot
//Fichier qui démarre le serveur

const express = require('express');
const keys = require('./config/keys.js');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}))

const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);

require('./model/Account');

require('./routes/cheminsPourClient')(app);

app.listen(keys.port, () => {
    console.log("Port " + keys.port);
});