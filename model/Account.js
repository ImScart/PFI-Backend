//Mathieu Chabot
//Ce code est le "modèle" de la base de données. Elle décrit ce que chaque compte possède.
const mongoose = require('mongoose');
const { Schema } = mongoose;

const compteschema = new Schema({
    nomUtilisateur: String,
    motDePasse: String,
    salt: String,

    derniereConnexion: Date,

    jetonTemporaire:String,
    potionDeVie:Number,
    potionDeVitesse:Number,
    nbrPieces:Number,
    
});

mongoose.model('comptes', compteschema);