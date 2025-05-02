import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <ul className={styles.footerLinks}>
                <li>
                    <Link to="/">Accueil</Link>
                </li>
                <li>
                    <span className={styles.legal}>Mentions légales</span>
                </li>
                <li>
                    <Link to="/auth">Login / Register</Link>
                </li>
            </ul>
        </footer>
    );
};

export default Footer;
