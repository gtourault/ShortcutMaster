import React from 'react'
import type { Session } from '../../../libs/types';
import styles from './DayDetails.module.css';
import { useMemo } from 'react';
import Button from '../button/Button';
import { useState } from 'react';
import { toDateKey } from '../../../hooks/date';
import { motion, AnimatePresence} from 'framer-motion';

type DayDetailsProps = {
  date: string;          
  sessions: Session[];
  onShowHistory: (date: string) => void;
};


export function DayDetails({ date, sessions, onShowHistory }: DayDetailsProps) {
  const [ showHistory, setShowHistory ] = useState(false);
  const [openDetailsIndex, setOpenDetailsIndex] = useState<number | null>(null);
const initialStats = {
  quizz: {
    count: 0,
    totalTime: 0,
    correct: 0,
    totalQuestions: 0,
  },
  training: {
    count: 0,
    totalTime: 0,
    correct: 0,
    totalQuestions: 0,
  },
};
function getScoreClass(correct: number | null, total: number | null) {
  if (total === 0) return 'scoreGray';
  const percent = (correct / total) * 100;

  if (percent >= 80) return 'scoreGreen';
  if (percent >= 50) return 'scoreOrange';
  return 'scoreRed';
}
  const stats = useMemo(() => {
    const result = structuredClone(initialStats);

    sessions.forEach(session => {
      const target = result[session.type];
      target.count++;
      target.totalTime += session.average_time_ms ?? 0;
      target.correct += session.total_correct ?? 0;
      target.totalQuestions += session.total_questions ?? 0;
    });

    return result;
  }, [sessions]);

 return (
    <div className={styles.container}>
  <AnimatePresence>
      <h3>Détails du :
      <span>
        <motion.div
      key={date}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 0 }}
            className={styles.date}
            transition={{ duration: 0.5 }}>{new Date(date).toLocaleDateString()}
            </motion.div>
      </span>
      </h3>
  </AnimatePresence>

      <AnimatePresence mode='wait'>
      <motion.div
          key={date}
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.detailsBox}>
      <div className={`${styles.section} ${styles.quizzSection}`}>
        <h4>🎯 Quizz</h4>
        <p>Parties : <span>{stats.quizz.count}</span></p>
        <p>Temps total : <span>{stats.quizz.totalTime} ms</span></p>
        <p>
          Réussite : <span className={`${styles[getScoreClass(stats.quizz.correct, stats.quizz.totalQuestions)]} ${styles.score}`}>
            {stats.quizz.totalQuestions > 0
            ? Math.round((stats.quizz.correct / stats.quizz.totalQuestions) * 100)
            : 0}%
          </span>
        </p>
      </div>

      <div className={`${styles.section} ${styles.trainingSection}`}>
        <h4>⌨️ Training</h4>
        <p>Parties : <span>{stats.training.count}</span></p>
        <p>Temps total : <span>{stats.training.totalTime} ms</span></p>
        <p>
          Réussite : <span>
            {stats.training.totalQuestions > 0
            ? Math.round((stats.training.correct / stats.training.totalQuestions) * 100)
            : 0}%
          </span>
        </p>
      </div>
      </motion.div>
</AnimatePresence>

      <AnimatePresence>
      <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 0 }}
          transition={{ duration: 0.5 }}>
      

      {showHistory && (
        <div className={styles.sessionsList}>
          {sessions.length === 0 ? (
            <p>Aucune session ce jour-là.</p>
          ) : (
            sessions.map((session, index) => (
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
                  <button
                    onClick={() =>
                      setOpenDetailsIndex(openDetailsIndex === index ? null : index)
                    }
                    className={styles.detailsButton}
                  >
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
                            className={
                              answer.is_correct ? styles.correctRow : styles.incorrectRow
                            }
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
            ))
          )}
        </div>
        
      )}
      
          </motion.div>

      </AnimatePresence>
    </div>
  );
}
