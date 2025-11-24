import React from "react";
import styles from './Home.module.css';
import Button from "../ui/button/Button";
import { useAuth } from '../../context/authContext';
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Software } from "../../types/softwares";


interface Home {
    usersCount: number;
    totalSessions: number;
}

const Home: React.FC = () => {
    const [softwares, setSoftwares] = useState<Software[]>([]);
    const { token, setToken } = useAuth();
    const [ homeData , setHomeData] = useState<Home | null>(null);
    const [expanded, setExpanded] = useState(false);
    const displayedSoftwares = expanded ? softwares.slice(0, 10) : [];
    const navigate = useNavigate();

    useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        const res = await axios.get<Software[]>("http://localhost:5000/api/auth/softwares");
        setSoftwares(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des logiciels :", err);
      }
    };
    fetchSoftwares();
  }, []);


      useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<Home>("http://localhost:5000/api/auth/home", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setHomeData(res.data);
          } catch (err) {
        console.error("Erreur lors de la récupération des stats:", err);
      }
    };

    fetchStats();
  }, [token]);


    return (
        <div className={styles.home}>
            <section className={styles.heroSection}>
                <p>🚀 Première version bientôt disponible</p>
            <h1>Maîtrisez vos raccourcis clavier</h1>
            <p>Apprenez, challengez-vous et devenez un expert des raccourcis clavier pour vos logiciels favoris. Gagnez en productivité et impressionnez vos collègues !</p>
            <div>
            <Button>Commencer le quizz</Button>
            <Button>Commencer l'entrainement</Button>
            </div>
            </section>
            <section className={styles.statsSection}>
            <div className={styles.card}>
                
                <h2>Logiciels supportés</h2>
        <p>{softwares.length} au total</p>
        <a href="#softwares" className={styles.anchorBtn}>
          Voir la liste
        </a>
                
            </div>

            <div className={styles.card}>
                <div className={styles.icon}>👥</div>
                
                <div className={styles.value}> <p>{homeData ? homeData.usersCount : "Chargement..."}</p></div>
                {!token && 
                <div>
                <p className={styles.description}>Rejoins la communauté dès maintenant</p>
                <Button onClick={() => window.location.href = '/auth'}>S'inscrire</Button>
                </div>
                }
                
            </div>

            <div className={styles.card}>
                <div className={styles.icon}>📊</div>
                <div> 
                    
                    <p className={styles.description}>Déja <span>{homeData ? homeData.totalSessions : "Chargement..."}</span> sessions jouées, mesure toi aux autres et gravis le classement !</p>
                </div>
                
                

            </div>
            </section>
            <section className={styles.difficultySection}>
            <h2 className={styles.sectionTitle}>Choisissez votre difficulté de jeu</h2>
            <div className={styles.cardsWrapper}>
                {/* Mode Apprentissage */}
                <div className={styles.difficultyCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>🎓</span>
                    <h3>Apprentissage</h3>
                </div>
                <p className={styles.cardDescription}>Découvrez à votre rythme</p>
                <ul className={styles.featuresList}>
                    <li>Progression guidée</li>
                    <li>Explication détaillée</li>
                    <li>Pas de pression</li>
                </ul>
                <Button onClick={() => window.location.href = '/quizz'}>Commencer le quizz</Button>
                <Button onClick={() => window.location.href = '/training'}>Commencer l'entrainement</Button>
                </div>

                {/* Mode Challenge */}
                <div className={styles.difficultyCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>⚔️</span>
                    <h3>Challenge</h3>
                </div>
                <p className={styles.cardDescription}>Mesurez votre niveau</p>
                <ul className={styles.featuresList}>
                    <li>Pas d'explication</li>
                    <li>Score basé sur la rapidité</li>
                    <li>On passe au suivant même si erreur</li>
                </ul>
                <Button onClick={() => window.location.href = '/quizz'}>Commencer le quizz</Button>
                <Button onClick={() => window.location.href = '/training'}>Commencer l'entrainement</Button>
                </div>

                {/* Mode Hardcore */}
                <div className={styles.difficultyCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>💀</span>
                    <h3>Hardcore</h3>
                </div>
                <p className={styles.cardDescription}>Réservé aux experts</p>
                <ul className={styles.featuresList}>
                    <li>Une seule erreur possible</li>
                    <li>Pas d'indice</li>
                    <li>Mode brutal 😈</li>
                </ul>
                <Button onClick={() => window.location.href = '/quizz'}>Commencer le quizz</Button>
                <Button onClick={() => window.location.href = '/training'}>Commencer l'entrainement</Button>
                </div>
            </div>
            </section>
            <section id="softwares" className={styles.softwaresSection}>
        <h2>Liste des logiciels</h2>
        <div className={styles.grid}>
          {softwares.map((s) => (
            <div
              key={s.id}
              className={styles.softwareCard}
              onClick={() => navigate(`/encyclopedie/${s.id}`)} // plus tard -> navigation
            >
              <img src={s.logo} alt={s.label} className={styles.logo} />
              <h3>{s.label}</h3>
              <p>{s.shortcuts_count} raccourcis disponibles</p>
            </div>
          ))}
        </div>
      </section>

        </div>
    );
};

export default Home;