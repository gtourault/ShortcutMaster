import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import InputField from '../components/ui/InputFields/InputFields';
import Button from '../components/ui/button/Button';
import { FaUser, FaLock } from 'react-icons/fa';



const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth();

    const toggleMode = () => {
        setError('');
        setFormData({ username: '', email: '', password: '' });
        setIsLogin(!isLogin);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const url = isLogin
                ? 'http://localhost:5000/api/auth/login'
                : 'http://localhost:5000/api/auth/register';

            const response = await axios.post(url, formData);

            if (isLogin) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
                navigate('/mon-compte');
            } else {
                alert('Compte créé ! Vous pouvez maintenant vous connecter.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">{isLogin ? 'Connexion' : 'Inscription'}</h2>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <InputField
                        label="Nom d'utilisateur"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nom d'utilisateur"
                        required

                    />
                )}

                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                />

                <InputField
                    label="Mot de passe"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                    required
                />

                <Button type="submit">
                    {isLogin ? 'Se connecter' : "S'inscrire"}
                </Button>
            </form>

            <p className="auth-switch">
                {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{' '}
                <Button type="button" onClick={toggleMode} className="auth-toggle">
                    {isLogin ? "S'inscrire" : 'Se connecter'}
                </Button>
            </p>
        </div>
    );
};

export default Auth;
