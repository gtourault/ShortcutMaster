import React from "react";
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import PieComp from '../../ui/PieCharts/PieComp';
import type { HistoryItem } from "../../../libs/types";
import styles from './HistoryList.module.css';
import { LuTarget } from "react-icons/lu";

//import { IoIosTimer } from "react-icons/io5";
import Button from "../../ui/button/Button";

type Props = {  
  grouped: Record<string, HistoryItem[]>;
  detailsOpen: Record<string, boolean>;
  toggleDetails: (action: string) => void;
  gameOver: boolean;
  successCount: number;
  failureCount: number;
  currentIndex: number;
   onRestart: () => void;
};

export default function HistoryList({ grouped, detailsOpen, toggleDetails, successCount, failureCount, gameOver, currentIndex, onRestart }: Props) {
  return (
    <div className={styles.endScreen}> 
    {gameOver && (
      <>
      <h1 className={styles.quizzTitle}>Vos statistiques</h1>
                    <p className={styles.infosTitle}>Suivez votre progrès et analysez votre performance</p>
                    <div className={styles.scoreContainer}>
                        <div className={styles.scoreCard}>
                            <p>Score : {successCount} bonnes réponses sur {currentIndex+1} questions</p>
                            <LuTarget />
                        </div>
                        <div className={styles.scoreCard}>
                            {/* <p>Temps moyen de réponse : {history.length > 0 ? formatTime(Math.round(history.reduce((acc, cur) => acc + (cur.responseTime ?? 0), 0) / history.length)) : '0 s'}</p> */}
                            <p>Temps de réponse ici</p>
                            <LuTarget />
                        </div>
                        <Button onClick={onRestart}>Recommencer</Button>
                    </div>
                    </>
)}
    <div className={styles.historyEndSection}>
      
                        <div className={styles.history}>
                            <h2>Historique :</h2>
                            <ul>
                                {Object.entries(grouped).reverse().map(([action, attempts]) => (
                                    <li key={action} className={styles.groupedItem}>
                                        <div className={styles.groupHeader}>
                                            <strong>{action} - {attempts.length} tentative{attempts.length > 1 ? 's' : ''}</strong>
                                            <button
                                                className={styles.toggleDetailsBtn}
                                                onClick={() => toggleDetails(action)}
                                            >
                                                {detailsOpen[action] ? <FaArrowCircleUp /> : <FaArrowCircleDown />}
                                            </button>
                                        </div>
                                        {detailsOpen[action] && (
                                            <ul className={styles.detailList}>
                                                {attempts.map((item, index) => (
                                                    <li key={index}
                                                        className={item.success ? styles.correct : styles.incorrect}>
                                                        Ta réponse : <strong>{item.userInput}</strong> - 
                                                        {item.success ? "Bonne réponse" : "Mauvaise réponse"}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/*
                        {isFinished && <PieComp successCount={successCount} failureCount={failureCount} /> 
                        */}
                        {gameOver && (
                          <PieComp 
                            successCount={successCount}
                            failureCount={failureCount}
                          />
                        )}
                    </div>
    </div>
  );
}
