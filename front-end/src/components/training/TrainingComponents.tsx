import React, { useState, useEffect } from "react";
import styles from "./Training.module.css";
import shortcutData from "../../data/vscode.json"; // Importe les raccourcis depuis le JSON
//console.log(shortcutData.shortcuts); // Vérifie le contenu du JSON
import Button from "../ui/button/Button"; // Importe le composant Button
const Training: React.FC = () => {
    const [currentShortcut, setCurrentShortcut] = useState(shortcutData.shortcuts[0]);
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);
    const [feedback, setFeedback] = useState("");
    const [history, setHistory] = useState<
        { action: string; correctShortcut: string; userInput: string; success: boolean; skipped?: boolean }[]
    >([]);

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
    };
    // Fonction pour passer au raccourci suivant
    const nextShortcut = () => {
        setPressedKeys([]);
        setFeedback("");
        const nextIndex = Math.floor(Math.random() * shortcutData.shortcuts.length);
        setCurrentShortcut(shortcutData.shortcuts[nextIndex]);
    };

    // Gestion de l'événement clavier
    const handleKeyDown = (event: KeyboardEvent) => {
        event.preventDefault(); // Empêche le comportement par défaut des raccourcis

        const key = event.key.toLowerCase();
        if (!pressedKeys.includes(key)) {
            setPressedKeys((prev) => [...prev, key]);
        }
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

        return keyMap[key.toLowerCase()] || key.toLowerCase(); // Normalisation en minuscule
    };
    useEffect(() => {
        const expectedKeys = currentShortcut?.windows
            ? currentShortcut.windows.toLowerCase().split(" + ").map(normalizeKey).sort()
            : [];

        const userKeys = [...pressedKeys].map(normalizeKey).sort();

        if (userKeys.length >= expectedKeys.length) {
            const isCorrect = JSON.stringify(userKeys) === JSON.stringify(expectedKeys);

            setHistory((prev) => [
                ...prev,
                {
                    action: currentShortcut.action,
                    correctShortcut: currentShortcut.windows,
                    userInput: userKeys.join(" + "),
                    success: isCorrect,
                },
            ]);

            if (isCorrect) {
                setFeedback("✅ Correct !");
                setTimeout(nextShortcut, 1000);
            } else {
                setFeedback("❌ Incorrect. Réessaie !");
                setTimeout(() => {
                    setPressedKeys([]);
                    setFeedback("");
                }, 1000);
            }
        }
    }, [pressedKeys, currentShortcut]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pressedKeys]);
    const resetInput = () => {
        setPressedKeys([]);
        setFeedback("");
    };

    return (
        <div className={styles.trainingContainer}>
            <h2 className={styles.title}>Mode Entraînement</h2>
            <p className={styles.instruction}>
                Tapez le raccourci pour : <strong>{currentShortcut.action}</strong>
            </p>

            <div className={styles.inputDisplay}>{pressedKeys.join(" + ")}</div>

            <p className={styles.feedback}>{feedback}</p>
            <p className={styles.solution}>
                💡 Solution : <strong>{currentShortcut.windows}</strong>
                <Button onClick={resetInput}>
                    🔁
                </Button>
                <Button onClick={skipShortcut}>⏭ Passer</Button>
            </p>

            <div className={styles.historySection}>
                <h3>🕓 Historique de la session</h3>
                <ul className={styles.historyList}>
                    {history.map((entry, index) => (
                        <li key={index} className={entry.success ? styles.success : styles.error}>
                            {entry.skipped ? (
                                <>
                                    ⏭ <strong>{entry.action}</strong> — Raccourci sauté
                                </>
                            ) : (
                                <>
                                    {entry.success ? "✅" : "❌"} <strong>{entry.action}</strong> —
                                    Correct : <code>{entry.correctShortcut}</code> —
                                    <span>Input : <code>{entry.userInput}</code></span>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Training;

