import React, { useState, useEffect } from 'react';
import EncyclopedieData from '../components/encyclopedie/EncyclopedieData';
import shortcutData from "../data/vscode.json";
import Button from '../components/ui/button/Button';
import { useParams } from "react-router-dom";
//import softwares from "../data/softwares.json";
import { useNavigate } from 'react-router-dom';
import { Software } from "../types/softwares";
import axios from 'axios';

interface Raccourci {
    action: string;
    windows: string;
    macos: string;
    linux: string;
    description: string;
    category: string;
}

const EncyclopediePage: React.FC = () => {
      const [softwares, setSoftwares] = useState<Software[]>([]);
      const { softwareId } = useParams<{ softwareId: string }>();
      const [shortcuts, setShortcuts] = useState<any[]>([]);
      const [categorie, setCategorie] = useState<string>(''); 
      const [raccourcisFiltrés, setRaccourcisFiltrés] = useState(shortcutData.shortcuts);
      const navigate = useNavigate();
      const [showSoftwareList, setShowSoftwareList] = useState<boolean>(false);

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


    const categoriesDisponibles = Array.from(new Set(shortcutData.shortcuts.map(r => r.category)));
  useEffect(() => {
  if (!softwareId) {
    setShortcuts([]);
    setRaccourcisFiltrés([]);
    setCategorie('');
    return;
  }

  const fetchShortcuts = async () => {
    try {
      const res = await axios.get<{ shortcuts: Raccourci[] }>(
  `http://localhost:5000/api/auth/softwares/${softwareId}/shortcuts`
);

      setShortcuts(res.data.shortcuts);
      setRaccourcisFiltrés(res.data.shortcuts);
      setCategorie("");
    } catch (err) {
      console.error("Erreur lors de la récupération des raccourcis :", err);
    }
  };

  fetchShortcuts();
}, [softwareId]);


  useEffect(() => {
    if (categorie === "") {
      setRaccourcisFiltrés(shortcuts);
    } else {
      setRaccourcisFiltrés(shortcuts.filter((r) => r.category === categorie));
    }
  }, [categorie, shortcuts]);


    useEffect(() => {
        if (categorie === '') {
            setRaccourcisFiltrés(shortcutData.shortcuts);
        } else {
            const filtrés = shortcutData.shortcuts.filter(raccourci => raccourci.category === categorie);
            setRaccourcisFiltrés(filtrés);
        }
    }, [categorie]);

    return (
    <div style={{ padding: "2rem", backgroundColor: "#141726" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Encyclopédie — {softwareId}
      </h1>
       {/* Bouton pour afficher la liste des logiciels */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <Button onClick={() => setShowSoftwareList((prev) => !prev)}>
          {showSoftwareList ? "Fermer la liste" : "Changer de logiciel"}
        </Button>
      </div>

      {/* Liste des logiciels (affichée si showSoftwareList = true) */}
      {showSoftwareList && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
          {(softwares as any[]).map((s) => (
            <div
              key={s.id}
              style={{
                cursor: "pointer",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#1f2235",
                color: "#fff",
                textAlign: "center",
                width: "150px",
              }}
              onClick={() => {
                setShowSoftwareList(false);
                navigate(`/encyclopedie/${s.id}`);
              }}
            >
              <img src={s.logo} alt={s.label} style={{ width: "40px", marginBottom: "0.5rem" }} />
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {/* Boutons de filtre */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
        <Button onClick={() => setCategorie("")}>Tous</Button>
        {categoriesDisponibles.map((cat, index) => (
          <Button key={index} onClick={() => setCategorie(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      {/* Affichage des raccourcis */}
      <EncyclopedieData shortcuts={raccourcisFiltrés} softwareFilter={softwareId} />
    </div>
    );
};

export default EncyclopediePage;
