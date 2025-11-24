// src/components/Encyclopedie.tsx

import React from "react";
import styles from './EncyclopedieData.module.css';
//import softwares from "../../data/softwares.json";

interface Raccourci {
    action: string;
    windows: string;
    macos: string;
    linux: string;
    description: string;
    category: string;
}

interface EncyclopedieDataProps {
    softwareFilter?: string;
    shortcuts: Raccourci[];
}
// name, label,  changement : suppression de name et label care inutilisé
const EncyclopedieData: React.FC<EncyclopedieDataProps> = ({ shortcuts, softwareFilter }) => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Encyclopédie des Raccourcis</h1>
            <div className={styles.raccourcisList}>
                {shortcuts.map((shortcuts, index) => (
                    <div key={index} className={styles.raccourciCard}>
                        <h2 className={styles.raccourciAction}>{shortcuts.action}</h2>
                        <div className={styles.category}>Catégorie: {shortcuts.category}</div>
                        <div className={styles.platform}>
                            <span className={styles.platformTitle}>Windows:</span> {shortcuts.windows}
                        </div>
                        <div className={styles.platform}>
                            <span className={styles.platformTitle}>MacOS:</span> {shortcuts.macos}
                        </div>
                        <div className={styles.platform}>
                            <span className={styles.platformTitle}>Linux:</span> {shortcuts.linux}
                        </div>
                        <p className={styles.description}>{shortcuts.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EncyclopedieData;