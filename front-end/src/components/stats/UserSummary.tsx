import { useEffect, useState } from 'react';
import styles from './StatsUser.module.css';

interface SummaryData {
  username: string;
  total_sessions: number;
  total_correct: number;
  total_wrong: number;
  average_score: number;
  average_time_ms: number;
  last_played_at: string;
  best_score_id: number;
  best_score_correct: number;
  best_score_questions: number;
  best_score_played_at: string;
  distribution_by_type: Record<string, number>;
  distribution_by_software: Record<string, number>;
  distribution_by_system: Record<string, number>;
  distribution_by_difficulty: Record<string, number>;
}

const UserSummary = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/user/summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSummary(data);
        console.log('API summary raw:', data);
      } catch (error) {
        console.error('Erreur récupération résumé :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);
  console.log('User summary data:', summary?.username);
  if (loading) return <p>Chargement du résumé...</p>;
  if (!summary) return <p>Aucune donnée de résumé disponible.</p>;

  return (
    <div className={styles.summaryContainer}>
      <h1>
      Hello {summary?.username} 👋
    </h1>
      <h2 className={styles.sectionTitle}>Résumé global</h2>
      <div className={styles.cardsGrid}>
        <div className={styles.statCard}>
          <p className={styles.cardLabel}>Sessions jouées</p>
          <h3 className={styles.cardValue}>{summary.total_sessions}</h3>
        </div>
        <div className={styles.statCard}>
          <p className={styles.cardLabel}>Score moyen</p>
          <h3 className={styles.cardValue}>{summary.average_score}%</h3>
        </div>
        <div className={styles.statCard}>
          <p className={styles.cardLabel}>Temps moyen</p>
          <h3 className={styles.cardValue}>{summary.average_time_ms} ms</h3>
        </div>
        <div className={styles.statCard}>
          <p className={styles.cardLabel}>Dernière session</p>
          <h3 className={styles.cardValue}>{new Date(summary.last_played_at).toLocaleDateString('fr-FR')}</h3>
        </div>
      </div>
    </div>
  );
};

export default UserSummary;