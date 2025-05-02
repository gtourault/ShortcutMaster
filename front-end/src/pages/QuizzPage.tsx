import React from "react";
import Quizz from "../components/quizz/Quizz";
// Import du module CSS             <h1>Mode Quizz</h1>

const QuizzPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: '#141726' }}>
            <Quizz />
        </div>
    );
};

export default QuizzPage;