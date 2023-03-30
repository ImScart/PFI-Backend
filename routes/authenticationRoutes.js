const mongoose = require('mongoose');
const Account = mongoose.model('accounts');

const argon2i =require('argon2-ffi').argon2i;
const crypto = require('crypto');
module.exports = app =>
{
    // Routes

    //Login
    app.post('/account/login', async(req, res) => {
        const {rUsername, rPassword} = req.body;
        if(rUsername ==null || rPassword == null)
        {
            res.send("Invalid credentials");
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
                        res.send(userAccount);
                        return;
                    }
                    else
                    {
                        res.send("Invalid credentials");
                        return;
                    }
                    
                });
        }

    });

    //Register
    app.post('/account/register', async(req, res) => {
        const {rUsername, rPassword} = req.body;
        if(rUsername ==null || rPassword == null)
        {
            res.send("Invalid credentials");
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
                        res.send(newAccount);
                        return;
                    });
            });
        }
        else
        {
                res.send("User already exists");
                return;
        }

    });
}
