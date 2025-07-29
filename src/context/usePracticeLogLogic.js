import { useState, useCallback, useEffect } from 'react';

export const usePracticeLogLogic = () => {
    const [practiceLog, setPracticeLog] = useState(() => {
        try {
            const savedLog = localStorage.getItem('practiceLog');
            return savedLog ? JSON.parse(savedLog) : [];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('practiceLog', JSON.stringify(practiceLog));
    }, [practiceLog]);

    const addLogEntry = useCallback((entry) => {
        setPracticeLog(prevLog => [...prevLog, entry]);
    }, []);

    const clearLog = useCallback(() => {
        if (window.confirm("Are you sure you want to clear the entire practice log? This action cannot be undone.")) {
            setPracticeLog([]);
        }
    }, []);
    
    const importLog = useCallback((file) => {
        if (!file) return;
        if (!window.confirm("Are you sure you want to import a new log? This will overwrite your current practice log.")) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    if (data.length > 0 && (data[0].game === undefined || data[0].date === undefined || data[0].remarks === undefined)) {
                        alert("Import failed: The JSON file has an invalid format.");
                        return;
                    }
                    setPracticeLog(data);
                    alert("Practice log imported successfully!");
                } else {
                    alert("Import failed: The JSON file does not contain a valid log array.");
                }
            } catch (error) {
                console.error("Failed to parse log file:", error);
                alert("Import failed: Not a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }, []);

    return { practiceLog, addLogEntry, clearLog, importLog };
};