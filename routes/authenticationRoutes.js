const mongoose = require('mongoose');
const Account = mongoose.model('accounts');

const argon2i =require('argon2-ffi').argon2i;
const crypto = require('crypto');
module.exports = app =>
{
    // Routes

    //Login
    app.post('/account/login', async(req, res) => {

        var response = {};


        const {rUsername, rPassword} = req.body;
        if(rUsername ==null || rPassword == null)
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({username: rUsername})
        if(userAccount != null)
        {
            argon2i.verify(userAccount.password,rPassword).then(async success =>
                {
                    if(success)
                    {
                        userAccount.lastAuthentication = Date.now();
                        await userAccount.save();

                        response.code = 0;
                        response.msg = ("Account found");
                        response.data = userAccount;
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
        if(rUsername ==null || rPassword == null)
        {
            response.code = 1;
            response.msg = ("Invalid credentials");
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({username: rUsername})
        if(userAccount == null)
        {
            // Create a new user
            crypto.randomBytes(32,function(err,salt)
            {
                argon2i.hash(rPassword,salt).then(async hash=>
                    {
                        var newAccount = new Account({
                            username : rUsername,
                            password : hash,
                            salt : salt,
        
                            lastAuthentication : Date.now()
                        });
                        await newAccount.save();
                        response.code = 0;
                        response.msg = ("Account found");
                        response.data = userAccount;
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
}
