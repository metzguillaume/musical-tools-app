import { useState, useCallback, useEffect } from 'react';

export const useScoreboardLogic = () => {
    const [scores, setScores] = useState(() => {
        try {
            const savedScores = localStorage.getItem('challengeScores');
            return savedScores ? JSON.parse(savedScores) : [];
        } catch (error) {
            console.error("Error reading scores from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('challengeScores', JSON.stringify(scores));
    }, [scores]);

    const saveChallengeResult = useCallback((result) => {
        setScores(prevScores => [result, ...prevScores]); // Add new result to the top
    }, []);

    const clearScoreboard = useCallback(() => {
        if (window.confirm("Are you sure you want to clear the entire scoreboard? This is irreversible.")) {
            setScores([]);
        }
    }, []);

    return { scores, saveChallengeResult, clearScoreboard };
};