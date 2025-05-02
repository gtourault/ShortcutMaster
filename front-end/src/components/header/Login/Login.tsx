import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 👈 Ajout
import styles from './Login.module.css';
import { useAuth } from '../../../context/authContext';



function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate(); // 👈 Ajout
    const { setToken } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);

            // 🔐 Mise à jour du contexte et localStorage
            setToken(response.data.token); // ← ajoute cette ligne !
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);

            alert('Connexion réussie !');
            navigate('/mon-compte'); // ✅ Rediriger vers la page protégée

        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur de la connexion');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Connexion</h2>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}

export default Login;
