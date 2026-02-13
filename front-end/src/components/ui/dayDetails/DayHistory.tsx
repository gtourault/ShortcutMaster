import React, { useState } from 'react';
import type { Session } from '../../../libs/types';
import styles from './DayHistory.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../button/Button';
import { RiArrowDownDoubleLine } from "react-icons/ri";


type DayHistoryProps = {
  date: string;
  sessions: Session[];
};

export default function DayHistory({ date, sessions }: DayHistoryProps) {
  const [openDetailsIndex, setOpenDetailsIndex] = useState<number | null>(null);
function getScoreClass(correct: number | null, total: number | null) {
  if (total === 0) return 'scoreGray';
  const percent = (correct / total) * 100;

  if (percent >= 80) return 'scoreGreen';
  if (percent >= 50) return 'scoreOrange';
  return 'scoreRed';
}

  return (
    <AnimatePresence>
      <motion.div
        key={date}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.historyContainer}
      >
        <h4>Historique du {new Date(date).toLocaleDateString()}</h4>
        <div className={styles.sessionSummary}>
        <div className={styles.sessionInfoLabels}>
          <p>Date <RiArrowDownDoubleLine /></p>
          <p>Software <RiArrowDownDoubleLine /></p>
          <p>OS <RiArrowDownDoubleLine /></p>
          <p>Mode <RiArrowDownDoubleLine /></p>
          <p>Difficulté <RiArrowDownDoubleLine /></p>
          <p>Score <RiArrowDownDoubleLine /></p>
          <p>Temps moyen <RiArrowDownDoubleLine /></p>
        </div>
      </div>
        {sessions.length === 0 ? (
          <p>Aucune session ce jour-là.</p>
        ) : (
          sessions.map((session, index) => (
            
            <div key={session.id} className={styles.sessionRow}>
              <div className={styles.sessionSummary}>
                <div className={styles.sessionInfo}>
                  <span>{new Date(session.played_at).toLocaleString('fr-FR')}</span>
                  <span className={styles.software}>{session.software || '—'}</span>
                  <span>{session.system || '—'}</span>
                  <span>{session.type || '—'}</span>
                  <span>{session.difficulty || '—'}</span>
                  <span className={`${styles[getScoreClass(session.total_correct, session.total_questions)]} ${styles.score}`}>
                    {session.total_correct}/{session.total_questions}
                  </span>
                  <span>{session.average_time_ms ? `${session.average_time_ms} ms` : '—'}</span>
                </div>
                <Button
                  onClick={() =>
                    setOpenDetailsIndex(openDetailsIndex === index ? null : index)
                  }
                  className={styles.detailsButton}
                >
                  {openDetailsIndex === index ? 'Masquer' : 'Détails'}
                </Button>
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
          ))
        )}
      </motion.div>
    </AnimatePresence>
  );
}
