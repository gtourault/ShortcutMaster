import React from "react";
import styles from './Home.module.css';
import Button from "../ui/button/Button";
const Home: React.FC = () => {
    return (
        <div className={styles.home}>
            <h1>Bienvenue dans l'outil d'apprentissage des raccourcis clavier !</h1>
            <p>Sélectionnez une option dans le menu pour commencer.</p>
            <Button>Commencer</Button>
        </div>
    );
};

export default Home;