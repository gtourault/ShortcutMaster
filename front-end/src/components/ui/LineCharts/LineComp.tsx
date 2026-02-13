import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import type { Session } from '../../../libs/types';


// changement a faire : probleme type session declaré ici et danns statsuser


interface Props {
  sessions: Session[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { payload: data } = payload[0];
    return (
      <div style={{
        backgroundColor: 'var(--solid-secondary)',
        border: '2px solid var(--border-tertiary)',
        padding: 8,
        borderRadius: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          {data.date}
        </p>
        <p style={{ margin: 0 }}>Score : {data.score}%</p>
      </div>
    );
  }
  return null;
};

export default function SessionScoreLine({ sessions }: Props) {
  // Préparer les données triées par date (les 10 dernières sessions)
  const chartData = [...sessions]
    .sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime())
    .slice(-10)
    .map(session => ({
      date: new Date(session.played_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      }),
      score: session.total_questions
        ? Math.round((session.total_correct as any / session.total_questions) * 100)
        : 0
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-tertiary)" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
