import express from 'express';
import bcrypt from 'bcrypt';
import pool from './database.js';
import { createSession, getUserSessions, getUserSummary } from './sessionsController.js';

import {
    registerUser,
    loginUser,
    getQuizzIntroPreference,
    updateQuizzIntroPreference,
    updateUserStats,
    getUserStats,
} from './authController.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();


// Routes préférences utilisateur
router.get('/preferences/quizz-intro', verifyToken, getQuizzIntroPreference);
router.patch('/preferences/quizz-intro', verifyToken, updateQuizzIntroPreference);
router.post('/register', registerUser); // 👈 On délègue au controller
router.post('/login', loginUser);
router.get('/mon-compte', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Accès autorisé à la page Mon Compte',
        user: req.user, // req.user a été ajouté dans le middleware
    });
});
router.post('/stats', verifyToken, updateUserStats);
router.get('/mes-stats', verifyToken, getUserStats);

/* route stats */

router.post('/sessions', verifyToken, createSession);
router.get("/stats/me/sessions", verifyToken, getUserSessions);

router.get('/user/summary', verifyToken, getUserSummary);
// router.get('/leaderboard', getLeaderboard);

export default router;


/*

POST /stats
GET /stats/per_quizz
GET /stats/quizz_history



*/
