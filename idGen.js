//Mathieu Chabot
//Fonction pour générer un jeton aléatoire
function générerJeton(longeur) {
  let résultat = '';
  const caractères = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const longeurCaractères = caractères.length;
  let compteur = 0;
  while (compteur < longeur) {
    résultat += caractères.charAt(Math.floor(Math.random() * longeurCaractères));
    compteur += 1;
  }
  return résultat;
}
module.exports = { générerJeton };