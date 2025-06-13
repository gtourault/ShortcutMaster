import React from "react";
import styles from './Home.module.css';
import Button from "../ui/button/Button";
const Home: React.FC = () => {
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
                <div className={styles.icon}>🧩</div>
                <div className={styles.value}>6 logiciels</div>
                <p className={styles.description}>Et bientôt plus à venir !</p>
            </div>

            <div className={styles.card}>
                <div className={styles.icon}>👥</div>
                <div className={styles.value}>12 inscrits</div>
                <p className={styles.description}>Rejoins la communauté dès maintenant</p>
            </div>

            <div className={styles.card}>
                <div className={styles.icon}>📊</div>
                <div className={styles.value}>38 sessions jouées</div>
                <p className={styles.description}>Connecte-toi et commence pour voir tes stats !</p>
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
                <button className={styles.cardButton}>Commencer</button>
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
                <button className={styles.cardButton}>Commencer</button>
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
                <button className={styles.cardButton}>Commencer</button>
                </div>
            </div>
            </section>
            <section className={styles.softwareSection}>
            <h2 className={styles.sectionTitle}>Logiciels supportés</h2>
            <p className={styles.sectionSubtitle}>
                Apprenez les raccourcis des outils que vous utilisez au quotidien
            </p>

            <div className={styles.softwareCards}>
                {/* VS Code */}
                <div className={styles.softwareCard}>
                <span className={styles.softwareIcon}>🖥️</span>
                <div className={styles.softwareInfo}>
                    <h3>Visual Studio Code</h3>
                    <p>45 raccourcis disponibles</p>
                </div>
                </div>

                {/* Placeholder Logiciel 2 */}
                <div className={styles.softwareCard}>
                <span className={styles.softwareIcon}>📦</span>
                <div className={styles.softwareInfo}>
                    <h3>Logiciel 2</h3>
                    <p>Bientôt disponible</p>
                </div>
                </div>

                {/* Placeholder Logiciel 3 */}
                <div className={styles.softwareCard}>
                <span className={styles.softwareIcon}>🎨</span>
                <div className={styles.softwareInfo}>
                    <h3>Logiciel 3</h3>
                    <p>Bientôt disponible</p>
                </div>
                </div>
            </div>
            </section>

        </div>
    );
};

export default Home;