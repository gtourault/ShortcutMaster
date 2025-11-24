import React, { useState, useEffect } from "react";
import styles from "./Training.module.css";
import Button from "../ui/button/Button";
import PieComp from '../ui/PieCharts/PieComp';
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import { IoIosTimer } from "react-icons/io";
import { LuTarget } from "react-icons/lu";
import QuizzSetup from "../quizz/QuizzSetup";

type GameMode = "Apprentissage" | "Challenge" | "Hardcore";

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

interface Shortcut {
    id: number;
    action: string;
    windows: string;
    macos: string;
    linux: string;
    software_id: number;
}

const Training: React.FC = () => {
    const [mode, setMode] = useState<GameMode>("Apprentissage");
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const token = localStorage.getItem("token");
    const [isLoadingPref, setIsLoadingPref] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});

    // 🔹 États de configuration (reçus du QuizzSetup)
    const [difficulty, setDifficulty] = useState<string>("");
    const [softwareId, setSoftwareId] = useState<number>();
    const [selectedSystem, setSelectedSystem] = useState<string>("");
    const [selectedSoftware, setSelectedSoftware] = useState<{ 
        id: number; 
        label: string; 
        logo: string; 
    } | null>(null);

    // 🔹 États des raccourcis
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [shuffledShortcuts, setShuffledShortcuts] = useState<Shortcut[]>([]);
    const [currentShortcut, setCurrentShortcut] = useState<Shortcut | null>(null);

    // 🔹 Historique
    const [history, setHistory] = useState<
        {
            action: string;
            correctShortcut: string;
            userInput: string;
            success: boolean;
            skipped?: boolean;
            responseTime?: number;
        }[]
    >([]);

    // 🔹 Regroupement de l'historique par action
    const groupedHistory = history
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .reduce((acc, item) => {
            const action = item.action ?? "inconnu";
            if (!acc[action]) acc[action] = [];
            acc[action].push(item);
            return acc;
        }, {} as Record<string, typeof history>);

    // 🔹 Compteurs de succès/échec
    const successCount = history.filter(item => item.success).length;
    const failureCount = history.length - successCount;

    // 🔹 Toggle des détails dans l'historique
    const toggleDetails = (action: string) => {
        setDetailsOpen(prev => ({
            ...prev,
            [action]: !prev[action]
        }));
    };

    // ========================================
    // 🔹 EFFET : Auto-ouverture des 2 dernières actions
    // ========================================
    useEffect(() => {
        if (history.length === 0) return;

        const uniqueLastActions: string[] = [];
        for (let i = history.length - 1; i >= 0 && uniqueLastActions.length < 2; i--) {
            const action = history[i].action;
            if (!uniqueLastActions.includes(action)) {
                uniqueLastActions.push(action);
            }
        }

        setDetailsOpen(() => {
            const newState: Record<string, boolean> = {};
            Object.keys(groupedHistory).forEach(action => {
                newState[action] = uniqueLastActions.includes(action);
            });
            return newState;
        });
    }, [history]);

    // ========================================
    // 🔹 CHANGEMENT DE MODE
    // ========================================
    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMode(e.target.value as GameMode);
        resetInput();
        setHistory([]);
        setGameOver(false);
    };

    // ========================================
    // 🔹 FORMATAGE DU TEMPS
    // ========================================
    function formatTime(ms: number): string {
        if (ms < 1000) return `${ms} ms`;
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes} min ${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} s`;
        }

        return `${seconds} s`;
    }

    // ========================================
    // 🔹 NORMALISATION DES TOUCHES
    // ========================================
    const normalizeKey = (key: string) => {
        const keyMap: { [key: string]: string } = {
            control: "ctrl",
            meta: "cmd",
            shift: "shift",
            alt: "alt",
            arrowup: "↑",
            arrowdown: "↓",
            arrowleft: "←",
            arrowright: "→",
            enter: "enter",
            escape: "esc",
            backspace: "backspace",
            delete: "del",
            capslock: "caps lock",
            tab: "tab",
            space: "space",
            numlock: "num lock",
            scrolllock: "scroll lock",
            contextmenu: "menu"
        };

        return keyMap[key.toLowerCase()] || key.toLowerCase();
    };

    // ========================================
    // 🔹 DÉTECTION DES RACCOURCIS DANGEREUX
    // ========================================
    const dangerousShortcuts = [
        ['ctrl', 'w'],
        ['ctrl', 'r'],
        ['ctrl', 'n'],
        ['meta', 'w'],
        ['meta', 'r'],
        ['control', 'n'],
        ['meta', 'q']
    ];

    const isDangerousShortcut = (keys: string[]): boolean => {
        const normalized = keys.map(k => k.toLowerCase());
        const set = new Set(normalized);

        return dangerousShortcuts.some((dangerCombo) =>
            dangerCombo.every(key => set.has(key))
        );
    };

    // ========================================
    // 🔹 PASSAGE AU RACCOURCI SUIVANT
    // ========================================
    const nextShortcut = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < shuffledShortcuts.length) {
            setCurrentIndex(nextIndex);
            setCurrentShortcut(shuffledShortcuts[nextIndex]);
            setPressedKeys([]);
            setStartTime(Date.now());
        } else {
            console.log("Fin de l'entraînement");
            setGameOver(true);
        }
    };

    // ========================================
    // 🔹 RÉINITIALISATION DE L'INPUT
    // ========================================
    const resetInput = () => {
        setPressedKeys([]);
        setStartTime(Date.now());
    };

    // ========================================
    // 🔹 PASSER UN RACCOURCI
    // ========================================
    const skipShortcut = () => {
        if (!currentShortcut) return;

        setHistory((prev) => [
            ...prev,
            {
                action: currentShortcut.action,
                correctShortcut: getCorrectShortcutForSystem(currentShortcut),
                userInput: "-",
                success: false,
                skipped: true,
            },
        ]);
        nextShortcut();
        setWrongCount(prev => prev + 1);
    };

    // ========================================
    // 🔹 RÉCUPÉRATION DU RACCOURCI SELON L'OS
    // ========================================
    const getCorrectShortcutForSystem = (shortcut: Shortcut): string => {
        switch (selectedSystem) {
            case "windows":
                return shortcut.windows;
            case "macos":
                return shortcut.macos;
            case "linux":
                return shortcut.linux;
            default:
                return shortcut.windows;
        }
    };

    // ========================================
    // 🔹 GESTION DES TOUCHES PRESSÉES
    // ========================================
    const handleKeyDown = (event: KeyboardEvent) => {
        if (gameOver) return;
        event.preventDefault();

        const key = event.key.toLowerCase();
        if (!pressedKeys.includes(key)) {
            setPressedKeys((prev) => [...prev, key]);
        }
    };

    // ========================================
    // 🔹 REDÉMARRAGE DE L'ENTRAÎNEMENT
    // ========================================
    const restartTraining = () => {
        const newShuffled = shuffleArray(shortcuts);
        setShuffledShortcuts(newShuffled);
        setCurrentIndex(0);
        setCorrectCount(0);
        setWrongCount(0);
        setCurrentShortcut(newShuffled[0]);
        setPressedKeys([]);
        setStartTime(Date.now());
        setHistory([]);
        setGameOver(false);
        setHasStarted(false);
    };

    // ========================================
    // 🔹 EFFET : VALIDATION DE LA RÉPONSE
    // ========================================
    useEffect(() => {
        if (!hasStarted || !currentShortcut) return;

        // 🔸 Récupère le raccourci attendu selon l'OS sélectionné
        const correctShortcut = getCorrectShortcutForSystem(currentShortcut);
        const expectedKeys = correctShortcut
            .toLowerCase()
            .split(" + ")
            .map(normalizeKey)
            .sort();

        const userKeys = [...pressedKeys].map(normalizeKey).sort();

        const isCorrect = JSON.stringify(userKeys) === JSON.stringify(expectedKeys);
        const responseTime = startTime ? Date.now() - startTime : undefined;

        if (userKeys.length >= expectedKeys.length) {
            // 🔸 Ajout à l'historique (DÉCOMMENTÉ ET CORRIGÉ)
            setHistory((prev) => [
                ...prev,
                {
                    action: currentShortcut.action,
                    correctShortcut: correctShortcut,
                    userInput: userKeys.join(" + "),
                    success: isCorrect,
                    responseTime: (mode !== "Apprentissage" && responseTime) ? responseTime : undefined,
                },
            ]);

            // 🔸 Logique selon le mode
            if (mode === "Apprentissage") {
                if (isCorrect) {
                    setIsCorrect(true);
                    setCorrectCount(prev => prev + 1);
                    setTimeout(() => {
                        nextShortcut();
                        setIsCorrect(null);
                    }, 1000);
                } else {
                    setIsCorrect(false);
                    setWrongCount(prev => prev + 1);
                    setTimeout(() => {
                        setPressedKeys([]);
                        setIsCorrect(null);
                    }, 1000);
                }
            }

            if (mode === "Challenge") {
                setIsCorrect(isCorrect);
                if (isCorrect) {
                    setCorrectCount(prev => prev + 1);
                } else {
                    setWrongCount(prev => prev + 1);
                }
                setTimeout(() => {
                    nextShortcut();
                    setIsCorrect(null);
                }, 1000);
            }

            if (mode === "Hardcore") {
                if (isCorrect) {
                    setIsCorrect(true);
                    setCorrectCount(prev => prev + 1);
                    setTimeout(() => {
                        nextShortcut();
                        setIsCorrect(null);
                    }, 1000);
                } else {
                    setIsCorrect(false);
                    setWrongCount(prev => prev + 1);
                    setGameOver(true);
                }
            }
        }
    }, [pressedKeys, currentShortcut, hasStarted]);

    // ========================================
    // 🔹 EFFET : CHARGEMENT DES PRÉFÉRENCES
    // ========================================
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
                setShowIntro(data.showIntro);
                setIsLoadingPref(false);
            } catch (err) {
                console.error("Erreur de récupération des préférences", err);
                setIsLoadingPref(false);
            }
        };

        fetchPreference();
    }, [token]);

    // ========================================
    // 🔹 EFFET : ÉCOUTE DU CLAVIER
    // ========================================
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pressedKeys, gameOver]);

    // ========================================
    // 🔹 MASQUER L'INTRO
    // ========================================
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
            setShowIntro(false);
        } catch (err) {
            console.error("Erreur lors de la mise à jour de la préférence", err);
        }
    };

    // ========================================
    // 🔹 EFFET : DÉTECTION DES RACCOURCIS DANGEREUX
    // ========================================
    useEffect(() => {
        if (!hasStarted || !currentShortcut) return;
        if (pressedKeys.length === 0) return;

        // 🔸 CORRECTION : Utilise le bon système sélectionné
        const correctShortcut = getCorrectShortcutForSystem(currentShortcut);
        const shortcutKeys = correctShortcut
            .toLowerCase()
            .split(' + ')
            .map(k => k.trim());

        if (isDangerousShortcut(shortcutKeys)) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }
    }, [currentShortcut, selectedSystem]);

    // ========================================
    // 🔹 SAUVEGARDE DES STATISTIQUES
    // ========================================
    const finishTraining = async () => {
        if (!token || !selectedSoftware) return;

        const totalQuestions = shortcuts.length;

        const formattedAnswers = history.map(item => ({
            question_label: item.action,
            expected_shortcut: item.correctShortcut,
            user_input: item.userInput,
            is_correct: item.success,
            response_time_ms: item.responseTime ?? 0
        }));

        const payload = {
            type: "training",
            difficulty: mode,
            software: selectedSoftware.label,
            system: selectedSystem,
            total_questions: totalQuestions,
            total_correct: correctCount,
            total_wrong: wrongCount,
            average_time_ms: history.length > 0 
                ? Math.round(history.reduce((acc, cur) => acc + (cur.responseTime ?? 0), 0) / history.length)
                : 0,
            answers: formattedAnswers,
        };

        try {
            const response = await fetch("http://localhost:5000/api/auth/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
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

    // ========================================
    // 🔹 DÉMARRAGE DEPUIS QuizzSetup
    // ========================================
    const handleStart = async (data: { 
        difficulty: string; 
        software: { id: number; label: string; logo: string; };
        system: string;
    }) => {
        // 🔸 Stocke les paramètres reçus
        setDifficulty(data.difficulty);
        setMode(data.difficulty as GameMode);
        setSoftwareId(data.software.id);
        setSelectedSystem(data.system);
        setSelectedSoftware(data.software);

        try {
            // 🔸 Récupère les raccourcis depuis l'API
            const res = await fetch(`http://localhost:5000/api/auth/softwares/${data.software.id}/shortcuts`);
            const fetchedData = await res.json();
            const fetchedShortcuts = fetchedData.shortcuts;

            setShortcuts(fetchedShortcuts);

            // 🔸 Mélange et initialise CORRECTEMENT
            const shuffled = shuffleArray(fetchedShortcuts);
            setShuffledShortcuts(shuffled);
            setCurrentShortcut(shuffled[0]); // ✅ CORRECTION ICI
            
            setPressedKeys([]);
            setStartTime(Date.now());
            setHasStarted(true);

            console.log("✅ Entraînement démarré avec :", {
                difficulty: data.difficulty,
                software: data.software.label,
                system: data.system,
                totalShortcuts: fetchedShortcuts.length
            });
        } catch (err) {
            console.error("Erreur lors du chargement des raccourcis :", err);
        }
    };

    // ========================================
    // 🔹 RENDU CONDITIONNEL
    // ========================================
    if (!hasStarted) {
        return <QuizzSetup onStart={handleStart} />;
    }

    if (isLoadingPref) return <p>Chargement...</p>;

    return (
        <div className={styles.trainingPage}>
            {!gameOver ? (
                <>
                    <div className={styles.empty}></div>
                    <div className={styles.trainingContainer}>
                        <h2 className={styles.quizzTitle}>Mode Entraînement</h2>
                        <div className={styles.progressContainer}>
                            {isCorrect !== null && (
                                <p className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
                                    {isCorrect ? "Bonne réponse !" : "Mauvaise réponse."}
                                </p>
                            )}
                            <p className={styles.progress}>
                                {selectedSoftware && (
                                    <img
                                        className={styles.progressSoftware}
                                        src={selectedSoftware.logo}
                                        alt={selectedSoftware.label}
                                    />
                                )}
                                Raccourci {currentIndex + 1} sur {shortcuts.length}
                            </p>
                            <div className={styles.progressBarBackground}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{
                                        width: `${((currentIndex + 1) / shortcuts.length) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        {showWarning && (
                            <div className={styles.shortcutWarning}>
                                Attention : ce raccourci peut provoquer une action du navigateur (fermeture, rechargement...).<br />
                                Veuillez taper le raccourci en différé.
                            </div>
                        )}
                        <div className={styles.shortcutContainer}>
                            <p className={styles.instruction}>
                                Tapez le raccourci pour : <strong>{currentShortcut?.action}</strong>
                            </p>
                            
                            <div className={styles.inputContainer}>
                                <div className={styles.inputFieldContainer}>
                                    <input
                                        type="text"
                                        className={styles.inputDisplay}
                                        value={pressedKeys.join(" + ")}
                                        readOnly
                                    />

                                    <div className={styles.inputBorder}></div>
                                    <div className={styles.holoScanLine}></div>
                                    <div className={styles.inputGlow}></div>
                                    <div className={styles.inputActiveIndicator}></div>

                                    <div className={styles.inputParticles}>
                                        <div className={styles.inputParticle} style={{ ['--index' as any]: 1, top: "20%", left: "10%" }}></div>
                                        <div className={styles.inputParticle} style={{ ['--index' as any]: 2, top: "65%", left: "25%" }}></div>
                                        <div className={styles.inputParticle} style={{ ['--index' as any]: 3, top: "40%", left: "40%" }}></div>
                                        <div className={styles.inputParticle} style={{ ['--index' as any]: 4, top: "75%", left: "60%" }}></div>
                                        <div className={styles.inputParticle} style={{ ['--index' as any]: 5, top: "30%", left: "75%" }}></div>
                                        <div className={styles.inputParticle} style={{ ['--index' as any]: 6, top: "60%", left: "90%" }}></div>
                                    </div>

                                    <div className={styles.inputHoloOverlay}></div>

                                    <div className={styles.interfaceLines}>
                                        <div className={styles.interfaceLine}></div>
                                        <div className={styles.interfaceLine}></div>
                                        <div className={styles.interfaceLine}></div>
                                        <div className={styles.interfaceLine}></div>
                                    </div>

                                    <div className={styles.hexDecoration}></div>
                                    <div className={styles.inputStatus}>Ready for input</div>
                                    <div className={styles.powerIndicator}></div>

                                    <div className={styles.inputDecoration}>
                                        <div className={styles.decorationDot}></div>
                                        <div className={styles.decorationLine}></div>
                                        <div className={styles.decorationDot}></div>
                                        <div className={styles.decorationLine}></div>
                                        <div className={styles.decorationDot}></div>
                                        <div className={styles.decorationLine}></div>
                                        <div className={styles.decorationDot}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <p className={styles.solution}>
                            💡 Solution : <strong>{currentShortcut && getCorrectShortcutForSystem(currentShortcut)}</strong>
                            <Button onClick={resetInput}>Reset</Button>
                            <Button onClick={skipShortcut}>Passer</Button>
                        </p>
                    
                        <div className={styles.historySection}>
                            <div className={styles.sessionInfosCard}>
                                <p className={styles.infosTitle}>Informations sur la session en cours : </p>
                                <p className={styles.infosMode}>Difficulté : <strong>{mode}</strong></p>
                                <p className={styles.infosTotal}>Total de raccourcis : <strong>{shortcuts.length}</strong></p>
                                <p className={styles.infosScore}>Score : <strong>{correctCount} bonnes</strong> / <strong>{wrongCount} mauvaises</strong></p>
                                <div className={styles.buttonsContainer}>
                                    <Button onClick={restartTraining}>Recommencer</Button>
                                    <Button onClick={finishTraining}>Terminer</Button>
                                </div>
                            </div>
                            <div className={styles.history}>
                                <h2>Historique :</h2>
                                <ul>
                                    {Object.entries(groupedHistory).reverse().map(([action, attempts]) => (
                                        <li key={action} className={styles.groupedItem}>
                                            <div className={styles.groupHeader}>
                                                <strong>{action} - {attempts.length} tentative{attempts.length > 1 ? 's' : ''}</strong>
                                                <button
                                                    className={styles.toggleDetailsBtn}
                                                    onClick={() => toggleDetails(action)}
                                                >
                                                    {detailsOpen[action] ? <FaArrowCircleUp /> : <FaArrowCircleDown />}
                                                </button>
                                            </div>
                                            {detailsOpen[action] && (
                                                <ul className={styles.detailList}>
                                                    {attempts.map((item, index) => (
                                                        <li key={index}
                                                            className={item.success ? styles.correct : styles.incorrect}>
                                                            Ta réponse : <strong>{item.userInput}</strong> - 
                                                            {item.success ? "Bonne réponse" : "Mauvaise réponse"}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.endScreen}>  
                    <h1 className={styles.quizzTitle}>Vos statistiques</h1>
                    <p className={styles.infosTitle}>Suivez votre progrès et analysez votre performance</p>
                    <div className={styles.scoreContainer}>
                        <div className={styles.scoreCard}>
                            <p>Score : {correctCount} bonnes réponses sur {currentIndex} questions</p>
                            <LuTarget />
                        </div>
                        <div className={styles.scoreCard}>
                            <p>Temps moyen de réponse : {history.length > 0 ? formatTime(Math.round(history.reduce((acc, cur) => acc + (cur.responseTime ?? 0), 0) / history.length)) : '0 s'}</p>
                            <IoIosTimer />
                        </div>
                        <Button onClick={restartTraining}>Recommencer</Button>
                    </div>
                    <div className={styles.historyEndSection}>
                        <div className={styles.history}>
                            <h2>Historique :</h2>
                            <ul>
                                {Object.entries(groupedHistory).reverse().map(([action, attempts]) => (
                                    <li key={action} className={styles.groupedItem}>
                                        <div className={styles.groupHeader}>
                                            <strong>{action} - {attempts.length} tentative{attempts.length > 1 ? 's' : ''}</strong>
                                            <button
                                                className={styles.toggleDetailsBtn}
                                                onClick={() => toggleDetails(action)}
                                            >
                                                {detailsOpen[action] ? <FaArrowCircleUp /> : <FaArrowCircleDown />}
                                            </button>
                                        </div>
                                        {detailsOpen[action] && (
                                            <ul className={styles.detailList}>
                                                {attempts.map((item, index) => (
                                                    <li key={index}
                                                        className={item.success ? styles.correct : styles.incorrect}>
                                                        Ta réponse : <strong>{item.userInput}</strong> - 
                                                        {item.success ? "Bonne réponse" : "Mauvaise réponse"}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <PieComp successCount={successCount} failureCount={failureCount} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Training;