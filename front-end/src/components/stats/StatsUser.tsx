import React, { useEffect, useState } from 'react';
import styles from './StatsUser.module.css';

interface Summary {
    total_quizz: string;
    total_correct: string;
    total_wrong: string;
    average_score: string;
}

interface BestScore {
    total_correct_answers: number;
    total_questions: number;
    played_at: string;
}

interface HistoryEntry {
    played_at: string;
    total_correct_answers: number;
    total_wrong_answers: number;
    total_questions: number;
}

interface StatsData {
    summary: Summary;
    bestScore: BestScore | null;
    history: HistoryEntry[];
}

const StatsUser = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/auth/mes-stats', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Erreur récupération stats :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <p>Chargement...</p>;
    if (!stats) return <p>Aucune statistique trouvée.</p>;

    return (
        <div className={styles.container}>
            {/* Résumé */}
            <div className={styles.summary}>
                <h2>Résumé</h2>
                <p>Total de quizz joués : {stats.summary.total_quizz}</p>
                <p>Total de bonnes réponses : {stats.summary.total_correct}</p>
                <p>Total de mauvaises réponses : {stats.summary.total_wrong}</p>
                <p>Score moyen : {stats.summary.average_score}%</p>
            </div>

            {/* Meilleur score */}
            {stats.bestScore && (
                <div className={styles.bestScore}>
                    <h2>Meilleur Score</h2>
                    <p>Score parfait : {stats.bestScore.total_correct_answers} / {stats.bestScore.total_questions}</p>
                    <p>Date : {new Date(stats.bestScore.played_at).toLocaleDateString('fr-FR')}</p>
                </div>
            )}

            {/* Historique */}
            <div className={styles.history}>
                <h2>Historique</h2>
                {stats.history.length === 0 ? (
                    <p>Pas d'historique disponible.</p>
                ) : (
                    <ul>
                        {stats.history.map((entry, index) => (
                            <li key={index}>
                                {new Date(entry.played_at).toLocaleDateString('fr-FR')} : {entry.total_correct_answers} bonnes réponses / {entry.total_questions} questions
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default StatsUser;
