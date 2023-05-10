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

        var userAccount = await Account.findOne({username: rUsername}, 'username password tempToken potionDeVie potionDeVitesse nbrPieces')
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
                        response.data = (({username,tempToken,potionDeVie,potionDeVitesse,nbrPieces}) => ({username,tempToken,potionDeVie,potionDeVitesse,nbrPieces}))(userAccount);
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
                            tempToken: "userHasNotLoggedInYet",
                            potionDeVie:0,
                            potionDeVitesse:0,
                            nbrPieces:0,
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

    //+1 Values Stored In Existing User
    app.post('/account/changeValue', async(req, res) => {
        var response = {};

        const {rUsername, rTempToken, rIntValueToChange, rAddOrRemove} = req.body;
        if(rTempToken == null || rUsername == null)
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }
        if(rIntValueToChange == null|| rAddOrRemove >1|| rAddOrRemove <-1|| rAddOrRemove ==0)
        {
            response.code = 2;
            response.msg = ("Invalid value");
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({username: rUsername}, 'username tempToken potionDeVie potionDeVitesse nbrPieces')

        if(userAccount != null)
        {
            if(userAccount.tempToken == rTempToken)
            {
                
                if(rIntValueToChange ==1)
                {
                    console.log("Health potion value is being changed");

                    userAccount.potionDeVie = userAccount.potionDeVie+(1*rAddOrRemove);
                }
                else if(rIntValueToChange ==2)
                {
                    console.log("Speed potion value is being changed");

                    userAccount.potionDeVitesse = userAccount.potionDeVitesse+(1*rAddOrRemove);
                }
                else if(rIntValueToChange ==3)
                {
                    console.log("Coins value is being changed");

                    userAccount.nbrPieces = userAccount.nbrPieces+(1*rAddOrRemove);
                }
                
                await userAccount.save();

                response.code = 0;
                response.msg = ("Success");
                response.data = (({username,potionDeVie,potionDeVitesse,nbrPieces}) => ({username,potionDeVie,potionDeVitesse,nbrPieces}))(userAccount);
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
