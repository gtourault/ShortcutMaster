import pool from './database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const SECRET_KEY = 'ton_secret_super_secret';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Email invalide." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
        }

        // Vérifie si un utilisateur existe déjà
        const userExists = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Nom d’utilisateur ou email déjà utilisé." });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion en BDD
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès !',
            user: newUser.rows[0]
        });

    } catch (error) {
        // Gère les erreurs de contrainte UNIQUE 
        if (error.code === '23505') {
            return res.status(400).json({ message: "Email ou nom déjà utilisé (contrainte BDD)." });
        }

        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const loginUser = async (req, res) => {
    const SECRET_KEY = 'ton_secret_super_secret';

    try {
        const { email, password } = req.body;

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Email incorrect' });
        }

        const user = userCheck.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        // 🔐 GÉNÉRATION DU TOKEN
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token, // envoie le token ici
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getQuizzIntroPreference = async (req, res) => {
    const userId = req.user.id; // récupéré via le token

    try {
        const result = await pool.query(
            'SELECT show_quizz_intro FROM users WHERE id = $1',
            [userId]
        );

        res.status(200).json({ showIntro: result.rows[0].show_quizz_intro });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de la préférence." });
    }
};

export const updateQuizzIntroPreference = async (req, res) => {
    const userId = req.user.id;
    const { showIntro } = req.body;

    try {
        await pool.query(
            'UPDATE users SET show_quizz_intro = $1 WHERE id = $2',
            [showIntro, userId]
        );

        res.status(200).json({ message: "Préférence mise à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
    }
};

export const updateUserStats = async (req, res) => {
    console.log('Requête pour ajouter une nouvelle entrée dans quizz_history reçue');
    const userId = req.user.id;
    const { correct_answers, wrong_answers, total_questions, quizz_name } = req.body;
    console.log('Données reçues:', req.body);
    console.log('ID utilisateur:', userId);

    try {
        // Insérer une nouvelle ligne dans quizz_history
        await pool.query(
            `INSERT INTO quizz_history (played_at, total_questions, total_correct_answers, total_wrong_answers, user_id, quizz_name)
             VALUES (NOW(), $1, $2, $3, $4, $5)`,
            [total_questions, correct_answers, wrong_answers, userId, quizz_name]
        );

        res.status(200).json({ message: "Partie enregistrée dans l'historique avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'enregistrement dans l'historique :", err);
        res.status(500).json({ message: "Erreur serveur lors de l'enregistrement dans l'historique." });
    }
};

export async function getUserStats(req, res) {
    const userId = req.user.id;

    try {
        const [summaryResult, bestScoreResult, historyResult] = await Promise.all([
            pool.query(`
          SELECT
            COUNT(*) AS total_quizz,
            SUM(total_correct_answers) AS total_correct,
            SUM(total_wrong_answers) AS total_wrong,
            ROUND(SUM(total_correct_answers)::decimal / NULLIF(SUM(total_questions), 0) * 100, 2) AS average_score
          FROM quizz_history
          WHERE user_id = $1
        `, [userId]),
            pool.query(`
          SELECT
            total_correct_answers,
            total_questions,
            played_at
          FROM quizz_history
          WHERE user_id = $1
          ORDER BY total_correct_answers DESC, played_at ASC
          LIMIT 1
        `, [userId]),
            pool.query(`
          SELECT
            played_at,
            total_correct_answers,
            total_wrong_answers,
            total_questions
          FROM quizz_history
          WHERE user_id = $1
          ORDER BY played_at ASC
        `, [userId])
        ]);

        res.status(200).json({
            summary: summaryResult.rows[0],
            bestScore: bestScoreResult.rows[0] || null,
            history: historyResult.rows
        });
    } catch (error) {
        console.error('Erreur récupération stats:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

