const mongoose = require('mongoose');
const Account = mongoose.model('accounts');

module.exports = app =>
{
    // Routes
    app.post('/account', async(req, res) => {
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
                res.send("Invalid credentials");
            }
        }

    });
}
