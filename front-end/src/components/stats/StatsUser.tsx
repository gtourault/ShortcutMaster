import { useEffect, useState, useMemo } from 'react';
import styles from './StatsUser.module.css';
import LineComp from '../ui/LineCharts/LineComp';
import type { Session } from '../../libs/types';
import Button from '../ui/button/Button';
import SoftwareProgressCard from '../ui/Progress/SoftwareProgressCard';
import { useSoftwares } from '../../hooks/useSoftwares';
import { CalendarMap } from '../ui/calendar/calendarMap';
import { DayDetails } from '../ui/dayDetails/DayDetails';
import PieComp from '../ui/PieCharts/PieComp';
import { toDateKey } from '../../hooks/date';
import DayHistory from '../ui/dayDetails/DayHistory';
import { motion } from 'framer-motion';
type SoftwareStatsMap = {
  quizzCorrect: number;
  quizzTotal: number;
  trainingCorrect: number;
  trainingTotal: number;
  quizzTimeTotal: number;
  quizzSessionsCount: number;
  trainingTimeTotal: number;
  trainingSessionsCount: number;
  lastQuizzDate: Date | null;
  lastTrainingDate: Date | null;
};

type SoftwareStats = {
  software: string;
  quizzProgress: number;
  trainingProgress: number;
  globalProgress: number;
  avgQuizzTime: number;
  avgTrainingTime: number;
  lastQuizzDate: Date | null;
  lastTrainingDate: Date | null;
};


const StatsUser = () => {
  
    const [filterByDate, setFilterByDate] = useState<string | null>(null);
    const [ showHistory, setShowHistory ] = useState(false);
    const [openDetailsIndex, setOpenDetailsIndex] = useState<number | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const { softwares, loading: loadingSoftwares } = useSoftwares();
    const getLogo = (softwareName: string) => {
    const software = softwares.find(s => s.label === softwareName || s.label === softwareName);
    return software?.logo ?? ""; // ou undefined selon ton besoin
    };
    const statsByDay: Record<string, { date: string; quizz: number; training: number }> = {};
    sessions.forEach(session => {
      const dateKey = toDateKey(new Date(session.played_at));


      if (!statsByDay[dateKey]) {
        statsByDay[dateKey] = {
          date: dateKey,
          quizz: 0,
          training: 0,
        };
      }

      if (session.type === "quizz") {
        statsByDay[dateKey].quizz++;
      }

      if (session.type === "training") {
        statsByDay[dateKey].training++;
      }
    });
    const calendarData = Object.values(statsByDay);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
  const today = new Date();
  return toDateKey(today); // "YYYY-MM-DD"
});


    const sessionsOfSelectedDay = useMemo(() => {
  if (!selectedDate) return [];
  return sessions.filter(
    (session): session is Session => session.played_at.startsWith(selectedDate)
  );
}, [selectedDate, sessions]);
const quizzCount = sessions.filter(s => s.type === 'quizz').length;
const trainingCount = sessions.filter(s => s.type === 'training').length;

