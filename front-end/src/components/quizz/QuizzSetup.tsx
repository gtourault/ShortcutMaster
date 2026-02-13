import styles from "./QuizzSetup.module.scss";
import React, { ReactNode } from "react";
import Button from "../ui/button/Button";
import { Software } from "../../types/softwares";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaRegStar, FaStar } from "react-icons/fa";
import { useLocation } from "react-router-dom";


interface QuizzSetupProps {
  onStart: (data: { 
    difficulty: string; 
    software: { id: number; label: string; logo: string;}
    system: string;
  }) => void; 
  preselectedSoftwareId?: number;
  variant?: "default" | "compact";
  mode?: "quizz" | "training";
}


const QuizzSetup: React.FC<QuizzSetupProps> = ({ onStart, preselectedSoftwareId, variant = "default", mode }) => {

    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Aucun");
    const [softwares, setSoftwares] = useState<Software[]>([]);
    const [selectedSystem, setSelectedSystem] =  useState<string | null>(null);
    const [selectedSoftware, setSelectedSoftware] = useState<{ 
  id: number; 
  label: string; 
  logo: string; 
} | null>(null);
            //console.log(selectedDifficulty)

            const paginatedSoftwares = softwares.slice(
  currentPage * ITEMS_PER_PAGE,
  (currentPage + 1) * ITEMS_PER_PAGE
);
const location = useLocation();
// console.log(location.pathname);

const initialMode: "quizz" | "training" | null = 
  location.pathname === "/quizz" ? "quizz" :
  location.pathname === "/training" ? "training" : null;
  console.log("Initial mode:", initialMode);
const [selectedMode, setSelectedMode] = useState<"quizz" | "training" | null>(initialMode);

const totalPages = Math.ceil(softwares.length / ITEMS_PER_PAGE);
    useEffect(() => {
  const fetchSoftwares = async () => {
    try {
      const res = await axios.get<Software[]>(
        "http://localhost:5000/api/auth/softwares"
      );

      setSoftwares(res.data);

      if (preselectedSoftwareId) {
        const found = res.data.find(
          s => s.id === preselectedSoftwareId
        );
        if (found) {
          setSelectedSoftware(found);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchSoftwares();
  //console.log(preselectedSoftwareId);
}, [preselectedSoftwareId]);

const difficultyDescriptions: Record<string, ReactNode> = {
  Aucun: (
    <p className={styles.muted}>
      La description du mode sélectionné apparaîtra ici.
    </p>
  ),

  Apprentissage: (
    <ul className={`${styles.list} ${styles.Apprentissage}`}>
      <li>Pas de limite de temps</li>
      <li>Erreurs autorisées</li>
      <li>Idéal pour commencer et apprendre</li>
    </ul>
  ),

  Challenge: (
    <ul className={`${styles.list} ${styles.Challenge}`}>
      <li>Limite de temps</li>
      <li>Une erreur passe au raccourci suivant</li>
      <li>Idéal pour aller plus loin</li>
    </ul>
  ),

  Hardcore: (
    <ul className={`${styles.list} ${styles.Hardcore}`}>
      <li>Limite de temps très courte</li>
      <li>Une erreur arrête l’exercice</li>
      <li>Réservé aux braves</li>
    </ul>
  ),
};

const systemImages: Record<string, string> = {
  windows: "/assets/windowsDesktop.png",
  macos: "/assets/macDesktop.png",
  linux: "/assets/linuxDesktop.png",
};
const recapImages: Record<string, string> = {
  windows: "/assets/logoWindows.png",
  macos: "/assets/logoMac.webp",
  linux: "/assets/logoLinux.png",
};
console.log('mode:', mode);
console.log('modedeux:', selectedMode);
console.log('modetrois:', initialMode);
    return (
    <div className={`${styles.setupContainer} ${styles[variant]}` }>
      
      <div className={styles.selectionSection}>
      <h1>Préparation de l'exercice</h1>

      <div className={`${styles.difficultyGrid}`}>
        <label className={styles.title} htmlFor="difficulty">Difficulté :</label>
       <div className={styles.difficultyList}>
         {[
          { value: "Apprentissage", label: "Mode Apprentissage 🎓" },
          { value: "Challenge", label: "Mode Challenge ⚔️" },
          { value: "Hardcore", label: "Mode Hardcore 💀" },
        ].map((mode) => (
          <div
            key={mode.value}
            className={`${styles.difficultyItem} ${
              selectedDifficulty === mode.value ? styles.active : ""
            }`}
            onClick={() => setSelectedDifficulty(mode.value)}
          >
          
            <span className={styles.label}>{mode.label}</span>
            <span className={styles.radio}>
              <span className={styles.radioDot} />
            </span>
          </div>
        ))}
       </div>
        {selectedDifficulty && (
          <div className={`${styles.difficultyDescription} ${styles[selectedDifficulty]}`}>
            <span>Description :</span>
            {difficultyDescriptions[selectedDifficulty]}
          </div>
        )}
      </div>  


      <div className={`${styles.difficultyGrid} ${styles.systemSelection} ${styles[selectedSystem]}`}>
      <h2 className={styles.title}>Système :</h2>
        <div className={styles.difficultyList}>
          {location.pathname !== "/home" && selectedSystem ? (
                  <img
                    src={systemImages[selectedSystem]}
                    alt="System preview"
                    className={`${styles.systemImage} ${styles[selectedSystem]}`}
                  />
                ) : (
                  <div className={styles.systemPlaceholder}>
                    <span>Choisis un système</span>
                  </div>
        )}
        {[
          { value: "windows", label: "Windows " },
          { value: "macos", label: "MacOS " },
          { value: "linux", label: "Linux " },
        ].map(sys => (
          <div
            key={sys.value}
            onClick={() => setSelectedSystem(sys.value)}
            className={`${selectedSystem === sys.value ? styles.active : ""} ${styles.difficultyItem}`}
          >
            <span className={styles.label}>{sys.label}</span>
            <span className={styles.radio}>
              <span className={styles.radioDot} />
            </span>
          </div>
        ))}
        </div>
        
      </div>
      <div className={`${styles.difficultyGrid} ${styles.softwareSelection}`}>
        <h2 className={styles.title}>Logiciels :</h2>
          <div className={styles.softwareGrid}>
            {paginatedSoftwares.map((s) => (
              <div
                key={s.id}
                className={`${styles.softwareCard} ${
                  selectedSoftware?.id === s.id ? styles.active : ""
                }`}
                onClick={() => setSelectedSoftware(s)}
              >
                <span className={styles.starFavorite}>
                  <FaRegStar />
                </span>
                <img src={s.logo} alt={s.label} />
                <p>{s.label}</p>
              </div>
            ))}
          </div>
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
              >
                ◀
              </button>

              <span>
                {currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                ▶
              </button>
            </div>
      </div>
      </div>
            {/* Sélection logiciel  ${styles.difficultyGrid} */}
      
      <div className={styles.containerSummary}>
        { variant === "compact" && (
                <div className={styles.modeSelection}>
                <h4>Choisir le mode :</h4>
                
                  <Button
                  className={`${selectedMode === "quizz" ? styles.active : ""} ${styles.modeButton}`}
                  onClick={() => setSelectedMode("quizz")}
                >
                  Quizz
                </Button>
                <Button
                  className={`${selectedMode === "training" ? styles.active : ""} ${styles.modeButton}`}
                  onClick={() => setSelectedMode("training")}
                >
                  Entrainement
                </Button>
                
              </div>
            )}
        <div className={`${styles.summaryCard}`}>
              <h2 className={styles.title}>Récap de votre partie :</h2>

              <div className={styles.summaryRow}>
                <span>Difficulté :</span>
                <strong>
                  {selectedDifficulty || "Non sélectionnée"}
                </strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Système :</span>
                <strong>
                  {selectedSystem?.toUpperCase()}
                </strong>
                {selectedSystem && (
                  <img src={recapImages[selectedSystem]} alt="System preview" />
                )}
              </div>

              <div  className={styles.summaryRow}>
                {selectedSoftware ? (
                  <div  className={styles.summaryRow}>
                <span>Logiciel :</span>

                    <strong>{selectedSoftware.label}</strong>
                    <img src={selectedSoftware.logo} alt={selectedSoftware.label} />

                  </div>
                  
                ) : (
                  <strong>Non sélectionné</strong>
                )}
                
              </div>
               { variant === "compact" && (
                <div className={styles.summaryRow}>
                  <span>Mode :</span>
                  <span>{selectedMode}</span>
                </div>
                )}
      </div>
      <Button
  onClick={() => {
    if (!selectedSoftware || !selectedDifficulty || !selectedSystem) return;
    if (!mode && !selectedMode) return; // si aucun mode choisi, on bloque

    onStart({
      difficulty: selectedDifficulty,
      software: selectedSoftware,
      system: selectedSystem,
      mode: mode || selectedMode!, // ← si mode déjà passé, on prend celui-là, sinon le sélectionné
    });
  }}
  disabled={!selectedDifficulty || !selectedSoftware || !selectedSystem || (!mode && !selectedMode)}
>
  Commencer
</Button>
      </div>

      {/* Bouton valider */}
      
          </div>
        );
      };

export default QuizzSetup;