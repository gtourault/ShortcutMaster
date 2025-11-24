import { useEffect, useState } from 'react';
import styles from './StatsUser.module.css';
import LineComp from '../ui/LineCharts/LineComp';
import { Session } from '../../types/sessions';

/*
const softwareIcons: Record<string, string> = {
    vscode: '/src/assets/vscode.svg',
};

const systemIcons: Record<string, string> = {
    windows: '/assets/windows.png',
    macos: '/assets/macos.png',
    linux: '/assets/linux.png',
};
*/
const StatsUser = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDetailsIndex, setOpenDetailsIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/auth/stats/me/sessions', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setSessions(data);
            } catch (error) {
                console.error('Erreur récupération stats :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const toggleDetails = (index: number) => {
        setOpenDetailsIndex(openDetailsIndex === index ? null : index);
    };

    if (loading) return <p>Chargement...</p>;
    if (!sessions.length) return <p>Aucune session trouvée.</p>;

    return (
        
        <div className={styles.statsContainer}>
            <h2 className={styles.title}>Historique des sessions</h2>
            <div className={styles.sessionsList}>
                {sessions.map((session, index) => (
                    <div key={session.id} className={styles.sessionRow}>
                        <div className={styles.sessionSummary}>
                            <div className={styles.sessionInfo}>
                                <span>{new Date(session.played_at).toLocaleString('fr-FR')}</span>
                                <span>{session.software || '—'}</span>
                                <span>{session.system || '—'}</span>
                                <span>{session.type || '—'}</span>
                                <span>{session.difficulty || '—'}</span>
                                <span>{session.total_correct}/{session.total_questions}</span>
                                <span>{session.average_time_ms ? `${session.average_time_ms} ms` : '—'}</span>
                            </div>
                            <button onClick={() => toggleDetails(index)} className={styles.detailsButton}>
                                {openDetailsIndex === index ? 'Masquer' : 'Détails'}
                            </button>
                        </div>
                        {openDetailsIndex === index && (
                            <div className={styles.sessionDetails}>
                                <table className={styles.detailsTable}>
                                    <thead>
                                        <tr>
                                            <th>Question</th>
                                            <th>Attendu</th>
                                            <th>Réponse</th>
                                            <th>Résultat</th>
                                            <th>Temps (ms)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {session.answers.map((answer, i) => (
                                            <tr
                                            key={i}
                                            className={answer.is_correct ? styles.correctRow : styles.incorrectRow}
                                            >
                                            <td>{answer.question_label}</td>
                                            <td>{answer.expected_shortcut}</td>
                                            <td>{answer.user_input}</td>
                                            <td>{answer.is_correct ? '✅' : '❌'}</td>
                                            <td>{answer.response_time_ms}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.chartContainer}>
            <LineComp sessions={sessions} />
            </div>
        </div>
    );
};

export default StatsUser;