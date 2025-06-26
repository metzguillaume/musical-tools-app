import React from 'react';

const NameTheIntervalQuizFrame = () => (
    <div className="w-full h-[80vh] flex justify-center items-center">
      <iframe
        srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Musical Interval Quiz</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark charcoal background */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .game-container {
            background-color: #2d3748; /* Darker slate background for container */
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); /* More prominent shadow for dark mode */
            text-align: center;
            max-width: 600px;
            width: 100%;
        }
        .note-display {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
        }
        .note {
            font-size: 3.5rem; /* Larger font size for notes */
            font-weight: 700;
            color: #e2e8f0; /* Light gray text for notes */
            padding: 15px 25px;
            background-color: #4a5568; /* Medium gray background for notes */
            border-radius: 10px;
            min-width: 100px;
            text-align: center;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.15);
        }
        .interval-selection-grid {
            display: grid;
            grid-template-columns: 1fr 1fr; /* Two columns for quality and numeric */
            gap: 15px; /* Reduced gap between the two main columns */
            margin-top: 30px;
        }
        .interval-column {
            display: flex; /* Flex to stack title and inner button container */
            flex-direction: column;
            gap: 10px; /* Gap between title and inner button container */
        }
        .interval-column-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #cbd5e0;
            margin-bottom: 0; /* Adjusted as gap is now on parent */
        }
        /* Inner container for quality buttons (flex column) */
        #qualityButtonsInner {
            display: flex;
            flex-direction: column;
            gap: 8px; /* Gap between buttons in quality column */
        }
        /* Inner container for numeric buttons (grid for 2 columns) */
        #numericButtonsInner {
            display: grid;
            grid-template-columns: 1fr 1fr; /* Two columns for numeric buttons */
            gap: 8px; /* Gap between numeric buttons */
        }
        .interval-button {
            background-color: #48bb78; /* Teal-green primary button */
            color: white;
            padding: 8px 10px; /* Reduced padding */
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem; /* Reduced font size */
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            width: 100%; /* Ensure buttons fill the column width */
        }
        .interval-button:hover {
            background-color: #38a169; /* Darker teal-green on hover */
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
        }
        .interval-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        /* Style for selected button */
        .interval-button.selected {
            background-color: #63b3ed; /* A distinct blue for selected state */
            box-shadow: 0 0 0 3px #63b3ed, 0 4px 6px rgba(0, 0, 0, 0.3); /* Ring effect */
            transform: scale(1.02); /* Slightly larger */
        }
        .interval-button:disabled {
            background-color: #4a5568; /* Darker gray for disabled in dark mode */
            cursor: not-allowed;
            opacity: 0.7;
            box-shadow: none;
            transform: none;
        }
        .feedback {
            margin-top: 20px;
            font-size: 1.2rem;
            font-weight: 600;
            min-height: 25px; /* Reserve space to prevent layout shift */
        }
        .feedback.correct {
            color: #68d391; /* Lighter green for correct feedback */
        }
        .feedback.incorrect {
            color: #fc8181; /* Lighter red for incorrect feedback */
        }
        .score-display {
            font-size: 1.1rem;
            margin-bottom: 20px;
            color: #cbd5e0; /* Light gray for score */
        }
        h1 {
            color: #f7fafc; /* White for heading */
            margin-bottom: 25px;
            font-size: 2.2rem;
            font-weight: 700;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
            .note {
                font-size: 2.5rem;
                min-width: 80px;
            }
            h1 {
                font-size: 1.8rem;
            }
            .game-container {
                padding: 20px;
            }
            .interval-button {
                font-size: 0.85rem; /* Further reduced font size for small screens */
                padding: 6px 8px; /* Further reduced padding for small screens */
            }
            .interval-selection-grid {
                grid-template-columns: 1fr; /* Stack main columns on small screens */
                gap: 10px; /* Reduced gap between stacked main columns */
            }
            .interval-column {
                margin-bottom: 10px; /* Reduced space between stacked main columns */
            }
            #numericButtonsInner {
                grid-template-columns: 1fr 1fr; /* Keep two columns for numeric on small screens as well if fits */
            }
        }
        /* Further adjustment for very small screens if needed, might collapse to 1 column for numeric */
        @media (max-width: 360px) {
             #numericButtonsInner {
                grid-template-columns: 1fr; /* Collapse numeric buttons to single column on very small screens */
            }
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>Musical Interval Quiz</h1>
        <div class="score-display">Score: <span id="score">0</span></div>
        <div class="note-display">
            <div id="note1" class="note">C</div>
            <div id="note2" class="note">E</div>
        </div>
        <div id="feedback" class="feedback"></div>
        <div class="interval-selection-grid">
            <div class="interval-column">
                <div class="interval-column-title">Quality</div>
                <div id="qualityButtonsInner">
                    <!-- Quality buttons will be dynamically generated here -->
                </div>
            </div>
            <div class="interval-column">
                <div class="interval-column-title">Number</div>
                <div id="numericButtonsInner">
                    <!-- Numeric buttons will be dynamically generated here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        // Array of notes and their corresponding MIDI values (C = 0, C# = 1, etc.)
        const allNotesChromatic = [
            { name: 'C', midi: 0 }, { name: 'C#', midi: 1 }, { name: 'D', midi: 2 }, { name: 'D#', midi: 3 },
            { name: 'E', midi: 4 }, { name: 'F', midi: 5 }, { name: 'F#', midi: 6 }, { name: 'G', midi: 7 },
            { name: 'G#', midi: 8 }, { name: 'A', midi: 9 }, { name: 'A#', midi: 10 }, { name: 'B', midi: 11 }
        ];

        // Helpers for musical calculations related to note spelling
        const naturalNoteAlphabeticalIndex = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
        const alphabeticalIndexToNaturalNote = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const naturalNoteSemitoneOffsetFromC = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };

        // Define the intervals the game will quiz on, including their generic type and semitone count.
        const quizIntervalOptions = [
            { name: 'Perfect Unison', semitones: 0, genericType: 'unison', quality: 'Perfect', number: 'Unison' },
            { name: 'Minor 2nd', semitones: 1, genericType: 'second', quality: 'Minor', number: '2nd' },
            { name: 'Major 2nd', semitones: 2, genericType: 'second', quality: 'Major', number: '2nd' },
            { name: 'Minor 3rd', semitones: 3, genericType: 'third', quality: 'Minor', number: '3rd' },
            { name: 'Major 3rd', semitones: 4, genericType: 'third', quality: 'Major', number: '3rd' },
            { name: 'Augmented 3rd', semitones: 5, genericType: 'third', quality: 'Augmented', number: '3rd' },
            { name: 'Perfect 4th', semitones: 5, genericType: 'fourth', quality: 'Perfect', number: '4th' },
            { name: 'Augmented 4th', semitones: 6, genericType: 'fourth', quality: 'Augmented', number: '4th' },
            { name: 'Diminished 5th', semitones: 6, genericType: 'fifth', quality: 'Diminished', number: '5th' },
            { name: 'Perfect 5th', semitones: 7, genericType: 'fifth', quality: 'Perfect', number: '5th' },
            { name: 'Minor 6th', semitones: 8, genericType: 'sixth', quality: 'Minor', number: '6th' },
            { name: 'Major 6th', semitones: 9, genericType: 'sixth', quality: 'Major', number: '6th' },
            { name: 'Minor 7th', semitones: 10, genericType: 'seventh', quality: 'Minor', number: '7th' },
            { name: 'Major 7th', semitones: 11, genericType: 'seventh', quality: 'Major', number: '7th' },
            { name: 'Perfect Octave', semitones: 12, genericType: 'octave', quality: 'Perfect', number: 'Octave' }
        ];

        const note1Display = document.getElementById('note1');
        const note2Display = document.getElementById('note2');
        const scoreDisplay = document.getElementById('score');
        const feedbackDisplay = document.getElementById('feedback');
        const qualityButtonsInnerContainer = document.getElementById('qualityButtonsInner');
        const numericButtonsInnerContainer = document.getElementById('numericButtonsInner');

        let score = 0;
        let currentNotes = { noteA: null, noteB: null };
        let correctInterval = null;
        let isWaitingForNextRound = false;

        let selectedQuality = null;
        let selectedNumericInterval = null;
        let lastSelectedQualityButton = null;
        let lastSelectedNumericButton = null;

        /**
         * Calculates the accurately spelled target note name and MIDI value based on a base note,
         * a generic interval type, and the total semitone difference.
         * @param {string} baseNoteNaturalLetter - The natural letter name of the base note (e.g., 'C', 'F').
         * @param {number} baseNoteOctave - The octave number of the base note (e.g., 3 for C3).
         * @param {string} intervalGenericType - The generic type of the interval (e.g., 'third', 'fourth').
         * @param {number} targetSemitones - The total semitone difference from the base note.
         * @returns {{name: string, midiValue: number}} An object containing the target note's spelled name and its MIDI value.
         */
        function getTargetNoteSpelling(baseNoteNaturalLetter, baseNoteOctave, intervalGenericType, targetSemitones) {
            const baseMidi = naturalNoteSemitoneOffsetFromC[baseNoteNaturalLetter] + (baseNoteOctave + 1) * 12;
            const baseNaturalLetterIndex = naturalNoteAlphabeticalIndex[baseNoteNaturalLetter];
            let targetNaturalLetterIndex;

            switch (intervalGenericType) {
                case 'unison':
                case 'octave':
                    targetNaturalLetterIndex = baseNaturalLetterIndex;
                    break;
                case 'second':
                    targetNaturalLetterIndex = (baseNaturalLetterIndex + 1) % 7;
                    break;
                case 'third':
                    targetNaturalLetterIndex = (baseNaturalLetterIndex + 2) % 7;
                    break;
                case 'fourth':
                case 'tritone':
                    if (intervalGenericType === 'fourth') {
                        targetNaturalLetterIndex = (baseNaturalLetterIndex + 3) % 7;
                    } else if (intervalGenericType === 'fifth') {
                        targetNaturalLetterIndex = (baseNaturalLetterIndex + 4) % 7;
                    } else {
                        targetNaturalLetterIndex = (baseNaturalLetterIndex + 3) % 7;
                    }
                    break;
                case 'fifth':
                    targetNaturalLetterIndex = (baseNaturalLetterIndex + 4) % 7;
                    break;
                case 'sixth':
                    targetNaturalLetterIndex = (baseNaturalLetterIndex + 5) % 7;
                    break;
                case 'seventh':
                    targetNaturalLetterIndex = (baseNaturalLetterIndex + 6) % 7;
                    break;
                default:
                    console.error("Unknown generic interval type:", intervalGenericType);
                    return { name: 'Error', midiValue: 0 };
            }

            const targetNaturalLetter = alphabeticalIndexToNaturalNote[targetNaturalLetterIndex];
            let naturalTargetMidiValue = naturalNoteSemitoneOffsetFromC[targetNaturalLetter];
            let octaveAdjustment = 0;

            if (targetNaturalLetterIndex < baseNaturalLetterIndex && targetSemitones > 0) {
                 octaveAdjustment = 1;
            } else if (targetNaturalLetterIndex === baseNaturalLetterIndex && targetSemitones > 0 && intervalGenericType === 'octave') {
                octaveAdjustment = 1;
            }

            naturalTargetMidiValue = naturalNoteSemitoneOffsetFromC[targetNaturalLetter] + (baseNoteOctave + octaveAdjustment + 1) * 12;

            const actualTargetMidi = baseMidi + targetSemitones;
            const semitonesFromNatural = actualTargetMidi - naturalTargetMidiValue;

            let finalAccidental = '';
            if (semitonesFromNatural === 1) {
                finalAccidental = '#';
            } else if (semitonesFromNatural === 2) {
                finalAccidental = '##';
            } else if (semitonesFromNatural === -1) {
                finalAccidental = 'b';
            } else if (semitonesFromNatural === -2) {
                finalAccidental = 'bb';
            }

            return {
                name: targetNaturalLetter + finalAccidental,
                midiValue: actualTargetMidi
            };
        }

        /**
         * Generates a complete interval question, ensuring musical accuracy for spelling.
         * @returns {{note1: object, note2: object, correctInterval: object}}
         * An object containing the two notes (with name and MIDI) and the correct interval object.
         */
        function generateIntervalQuestion() {
            const chosenInterval = quizIntervalOptions[Math.floor(Math.random() * quizIntervalOptions.length)];
            const baseNaturalLetter = alphabeticalIndexToNaturalNote[Math.floor(Math.random() * alphabeticalIndexToNaturalNote.length)];
            const baseOctave = Math.floor(Math.random() * (4 - 3 + 1)) + 3; // Octaves 3 and 4 (C3 to B4 for max range)

            const note1Midi = naturalNoteSemitoneOffsetFromC[baseNaturalLetter] + (baseOctave + 1) * 12;
            const note1 = { name: baseNaturalLetter, midiValue: note1Midi };

            const note2 = getTargetNoteSpelling(baseNaturalLetter, baseOctave, chosenInterval.genericType, chosenInterval.semitones);

            const minGameMidi = 48; // C3
            const maxGameMidi = 71; // B4
            if (note2.midiValue < minGameMidi || note2.midiValue > maxGameMidi || note1.midiValue < minGameMidi || note1.midiValue > maxGameMidi || note1.midiValue === note2.midiValue) {
                return generateIntervalQuestion();
            }

            let displayNote1 = note1;
            let displayNote2 = note2;

            if (note1.midiValue > note2.midiValue) {
                [displayNote1, displayNote2] = [note2, note1];
            }

            return {
                note1: displayNote1,
                note2: displayNote2,
                correctInterval: chosenInterval
            };
        }

        /**
         * Starts a new round of the quiz.
         */
        function startNewRound() {
            if (isWaitingForNextRound) return;

            feedbackDisplay.textContent = '';
            feedbackDisplay.className = 'feedback';

            if (lastSelectedQualityButton) {
                lastSelectedQualityButton.classList.remove('selected');
            }
            if (lastSelectedNumericButton) {
                lastSelectedNumericButton.classList.remove('selected');
            }
            selectedQuality = null;
            selectedNumericInterval = null;
            lastSelectedQualityButton = null;
            lastSelectedNumericButton = null;

            const question = generateIntervalQuestion();
            currentNotes = { noteA: question.note1, noteB: question.note2 };
            correctInterval = question.correctInterval;

            note1Display.textContent = currentNotes.noteA.name;
            note2Display.textContent = currentNotes.noteB.name;

            // Enable all buttons for the new round and reset their active color
            Array.from(qualityButtonsInnerContainer.children).forEach(button => {
                if (button.tagName === 'BUTTON') {
                    button.disabled = false;
                    button.classList.remove('bg-gray-600');
                    button.classList.add('bg-teal-500', 'hover:bg-teal-600');
                }
            });
            Array.from(numericButtonsInnerContainer.children).forEach(button => {
                if (button.tagName === 'BUTTON') {
                    button.disabled = false;
                    button.classList.remove('bg-gray-600');
                    button.classList.add('bg-teal-500', 'hover:bg-teal-600');
                }
            });
        }

        /**
         * Checks the current selection and provides feedback.
         */
        function checkAnswerAndProceed() {
            if (selectedQuality && selectedNumericInterval) {
                let isCorrect = false;

                // Special handling for the combined Unison / Octave button
                if (selectedNumericInterval === 'Unison / Octave') {
                    // Correct if quality is Perfect AND the actual interval is Unison or Octave
                    if (selectedQuality === 'Perfect' && (correctInterval.number === 'Unison' || correctInterval.number === 'Octave')) {
                        isCorrect = true;
                    }
                } else {
                    // For all other intervals, direct comparison of quality and number
                    if (selectedQuality === correctInterval.quality && selectedNumericInterval === correctInterval.number) {
                        isCorrect = true;
                    }
                }

                if (isCorrect) {
                    score++;
                    feedbackDisplay.textContent = 'Correct!';
                    feedbackDisplay.classList.add('correct');
                } else {
                    feedbackDisplay.textContent = \`Incorrect! It was \${correctInterval.name}.\`;
                    feedbackDisplay.classList.add('incorrect');
                }
                scoreDisplay.textContent = score;

                // Disable all buttons
                Array.from(qualityButtonsInnerContainer.children).forEach(button => {
                    if (button.tagName === 'BUTTON') button.disabled = true;
                });
                Array.from(numericButtonsInnerContainer.children).forEach(button => {
                    if (button.tagName === 'BUTTON') button.disabled = true;
                });

                isWaitingForNextRound = true;
                setTimeout(() => {
                    isWaitingForNextRound = false;
                    startNewRound();
                }, 2000);
            }
        }

        /**
         * Handles a quality button click.
         * @param {string} quality - The selected quality (e.g., 'Major').
         * @param {HTMLElement} button - The button element that was clicked.
         */
        function handleQualityClick(quality, button) {
            if (isWaitingForNextRound) return;

            if (lastSelectedQualityButton) {
                lastSelectedQualityButton.classList.remove('selected');
            }
            selectedQuality = quality;
            button.classList.add('selected');
            lastSelectedQualityButton = button;

            checkAnswerAndProceed();
        }

        /**
         * Handles a numeric interval button click.
         * @param {string} numericInterval - The selected numeric interval (e.g., '3rd').
         * @param {HTMLElement} button - The button element that was clicked.
         */
        function handleNumericClick(numericInterval, button) {
            if (isWaitingForNextRound) return;

            if (lastSelectedNumericButton) {
                lastSelectedNumericButton.classList.remove('selected');
            }
            selectedNumericInterval = numericInterval;
            button.classList.add('selected');
            lastSelectedNumericButton = button;

            checkAnswerAndProceed();
        }

        /**
         * Initializes the quality and numeric interval buttons.
         */
        function initializeIntervalButtons() {
            const qualities = ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'];
            // These are the *individual* numeric intervals for the buttons
            const numericIntervalsForButtons = ['2nd', '3rd', '4th', '5th', '6th', '7th'];
            const unisonOctaveButtonText = 'Unison / Octave'; // Text for the combined button

            qualities.forEach(quality => {
                const button = document.createElement('button');
                button.classList.add('interval-button', 'bg-teal-500', 'hover:bg-teal-600', 'focus:outline-none', 'focus:ring-2', 'focus:ring-teal-400', 'focus:ring-opacity-50');
                button.textContent = quality;
                button.onclick = () => handleQualityClick(quality, button);
                qualityButtonsInnerContainer.appendChild(button);
            });

            // Create the combined Unison / Octave button
            const unisonOctaveButton = document.createElement('button');
            unisonOctaveButton.classList.add('interval-button', 'bg-teal-500', 'hover:bg-teal-600', 'focus:outline-none', 'focus:ring-2', 'focus:ring-teal-400', 'focus:ring-opacity-50');
            unisonOctaveButton.textContent = unisonOctaveButtonText;
            unisonOctaveButton.onclick = () => handleNumericClick(unisonOctaveButtonText, unisonOctaveButton);
            numericButtonsInnerContainer.appendChild(unisonOctaveButton);

            // Create the remaining numeric interval buttons (2nd to 7th)
            numericIntervalsForButtons.forEach(number => {
                const button = document.createElement('button');
                button.classList.add('interval-button', 'bg-teal-500', 'hover:bg-teal-600', 'focus:outline-none', 'focus:ring-2', 'focus:ring-teal-400', 'focus:ring-opacity-50');
                button.textContent = number;
                button.onclick = () => handleNumericClick(number, button);
                numericButtonsInnerContainer.appendChild(button);
            });
        }

        // Initialize the game when the window loads
        window.onload = function() {
            initializeIntervalButtons();
            startNewRound();
        };

    </script>
</body>
</html>`}
        title="Name The Interval Quiz"
        className="w-full h-full border-none rounded-xl shadow-lg"
      ></iframe>
    </div>
);

export default NameTheIntervalQuizFrame;
