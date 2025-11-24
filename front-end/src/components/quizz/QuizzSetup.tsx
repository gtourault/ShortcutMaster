import styles from "./Quizz.module.css";
import React from "react";
import Button from "../ui/button/Button";
import { Software } from "../../types/softwares";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface QuizzSetupProps {
  onStart: (data: { 
    difficulty: string; 
    software: { id: number; label: string; logo: string;}
    system: string;
  }) => void;
}


const QuizzSetup: React.FC<QuizzSetupProps> = ({ onStart }) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [softwares, setSoftwares] = useState<Software[]>([]);
    const [selectedSystem, setSelectedSystem] = useState<string>("windows");
    const [selectedSoftware, setSelectedSoftware] = useState<{ 
  id: number; 
  label: string; 
  logo: string; 
} | null>(null);
            //console.log(selectedDifficulty)
    useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        const res = await axios.get<Software[]>("http://localhost:5000/api/auth/softwares");
        setSoftwares(res.data);
        //console.log(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des logiciels :", err);
      }
    };
    fetchSoftwares();
  }, []);

    return (
    <div className={styles.setupContainer}>
      <h1>Préparation du Quizz</h1>
      <div className={styles.difficultyGrid}>
        <label htmlFor="difficulty">Choisis ta difficulté :</label>
        <select
          id="difficulty"
          className={styles.select}
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="">-- Sélectionne un mode --</option>
          <option value="Apprentissage">Mode Apprentissage 🎓</option>
          <option value="Challenge">Mode Challenge ⚔️</option>
          <option value="Hardcore">Mode Hardcore 💀</option>
        </select>
      </div>

      <h2>Choisissez votre système</h2>
      <div className={styles.systemSelector}>
        {["windows", "macos", "linux"].map(sys => (
          <Button
            key={sys}
            onClick={() => setSelectedSystem(sys)}
            className={selectedSystem === sys ? styles.active : ""}
          >
            {sys.toUpperCase()}
          </Button>
        ))}
      </div>

            {/* Sélection logiciel */}
      <h2>Choisissez le logiciel</h2>
      <div className={styles.softwareGrid}>
        {softwares.map((s) => (
          <div
            key={s.id}
            className={`${styles.softwareCard} ${
              selectedSoftware?.id === s.id ? styles.active : ""
            }`}
            onClick={() => setSelectedSoftware(s) }
             // on stocke l'objet complet
          >
            <img src={s.logo} alt={s.label} />
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bouton valider */}
      <Button
        onClick={() =>
          selectedSoftware &&
          onStart({
            difficulty: selectedDifficulty,
            software: selectedSoftware,
            system: selectedSystem,
          })
        }
        disabled={!selectedDifficulty || !selectedSoftware || !selectedSystem} // désactivé si pas de sélection
      >
        Commencer le Quizz
      </Button>
          </div>
        );
      };

export default QuizzSetup;