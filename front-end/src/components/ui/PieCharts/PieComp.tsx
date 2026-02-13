import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Pie.module.css';
const COLORS = ['var(--color-success)', 'var(--color-error)']; // Couleurs pour réussite et échec

interface Props {
  successCount: number;
  failureCount: number;
  labels?: [string, string];

}
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={{ backgroundColor: 'var(--solid-secondary)', border: '2px solid var(--border-tertiary)', padding: 8, borderRadius: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-secondary)' }}>{name}</p>
        <p style={{ margin: 0 }}>{value} réponses</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  console.log(payload),
  <div className={styles.legend}>
    {payload.map((entry: any, index: number) => (
      <div key={index} className={styles.legendItem}
      style={{ backgroundColor: entry.color }}>
        <span
          className={styles.legendDot}
        />
        <span>{entry.value}</span>
      </div>
    ))}
  </div>
)
  


export default function SessionSuccessPie({
  successCount,
  failureCount,
  labels,

}: Props) {
  const [successLabel, failureLabel] = labels || ['Réussites', 'Échecs'];
  const data = [
    { name: successLabel, value: successCount },
    { name: failureLabel, value: failureCount }
  ];

  return (
    <div className={styles.PieCharts}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
</div>
  );
}
