import styles from './SoftwareProgressCard.module.css';
import ProgressBar from './ProgressBar';
import { useState } from "react";
import Button from '../button/Button';
import { FaRegStar, FaStar } from "react-icons/fa";

type SoftwareProgressCardProps = {
  softwareName: string;
  logo?: string;
  quizzProgress: number;
  trainingProgress: number;
  globalProgress: number;
  levelLabel: string;
  avgQuizzTime: number;
  avgTrainingTime: number;
  lastQuizzDate: Date | null;
  lastTrainingDate: Date | null;
};


const SoftwareProgressCard = ({
  logo,
  softwareName,
  levelLabel,
  globalProgress,
  quizzProgress,
  trainingProgress,
  avgQuizzTime,
  avgTrainingTime,
  lastQuizzDate,
  lastTrainingDate,
}: SoftwareProgressCardProps) => {
    const [showDetails, setShowDetails] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);


    const getProgressClass = (value: number) => {
  if (value < 20) return 'beginner';
  if (value < 50) return 'intermediate';
  if (value < 80) return 'advanced';
  return 'expert';
};
const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '—';

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}j`);
  if (remainingHours > 0) parts.push(`${remainingHours}h`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);

  return parts.join(' ');
};

const progressClass = getProgressClass(globalProgress);

 return (


    <div className={`${styles.card} ${styles[progressClass]}`}>
      {/* HEADER 
      <div className={styles.softwareInfo}>
        </div>
      */}
      <div className={styles.header}>
        
            <span className={styles.level}>{levelLabel}</span>

        {isFavorite ? <FaStar /> : <FaRegStar />}
      </div>
    <div className={styles.softwareContent}>
         {logo && <img src={logo} alt={softwareName} className={styles.logo} />}
          <div>
            <h4>{softwareName}</h4>
          </div>
    </div>
        <div className={styles.globalValue}>{globalProgress}%</div>

      {/* GLOBAL PROGRESS */}
      <ProgressBar value={globalProgress} />

      {/* DETAILS TOGGLE */}
      <Button
        className={styles.toggleButton}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Masquer les détails" : "Voir les détails"}
      </Button>
      {showDetails && (
  <div className={styles.details}>
    <ProgressBar value={quizzProgress} label="🧠 Quizz" />
    <p>⏱️ Temps moyen Quizz : {formatDuration(avgQuizzTime)}</p>
    <p>📅 Dernière session Quizz : {lastQuizzDate?.toLocaleDateString()}</p>
    <ProgressBar value={trainingProgress} label="⌨️ Entraînement" />
    <p>⏱️ Temps moyen Entraînement : {formatDuration(avgTrainingTime)}</p>
    <p>📅 Dernière session Entraînement : {lastTrainingDate?.toLocaleDateString()}</p>
    <div className={styles.extraStats}>

    </div>
  </div>
)}

      {/* TOGGLE BUTTON */}
      
    </div>
  );
};


export default SoftwareProgressCard;
