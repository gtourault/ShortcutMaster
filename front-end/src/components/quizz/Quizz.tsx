import React, { useState, useEffect } from 'react';
import shortcutData from "../../data/vscode.json";
import styles from "./Quizz.module.css";
import Button from '../ui/button/Button';
import { MdKeyboardHide } from "react-icons/md";
import PieComp from '../ui/PieCharts/PieComp';
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import { IoIosTimer } from "react-icons/io";
import { LuTarget } from "react-icons/lu";

import vscodeLogo from "../../assets/vscode.svg";
const quizzName = shortcutData.name;

const logos: Record<string, string> = {
  vscode: vscodeLogo,
};
const Quizz: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const [isLoadingPref, setIsLoadingPref] = useState(true);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [mode, setMode] = useState<'Apprentissage' | 'Challenge' | 'Hardcore'>('Apprentissage');
    const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});

    type FeedbackProps = {
    isCorrect: boolean | null;
    };
    const Feedback = ({ isCorrect }: FeedbackProps) => {
    if (isCorrect === null) return null;

    return (
        <div className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
        {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.'}
        </div>
    );
    };
    const token = localStorage.getItem("token");
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
            return []; 
        }
        const correctAnswer = shortcutData.shortcuts[currentIndex].windows;
        const incorrectAnswers = shortcutData.shortcuts
            .filter((raccourci, index) => index !== currentIndex)
            .slice(0, 4)
            .map((raccourci) => raccourci.windows);

        const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers]);
        setOptions(allOptions);
    };

    useEffect(() => {
        generateOptions();
        setStartTime(Date.now());
    }, [currentIndex]);
const restartQuizz = async () => {
    setHasStarted(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setIsCorrect(null);
    setIsFinished(false);
    setHistory([]);
    setStartTime(null);

    if (token) {
        try {
            const res = await fetch("http://localhost:5000/api/auth/preferences/quizz-intro", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setShowIntro(data.showIntro);
        } catch (err) {
            console.error("Erreur de récupération de la préférence", err);
            setShowIntro(false);
        }
    } else {
        setShowIntro(true);
    }
};
    const handleAnswer = (selectedAnswer: string) => {
        const currentShortcut = shortcutData.shortcuts[currentIndex];
        const correctAnswer = currentShortcut.windows;
        const isAnswerCorrect = selectedAnswer === correctAnswer;
        const responseTime = startTime ? Date.now() - startTime : 0;

        setIsCorrect(isAnswerCorrect);


        setHistory((prevHistory) => [
            ...prevHistory,
            {
                action: currentShortcut.action,
                correctShortcut: correctAnswer,
                userInput: selectedAnswer,
                success: isAnswerCorrect,
                responseTime,
            },
        ]);

        if (isAnswerCorrect) {
            setCorrectCount(prev => prev + 1);
        } else {
            setWrongCount(prev => prev + 1);
        }

        if (mode === 'Apprentissage') {
            if (isAnswerCorrect) setCurrentIndex(prev => prev + 1);
        } else if (mode === 'Challenge') {
            setCurrentIndex(prev => prev + 1);
        } else if (mode === 'Hardcore') {
            if (isAnswerCorrect) {
                setCurrentIndex(prev => prev + 1);
            } else {
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

    const finishQuizz = async () => {
        setIsFinished(true);
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
                type: "quizz",
                difficulty: mode,
                software: quizzName,
                system: "windows",
                total_questions: totalQuestions,
                total_correct: correctCount,
                total_wrong: wrongCount,
                average_time_ms: 4200,
                answers: formattedAnswers
            };
        try {

            const response = await fetch("http://localhost:5000/api/auth/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload,),
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

    if (isLoadingPref) return <p>Chargement...</p>;
    return (
        
            <div className={styles.container}>
                {isFinished ? (
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
                            <Button onClick={restartQuizz}>Rejouer</Button>
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
                                                                {item.success ? "Bonne réponse" : "Mauvaise réponse"} - 
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
                ) : (
                    <>
                        {!hasStarted ? (
                            <div className={styles.introContainer}>
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
                                        onChange={(e) => setMode(e.target.value as 'Apprentissage' | 'Challenge' | 'Hardcore')}
                                    >
                                        <option value="Apprentissage">Mode Apprentissage🎓</option>
                                        <option value="Challenge">Mode Challenge    ⚔️ </option>
                                        <option value="Hardcore">Mode Hardcore      💀</option>
                                    </select>
                                </div>
                                <div className={styles.buttonContainer}><Button onClick={() => setHasStarted(true)}>Commencer</Button>
                                    {showIntro && <Button onClick={handleHideIntro}>Ne plus afficher les règles</Button>}</div>
                            </div>
                        ) : (
                            <>
                            <div className={styles.quizzPage}>
                                <div className={styles.empty}></div>
                                <div className={styles.quizzHeader}>
                                    <h1 className={styles.quizzTitle}>Quizz des raccourcis</h1>
                                    <div className={styles.progressContainer}>
                                    <p className={styles.progress}>
                                        <img className={styles.progressSoftware} src={logos[shortcutData.name]} alt={shortcutData.label} />
                                        <Feedback isCorrect={isCorrect} />
                                        Question {currentIndex + 1} sur {shortcutData.shortcuts.length}
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
                                <div className={styles.quizzContainer}>
                                    {shortcutData.shortcuts[currentIndex] && (
                                        <>
                                            <div className={styles.questionContainer}>
                                                <p><MdKeyboardHide />Raccourci clavier</p>
                                                <h2 className={styles.action}>Quel raccourci permet de : {shortcutData.shortcuts[currentIndex].action}</h2>
                                            <div className={styles.buttons}>
                                                {options.map((option, index) => {
                                                    const label = String.fromCharCode(65 + index); // A, B, C, D...
                                                    return (
                                                        <button className={styles.answerButtons} key={index} onClick={() => handleAnswer(option)}>
                                                            <span className={styles.optionLabel}>{label}</span> {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            </div>
                                        </>
                                    )}

                                </div>
                                </div>
                                <div className={styles.historySection}>
                                    <div className={styles.sessionInfosCard}>
                                        <p className={styles.infosTitle}>Informations sur la session en cours : </p>
                                        <p className={styles.infosMode}>Difficulté : <strong>{mode}</strong></p>
                                        <p className={styles.infosTotal}>Total de raccourcis : <strong>{shortcutData.shortcuts.length}</strong></p>
                                        <p className={styles.infosScore}>Score : <strong>{correctCount} bonnes</strong> / <strong>{wrongCount} mauvaises</strong></p>
                                        <div className={styles.buttonsContainer}>
                                            <Button onClick={finishQuizz}>Terminer</Button>
                                            <Button onClick={restartQuizz}>Rejouer</Button>
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
                            </div>
                            </>
                          
                        )}
                        
                    </>
                )}
            </div>
        
    );
};

export default Quizz;
