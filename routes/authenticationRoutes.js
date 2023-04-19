const mongoose = require('mongoose');
const Account = mongoose.model('accounts');

const argon2i =require('argon2-ffi').argon2i;
const crypto = require('crypto');
var idGen = require('../idGen');

const passwordRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})", "gm");


module.exports = app =>
{
    // Routes

    //Login
    app.post('/account/login', async(req, res) => {

        var response = {};


        const {rUsername, rPassword} = req.body;
        if(rUsername ==null || rPassword ==false)
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({username: rUsername}, 'username password tempToken health')
        if(userAccount != null)
        {
            argon2i.verify(userAccount.password,rPassword).then(async success =>
                {
                    if(success)
                    {
                        console.log("Someone logged in");
                        userAccount.lastAuthentication = Date.now();
                        userAccount.tempToken = idGen.generateToken(50);
                        await userAccount.save();

                        response.code = 0;
                        response.msg = ("Account found");
                        response.data = (({username,tempToken,health}) => ({username,tempToken,health}))(userAccount);
                        res.send(response);
                        return;
                    }
                    else
                    {
                        response.code = 1;
                        response.msg = ("Invalid credentials");
                        res.send(response);
                        return;
                    }
                    
                });
        }
        else
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }

    });

    //Register
    app.post('/account/register', async(req, res) => {

        var response = {};
        const {rUsername, rPassword} = req.body;
        if(rUsername == null)
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }
        if(!passwordRegex.test(rPassword))
        {
            response.code = 3;
            response.msg = ("Unsafe Password");
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({username: rUsername}, '_id')
        if(userAccount == null)
        {
            // Create a new user
            crypto.randomBytes(32,function(err,salt)
            {
                argon2i.hash(rPassword,salt).then(async hash=>
                    {
                        var newAccount = new Account({
                            username : rUsername,
                            health: 100,
                            tempToken : 0,
                            password : hash,
                            salt : salt,
        
                            lastAuthentication : Date.now()
                        });
                        console.log("Someone created a new account");
                        await newAccount.save();
                        response.code = 0;
                        response.msg = ("Account created");
                        res.send(response);
                    });
            });
        }
        else
        {
            response.code = 2;
            response.msg = ("Username is already taken");
            res.send(response);
            return;
        }

    });

    //ModifyHealth
    app.post('/account/health', async(req, res) => {
        var response = {};


        const {rUsername, rTempToken} = req.body;
        if(rTempToken == null || rUsername == null)
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({username: rUsername}, 'username tempToken')
        if(userAccount != null)
        {
            if(userAccount.tempToken == rTempToken)
            {
                console.log("A value is being changed");
                userAccount.health = 69;
                await userAccount.save();

                response.code = 0;
                response.msg = ("Success");
                res.send(response);
                return;
            }
            else
            {
                response.code = 1;
                response.msg = ("Invalid credentials");
                res.send(response);
                return;
            }
        };
    });
    
}
