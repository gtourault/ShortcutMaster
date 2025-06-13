import React, { useState, useEffect } from "react";
import styles from "./Training.module.css";
import shortcutData from "../../data/vscode.json";
import Button from "../ui/button/Button";
const quizzName = shortcutData.name;
import PieComp from '../ui/PieCharts/PieComp';
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import { IoIosTimer } from "react-icons/io";
import { LuTarget } from "react-icons/lu";
import { shuffle } from "gsap";

type GameMode = "Apprentissage" | "Challenge" | "Hardcore";
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};
import vscodeLogo from "../../assets/vscode.svg";
const logos: Record<string, string> = {
  vscode: vscodeLogo,
};

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
    const [shuffledShortcuts, setShuffledShortcuts] = useState(() => shuffleArray(shortcutData.shortcuts));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentShortcut, setCurrentShortcut] = useState(shuffledShortcuts[0]);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});

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
const groupedHistory = history.reduce((acc, item) => {
        if (!acc[item.action]) acc[item.action] = [];
        acc[item.action].push(item);
        return acc;
    }, {} as Record<string, typeof history>);

    const toggleDetails = (action: string) => {
        setDetailsOpen(prev => ({
            ...prev,
            [action]: !prev[action],
        }));
    };

        useEffect(() => {
  if (history.length === 0) return;

  // On part de la fin et on récupère les deux dernières actions uniques
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

    const successCount = history.filter(item => item.success).length;
    const failureCount = history.length - successCount;

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMode(e.target.value as GameMode);
        resetInput();
        setHistory([]);
        setGameOver(false);
        //nextShortcut(); // Recharge un raccourci
    };

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
    const dangerousShortcuts = [
    ['ctrl', 'w'],
    ['ctrl', 'r'],
    ['ctrl', 'n'],
    ['meta', 'w'],
    ['meta', 'r'],
    ['meta', 'q']
    ];
    const isDangerousShortcut = (keys: string[]): boolean => {
    const normalized = keys.map(k => k.toLowerCase());
    const set = new Set(normalized);

    return dangerousShortcuts.some((dangerCombo) =>
        dangerCombo.every(key => set.has(key))
    );
    };
    const nextShortcut = () => {
        const nextIndex = currentIndex + 1;
        console.log(shuffledShortcuts.length, nextIndex);
        if (nextIndex < shuffledShortcuts.length) {
            setCurrentIndex(nextIndex);
            setCurrentShortcut(shuffledShortcuts[nextIndex]);
            setPressedKeys([]);
            setStartTime(Date.now());
        } else {
            setGameOver(true); // Fin de la session
        }
    };

    const resetInput = () => {
        setPressedKeys([]);
        setStartTime(Date.now());
    };

    const skipShortcut = () => {
        setHistory((prev) => [
            ...prev,
            {
                action: currentShortcut.action,
                correctShortcut: currentShortcut.windows,
                userInput: "-",
                success: false,
                skipped: true,
            },
        ]);
        nextShortcut();
        setWrongCount(prev => prev + 1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (gameOver) return;
        event.preventDefault();

        const key = event.key.toLowerCase();
        if (!pressedKeys.includes(key)) {
            setPressedKeys((prev) => [...prev, key]);
        }
    };


    const restartTraining = () => {
        const newShuffled = shuffleArray(shortcutData.shortcuts);
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
        finishTraining(); // Remet l’écran d’intro
    };
    useEffect(() => {
        const expectedKeys = currentShortcut?.windows
            ? currentShortcut.windows.toLowerCase().split(" + ").map(normalizeKey).sort()
            : [];

        const userKeys = [...pressedKeys].map(normalizeKey).sort();

        const isCorrect = JSON.stringify(userKeys) === JSON.stringify(expectedKeys);
        const responseTime = startTime ? Date.now() - startTime : undefined;

        if (userKeys.length >= expectedKeys.length) {
            // Ajout à l'historique
            setHistory((prev) => [
                ...prev,
                {
                    action: currentShortcut.action,
                    correctShortcut: currentShortcut.windows,
                    userInput: userKeys.join(" + "),
                    success: isCorrect,
                    responseTime: (mode !== "Apprentissage" && !isNaN(responseTime!)) ? responseTime : undefined,
                },
            ]);

            if (mode === "Apprentissage") {
                if (isCorrect) {
                    setIsCorrect(true);
                    setCorrectCount(prev => prev + 1);
                    setTimeout(() => {
                        nextShortcut();
                        setIsCorrect(null); // reset feedback
                    }, 1000);
                } else {
                    setIsCorrect(false);
                    setWrongCount(prev => prev + 1);
                    setTimeout(() => {
                        setPressedKeys([]);
                        setIsCorrect(null); // reset feedback
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
    }, [pressedKeys, currentShortcut]);

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
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pressedKeys, gameOver]);

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

    useEffect(() => {
  if (!currentShortcut) return;

  const shortcutKeys = currentShortcut.windows
    .toLowerCase()
    .split(' + ')
    .map(k => k.trim());

  if (isDangerousShortcut(shortcutKeys)) {
    setShowWarning(true);
  } else {
    setShowWarning(false);
  }
}, [currentShortcut]);

    const finishTraining = async () => {
    if (!token) return;

    const totalQuestions = shortcutData.shortcuts.length;
    

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
        software: quizzName,
        system: "windows", // Idem, à ajuster selon l'OS si besoin
        total_questions: totalQuestions,
        total_correct: correctCount,
        total_wrong: wrongCount,
        average_time_ms: 4200,
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





    if (isLoadingPref) return <p>Chargement...</p>;
    return (
        <div className={styles.trainingPage}>

            {!hasStarted ? (
                
                <div className={styles.introContainer}>
                    {showIntro && (
                        <div className={styles.rules}>
                            <h1 className={styles.title}>Bienvenue dans l'entraînement</h1>
                            <p>Voici comment ça fonctionne :</p>
                            <ul className={styles.rulesList}>
                                <li>🎮 Choisis un mode de jeu avant de commencer.</li>
                                <li>🧠 Une action s'affiche, tu dois taper le raccourci clavier correspondant.</li>
                                <li>⏱️ Le temps est mesuré dans certains modes.</li>
                                <li>💀 En mode Hardcore, une seule erreur met fin à la session.</li>
                            </ul>
                        </div>
                    )}
                    <div className={styles.modeSelector}>

                        <label htmlFor="mode-select">Choisissez un mode :</label>

                        <select
                            id="mode-select"
                            value={mode}
                            onChange={handleModeChange}>
                            <option value="Apprentissage">Mode Apprentissage</option>
                            <option value="Challenge">Mode Challenge</option>
                            <option value="Hardcore">Mode Hardcore</option>
                        </select>
                    </div>
                    <div className={styles.buttonContainer}>
                        <Button onClick={() => setHasStarted(true)}>Commencer</Button>
                        {showIntro && <Button onClick={handleHideIntro}>Ne plus afficher les règles</Button>}
                    </div>
                </div>
            ) : (
                <>
        <div className={styles.empty}></div>

                    {!gameOver ? (
                        <>
                            <div className={styles.trainingContainer}>
                                <h2 className={styles.quizzTitle}>Mode Entraînement</h2>
                            <div className={styles.progressContainer}>
                                    <p className={styles.progress}>
                                        <img className={styles.progressSoftware} src={logos[shortcutData.name]} alt={shortcutData.label} />
                                        Raccourci {currentIndex + 1} sur {shortcutData.shortcuts.length}
                                    </p>
                                    <div className={styles.progressBarBackground}>
                                        <div
                                        className={styles.progressBarFill}
                                        style={{
                                            width: `${((currentIndex + 1) / shortcutData.shortcuts.length) * 100}%`,
                                    }}
                                    ></div>
                                </div>
                            </div>
                            {showWarning && (
                            <div className={styles.shortcutWarning}>
                                Attention : ce raccourci peut provoquer une action du navigateur (fermeture, rechargement...).<br></br>
                                Veuillez taper le raccourci en différé.
                            </div>
                            )}
                            <div className={styles.shortcutContainer}>
                            <p className={styles.instruction}>
                                
                                Tapez le raccourci pour : <strong>{currentShortcut.action}</strong>
                            </p>
                            <div className={styles.inputDisplay}>{pressedKeys.join(" + ")}</div>
                            {isCorrect !== null && (
                            <p className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
                                {isCorrect ? "✅ Bonne réponse !" : "❌ Mauvaise réponse."}
                            </p>
                            )}
                            <p className={styles.solution}>
                                💡 Solution : <strong>{currentShortcut.windows}</strong>
                                <Button onClick={resetInput}>Reset</Button>
                                <Button onClick={skipShortcut}>Passer</Button>
                            </p>
                            </div>
                            </div>
                            <div className={styles.historySection}>
                                    <div className={styles.sessionInfosCard}>
                                        <p className={styles.infosTitle}>Informations sur la session en cours : </p>
                                        <p className={styles.infosMode}>Difficulté : <strong>{mode}</strong></p>
                                        <p className={styles.infosTotal}>Total de raccourcis : <strong>{shortcutData.shortcuts.length}</strong></p>
                                        <p className={styles.infosScore}>Score : <strong>{correctCount} bonnes</strong> / <strong>{wrongCount} mauvaises</strong></p>
                                                                    <Button onClick={restartTraining}>Recommencer</Button>
                                                                    <Button onClick={finishTraining}>Terminer</Button>
                                                                    

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
                                                                Ta réponse : <strong>{item.userInput} - </strong> 
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
                        </>
                    ) : (
                        <div className={styles.historySection}>
                            <h3>Historique de la session</h3>
                            <p>Score : {correctCount} bonnes réponses</p>
                            <p>Erreurs : {wrongCount} mauvaises réponses</p>
                            <p>Total d’essais : {correctCount + wrongCount}</p>
                            <ul className={styles.historyList}>
                                {history.map((entry, index) => (
                                    <li key={index} className={entry.success ? styles.correct : styles.incorrect}>
                                        {entry.skipped ? (
                                            <>
                                                <strong>{entry.action}</strong> — Raccourci sauté
                                            </>
                                        ) : (
                                            <>
                                                {entry.success ? styles.correct : styles.incorrect} <strong>{entry.action}</strong> —
                                                Correct : <code>{entry.correctShortcut}</code> —
                                                <span>Input : <code>{entry.userInput}</code></span>
                                                {entry.responseTime !== undefined && (
                                                    <> — <em>{entry.responseTime}ms</em></>
                                                )}
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <Button onClick={restartTraining}>Recommencer</Button>
                        </div>
                    )}


                </>
            )}
        </div>
    );
};

export default Training;