function getLevelLabel(progress: number) {
  if (progress < 20) return "Débutant";
  if (progress < 50) return "Intermédiaire";
  if (progress < 80) return "Avancé";
  return "Expert";
}

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
  

    
const softwareStats: SoftwareStats[] = useMemo(() => {
  const map = new Map<string, SoftwareStatsMap>();

  sessions.forEach(session => {
    if (!session.software) return;

    if (!map.has(session.software)) {
      map.set(session.software, {
        quizzCorrect: 0,
        quizzTotal: 0,
        trainingCorrect: 0,
        trainingTotal: 0,
        quizzTimeTotal: 0,
        quizzSessionsCount: 0,
        trainingTimeTotal: 0,
        trainingSessionsCount: 0,
        lastQuizzDate: null,
        lastTrainingDate: null,
      });
    }

    const stats = map.get(session.software)!;

    const sessionTime = session.answers.reduce(
    (total, answer) => total + (answer.response_time_ms || 0),
    0
  );
    if (session.type === 'quizz') {
      stats.quizzCorrect += session.total_correct as any;
      stats.quizzTotal += session.total_questions as any;
      stats.quizzTimeTotal += sessionTime;
      stats.quizzSessionsCount += 1;
      const sessionDate = new Date(session.played_at);
      if (!stats.lastQuizzDate || sessionDate > stats.lastQuizzDate) {
        stats.lastQuizzDate = sessionDate;
      }
    }

    if (session.type === 'training') {
      stats.trainingCorrect += session.total_correct as any;
      stats.trainingTotal += session.total_questions as any;
      stats.trainingTimeTotal += sessionTime;
      stats.trainingSessionsCount += 1;
      const sessionDate = new Date(session.played_at);
      if (!stats.lastTrainingDate || sessionDate > stats.lastTrainingDate) {
        stats.lastTrainingDate = sessionDate;
      }
    }
  });

  return Array.from(map.entries()).map(([software, stats]) => {
    const quizzProgress = stats.quizzTotal
      ? Math.round((stats.quizzCorrect / stats.quizzTotal) * 100)
      : 0;

    const trainingProgress = stats.trainingTotal
      ? Math.round((stats.trainingCorrect / stats.trainingTotal) * 100)
      : 0;

    const globalProgress = Math.round((quizzProgress + trainingProgress) / 2);

    const avgQuizzTime = stats.quizzSessionsCount
      ? Math.round(stats.quizzTimeTotal / stats.quizzSessionsCount)
      : 0;

    const avgTrainingTime = stats.trainingSessionsCount
      ? Math.round(stats.trainingTimeTotal / stats.trainingSessionsCount)
      : 0;

    return {
      software,
      quizzProgress,
      trainingProgress,
      globalProgress,
      avgQuizzTime,
      avgTrainingTime,
      lastQuizzDate: stats.lastQuizzDate,
      lastTrainingDate: stats.lastTrainingDate,
    };
  });
}, [sessions]);
    if (loading) return <p>Chargement...</p>;
    if (!sessions.length) return <p>Aucune session trouvée.</p>;
  const topSoftwares = softwareStats
      .sort((a, b) => b.globalProgress - a.globalProgress)
      .slice(0, 10);
      return (
        
        <div className={styles.statsContainer}>

          <div className={styles.calendarSection}>
          
          <CalendarMap 
          data={calendarData}
          onSelectDay={setSelectedDate}
          />
          {selectedDate && (
            <motion.div className={styles.dayDetailsContainer}>
            <DayDetails
              date={selectedDate}
              sessions={sessionsOfSelectedDay}
              onShowHistory={() => setShowHistory(true)}
            />
            <div className={styles.historyButton}>
              <Button className={styles.button} onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Masquer l’historique' : 'Voir l’historique du jour'}
            </Button>
            </div>
            </motion.div>
            
          )}
            
            {showHistory && (
              <DayHistory date={selectedDate} sessions={sessionsOfSelectedDay} />
            )}
          </div>
          <div className={styles.PieCharts}>
            <h3>Progression</h3>
            <PieComp 
          successCount={quizzCount}
          failureCount={trainingCount}
          labels={['Quizz', 'Training']}
          />
          </div>
          <div className={styles.topSoftwaresGrid}>
              <h3>List</h3>
              {topSoftwares.map(stat => {
                const logoPath = getLogo(stat.software);
                return (
                <div key={stat.software} className={styles.softwareListItem}>
                  {logoPath && (
                    <>
                  <img
                    src={logoPath}
                    alt={stat.software}
                    className={styles.softwareLogo}
                  />
                  <h4>{stat.software}</h4>

                  <p> {stat.globalProgress}% </p>
                  </>
                )}
                </div>
                );
              })}
            </div>
              <div className={styles.softwareProgressSection}>
                {softwareStats.map(stat => {
                const logoPath = getLogo(stat.software);

                return (
                    <div key={stat.software}>
                        <SoftwareProgressCard
                          softwareName={stat.software}
                          logo={logoPath}
                          quizzProgress={stat.quizzProgress}
                          trainingProgress={stat.trainingProgress}
                          globalProgress={stat.globalProgress}
                          levelLabel={getLevelLabel(stat.globalProgress)}

                          avgQuizzTime={stat.avgQuizzTime}
                          avgTrainingTime={stat.avgTrainingTime}
                          lastQuizzDate={stat.lastQuizzDate}
                          lastTrainingDate={stat.lastTrainingDate}
                        />

                    </div>
                );
            })}
            </div>
             
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