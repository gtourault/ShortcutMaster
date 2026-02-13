import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;       // 0 → 100
  label?: string;
};

const getColorFromValue = (value: number) => {
  if (value < 10) return '#d0e7ff';
  if (value < 30) return '#8ecbff';
  if (value < 50) return '#4fa3ff';
  if (value < 70) return '#4caf50';
  if (value < 90) return '#2e7d32';
  return '#fbc02d';
};

const ProgressBar = ({ value, label }: ProgressBarProps) => {
  const safeValue = Math.min(100, Math.max(0, value));
  const color = getColorFromValue(safeValue);

  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.labelRow}>
          <span>{label}</span>
          <span>{safeValue}%</span>
        </div>
      )}

      <div className={styles.barBackground}>
        <motion.div
          className={styles.barFill}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
