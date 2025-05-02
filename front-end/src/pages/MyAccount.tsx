import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authContext'; // Assurez-vous que le chemin est correct
import Button from '../components/ui/button/Button';

function MonCompte() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { setToken } = useAuth();


    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        axios.get('http://localhost:5000/api/auth/mon-compte', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setUserData(res.data.user);
            })
            .catch(err => {
                console.error(err);
                localStorage.removeItem('token');
                setToken(null); // ← ici aussi, pour être sûr
                navigate('/login');
            })
            .finally(() => setLoading(false));
    }, [navigate, setToken]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null); // 👈 ajoute ça !
        navigate('/');
    };

    if (loading) return <p>Chargement...</p>;
    if (!userData) return <p>Erreur ou non connecté</p>;

    return (
        <div>
            <h2>Bienvenue, {userData.username}</h2>
            <p>Email : {userData.email}</p>
            <p>Inscrit le : {new Date(userData.created_at).toLocaleDateString()}</p>
            <Button onClick={handleLogout}>Déconnexion</Button>
        </div>
    );
}

export default MonCompte;

