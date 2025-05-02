import { Link, useNavigate, } from "react-router-dom";
import styles from "./Header.module.css";
import { useAuth } from '../../context/authContext';
import { useState, useRef, useEffect } from "react";
import Button from "../ui/button/Button";
import gsap from "gsap";
import { FaUser, FaBook, FaBrain, } from 'react-icons/fa';
import { GiArmoredBoomerang, } from "react-icons/gi";
import { MdOutlineModelTraining } from "react-icons/md";
import { HiHomeModern } from "react-icons/hi2";

const Header: React.FC = () => {
    const { token, setToken } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navListRef = useRef<HTMLUListElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsDropdownOpen(false);
        navigate('/');
    };
    useEffect(() => {
        if (navListRef.current) {
            gsap.fromTo(
                navListRef.current.children,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }
            );
        }
    }, []);
    useEffect(() => {
        if (logoRef.current) {
            gsap.fromTo(
                logoRef.current,
                { opacity: 0, scale: 0.2 },
                { opacity: 1, scale: 1, duration: 0.6 }
            );
        }
    }, []);
    useEffect(() => {
        if (avatarRef.current) {
            gsap.fromTo(
                avatarRef.current,
                { opacity: 0, scale: 0.2 },
                { opacity: 1, scale: 1, duration: 0.6 }
            );
        }
    }, []);
    return (
        <header className={styles.header}>
            <div ref={logoRef} className={styles.logo}>🚀</div>
            <nav className={styles.nav}>

                <ul ref={navListRef}>
                    <li><Link to="/">Accueil <HiHomeModern />
                    </Link></li>
                    <li><Link to="/encyclopedie">Encyclopédie <FaBook /></Link></li>
                    <li><Link to="/quizz">Quizz <FaBrain /></Link></li>
                    <li><Link to="/training">Entraînement <MdOutlineModelTraining />
                    </Link></li>
                    <li><Link to="/test">Plus loin <GiArmoredBoomerang /></Link></li>
                </ul>
            </nav>

            <div ref={avatarRef} className={styles.loginRegister}>
                {!token && (
                    <li><Link to="/auth">Login / Register</Link></li>
                )}
            </div>

            {token && (
                <div className={styles.avatarContainer}>
                    <div className={styles.avatar} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <FaUser />
                    </div>
                    {isDropdownOpen && (
                        <div className={styles.dropdown}>
                            <Link to="/mon-compte" onClick={() => setIsDropdownOpen(false)}>Mon Compte</Link>
                            <Link to="/mes-stats" onClick={() => setIsDropdownOpen(false)}>Mes Stats</Link>
                            <Button onClick={handleLogout}>Déconnexion</Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;


/*                      <Link to="/register">Inscription</Link>
                    <Link to="/login">Connexion</Link>*/