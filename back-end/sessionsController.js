import pool from './database.js';

export const createSession = async (req, res) => {
    const userId = req.user.id;
    const {
        type,
        difficulty,
        software,
        system,
        total_questions,
        total_correct,
        total_wrong,
        average_time_ms,
        answers,
    } = req.body;

    try {
        // 1. Insertion dans la table sessions
        const sessionResult = await pool.query(
            `INSERT INTO sessions (user_id, type, difficulty, software, system, total_questions, total_correct, total_wrong, average_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
            [
                userId,
                type,
                difficulty,
                software,
                system,
                total_questions,
                total_correct,
                total_wrong,
                average_time_ms,
            ]
        );

        const sessionId = sessionResult.rows[0].id;

        // 2. Insertion des détails
        for (const detail of answers) {
            const {
                question_label,
                expected_shortcut,
                user_input,
                is_correct,
                response_time_ms,
            } = detail;

            // 🔍 Requête pour savoir combien de tentatives existent déjà pour ce raccourci dans cette session
            const attemptResult = await pool.query(
                `SELECT COUNT(*) FROM session_details 
                WHERE session_id = $1 AND expected_shortcut = $2`,
                [sessionId, expected_shortcut]
            );

            const attempt_number = parseInt(attemptResult.rows[0].count) + 1;

            await pool.query(
                `INSERT INTO session_details (
                    session_id,
                    question_label,
                    expected_shortcut,
                    user_input,
                    is_correct,
                    response_time_ms,
                    attempt_number
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    sessionId,
                    question_label,
                    expected_shortcut,
                    user_input,
                    is_correct,
                    response_time_ms,
                    attempt_number,
                ]
            );
        }


        res.status(201).json({ message: 'Session enregistrée avec succès !' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la session :', error);
        res.status(500).json({ error: 'Erreur serveur' });

    }
};

export const getUserSessions = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT * FROM sessions WHERE user_id = $1 ORDER BY played_at DESC`,
            [userId]
        );

        const sessions = result.rows;

        // Ajouter les détails pour chaque session
        for (let session of sessions) {
            const detailRes = await pool.query(
                `SELECT question_label, expected_shortcut, user_input, is_correct, response_time_ms
                 FROM session_details
                 WHERE session_id = $1`,
                [session.id]
            );
            session.answers = detailRes.rows;
        }

        res.status(200).json(sessions);
    } catch (err) {
        console.error('Erreur récupération des sessions :', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des sessions' });
    }
};


export const getUserSummary = async (req, res) => {
    const userId = req.user.id;

    try {
        const { rows } = await pool.query(
            `
            WITH user_sessions AS (
                SELECT * FROM sessions WHERE user_id = $1
            ),
            summary AS (
                SELECT 
                    COUNT(*) AS total_sessions,
                    COALESCE(SUM(total_correct), 0) AS total_correct,
                    COALESCE(SUM(total_wrong), 0) AS total_wrong,
                    ROUND(
                        CASE 
                            WHEN SUM(total_correct + total_wrong) > 0 
                            THEN (SUM(total_correct)::decimal / SUM(total_correct + total_wrong)) * 100
                            ELSE 0
                        END
                    ) AS average_score,
                    ROUND(AVG(average_time_ms)) AS average_time_ms,
                    MAX(played_at) AS last_played_at
                FROM user_sessions
            ),
            best_score AS (
                SELECT 
                    id,
                    total_correct,
                    total_questions,
                    played_at
                FROM user_sessions
                ORDER BY (total_correct::decimal / NULLIF(total_questions, 0)) DESC
                LIMIT 1
            ),
            by_type AS (
                SELECT type, COUNT(*) AS count FROM user_sessions GROUP BY type
            ),
            by_software AS (
                SELECT software, COUNT(*) AS count FROM user_sessions GROUP BY software
            ),
            by_system AS (
                SELECT system, COUNT(*) AS count FROM user_sessions GROUP BY system
            ),
            by_difficulty AS (
                SELECT difficulty, COUNT(*) AS count FROM user_sessions GROUP BY difficulty
            )
            SELECT 
                s.*,
                b.id AS best_score_id,
                b.total_correct AS best_score_correct,
                b.total_questions AS best_score_questions,
                b.played_at AS best_score_played_at,
                json_object_agg(bt.type, bt.count) AS distribution_by_type,
                json_object_agg(bs.software, bs.count) AS distribution_by_software,
                json_object_agg(sy.system, sy.count) AS distribution_by_system,
                json_object_agg(d.difficulty, d.count) AS distribution_by_difficulty
            FROM summary s
            LEFT JOIN best_score b ON TRUE
            LEFT JOIN by_type bt ON TRUE
            LEFT JOIN by_software bs ON TRUE
            LEFT JOIN by_system sy ON TRUE
            LEFT JOIN by_difficulty d ON TRUE
            GROUP BY s.total_sessions, s.total_correct, s.total_wrong, s.average_score, s.average_time_ms, s.last_played_at,
                     b.id, b.total_correct, b.total_questions, b.played_at;
            `,
            [userId]
        );

        res.json(rows[0]);

    } catch (err) {
        console.error("Erreur getUserSummary SQL:", err);
        res.status(500).json({ message: "Erreur lors du résumé utilisateur (SQL)." });
    }
};

