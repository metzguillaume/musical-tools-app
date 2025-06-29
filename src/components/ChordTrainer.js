import React, { useState } from 'react';
// MINOR_KEY_FEATURE: The useTools context is used for logging sessions, which can be re-enabled later.
// import { useTools } from '../context/ToolsContext';

// --- Core Data and Logic ---
const getChordData = (/* MINOR_KEY_FEATURE: minorType = 'natural', useMajorV = true */) => {
    const majorData = {
        'C': { chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'G': { chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'D': { chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'A': { chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'E': { chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'B': { chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'F#': { chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'Gb': { chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'Db': { chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'Ab': { chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'Eb': { chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'Bb': { chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
        'F': { chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    };
    
    // MINOR_KEY_FEATURE: All data and logic for minor keys are commented out below.
    /*
    let naturalMinorData = {
        'Am': { chords: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Em': { chords: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Bm': { chords: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'F#m': { chords: ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'C#m': { chords: ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'G#m': { chords: ['G#m', 'A#dim', 'B', 'C#m', 'D#m', 'E', 'F#'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'D#m': { chords: ['D#m', 'E#dim', 'F#', 'G#m', 'A#m', 'B', 'C#'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Bbm': { chords: ['Bbm', 'Cdim', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Fm': { chords: ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Cm': { chords: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Gm': { chords: ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
        'Dm': { chords: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'natural minor' },
    };

    const harmonicMinorData = {
        'Am': { chords: ['Am', 'Bdim', 'C+', 'Dm', 'E', 'F', 'G#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Em': { chords: ['Em', 'F#dim', 'G+', 'Am', 'B', 'C', 'D#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Bm': { chords: ['Bm', 'C#dim', 'D+', 'Em', 'F#', 'G', 'A#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'F#m': { chords: ['F#m', 'G#dim', 'A+', 'Bm', 'C#', 'D', 'E#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'C#m': { chords: ['C#m', 'D#dim', 'E+', 'F#m', 'G#', 'A', 'B#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'G#m': { chords: ['G#m', 'A#dim', 'B+', 'C#m', 'D#', 'E', 'F##dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'D#m': { chords: ['D#m', 'E#dim', 'F#+', 'G#m', 'A#', 'B', 'C##dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Bbm': { chords: ['Bbm', 'Cdim', 'Db+', 'Ebm', 'F', 'Gb', 'Adim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Fm': { chords: ['Fm', 'Gdim', 'Ab+', 'Bbm', 'C', 'Db', 'Edim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Cm': { chords: ['Cm', 'Ddim', 'Eb+', 'Fm', 'G', 'Ab', 'Bdim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Gm': { chords: ['Gm', 'Adim', 'Bb+', 'Cm', 'D', 'Eb', 'F#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
        'Dm': { chords: ['Dm', 'Edim', 'F+', 'Gm', 'A', 'Bb', 'C#dim'], numerals: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'], type: 'harmonic minor' },
    };

    const melodicMinorData = {
        'Am': { chords: ['Am', 'Bm', 'C+', 'D', 'E', 'F#dim', 'G#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Em': { chords: ['Em', 'F#m', 'G+', 'A', 'B', 'C#dim', 'D#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Bm': { chords: ['Bm', 'C#m', 'D+', 'E', 'F#', 'G#dim', 'A#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'F#m': { chords: ['F#m', 'G#m', 'A+', 'B', 'C#', 'D#dim', 'E#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'C#m': { chords: ['C#m', 'D#m', 'E+', 'F#', 'G#', 'A#dim', 'B#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'G#m': { chords: ['G#m', 'A#m', 'B+', 'C#', 'D#', 'E#dim', 'F##dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'D#m': { chords: ['D#m', 'E#m', 'F#+', 'G#', 'A#', 'B#dim', 'C##dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Bbm': { chords: ['Bbm', 'Cm', 'Db+', 'Eb', 'F', 'Gdim', 'Adim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Fm': { chords: ['Fm', 'Gm', 'Ab+', 'Bb', 'C', 'Ddim', 'Edim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Cm': { chords: ['Cm', 'Dm', 'Eb+', 'F', 'G', 'Adim', 'Bdim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Gm': { chords: ['Gm', 'Am', 'Bb+', 'C', 'D', 'Edim', 'F#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
        'Dm': { chords: ['Dm', 'Em', 'F+', 'G', 'A', 'Bdim', 'C#dim'], numerals: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'], type: 'melodic minor' },
    };
    
    if (minorType === 'natural' && useMajorV) {
        for (const key in naturalMinorData) {
            const v_index = 4;
            naturalMinorData[key].numerals[v_index] = 'V';
            naturalMinorData[key].chords[v_index] = harmonicMinorData[key].chords[v_index];
            naturalMinorData[key].type = 'natural minor (Major V)';
        }
    }

    let minorData;
    if (minorType === 'harmonic') {
        minorData = harmonicMinorData;
    } else if (minorType === 'melodic') {
        minorData = melodicMinorData;
    } else {
        minorData = naturalMinorData;
    }
    
    return { ...majorData, ...minorData };
    */
    return { ...majorData };
};

const reminders = {
    1: { 
        "major": "e.g., G, Am, Bdim",
        // MINOR_KEY_FEATURE: Minor key reminders commented out.
        // "natural minor": "e.g., C, Dm, Bdim",
        // "harmonic minor": "e.g., E, F, C+",
        // "melodic minor": "e.g., D, E, C+",
        // "natural minor (Major V)": "e.g., E, F, Bdim"
    },
    2: {
        "major": "e.g., C G Am Edim",
        // MINOR_KEY_FEATURE: Minor key reminders commented out.
        // "natural minor": "e.g., Am F G Bdim",
        // "harmonic minor": "e.g., Am Dm E G#dim",
        // "melodic minor": "e.g., Am D E F#dim",
        // "natural minor (Major V)": "e.g., Am Dm E Bdim"
    },
    3: {
        "major": "e.g., G D Em Bdim",
        // MINOR_KEY_FEATURE: Minor key reminders commented out.
        // "natural minor": "e.g., Em C D F#dim",
        // "harmonic minor": "e.g., Bm Em F# A#dim",
        // "melodic minor": "e.g., Bm E F# G#dim",
        // "natural minor (Major V)": "e.g., Bm Em F# G"
    },
    4: {
        "major": "e.g., I V vi vii°",
        // MINOR_KEY_FEATURE: Minor key reminders commented out.
        // "natural minor": "e.g., i v VI ii°",
        // "harmonic minor": "e.g., i V VI III+",
        // "melodic minor": "e.g., i IV V vi°",
        // "natural minor (Major V)": "e.g., i V VI ii°"
    }
};

const keysInFifthsOrder = [
    ['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'], ['E', 'C#m'], ['B', 'G#m'],
    ['F#', 'D#m'], ['Db', 'Bbm'], ['Ab', 'Fm'], ['Eb', 'Cm'], ['Bb', 'Gm'], ['F', 'Dm']
];
// MINOR_KEY_FEATURE: Enharmonic minor key 'Ebm' commented out.
const extraEnharmonicKeys = ['Gb' /*, 'Ebm' */];
const scaleDegreeNames = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
const majorDefaultWeights = [10, 6, 4, 8, 10, 8, 2];
// MINOR_KEY_FEATURE: Default weights for minor keys commented out.
// const minorDefaultWeights = [10, 3, 7, 8, 10, 8, 2];

const shuffle = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

function generateQuestions(selectedKeys, modes, numQuestions, majorWeights, minorWeights, chordData) {
    let allQuestions = [];
    const modesToGen = modes;

    for (const key of selectedKeys) {
        const keyData = chordData[key];
        if (!keyData) continue;
        
        // MINOR_KEY_FEATURE: Logic to switch between major/minor weights is simplified to always use major.
        const currentWeights = majorWeights; // keyData.type === 'major' ? majorWeights : minorWeights;
        const weightedPool = [];
        currentWeights.forEach((weight, index) => {
            for (let i = 0; i < weight; i++) {
                weightedPool.push(index);
            }
        });
        
        if (modesToGen.includes(1) || modesToGen.includes(4)) {
            for (let i = 0; i < keyData.chords.length; i++) {
                if (modesToGen.includes(1)) allQuestions.push({ mode: 1, key: key, prompt: `In **${key}**, what is the **${keyData.numerals[i]}** chord?`, answer: keyData.chords[i] });
                if (modesToGen.includes(4)) allQuestions.push({ mode: 4, key: key, prompt: `In **${key}**, what is the numeral for **${keyData.chords[i]}**?`, answer: keyData.numerals[i] });
            }
        }
        
        if (modesToGen.includes(2)) {
            for (let i = 0; i < 5; i++) {
                const p = shuffle(weightedPool).slice(0, 4);
                const numeralProg = p.map(idx => keyData.numerals[idx]).join(' ');
                const chordProg = p.map(idx => keyData.chords[idx]).join(' ');
                allQuestions.push({ mode: 2, key: key, prompt: `In **${key}**, what are the chords for **${numeralProg}**?`, answer: chordProg });
            }
        }

        if (modesToGen.includes(3) && selectedKeys.length > 1) {
            const otherKeys = selectedKeys.filter(k => k !== key);
            if (otherKeys.length > 0) {
                for (let i = 0; i < 3; i++) {
                    const keyFrom = key;
                    const keyTo = otherKeys[Math.floor(Math.random() * otherKeys.length)];
                    const keyFromData = chordData[keyFrom];
                    const keyToData = chordData[keyTo];

                    if (!keyFromData || !keyToData) continue;

                    const p = shuffle(weightedPool).slice(0, 4);
                    const chordProgFrom = p.map(idx => keyFromData.chords[idx]).join(' ');
                    const chordProgTo = p.map(idx => keyToData.chords[idx]).join(' ');
                    allQuestions.push({ mode: 3, key: keyTo, prompt: `Transpose the progression **'${chordProgFrom}'** from **${keyFrom}** to the key of **${keyTo}**.`, answer: chordProgTo });
                }
            }
        }
    }
    
    return shuffle(allQuestions).slice(0, numQuestions);
}

const KeyCheckbox = React.memo(({ angle, radius, keyName, selected, onChange }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
    };
    return (
        <div style={style}>
            <label className={`block p-2 rounded-md text-center cursor-pointer min-w-[50px] ${selected ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                <input type="checkbox" checked={selected} onChange={() => onChange(keyName)} className="sr-only" />
                {keyName}
            </label>
        </div>
    );
});

const SetupScreen = React.memo(({
    selectedKeys, handleKeySelection,
    selectedModes, handleModeSelection,
    numQuestions, setNumQuestions,
    showAdvanced, setShowAdvanced,
    // MINOR_KEY_FEATURE: Props for minor key settings commented out.
    // minorType, setMinorType,
    // useMajorVInNaturalMinor, setUseMajorVInNaturalMinor,
    majorWeights, setMajorWeights,
    // minorWeights, setMinorWeights,
    // activeWeightTab, setActiveWeightTab,
    handleStartQuiz, handleWeightChange
}) => (
    <div className="w-full">
        <h2 className="text-3xl font-extrabold mb-6 text-indigo-300 text-center">Chord Trainer Setup</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-700 p-4 rounded-lg flex flex-col items-center">
                 <h3 className="text-xl font-bold text-teal-300 mb-4 text-center">Select Keys</h3>
                 <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] mx-auto mb-4">
                    {keysInFifthsOrder.map(([majorKey, minorKey], index) => {
                        const angle = index * (360 / 12) - 90;
                        const radiusMajor = window.innerWidth < 640 ? 120 : 150;
                        // MINOR_KEY_FEATURE: Radius for minor key circle commented out.
                        // const radiusMinor = window.innerWidth < 640 ? 80 : 105;
                        return (
                            <React.Fragment key={majorKey}>
                                <KeyCheckbox angle={angle} radius={radiusMajor} keyName={majorKey} selected={!!selectedKeys[majorKey]} onChange={handleKeySelection} />
                                {/* MINOR_KEY_FEATURE: KeyCheckbox for minor keys commented out. */}
                                {/* <KeyCheckbox angle={angle} radius={radiusMinor} keyName={minorKey} selected={!!selectedKeys[minorKey]} onChange={handleKeySelection} /> */}
                            </React.Fragment>
                        )
                    })}
                 </div>
                 <div className="border-t border-slate-600 pt-3 text-center mt-2">
                     <h4 className="font-semibold text-lg text-gray-400 mb-2">Enharmonic Keys</h4>
                     <div className="flex justify-center gap-4">
                        {extraEnharmonicKeys.map(keyName => (
                             <label key={keyName} className={`block p-2 rounded-md text-center cursor-pointer min-w-[50px] ${selectedKeys[keyName] ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                <input type="checkbox" checked={!!selectedKeys[keyName]} onChange={() => handleKeySelection(keyName)} className="sr-only" />
                                {keyName}
                            </label>
                        ))}
                     </div>
                 </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg flex flex-col">
                 <h3 className="text-xl font-bold text-teal-300 mb-4">Game Modes</h3>
                 <div className="space-y-2">
                    {[
                        {id: 1, label: "Name the Chord (from numeral)"},
                        {id: 4, label: "Name the Numeral (from chord)"},
                        {id: 2, label: "Name Chord Progression"},
                        {id: 3, label: "Transpose Progression"},
                    ].map(mode => (
                         <label key={mode.id} className={`block p-3 rounded-md cursor-pointer ${selectedModes[mode.id] ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                            <input type="checkbox" checked={!!selectedModes[mode.id]} onChange={() => handleModeSelection(mode.id)} className="mr-3" />
                            {mode.label}
                        </label>
                    ))}
                 </div>
                 <div className="flex gap-2 mt-3">
                    <button onClick={() => handleModeSelection(null, true, false)} className="text-sm bg-slate-600 hover:bg-slate-500 p-2 rounded-md flex-1">Select All</button>
                    <button onClick={() => handleModeSelection(null, false, true)} className="text-sm bg-slate-600 hover:bg-slate-500 p-2 rounded-md flex-1">Deselect All</button>
                 </div>
                <div className="border-t border-slate-600 my-4"></div>
                <h3 className="text-xl font-bold text-teal-300 mb-2">Quiz Length</h3>
                <div className="flex items-center gap-4">
                    <label htmlFor="num-questions" className="font-semibold">Questions:</label>
                    <input type="number" id="num-questions" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))} 
                           className="w-20 p-2 rounded-md bg-slate-600 text-white text-center" min="1" max="100" />
                </div>
                <div className="border-t border-slate-600 my-4"></div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-left text-teal-300 font-bold text-lg hover:text-teal-200 w-full">
                    {showAdvanced ? '▼' : '►'} Advanced Settings
                </button>
                {showAdvanced && (
                    <div className="mt-2 p-3 bg-slate-800/50 rounded-lg space-y-4">
                        {/* MINOR_KEY_FEATURE: Entire section for Minor Scale Options is commented out. */}
                        {/*
                        <div>
                            <h4 className="font-semibold text-lg text-gray-300 mb-2">Minor Scale Options</h4>
                            <div className="flex justify-around bg-slate-700 p-1 rounded-lg">
                                {['natural', 'harmonic', 'melodic'].map(type => (
                                    <label key={type} className={`flex-1 py-1 text-center rounded-md cursor-pointer text-sm capitalize ${minorType === type ? 'bg-blue-600 text-white' : 'hover:bg-slate-600'}`}>
                                        <input type="radio" name="minorType" value={type} checked={minorType === type} onChange={(e) => setMinorType(e.target.value)} className="sr-only"/>
                                        {type}
                                    </label>
                                ))}
                            </div>
                            {minorType === 'natural' && (
                                <label className="flex items-center mt-2 p-2 cursor-pointer">
                                    <input type="checkbox" checked={useMajorVInNaturalMinor} onChange={(e) => setUseMajorVInNaturalMinor(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"/>
                                    <span className="text-sm">Use Major V Chord (common practice)</span>
                                </label>
                            )}
                        </div>
                        */}
                        <div>
                            <h4 className="font-semibold text-lg text-gray-300 mb-1">Chord Weights</h4>
                            <p className="text-xs text-gray-400 mb-2">Control how often each chord appears in the quiz. The default weights are set to mimic their frequency in common songs.</p>
                            {/* MINOR_KEY_FEATURE: Tabs for switching between major/minor weights are commented out. The UI now only shows Major Key weights. */}
                            {/*
                            <div className="flex mb-2 border-b border-slate-600">
                                <button onClick={() => setActiveWeightTab('major')} className={`flex-1 py-1 text-center text-sm rounded-t-md ${activeWeightTab === 'major' ? 'bg-slate-700 text-teal-300' : 'bg-transparent text-gray-400'}`}>Major Keys</button>
                                <button onClick={() => setActiveWeightTab('minor')} className={`flex-1 py-1 text-center text-sm rounded-t-md ${activeWeightTab === 'minor' ? 'bg-slate-700 text-teal-300' : 'bg-transparent text-gray-400'}`}>Minor Keys</button>
                            </div>
                            */}
                            <div className="py-1 text-center text-sm rounded-t-md bg-slate-700 text-teal-300">Major Keys</div>
                            {majorWeights.map((weight, index) => (
                                <div key={index} className="flex items-center gap-3 mt-2">
                                    <label className="w-8 font-mono text-right">{scaleDegreeNames[index]}</label>
                                    <input type="range" min="0" max="10" value={weight} onChange={(e) => handleWeightChange(index, e.target.value)} className="flex-1" />
                                    <span className="w-4 text-left">{weight}</span>
                                </div>
                            ))}
                            <button onClick={() => setMajorWeights(majorDefaultWeights)} className="text-sm bg-slate-600 hover:bg-slate-500 p-2 rounded-md w-full mt-2">Reset to Default</button>
                        </div>
                    </div>
                )}
                 <div className="mt-auto pt-4">
                    <button onClick={handleStartQuiz} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-xl">
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    </div>
));

const QuizScreen = React.memo(({
    questions, currentQuestionIndex,
    score, userAnswer, setUserAnswer,
    feedback, autoAdvance, setAutoAdvance,
    handleAnswerSubmit, nextQuestion, handleGoToSetup,
    chordData
}) => {
    const question = questions[currentQuestionIndex];
    const promptParts = question.prompt.split('**');
    
    let reminderText = "";
    const keyType = chordData[question.key]?.type || 'major';
    const modeReminders = reminders[question.mode];

    if (modeReminders) {
        if (typeof modeReminders === 'object') {
            reminderText = modeReminders[keyType];
        } else {
            reminderText = modeReminders;
        }
    } else {
        reminderText = "Enter your answer below."
    }
    
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-between items-center mb-2 text-lg">
                <span>&nbsp;</span>
                <span>Score: {score} / {currentQuestionIndex + 1}</span>
            </div>
            <div className="w-full bg-slate-800 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-2">
                {promptParts.map((part, index) => (
                    <span key={index} className={index % 2 === 1 ? 'text-2xl md:text-3xl font-bold text-teal-300' : 'text-xl md:text-2xl text-gray-200'}>
                        {part}
                    </span>
                ))}
            </div>
            <div className={`text-md my-1 min-h-[40px] flex items-center text-center italic ${feedback ? 'text-transparent' : 'text-gray-400'}`}>{reminderText}</div>
            {feedback && (
                 <div className={`text-xl mb-2 min-h-[28px] flex items-center justify-center ${feedback.startsWith('Correct') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</div>
            )}
            <form onSubmit={handleAnswerSubmit} className="w-full max-w-sm flex flex-col items-center">
                <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full text-center text-xl p-2 md:text-2xl md:p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                    disabled={!!feedback} autoFocus />
                <div className="h-16 mt-3 flex items-center">
                    {!feedback ? (
                         <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">
                            Submit
                        </button>
                    ) : !autoAdvance && (
                        <button type="button" onClick={nextQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">
                            Next Question
                        </button>
                    )}
                </div>
            </form>
            <div className="flex items-center gap-2 p-2 rounded-lg">
                <label htmlFor="auto-advance" className="font-semibold text-sm text-gray-300">Auto-Advance:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="auto-advance" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <button onClick={handleGoToSetup} className="w-full max-w-sm mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                Back to Menu
            </button>
        </div>
    );
});

const ResultsScreen = React.memo(({ score, questions, setScreen, handleLogSession }) => (
    <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-indigo-300">Quiz Complete!</h2>
        <p className="text-2xl text-teal-300 mb-8">Your final score is: {score} / {questions.length}</p>
        <div className="flex justify-center gap-4">
            <button onClick={() => setScreen('setup')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-xl">
                Play Again
            </button>
            {/* MINOR_KEY_FEATURE: The Log Session button is commented out. */}
            {/* <button onClick={handleLogSession} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-xl">
                Log Session
            </button>
            */}
        </div>
    </div>
));


const ChordTrainer = () => {
    // MINOR_KEY_FEATURE: The useTools hook is not needed if logging is disabled.
    // const { addLogEntry } = useTools();
    const [screen, setScreen] = useState('setup');
    const [selectedKeys, setSelectedKeys] = useState({});
    const [selectedModes, setSelectedModes] = useState({ 1: true });
    const [numQuestions, setNumQuestions] = useState(20);
    const [majorWeights, setMajorWeights] = useState(majorDefaultWeights);
    const [showAdvanced, setShowAdvanced] = useState(false);
    // MINOR_KEY_FEATURE: State related to minor keys is commented out.
    // const [minorWeights, setMinorWeights] = useState(minorDefaultWeights);
    // const [minorType, setMinorType] = useState('natural');
    // const [useMajorVInNaturalMinor, setUseMajorVInNaturalMinor] = useState(true);
    // const [activeWeightTab, setActiveWeightTab] = useState('major');
    
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [autoAdvance, setAutoAdvance] = useState(true);

    // MINOR_KEY_FEATURE: Arguments for minor keys are removed from getChordData call.
    const chordData = getChordData();

    const handleKeySelection = (key) => setSelectedKeys(prev => ({ ...prev, [key]: !prev[key] }));
    const handleModeSelection = (modeId, selectAll = false, deselectAll = false) => {
        if (selectAll) {
            setSelectedModes({ 1: true, 2: true, 3: true, 4: true });
        } else if (deselectAll) {
            setSelectedModes({});
        } else {
            setSelectedModes(prev => ({ ...prev, [modeId]: !prev[modeId] }));
        }
    };
    const handleWeightChange = (index, value) => {
        // MINOR_KEY_FEATURE: Logic is simplified to only handle major key weights.
        const newWeights = [...majorWeights];
        newWeights[index] = Number(value);
        setMajorWeights(newWeights);
    };

    const handleStartQuiz = () => {
        const keys = Object.keys(selectedKeys).filter(k => selectedKeys[k]);
        const modes = Object.keys(selectedModes).filter(m => selectedModes[m]).map(Number);
        
        if (keys.length === 0) { alert("Please select at least one key."); return; }
        if (modes.length === 0) { alert("Please select at least one game mode."); return; }
        if (modes.includes(3) && keys.length < 2) { alert("Transpose Progression requires at least two keys to be selected."); return; }

        // MINOR_KEY_FEATURE: The 'minorWeights' argument is removed here. It's passed as null.
        const generatedQuestions = generateQuestions(keys, modes, numQuestions, majorWeights, null, chordData);
        if (generatedQuestions.length === 0) { alert("Could not generate questions with the current settings."); return; }

        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFeedback('');
        setUserAnswer('');
        setScreen('quiz');
    };
    
    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setUserAnswer('');
            setFeedback('');
        } else {
            setScreen('results');
        }
    };
    
    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (feedback) return;
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = userAnswer.trim().replace(/\s+/g, ' ').toLowerCase() === currentQuestion.answer.toLowerCase();

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('Correct!');
        } else {
            setFeedback(`Incorrect. The answer was: ${currentQuestion.answer}`);
        }

        if (autoAdvance) {
            setTimeout(() => {
                nextQuestion();
            }, 1500);
        }
    };

    const handleGoToSetup = () => {
        if (window.confirm("Are you sure you want to go back to the menu? Your current progress will be lost.")) {
            setScreen('setup');
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setScore(0);
        }
    };

    // MINOR_KEY_FEATURE: The session logging functionality is commented out.
    /*
    const handleLogSession = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${questions.length}`);
        if (remarks !== null) {
            addLogEntry({
                game: 'Chord Trainer',
                date: new Date().toLocaleDateString(),
                remarks: remarks || "No remarks."
            });
            alert("Session logged!");
        }
    };
    */
    
    if (screen === 'setup') {
        return <SetupScreen 
            selectedKeys={selectedKeys} handleKeySelection={handleKeySelection}
            selectedModes={selectedModes} handleModeSelection={handleModeSelection}
            numQuestions={numQuestions} setNumQuestions={setNumQuestions}
            showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
            // MINOR_KEY_FEATURE: Props for minor key settings are not passed.
            // minorType={minorType} setMinorType={setMinorType}
            // useMajorVInNaturalMinor={useMajorVInNaturalMinor} setUseMajorVInNaturalMinor={setUseMajorVInNaturalMinor}
            majorWeights={majorWeights} setMajorWeights={setMajorWeights}
            // minorWeights={minorWeights} setMinorWeights={setMinorWeights}
            // activeWeightTab={activeWeightTab} setActiveWeightTab={setActiveWeightTab}
            handleStartQuiz={handleStartQuiz}
            handleWeightChange={handleWeightChange}
        />;
    }
    if (screen === 'quiz') {
        return <QuizScreen 
            questions={questions} currentQuestionIndex={currentQuestionIndex}
            score={score} userAnswer={userAnswer} setUserAnswer={setUserAnswer}
            feedback={feedback} autoAdvance={autoAdvance} setAutoAdvance={setAutoAdvance}
            handleAnswerSubmit={handleAnswerSubmit} nextQuestion={nextQuestion} handleGoToSetup={handleGoToSetup}
            chordData={chordData}
        />;
    }
    if (screen === 'results') {
        return <ResultsScreen 
            score={score} questions={questions} 
            setScreen={setScreen} 
            // MINOR_KEY_FEATURE: handleLogSession is not passed.
            // handleLogSession={handleLogSession} 
        />;
    }
};

export default ChordTrainer;