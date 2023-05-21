// Mathieu Chabot
// Application. Ce script décrit chaque méthode du serveur. Créer un compte, se connecter et changer des données.
const mongoose = require('mongoose');
const Account = mongoose.model('comptes');

const argon2i =require('argon2-ffi').argon2i;
const crypto = require('crypto');
var idGen = require('../idGen');

// RegEx pour s'assurer que les mots de passes sont sécurisés.
const motDePasseRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})", "gm");

module.exports = app =>
{
    // Chemins

    //Connexion
    app.post('/compte/connexion', async(req, res) => {

        var reponse = {};


        const {rnomUtilisateur, rmotDePasse} = req.body;
        //Vérifie si une des valeurs reçues est vide.
        if(rnomUtilisateur ==null || rmotDePasse ==false)
        {
            reponse.code = 1;
            reponse.msg = ("Informations invalides");
            res.send(reponse);
            return;
        }

        //Recherche dans la base de données pour trouver le compte du client.
        var compteJoueur = await Account.findOne({nomUtilisateur: rnomUtilisateur}, 'nomUtilisateur motDePasse jetonTemporaire potionDeVie potionDeVitesse nbrPieces')
        if(compteJoueur != null) // Si le compte existe
        {
            argon2i.verify(compteJoueur.motDePasse,rmotDePasse).then(async success =>
                {
                    if(success) // Bon mot de passe
                    {
                        console.log("Connexion détectée");
                        compteJoueur.derniereConnexion = Date.now();
                        compteJoueur.jetonTemporaire = idGen.générerJeton(50); // créer le jeton temporaire pour modifier les données
                        await compteJoueur.save(); // Sauvegarder le jeton

                        reponse.code = 0;
                        reponse.msg = ("Compte trouvé");
                        reponse.donnees = (({nomUtilisateur,jetonTemporaire,potionDeVie,potionDeVitesse,nbrPieces}) => ({nomUtilisateur,jetonTemporaire,potionDeVie,potionDeVitesse,nbrPieces}))(compteJoueur);
                        res.send(reponse); // Envoyer au client les informations.
                        return;
                    }
                    else // Mauvais mot de passe
                    {
                        reponse.code = 1;
                        reponse.msg = ("Informations invalides");
                        res.send(reponse);
                        return;
                    }
                    
                });
        }
        else // Aucun compte qui existe avec ce nom d'utilisateur.
        {
            reponse.code = 1;
            reponse.msg = ("Informations invalides");
            res.send(reponse);
            return;
        }

    });

    //Inscription
    app.post('/compte/inscription', async(req, res) => {

        var reponse = {};
        const {rnomUtilisateur, rmotDePasse} = req.body;
        if(rnomUtilisateur == null)
        {
            reponse.code = 1;
            reponse.msg = ("Informations invalides");
            res.send(reponse);
            return;
        }
        if(!motDePasseRegex.test(rmotDePasse)) // Mot de passe non sécuritaire
        {
            reponse.code = 3;
            reponse.msg = ("mot de passe non sécuritaire");
            res.send(reponse);
            return;
        }

        var compteJoueur = await Account.findOne({nomUtilisateur: rnomUtilisateur}, '_id') // Recherche si un compte existe déjà avec ce nom d'utilisateur
        if(compteJoueur == null) // Aucun compte
        {
            // Créer un nouveau compte
            crypto.randomBytes(32,function(err,salt)
            {
                argon2i.hash(rmotDePasse,salt).then(async hash=> // Encryption du mot de passe en argon2-ffi
                    {
                        var nouveauCompte = new Account({
                            nomUtilisateur : rnomUtilisateur,
                            jetonTemporaire: "aucuneConnexion",
                            potionDeVie:0,
                            potionDeVitesse:0,
                            nbrPieces:10,
                            motDePasse : hash,
                            salt : salt,
        
                            derniereConnexion : Date.now()
                        });
                        console.log("Un compte vient d'etre créé");
                        await nouveauCompte.save();
                        reponse.code = 0;
                        reponse.msg = ("Succès");
                        res.send(reponse);
                    });
            });
        }
        else // Nom d'utilisateur déjà utilisé
        {
            reponse.code = 2;
            reponse.msg = ("nom d'utilisateur déjà utilisé");
            res.send(reponse);
            return;
        }

    });

    // Changer la valeur dans le compte d'un joueur
    app.post('/compte/changerValeur', async(req, res) => {
        var reponse = {};

        const {rnomUtilisateur, rjetonTemporaire, rIntValeurAChanger, rAjouterOuRetirer} = req.body;
        if(rjetonTemporaire == null || rnomUtilisateur == null) //Vérifie si une des valeurs reçues est vide.
        {
            reponse.code = 1;
            reponse.msg = ("Informations invalides");
            res.send(reponse);
            return;
        }
        if(rIntValeurAChanger == null|| rAjouterOuRetirer >1|| rAjouterOuRetirer <-1|| rAjouterOuRetirer ==0) //Vérifie si une des valeurs reçues est invalide
        {
            reponse.code = 2;
            reponse.msg = ("Valeurs invalides");
            res.send(reponse);
            return;
        }

        var compteJoueur = await Account.findOne({nomUtilisateur: rnomUtilisateur}, 'nomUtilisateur jetonTemporaire potionDeVie potionDeVitesse nbrPieces') // Recherche dans la base de données un compte avec le nom d'utilisateur

        if(compteJoueur != null) // Compte existant
        {
            if(compteJoueur.jetonTemporaire == rjetonTemporaire) // Vérifie que le jeton donné est le bon
            {
                
                if(rIntValeurAChanger ==1) // Potion de vie
                {
                    console.log("Valeur de potion de vie changée");

                    compteJoueur.potionDeVie = compteJoueur.potionDeVie+(1*rAjouterOuRetirer);
                }
                else if(rIntValeurAChanger ==2) // Potion de vitesse
                {
                    console.log("Valeur de potion de vitesse changée");

                    compteJoueur.potionDeVitesse = compteJoueur.potionDeVitesse+(1*rAjouterOuRetirer);
                }
                else if(rIntValeurAChanger ==3) // Pièces
                {
                    console.log("Valeur de pièces changée");
                    compteJoueur.nbrPieces = compteJoueur.nbrPieces+(1*rAjouterOuRetirer);
                }
                await compteJoueur.save();

                reponse.code = 0;
                reponse.msg = ("Succès");
                reponse.donnees = (({nomUtilisateur,potionDeVie,potionDeVitesse,nbrPieces}) => ({nomUtilisateur,potionDeVie,potionDeVitesse,nbrPieces}))(compteJoueur);
                res.send(reponse);
                return;
            }
            else // Aucun compte avec le nom d'utilisateur
            {
                reponse.code = 1;
                reponse.msg = ("Informations invalides");
                res.send(reponse);
                return;
            }
        };
    });
    
}
