import React, { useState, useEffect } from 'react';
import EncyclopedieData from '../components/encyclopedie/EncyclopedieData';
import shortcutData from "../data/vscode.json";
import Button from '../components/ui/button/Button';

const EncyclopediePage: React.FC = () => {
    const [categorie, setCategorie] = useState<string>(''); // Catégorie sélectionnée
    const [raccourcisFiltrés, setRaccourcisFiltrés] = useState(shortcutData.shortcuts); // Liste affichée

    // Récupérer dynamiquement toutes les catégories dispo depuis le fichier JSON
    const categoriesDisponibles = Array.from(new Set(shortcutData.shortcuts.map(r => r.category)));

    // Mettre à jour la liste filtrée quand la catégorie change
    useEffect(() => {
        if (categorie === '') {
            setRaccourcisFiltrés(shortcutData.shortcuts);
        } else {
            const filtrés = shortcutData.shortcuts.filter(raccourci => raccourci.category === categorie);
            setRaccourcisFiltrés(filtrés);
        }
    }, [categorie]);

    return (
        <div style={{ padding: '2rem', backgroundColor: '#141726' }}>

            {/* Boutons de filtre              <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Encyclopédie des Raccourcis</h1>
*/}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
                <Button onClick={() => setCategorie('')} style={{ padding: '0.5rem 1rem' }}>
                    Tous
                </Button>
                {categoriesDisponibles.map((cat, index) => (
                    <Button key={index} onClick={() => setCategorie(cat)} style={{ padding: '0.5rem 1rem' }}>
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Affichage des raccourcis filtrés */}
            <EncyclopedieData
                shortcuts={raccourcisFiltrés}
                name={shortcutData.name}
                label={shortcutData.label}
            />
        </div>
    );
};

export default EncyclopediePage;
