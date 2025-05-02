import React, { useState, useEffect } from 'react';
import shortcutData from "../../data/vscode.json";
import styles from "./Quizz.module.css";
import Button from '../ui/button/Button';
const quizzName = shortcutData.name;
const Quizz: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const [isLoadingPref, setIsLoadingPref] = useState(true); // 👈 pour gérer le chargement des préférences
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [mode, setMode] = useState<'learning' | 'challenge' | 'hardcore'>('learning');


    const token = localStorage.getItem("token");

    // Récupère la préférence de l'utilisateur pour les règles
    useEffect(() => {
        const fetchPreference = async () => {
            if (!token) {
                setShowIntro(true);
                setIsLoadingPref(false);
                return;
            }
            try {
                const res = await fetch("http://localhost:5000/api/auth/preferences/quizz-intro", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setShowIntro(data.showIntro); // 👈 récupère la préférence
                setIsLoadingPref(false);
            } catch (err) {
                console.error("Erreur de récupération des préférences", err);
                setIsLoadingPref(false);
            }
        };

        fetchPreference();
    }, [token]);

    const shuffleArray = (array: string[]) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const generateOptions = () => {
        const currentShortcut = shortcutData.shortcuts[currentIndex];

        if (!currentShortcut) {
            return []; // 🔥 Si pas de question, retourne un tableau vide
        }
        const correctAnswer = shortcutData.shortcuts[currentIndex].windows;
        const incorrectAnswers = shortcutData.shortcuts
            .filter((raccourci, index) => index !== currentIndex)
            .slice(0, 2)
            .map((raccourci) => raccourci.windows);

        const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers]);
        setOptions(allOptions);
    };

    useEffect(() => {
        generateOptions();
    }, [currentIndex]);

    const handleAnswer = (selectedAnswer: string) => {
        const correctAnswer = shortcutData.shortcuts[currentIndex].windows;
        const isAnswerCorrect = selectedAnswer === correctAnswer;

        setIsCorrect(isAnswerCorrect);

        // 👇 Toujours compter avant d'agir !
        if (isAnswerCorrect) {
            setCorrectCount(prev => prev + 1);
        } else {
            setWrongCount(prev => prev + 1);
        }

        if (mode === 'learning') {
            if (isAnswerCorrect) {
                setCurrentIndex(prev => prev + 1);
            }
            // ❌ mauvaise réponse => on reste sur la même question (pas d'index +1)
        }
        else if (mode === 'challenge') {
            // ✅ ou ❌ => on passe toujours à la suivante
            setCurrentIndex(prev => prev + 1);
        }
        else if (mode === 'hardcore') {
            if (isAnswerCorrect) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // ❌ erreur => fin immédiate
                setCurrentIndex(prev => prev + 1);
                setIsFinished(true);
            }
        }
    };


    useEffect(() => {
        if (currentIndex === shortcutData.shortcuts.length) {
            finishQuizz();
        }
    }, [currentIndex]);

    const finishQuizz = async () => {
        setIsFinished(true);
        if (!token) return;

        try {
            const totalQuestions = shortcutData.shortcuts.length;

            const response = await fetch("http://localhost:5000/api/auth/stats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    total_questions: totalQuestions,
                    correct_answers: correctCount,
                    wrong_answers: wrongCount,
                    quizz_name: quizzName,
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi des statistiques");
            }

            const data = await response.json();
            console.log("Statistiques envoyées avec succès", data);

        } catch (err) {
            console.error("Erreur en envoyant les statistiques", err);
        }
    };


    // Enregistre la préférence pour ne plus afficher les règles
    const handleHideIntro = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/preferences/quizz-intro", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ showQuizzIntro: false }),
            });
            setShowIntro(false); // 👈 met à jour localement
        } catch (err) {
            console.error("Erreur lors de la mise à jour de la préférence", err);
        }
    };

    // Si les préférences sont en train de se charger
    if (isLoadingPref) return <p>Chargement...</p>;

    return (
        <div className={styles.container}>
            {isFinished ? (

                <div className={styles.endScreen}>
                    <h1>Quizz terminé 🎉</h1>
                    <p>Score : {correctCount} bonnes réponses sur {currentIndex} questions</p>
                    <Button
                        onClick={async () => {
                            setHasStarted(false);
                            setCurrentIndex(0);
                            setCorrectCount(0);
                            setWrongCount(0);
                            setIsCorrect(null);
                            setIsFinished(false);

                            if (token) {
                                try {
                                    const res = await fetch("http://localhost:5000/api/auth/preferences/quizz-intro", {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    });
                                    const data = await res.json();
                                    setShowIntro(data.showIntro); // 👈 on récupère VRAIMENT la préférence depuis la BDD
                                } catch (err) {
                                    console.error("Erreur de récupération de la préférence", err);
                                    setShowIntro(false); // par sécurité on part du principe qu'on n'affiche pas les règles
                                }
                            } else {
                                // Si pas connecté, on affiche toujours les règles
                                setShowIntro(true);
                            }
                        }}
                    >
                        Rejouer
                    </Button>

                </div>
            ) : (
                <>
                    {!hasStarted ? (
                        <div className={styles.introContainer}>
                            {/* Sélecteur de mode toujours affiché */}


                            {/* Affichage des règles uniquement si showIntro est true */}
                            {showIntro && (
                                <div className={styles.rules}>
                                    <h1 className={styles.title}>Bienvenue dans le Quizz des Raccourcis</h1>
                                    <p>Voici comment ça fonctionne :</p>
                                    <ul className={styles.rulesList}>
                                        <li>🎮 Tu dois sélectionner un mode de jeu avant de commencer.</li>
                                        <li>🧠 Une question s'affiche avec un raccourci à deviner.</li>
                                        <li>💻 Tu dois choisir la bonne combinaison de touches (Windows).</li>
                                        <li>✅ Si ta réponse est correcte, tu passes à la suivante.</li>
                                        <li>❌ Sinon, tu peux réessayer !</li>
                                    </ul>
                                </div>
                            )}
                            <div className={styles.modeSelector}>
                                <label htmlFor="mode-select">Choisissez un mode :</label>
                                <select
                                    id="mode-select"
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as 'learning' | 'challenge' | 'hardcore')}
                                >
                                    <option value="learning">Mode Apprentissage🎓</option>
                                    <option value="challenge">Mode Challenge    ⚔️ </option>
                                    <option value="hardcore">Mode Hardcore      💀</option>
                                </select>
                            </div>
                            <div className={styles.buttonContainer}><Button onClick={() => setHasStarted(true)}>Commencer</Button>
                                {showIntro && <Button onClick={handleHideIntro}>Ne plus afficher les règles</Button>}</div>
                        </div>
                    ) : (
                        <>
                            <h1 className={styles.question}>Quizz des raccourcis</h1>

                            <p className={styles.progress}>
                                Question {currentIndex + 1} / {shortcutData.shortcuts.length}
                            </p>

                            <div>
                                {shortcutData.shortcuts[currentIndex] && (
                                    <>
                                        <h2 className={styles.action}>{shortcutData.shortcuts[currentIndex].action}</h2>
                                        <div className={styles.buttons}>
                                            {options.map((option, index) => (
                                                <Button key={index} onClick={() => handleAnswer(option)}>
                                                    {option}
                                                </Button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {isCorrect !== null && (
                                    <div className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
                                        {isCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.'}
                                    </div>
                                )}

                                {/* Bouton "Terminer le quizz" */}
                                {currentIndex < shortcutData.shortcuts.length && !isFinished && (
                                    <Button onClick={finishQuizz}>Terminer le quizz</Button>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );


};

export default Quizz;
