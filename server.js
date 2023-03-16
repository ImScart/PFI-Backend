const express = require('express');
const keys = require('./config/keys.js');

const app = express();

// Setting up DB
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);
// Setup database models
require('./model/Account');
const Account = mongoose.model('accounts');

// Routes
app.get('/account', async(req, res) => {
    const {rUsername, rPassword} = req.query;
    if(rUsername ==null || rPassword == null)
    {
        res.send("Missing username or password.");
        return;
    }

    var userAccount = await Account.findOne({username: rUsername})
    if(userAccount == null)
    {
        // Create a new user
        console.log("Creating a new account...")
        {
            var newAccount = new Account({
                username : rUsername,
                password : rPassword,

                lastAuthentication : Date.now()
            });
            await newAccount.save();

            res.send(newAccount);
            return;
        }
    }
    else
    {
        if(rPassword == userAccount.password)
        {
            console.log("retrieving account")
            userAccount.lastAuthentication = Date.now();
            await userAccount.save();
            res.send(userAccount);
        }
        else
        {
            res.send('Invalid password');
        }
    }

});

app.listen(keys.port, () => {
    console.log("Listeting on " + keys.port);
});