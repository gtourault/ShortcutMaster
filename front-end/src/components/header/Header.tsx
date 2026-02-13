import { Link, useNavigate, } from "react-router-dom";
import styles from "./Header.module.scss";
import { useAuth } from '../../context/authContext';
import { useState, useRef, useEffect } from "react";
import Button from "../ui/button/Button";
import gsap from "gsap";
import { FaUser, FaBook, FaBrain, } from 'react-icons/fa';
import { GiArmoredBoomerang, } from "react-icons/gi";
import { MdOutlineModelTraining } from "react-icons/md";
import { HiHomeModern } from "react-icons/hi2";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

interface HeaderProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isVisible, setIsVisible }) => {
    const { token, setToken } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navListRef = useRef<HTMLUListElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [isTopHeader, setIsTopHeader] = useState(false);
    
    const toggleSidebar = () => {
    setIsVisible(!isVisible);
  }
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
        <motion.header 
        className={styles.header}
        animate={{
    x: isTopHeader ? 0 : isOpen ? 0 : '-100%',
    y: isTopHeader ? 0 : 0,
    width: isTopHeader ? '100%' : 'var(--sidebar-w)',
    height: isTopHeader ? '60px' : '100vh',
    flexDirection: isTopHeader ? 'row' : 'column'
  }}
  transition={{ type: "tween", duration: 0.3 }}
        >
            <button 
                className={styles.button_header}
                onClick={() => {
                    setIsOpen(!isOpen);
                    toggleSidebar();
                    
                }}
                
            >
                {isOpen ? '◀' : '▶'}
                
            </button>
            <div ref={logoRef} className={styles.logo}>
                <img src="/assets/coding.png" alt="Logo ShortCutMaster" className={styles.logoImage} />
            </div>
           
<nav className={styles.nav}>
  <ul ref={navListRef}>
    <li>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? styles.active : undefined
        }
      >
        Accueil <HiHomeModern />
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/encyclopedie"
        className={({ isActive }) =>
          isActive ? styles.active : undefined
        }
      >
        Encyclopédie <FaBook />
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/quizz"
        className={({ isActive }) =>
          isActive ? styles.active : undefined
        }
      >
        Quizz <FaBrain />
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/training"
        className={({ isActive }) =>
          isActive ? styles.active : undefined
        }
      >
        Entraînement <MdOutlineModelTraining />
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/test"
        className={({ isActive }) =>
          isActive ? styles.active : undefined
        }
      >
        Plus loin <GiArmoredBoomerang />
      </NavLink>
    </li>
  </ul>
 
</nav>

    
<div ref={avatarRef} className={styles.loginRegister}>
  {!token ? (
    <Link to="/auth">Login / Register</Link>
  ) : (
    <div className={styles.avatarContainer}>
        <Button onClick={handleLogout}>
            Déconnexion
          </Button>
      <div
        className={styles.avatar}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <FaUser />
      </div>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          <Link
            to="/mon-compte"
            onClick={() => setIsDropdownOpen(false)}
          >
            Mon Compte
          </Link>

          <Link
            to="/mes-stats"
            onClick={() => setIsDropdownOpen(false)}
          >
            Mes Stats
          </Link>
        </div>
      )}
    </div>
  )}
</div>

               
            
        </motion.header>
    );
};

export default Header;


/*                      <Link to="/register">Inscription</Link>
                    <Link to="/login">Connexion</Link>*/