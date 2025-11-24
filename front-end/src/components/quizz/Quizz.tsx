import React, { useState, useEffect } from 'react';
import styles from "./Quizz.module.css";
import Button from '../ui/button/Button';
import { MdKeyboardHide } from "react-icons/md";
import PieComp from '../ui/PieCharts/PieComp';
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import { IoIosTimer } from "react-icons/io";
import { LuTarget } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import QuizzSetup from './QuizzSetup';

const Quizz: React.FC = () => {

    const [difficulty, setDifficulty] = useState<string>("");
    const [softwareId, setSoftwareId] = useState<number>();
    const [selectedSystem, setSelectedSystem] = useState<string>("");
    const [selectedSoftware, setSelectedSoftware] = useState<{ id: number; label: string; logo: string; } | null>(null);
    const [shortcuts, setShortcuts] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    //const [mode, setMode] = useState<'Apprentissage' | 'Challenge' | 'Hardcore'>('Apprentissage');
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

    const shuffleArray = (array: string[]) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const generateOptions = () => {
        const currentShortcut = shortcuts[currentIndex];

        if (!currentShortcut) {
            return []; 
        }
        //changement a faire ? supprimé raccourci
        //const correctAnswer = shortcuts[currentIndex].windows;
        const correctAnswer = currentShortcut[selectedSystem as keyof typeof currentShortcut];
        if (!correctAnswer) {
            console.warn("Aucune donnée pour le système sélectionné :", selectedSystem);
            return [];
        }
        const incorrectAnswers = shortcuts
            .filter((_, index) => index !== currentIndex)
            .slice(0, 4)
            .map((raccourci) => raccourci[selectedSystem as keyof typeof raccourci])

        const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers]);
        setOptions(allOptions);
        console.log(allOptions);
    };

    useEffect(() => {
  if (shortcuts.length === 0) return;
  generateOptions();
  setStartTime(Date.now());
}, [currentIndex, shortcuts]);

const restartQuizz = async () => {
    setHasStarted(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setIsCorrect(null);
    setIsFinished(false);
    setHistory([]);
    setStartTime(null);
};
    const handleAnswer = (selectedAnswer: string) => {
        const currentShortcut = shortcuts[currentIndex];
        //const correctAnswer = currentShortcut.windows;
        const correctAnswer = currentShortcut[selectedSystem as keyof typeof currentShortcut];
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

        if (difficulty === 'Apprentissage') {
            if (isAnswerCorrect) setCurrentIndex(prev => prev + 1);
        } else if (difficulty === 'Challenge') {
            setCurrentIndex(prev => prev + 1);
        } else if (difficulty === 'Hardcore') {
            if (isAnswerCorrect) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setCurrentIndex(prev => prev + 1);
                setIsFinished(true);
            }
        }
    };
    useEffect(() => {
  if (!hasStarted || shortcuts.length === 0) return;
  if (currentIndex >= shortcuts.length) {
    finishQuizz();
  }
}, [currentIndex, shortcuts, hasStarted]);


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
        console.log("Quizz terminé !");
        if (!token) return;
        console.log("Envoi des statistiques...");
            const totalQuestions = shortcuts.length;
            const formattedAnswers = history.map(item => ({
                    question_label: item.action,
                    expected_shortcut: item.correctShortcut,
                    user_input: item.userInput,
                    is_correct: item.success,
                    response_time_ms: item.responseTime ?? 0
                }));
            const payload = {
                type: "quizz",
                difficulty: difficulty,
                software: selectedSoftware?.label,
                system: selectedSystem,
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




const handleStart = async (data: { 
  difficulty: string; 
  software: { id: number; label: string; logo: string;  };
  system: string;
}) => {
  setDifficulty(data.difficulty);
  setSoftwareId(data.software.id);
  setSelectedSystem(data.system);
  const { id, label, logo, } = data.software;
  
  try {
    const res = await fetch(`http://localhost:5000/api/auth/softwares/${id}/shortcuts`);
    const fetchedShortcuts = await res.json();
    setShortcuts(fetchedShortcuts.shortcuts);
    console.log(fetchedShortcuts.shortcuts);
    setHasStarted(true);
    console.log('ici');
    setSelectedSoftware({ id, label, logo, });
  } catch (err) {
    console.error("Erreur lors du chargement des raccourcis :", err);
  }
};

if (!hasStarted) {
    //console.log('ici');
    return <QuizzSetup onStart={handleStart} />;
  }
    return (
        
            <div className={styles.container}>
                <AnimatePresence mode="wait">
                {isFinished ? (
                    <motion.div
                    key="endScreen"
                    className={styles.endScreen}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}
                    >
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
                    </motion.div>
                ) : (
                    <>
                    
                        {!hasStarted ? null : (
                            <motion.div
                                key="quizzScreen"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                >
                            <div className={styles.quizzPage}>
                                <div className={styles.empty}></div>
                                <div className={styles.quizzHeader}>
                                    <h1 className={styles.quizzTitle}>Quizz des raccourcis</h1>
                                    <div className={styles.progressContainer}>
                                    <div className={styles.progress}>
                                        {selectedSoftware && (
                                            <img
                                                className={styles.progressSoftware}
                                                src={selectedSoftware.logo}
                                                alt={selectedSoftware.label}
                                            />
                                            )}
                                        <Feedback isCorrect={isCorrect} />
                                        Question {currentIndex + 1} sur {shortcuts.length}
                                    </div>
                                    <div>Systeme choisi : {selectedSystem}</div>
                                    <div className={styles.progressBarBackground}>
                                        <div
                                        className={styles.progressBarFill}
                                        style={{
                                            width: `${((currentIndex + 1) / shortcuts.length) * 100}%`,
                                        }}
                                        ></div>
                                    </div>
                                    </div>
                                <div className={styles.quizzContainer}>
                                    {shortcuts[currentIndex] && (
                                        <>
                                            <div className={styles.questionContainer}>
                                                <p><MdKeyboardHide />Raccourci clavier</p>
                                                <h2 className={styles.action}>Quel raccourci permet de : {shortcuts[currentIndex].action}</h2>
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
                                        <p className={styles.infosMode}>Difficulté : <strong>{difficulty}</strong></p>
                                        <p className={styles.infosTotal}>Total de raccourcis : <strong>{shortcuts.length}</strong></p>
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
                                                <AnimatePresence initial={false}>
                                                    {detailsOpen[action] && (
                                                        <motion.ul
                                                            className={styles.detailList}
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        >
                                                            {attempts.map((item, index) => (
                                                                <li
                                                                    key={index}
                                                                    className={item.success ? styles.correct : styles.incorrect}
                                                                >
                                                                    Ta réponse : <strong>{item.userInput} - </strong>
                                                                    {item.success ? "Bonne réponse" : "Mauvaise réponse"}
                                                                </li>
                                                            ))}
                                                        </motion.ul>
                                                    )}
                                                </AnimatePresence>
                                            </li>
                                        ))}
                                    </ul>
                                    </div>
                                </div>
                            </div>
                            </motion.div>
                        )}
                    </>
                )}
                </AnimatePresence>
            </div>
        
    );
};

export default Quizz;
