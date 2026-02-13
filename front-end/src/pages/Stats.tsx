import StatsUser from '../components/stats/StatsUser';
import UserSummary from '../components/stats/UserSummary';


const Stats = () => {
    return (
        <div className='stats-page'>
            <h1>📈 Mes Statistiques</h1>
            <UserSummary/>
            <StatsUser />
        </div>
    );
};

export default Stats;
