const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
    username: String,
    password: String,
    salt: String,

    lastAuthentication: Date,

    tempToken:String,
    potionDeVie:Number,
    potionDeVitesse:Number,
    nbrPieces:Number,
    
});

mongoose.model('accounts', accountSchema);