{
  userId: string,             // ID de l'utilisateur (lié à l'auth/token)
  mode: "apprentissage" | "challenge" | "hardcore",
  type: "training" | "quizz", // type de jeu
  software: string,           // ex: "vscode", "macos", "linux"
  date: string,               // Date ISO de la session
  duration: number,           // Temps total de la session en ms
  score: {
    correct: number,
    wrong: number,
    totalTries: number
  },
  details: [
    {
      action: string,
      correctShortcut: string,
      userInput: string,
      success: boolean,
      responseTime?: number  // uniquement pour challenge et hardcore
    }
  ]
}


Routes API à prévoir
* POST /api/stats/add
Enregistrer une session complète après la fin d'une partie.

Body : correspond à la structure ci-dessus

Auth : nécessite un token JWT valide

* GET /api/stats/history
Récupérer toutes les sessions d’un utilisateur

Query : userId

Retour : tableau de sessions classées par date descendante

* GET /api/stats/summary
Récupérer les stats globales d’un utilisateur

Moyenne de bonnes réponses

Moyenne de temps de réponse (par type ou par logiciel)

Score moyen par mode, etc.

* GET /api/stats/leaderboard
Renvoyer un classement des meilleurs joueurs (optionnel, plus tard)

Données à afficher côté front
1. Historique
Liste de toutes les sessions avec : date, logiciel, score, temps

Bouton "voir détails" ➡ affiche la liste details[]

2. Stats globales
Pourcentage de réussite

Moyenne de temps de réponse

Graphiques par mode / logiciel

3. Classement (future feature)
Top 10 des meilleurs joueurs

Possibilité de se comparer aux autres