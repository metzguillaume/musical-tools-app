import { useState, useCallback, useEffect } from 'react';

export const useScoreboardLogic = () => {
    const [scores, setScores] = useState(() => {
        try {
            const savedScores = localStorage.getItem('routineScores'); // RENAMED KEY
            return savedScores ? JSON.parse(savedScores) : [];
        } catch (error) {
            console.error("Error reading scores from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('routineScores', JSON.stringify(scores)); // RENAMED KEY
    }, [scores]);

    const saveRoutineResult = useCallback((result) => { // RENAMED FUNCTION
        setScores(prevScores => [result, ...prevScores]);
    }, []);

    const clearScoreboard = useCallback(() => {
        if (window.confirm("Are you sure you want to clear the entire scoreboard? This is irreversible.")) {
            setScores([]);
        }
    }, []);

    const deleteScore = useCallback((scoreId) => {
        if (window.confirm("Are you sure you want to delete this result?")) {
            setScores(prevScores => prevScores.filter(s => s.id !== scoreId));
        }
    }, []);

    return { scores, saveRoutineResult, clearScoreboard, deleteScore }; // RENAMED FUNCTION
};