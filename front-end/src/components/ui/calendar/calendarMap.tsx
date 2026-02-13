import styles from './calendarMap.module.css';
import { useState } from 'react';
import Button from '../button/Button';
import { toDateKey } from '../../../hooks/date';
type DayStats = {
  date: string;        // "2026-01-05"
  quizz: number;
  training: number;
};

type CalendarMapProps = {
  data: DayStats[];
  onSelectDay: (date: string) => void;
};


export function CalendarMap({ data, onSelectDay }: CalendarMapProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const endDate = new Date(year, month + 1, 0);
    const startDate = new Date(year, month, 1);

    const daysInMonth: Date[] = [];

    const current = new Date(startDate);
    const firstDayOfWeek = startDate.getDay();
    const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
const weekDays = [
  { key: 'mon', label: 'L' },
  { key: 'tue', label: 'M' },
  { key: 'wed', label: 'M' },
  { key: 'thu', label: 'J' },
  { key: 'fri', label: 'V' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'D' },
];
 
    while (current <= endDate) {
    daysInMonth.push(new Date(current));
    current.setDate(current.getDate() + 1);
    }

    const statsByDate = new Map(
    data.map(d => [d.date, d])
    );
const pad = (n: number) => n.toString().padStart(2, '0');
    const calendarDays = daysInMonth.map(date => {
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    return {
        date,
        stats: statsByDate.get(key) || null,
    };
    });


    const getLevelClass = (stats: any) => {
        if (!stats) return styles.level0;

        const total = stats.quizz + stats.training;

        if (total >= 6) return styles.level4;
        if (total >= 4) return styles.level3;
        if (total >= 2) return styles.level2;
        return styles.level1;
      };

return (
  
<div className={styles.calendarContainer}>
  <div className={styles.calendarHeader}>
  <Button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>{'<'}</Button>
  <span className={styles.calendarMonthSpan}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
  <Button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>{'>'}</Button>
</div>

    <div className={styles.calendar}>
    {weekDays.map(day => (
            <div key={day.key} className={styles.weekDay}>
              {day.label}
            </div>
          ))}
  {Array.from({ length: emptyDays }).map((_, i) => (
    <div key={`empty-${i}`} className={styles.empty} />
  ))}

    {calendarDays.map(day => (
      
    <div
        key={day.date.toISOString()}
        className={`${styles.day} ${getLevelClass(day.stats)}`}
        onClick={() =>
        onSelectDay(toDateKey(day.date))
      }
    >
      <span className={styles.dayNumber}>{day.date.getDate()}</span>
        {day.stats && (
        <div className={styles.tooltip}>
            <strong>{day.date.toLocaleDateString()}</strong><br />
            🎯 Quizz : {day.stats.quizz}<br />
            ⌨️ Training : {day.stats.training}
        </div>
        )}
    </div>
    ))}
  
</div>

</div>
);
  return (
  <div>
    {calendarDays.map(day => (
      <div key={day.date.toISOString()}>
        {day.date.toDateString()}
      </div>
    ))}
  </div>
);
}