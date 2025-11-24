import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['var(--color-success)', 'var(--color-error)']; // Couleurs pour réussite et échec

interface Props {
  successCount: number;
  failureCount: number;
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
export default function SessionSuccessPie({ successCount, failureCount }: Props) {
  const data = [
    { name: 'Réussites', value: successCount },
    { name: 'Échecs', value: failureCount }
  ];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={70}
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
        
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={CustomTooltip} />
      <Legend />
    </PieChart>
  );
}
