import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone'; // Import Tone.js directly

// Component to render the "Intervals Quiz" HTML game within an iframe
const IntervalsQuizFrame = () => (
  <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] flex justify-center items-center">
    <iframe
      srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interval Quiz</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        /* Custom styles for the Inter font and overall look */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background */
            color: #e2e8f0; /* Light text */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px; /* Add some padding for smaller screens */
            box-sizing: border-box;
            overflow-y: auto; /* Allow scrolling if content overflows */
        }
        .container {
            background-color: #2d3748; /* Slightly lighter dark background for the container */
            border-radius: 1rem; /* Rounded corners */
            padding: 2rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
            text-align: center;
            width: 100%;
            max-width: 500px; /* Max width for desktop */
            min-height: 500px; /* Ensure a minimum height for the game container */
        }
        input[type="text"] {
            background-color: #4a5568; /* Darker input background */
            color: #e2e8f0;
            border: 2px solid #4a5568;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            outline: none;
            transition: border-color 0.3s ease;
        }
        input[type="text"]:focus {
            border-color: #63b3ed; /* Blue border on focus */
        }
        button {
            background-color: #4299e1; /* Blue button */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: bold;
            transition: background-color 0.3s ease, transform 0.1s ease;
            cursor: pointer;
        }
        button:hover {
            background-color: #3182ce; /* Darker blue on hover */
            transform: translateY(-2px); /* Slight lift on hover */
        }
        button:active {
            transform: translateY(0); /* Press effect */
        }
        button:disabled {
            background-color: #4a5568; /* Grey out disabled button */
            cursor: not-allowed;
            transform: translateY(0);
            box-shadow: none;
        }
        .feedback {
            margin-top: 1rem;
            font-weight: bold;
        }
        .feedback.correct {
            color: #48bb78; /* Green for correct */
        }
        .feedback.incorrect {
            color: #f56565; /* Red for incorrect */
        }
        .note-display {
            font-size: 4rem; /* Large font for notes */
            margin-bottom: 1.5rem;
            font-weight: bold;
            color: #a0aec0; /* Light grey note color */
        }
        .score-display {
            margin-top: 1.5rem;
            font-size: 1.25rem;
            color: #cbd5e0; /* Off-white for score */
        }
        /* Checkbox styling */
        .checkbox-group {
            display: flex;
            flex-direction: column;
            align-items: flex-start; /* Align checkboxes to the left */
            margin-bottom: 1.5rem;
            gap: 0.75rem; /* Space between checkboxes */
        }
        .checkbox-item {
            display: flex;
            align-items: center;
        }
        .checkbox-item input[type="checkbox"] {
            appearance: none; /* Hide default checkbox */
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border: 2px solid #63b3ed; /* Blue border */
            border-radius: 0.25rem;
            margin-right: 0.75rem;
            cursor: pointer;
            position: relative;
            flex-shrink: 0; /* Prevent shrinking */
        }
        .checkbox-item input[type="checkbox"]:checked {
            background-color: #63b3ed; /* Blue background when checked */
            border-color: #63b3ed;
        }
        .checkbox-item input[type="checkbox"]:checked::after {
            content: '✔'; /* Checkmark */
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            font-weight: bold;
        }
        .checkbox-item label {
            cursor: pointer;
            font-size: 1.1rem;
            color: #cbd5e0;
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
            .note-display {
                font-size: 3rem;
            }
            .container {
                padding: 1.5rem;
            }
            button {
                padding: 0.6rem 1.2rem;
                font-size: 0.9rem;
            }
            input[type="text"] {
                padding: 0.6rem 0.8rem;
            }
            .menu-button-group button, .menu-button-group .checkbox-group {
                width: 100%;
                align-items: center; /* Center checkboxes on small screens for better aesthetics */
            }
            .checkbox-group {
                align-items: flex-start; /* Ensure labels align */
            }
            .checkbox-item {
                width: 100%;
                justify-content: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="container flex flex-col items-center">
        <h1 class="text-3xl font-extrabold mb-6 text-indigo-300">Musical Interval Quiz</h1>

        <!-- Menu Screen -->
        <div id="menu-screen" class="flex flex-col items-center">
            <h2 class="text-2xl font-bold mb-6 text-blue-200">Select Quiz Intervals</h2>
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" id="check-thirds" value="thirds" checked>
                    <label for="check-thirds">Major Thirds</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="check-fourths" value="fourths">
                    <label for="check-fourths">Perfect Fourths</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="check-fifths" value="fifths">
                    <label for="check-fifths">Perfect Fifths</label>
                </div>
            </div>
            <button id="start-quiz-button" class="shadow-lg hover:shadow-xl bg-green-600 hover:bg-green-700">Start Quiz</button>
        </div>

        <!-- Quiz Screen (initially hidden) -->
        <div id="quiz-screen" class="hidden flex flex-col items-center w-full">
            <div class="note-display" id="root-note-display">C</div>

            <input
                type="text"
                id="answer-input"
                class="w-full max-w-xs mb-4 text-center text-2xl"
                placeholder="Type your answer (e.g., E, Bb)"
                autocomplete="off"
            />

            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4 w-full justify-center">
                <button id="submit-button" class="shadow-lg hover:shadow-xl">Submit</button>
                <button id="next-button" class="bg-gray-600 hover:bg-gray-700 shadow-lg hover:shadow-xl">Next Question</button>
            </div>
            <button id="back-to-menu-button" class="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl mt-4 w-full max-w-xs">Back to Menu</button>

            <div id="feedback-message" class="feedback text-lg"></div>

            <div class="score-display">
                Score: <span id="correct-score">0</span> / <span id="total-questions">0</span>
            </div>

            <!-- Keyboard shortcuts explanation -->
            <div class="text-sm mt-4 text-gray-400">
                Keyboard Shortcuts:
                <br>
                **Enter**: Submit Answer / Next Question
                <br>
                **Spacebar**: Next Question (after submitting)
            </div>
        </div>
    </div>

    <script>
        // DOM Elements
        const menuScreen = document.getElementById('menu-screen');
        const quizScreen = document.getElementById('quiz-screen');

        const checkThirds = document.getElementById('check-thirds');
        const checkFourths = document.getElementById('check-fourths');
        const checkFifths = document.getElementById('check-fifths');
        const startQuizButton = document.getElementById('start-quiz-button');
        const backToMenuButton = document.getElementById('back-to-menu-button');

        const rootNoteDisplay = document.getElementById('root-note-display');
        const answerInput = document.getElementById('answer-input');
        const submitButton = document.getElementById('submit-button');
        const nextButton = document.getElementById('next-button');
        const feedbackMessage = document.getElementById('feedback-message');
        const correctScoreSpan = document.getElementById('correct-score');
        const totalQuestionsSpan = document.getElementById('total-questions');

        // Musical notes and their interval maps
        const intervalMaps = {
            'thirds': {
                name: '3rd',
                map: {
                    'C': 'E', 'D': 'F#', 'E': 'G#', 'F': 'A', 'G': 'B', 'A': 'C#', 'B': 'D#'
                }
            },
            'fourths': {
                name: '4th',
                map: {
                    'C': 'F', 'D': 'G', 'E': 'A', 'F': 'Bb', 'G': 'C', 'A': 'D', 'B': 'E'
                }
            },
            'fifths': {
                name: '5th',
                map: {
                    'C': 'G', 'D': 'A', 'E': 'B', 'F': 'C', 'G': 'D', 'A': 'E', 'B': 'F#'
                }
            }
        };

        let selectedIntervalTypes = [];
        let currentRootNote = '';
        let correctTargetNote = '';
        let correctAnswers = 0;
        let totalQuestions = 0;
        let answerChecked = false;

        let previousRootNote = '';
        let previousIntervalType = '';

        /**
         * Updates the state of the Start Quiz button based on checkbox selections.
         */
        function updateStartButtonState() {
            selectedIntervalTypes = [];
            if (checkThirds.checked) selectedIntervalTypes.push('thirds');
            if (checkFourths.checked) selectedIntervalTypes.push('fourths');
            if (checkFifths.checked) selectedIntervalTypes.push('fifths');

            startQuizButton.disabled = selectedIntervalTypes.length === 0;
        }

        /**
         * Shows the menu screen and hides the quiz screen.
         * Resets scores when returning to menu.
         */
        function showMenu() {
            menuScreen.classList.remove('hidden');
            menuScreen.classList.add('flex');
            quizScreen.classList.add('hidden');
            quizScreen.classList.remove('flex');
            resetQuiz();
            updateStartButtonState();
            previousRootNote = '';
            previousIntervalType = '';
        }

        /**
         * Shows the quiz screen and hides the menu screen.
         */
        function showQuiz() {
            menuScreen.classList.add('hidden');
            menuScreen.classList.remove('flex');
            quizScreen.classList.remove('hidden');
            quizScreen.classList.add('flex');
            resetQuiz();
            generateNewQuestion();
        }

        /**
         * Resets quiz scores and feedback.
         */
        function resetQuiz() {
            correctAnswers = 0;
            totalQuestions = 0;
            updateScoreDisplay();
            feedbackMessage.textContent = '';
            feedbackMessage.classList.remove('correct', 'incorrect');
            answerInput.value = '';
            answerChecked = false;
        }

        /**
         * Generates a new quiz question based on the selected mode.
         */
        function generateNewQuestion() {
            feedbackMessage.textContent = '';
            feedbackMessage.classList.remove('correct', 'incorrect');
            answerInput.value = '';
            answerInput.focus();
            answerChecked = false;

            if (selectedIntervalTypes.length === 0) {
                feedbackMessage.textContent = "Please select at least one interval type from the menu.";
                feedbackMessage.classList.add('incorrect');
                return;
            }

            let newRootNote;
            let newChosenIntervalKey;
            let newSelectedMap;
            let newIntervalTypeName;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                const randomTypeIndex = Math.floor(Math.random() * selectedIntervalTypes.length);
                newChosenIntervalKey = selectedIntervalTypes[randomTypeIndex];

                newSelectedMap = intervalMaps[newChosenIntervalKey].map;
                newIntervalTypeName = intervalMaps[newChosenIntervalKey].name;

                const naturalNotesForCurrentMap = Object.keys(newSelectedMap);
                const randomIndex = Math.floor(Math.random() * naturalNotesForCurrentMap.length);
                newRootNote = naturalNotesForCurrentMap[randomIndex];

                attempts++;
            } while (attempts < maxAttempts && newRootNote === previousRootNote && newChosenIntervalKey === previousIntervalType);

            currentRootNote = newRootNote;
            correctTargetNote = newSelectedMap[currentRootNote];

            previousRootNote = currentRootNote;
            previousIntervalType = newChosenIntervalKey;
            
            rootNoteDisplay.textContent = currentRootNote + ' (' + newIntervalTypeName + ')';

            totalQuestions++;
            updateScoreDisplay();
        }

        /**
         * Checks the user's answer.
         */
        function checkAnswer() {
            const userAnswer = answerInput.value.trim();

            const normalizeNote = (note) => {
                return note.replace(/#/g, 's').replace(/b/g, 'f').toLowerCase();
            };

            const enharmonicMap = {
                'C#': ['C#', 'Db'], 'Db': ['C#', 'Db'],
                'D#': ['D#', 'Eb'], 'Eb': ['D#', 'Eb'],
                'F#': ['F#', 'Gb'], 'Gb': ['F#', 'Gb'],
                'G#': ['G#', 'Ab'], 'Ab': ['G#', 'Ab'],
                'A#': ['A#', 'Bb'], 'Bb': ['Bb', 'A#']
            };

            let possibleCorrectAnswersRaw = enharmonicMap[correctTargetNote] || [correctTargetNote];
            let possibleCorrectAnswersNormalized = possibleCorrectAnswersRaw.map(note => normalizeNote(note));
            let normalizedUserAnswer = normalizeNote(userAnswer);

            let isCorrect = possibleCorrectAnswersNormalized.includes(normalizedUserAnswer);

            if (!answerChecked) {
                if (isCorrect) {
                    feedbackMessage.textContent = 'Correct!';
                    feedbackMessage.classList.remove('incorrect');
                    feedbackMessage.classList.add('correct');
                    correctAnswers++;
                } else {
                    feedbackMessage.textContent = 'Incorrect. The correct answer was ' + correctTargetNote + '.';
                    feedbackMessage.classList.remove('correct');
                    feedbackMessage.classList.add('incorrect');
                }
                updateScoreDisplay();
                answerChecked = true;
            }
        }

        /**
         * Updates the displayed score.
         */
        function updateScoreDisplay() {
            correctScoreSpan.textContent = correctAnswers;
            totalQuestionsSpan.textContent = totalQuestions;
        }

        // Event Listeners for Menu Controls
        checkThirds.addEventListener('change', updateStartButtonState);
        checkFourths.addEventListener('change', updateStartButtonState);
        checkFifths.addEventListener('change', updateStartButtonState);
        startQuizButton.addEventListener('click', showQuiz);
        backToMenuButton.addEventListener('click', showMenu);

        // Event Listeners for Quiz Controls
        submitButton.addEventListener('click', checkAnswer);
        nextButton.addEventListener('click', generateNewQuestion);

        // Keyboard Event Listeners (for quick navigation)
        answerInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent new line in input if it was a textarea
                if (!answerChecked) {
                    checkAnswer(); // First Enter: check answer
                } else {
                    generateNewQuestion(); // Second Enter: go to next question
                }
            } else if (event.code === 'Space' && answerChecked) {
                event.preventDefault(); // Prevent adding a space character to the input
                generateNewQuestion();
            }
        });

        // Initialize the game when the window loads
        window.onload = function() {
            showMenu();
            updateStartButtonState(); // Set initial button state (thirds is checked by default)
        };

    </script>
</body>
</html>`}
      title="Intervals Quiz"
      className="w-full h-full border-none rounded-xl shadow-lg"
    ></iframe>
  </div>
);

// Component to render the "Name The Interval" HTML game within an iframe
const NameTheIntervalQuizFrame = () => (
    <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] flex justify-center items-center">
      <iframe
        srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Name The Interval Quiz</title>
    <!-- Tailwind CSS and Google Fonts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #1a202c; color: #e2e8f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .container { background-color: #2d3748; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2); text-align: center; width: 100%; max-width: 500px; min-height: 500px; }
        button { background-color: #4299e1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; transition: background-color 0.3s ease, transform 0.1s ease; cursor: pointer; border: none; }
        button:hover { background-color: #3182ce; transform: translateY(-2px); }
        button:active { transform: translateY(0); }
        button:disabled { background-color: #4a5568; cursor: not-allowed; transform: translateY(0); box-shadow: none; }
        .feedback { margin-top: 1rem; font-weight: bold; min-height: 24px; }
        .feedback.correct { color: #48bb78; }
        .feedback.incorrect { color: #f56565; }
        .note-display { font-size: 3.5rem; margin-bottom: 1.5rem; font-weight: bold; color: #a0aec0; }
        .score-display { margin-top: 1.5rem; font-size: 1.25rem; color: #cbd5e0; }
        .answer-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; width: 100%; }
    </style>
</head>
<body>
    <div class="container flex flex-col items-center justify-center">
        <h1 class="text-3xl font-extrabold mb-6 text-indigo-300">Name The Interval Quiz</h1>
        
        <div id="quiz-screen" class="flex flex-col items-center w-full">
            <div class="note-display" id="notes-display">C → G</div>
            <div id="feedback-message" class="feedback"></div>
            <div id="answer-buttons" class="answer-buttons">
                <!-- Answer buttons will be generated by script -->
            </div>
            <button id="next-button" class="bg-gray-600 hover:bg-gray-700 shadow-lg hover:shadow-xl mt-6">Next Question</button>
            <div class="score-display">
                Score: <span id="correct-score">0</span> / <span id="total-questions">0</span>
            </div>
        </div>
    </div>

    <script>
        // DOM Elements
        const notesDisplay = document.getElementById('notes-display');
        const answerButtonsContainer = document.getElementById('answer-buttons');
        const nextButton = document.getElementById('next-button');
        const feedbackMessage = document.getElementById('feedback-message');
        const correctScoreSpan = document.getElementById('correct-score');
        const totalQuestionsSpan = document.getElementById('total-questions');

        // Musical data
        const intervals = {
            'Major Third': { semitones: 4, map: {'C': 'E', 'F': 'A', 'G': 'B'} },
            'Perfect Fourth': { semitones: 5, map: {'C': 'F', 'D': 'G', 'E': 'A', 'F': 'Bb', 'G': 'C', 'A': 'D', 'B': 'E'} },
            'Perfect Fifth': { semitones: 7, map: {'C': 'G', 'D': 'A', 'E': 'B', 'F': 'C', 'G': 'D', 'A': 'E', 'B': 'F#'} },
            'Major Sixth': { semitones: 9, map: {'C': 'A', 'D': 'B', 'G': 'E'} },
        };
        const intervalNames = Object.keys(intervals);

        let currentCorrectAnswer = '';
        let correctAnswers = 0;
        let totalQuestions = 0;
        let answerChecked = false;

        function generateNewQuestion() {
            answerChecked = false;
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback';
            
            // 1. Pick a random interval
            const correctIntervalIndex = Math.floor(Math.random() * intervalNames.length);
            currentCorrectAnswer = intervalNames[correctIntervalIndex];
            const intervalData = intervals[currentCorrectAnswer];
            const possibleRoots = Object.keys(intervalData.map);
            
            // 2. Pick a random root note for that interval
            const rootNoteIndex = Math.floor(Math.random() * possibleRoots.length);
            const rootNote = possibleRoots[rootNoteIndex];
            const targetNote = intervalData.map[rootNote];
            
            notesDisplay.textContent = rootNote + ' → ' + targetNote;
            
            // 3. Create answer choices (one correct, others wrong)
            let answerChoices = [currentCorrectAnswer];
            while (answerChoices.length < 4) {
                const randomWrongAnswer = intervalNames[Math.floor(Math.random() * intervalNames.length)];
                if (!answerChoices.includes(randomWrongAnswer)) {
                    answerChoices.push(randomWrongAnswer);
                }
            }
            
            // Shuffle the choices
            answerChoices.sort(() => Math.random() - 0.5);
            
            // 4. Create and display buttons
            answerButtonsContainer.innerHTML = '';
            answerChoices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice;
                button.onclick = () => checkAnswer(choice);
                answerButtonsContainer.appendChild(button);
            });
            
            totalQuestions++;
            updateScoreDisplay();
        }

        function checkAnswer(userAnswer) {
            if (answerChecked) return; // Prevent multiple clicks
            answerChecked = true;

            if (userAnswer === currentCorrectAnswer) {
                feedbackMessage.textContent = 'Correct!';
                feedbackMessage.classList.add('correct');
                correctAnswers++;
            } else {
                feedbackMessage.textContent = 'Incorrect. It was a ' + currentCorrectAnswer;
                feedbackMessage.classList.add('incorrect');
            }
            
            // Disable all buttons after answering
            Array.from(answerButtonsContainer.children).forEach(button => {
                button.disabled = true;
                if (button.textContent === currentCorrectAnswer) {
                   button.style.backgroundColor = '#48bb78'; // Highlight correct answer
                }
            });
            
            updateScoreDisplay();
        }

        function updateScoreDisplay() {
            correctScoreSpan.textContent = correctAnswers;
            totalQuestionsSpan.textContent = totalQuestions;
        }

        nextButton.addEventListener('click', generateNewQuestion);

        window.onload = generateNewQuestion;
    </script>
</body>
</html>`}
        title="Name The Interval Quiz"
        className="w-full h-full border-none rounded-xl shadow-lg"
      ></iframe>
    </div>
);


function App() {
  const [activeCategory, setActiveCategory] = useState('practical'); // 'practical' or 'theory'
  const [activePracticalTab, setActivePracticalTab] = useState('metronome'); // 'metronome', 'note-generator', 'drone-player'
  const [activeTheoryTab, setActiveTheoryTab] = useState('intervals-quiz'); // 'intervals-quiz', 'name-the-interval-quiz', 'music-theory-general'

  // Metronome states (from previous version)
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const metronomeIntervalRef = useRef(null);
  const clickSynthRef = useRef(null);

  // Note Generator states (from previous version)
  const [lastNote, setLastNote] = useState('');
  const [noteOctave, setNoteOctave] = useState(4);
  const [sharpsFlats, setSharpsFlats] = useState('sharps');

  // Initialize Tone.js synth for metronome click
  useEffect(() => {
    // Only initialize if Tone is available, now that it's imported.
    clickSynthRef.current = new Tone.MembraneSynth().toDestination();
    return () => {
      if (clickSynthRef.current) {
        clickSynthRef.current.dispose();
      }
    };
  }, []);

  // Metronome Logic (from previous version)
  const startMetronome = useCallback(() => {
    // Tone.start() needs to be called to enable audio
    Tone.start().then(() => {
        setIsPlaying(true);
        setCurrentBeat(0);
        if (metronomeIntervalRef.current) {
          clearInterval(metronomeIntervalRef.current);
        }
        const intervalTime = (60 / bpm) * 1000;
        clickSynthRef.current.triggerAttackRelease("C4", "8n", Tone.now());
        setCurrentBeat(1);
        let beatCounter = 1;
        metronomeIntervalRef.current = setInterval(() => {
          clickSynthRef.current.triggerAttackRelease("C4", "8n", Tone.now());
          beatCounter = (beatCounter % 4) + 1;
          setCurrentBeat(beatCounter);
        }, intervalTime);
    });
  }, [bpm]);

  const stopMetronome = useCallback(() => {
    setIsPlaying(false);
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    setCurrentBeat(0);
  }, []);

  // Effect to stop metronome if BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      // A short delay helps ensure the old interval is cleared before starting a new one
      const timeoutId = setTimeout(() => startMetronome(), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [bpm, isPlaying, startMetronome, stopMetronome]);


  // Random Note Generator Logic (from previous version)
  const generateRandomNote = () => {
    const notesSharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notesFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const notes = sharpsFlats === 'sharps' ? notesSharps : notesFlats;
    const randomIndex = Math.floor(Math.random() * notes.length);
    const selectedNote = notes[randomIndex];
    setLastNote(`${selectedNote}${noteOctave}`);
  };

  // Helper component for a section header
  const SectionHeader = ({ title }) => (
    <h2 className="text-2xl font-bold text-teal-300 mb-4 p-2 bg-slate-700 rounded-lg shadow-sm text-center">
      {title}
    </h2>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-inter text-gray-200 p-6 flex flex-col items-center">
      {/* Tone.js is now imported via npm, so no global CDN script tag here for the main app.
          The iframes will load their own if necessary via srcDoc. */}

      <header className="w-full max-w-5xl bg-slate-800 shadow-lg rounded-xl p-6 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-teal-400 leading-tight">
          Musical Practice Tools
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Your comprehensive companion for musical growth!
        </p>
      </header>

      {/* Main Category Navigation Tabs */}
      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex justify-center space-x-4">
        <button
          onClick={() => { setActiveCategory('practical'); setActivePracticalTab('metronome'); }}
          className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
            ${activeCategory === 'practical' ? 'bg-indigo-700 text-white shadow-md' : 'text-teal-400 hover:bg-slate-700'}`}
        >
          Practical Exercises
        </button>
        <button
          onClick={() => { setActiveCategory('theory'); setActiveTheoryTab('intervals-quiz'); }}
          className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
            ${activeCategory === 'theory' ? 'bg-indigo-700 text-white shadow-md' : 'text-teal-400 hover:bg-slate-700'}`}
        >
          Theory Exercises
        </button>
      </nav>

      {/* Sub-Navigation Tabs based on Category */}
      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex justify-center space-x-4">
        {activeCategory === 'practical' && (
          <>
            <button
              onClick={() => setActivePracticalTab('metronome')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activePracticalTab === 'metronome' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Metronome
            </button>
            <button
              onClick={() => setActivePracticalTab('note-generator')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activePracticalTab === 'note-generator' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Note Generator
            </button>
            <button
              onClick={() => setActivePracticalTab('drone-player')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activePracticalTab === 'drone-player' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'} opacity-50 cursor-not-allowed`}
              disabled
            >
              Drone Player (Coming Soon)
            </button>
          </>
        )}
        {activeCategory === 'theory' && (
          <>
            <button
              onClick={() => setActiveTheoryTab('intervals-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activeTheoryTab === 'intervals-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Intervals Quiz
            </button>
            <button
              onClick={() => setActiveTheoryTab('name-the-interval-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activeTheoryTab === 'name-the-interval-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Name The Interval Quiz
            </button>
            <button
              onClick={() => setActiveTheoryTab('music-theory-general')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activeTheoryTab === 'music-theory-general' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'} opacity-50 cursor-not-allowed`}
              disabled
            >
              More Theory (Soon)
            </button>
          </>
        )}
      </nav>

      {/* Content Area */}
      <main className="w-full max-w-5xl bg-slate-800 shadow-2xl rounded-xl p-8 transform transition-transform duration-500 ease-out flex-grow">
        {/* Practical Exercises Content */}
        {activeCategory === 'practical' && (
          <>
            {activePracticalTab === 'metronome' && (
              <div className="flex flex-col items-center">
                <SectionHeader title="Metronome" />
                <div className="mb-6">
                  <label htmlFor="bpm" className="block text-gray-200 text-lg font-semibold mb-2">
                    Beats Per Minute (BPM): {bpm}
                  </label>
                  <input
                    type="range"
                    id="bpm"
                    min="40"
                    max="240"
                    step="1"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-80 h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg transition-colors duration-200
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                               [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                               [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                               [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-blue-500
                               [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-none"
                  />
                </div>
                <div className="flex space-x-4 mb-8">
                  <button
                    onClick={isPlaying ? stopMetronome : startMetronome}
                    className={`px-8 py-4 rounded-full text-xl font-bold text-white shadow-lg transform transition-transform duration-200 ease-in-out
                               ${isPlaying ? 'bg-red-600 hover:bg-red-700 active:scale-95' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                  >
                    {isPlaying ? 'Stop Metronome' : 'Start Metronome'}
                  </button>
                </div>
                <div className="flex space-x-3 mt-4">
                  {[1, 2, 3, 4].map((beat) => (
                    <div
                      key={beat}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg
                        ${currentBeat === beat ? 'bg-blue-500 shadow-xl scale-110' : 'bg-gray-600'}
                        transition-all duration-150 ease-out`}
                    >
                      {beat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePracticalTab === 'note-generator' && (
              <div className="flex flex-col items-center">
                <SectionHeader title="Random Note Generator" />
                <div className="mb-6 text-center">
                  <p className="text-5xl font-extrabold text-blue-400 mb-4 h-20 flex items-center justify-center">
                    {lastNote || 'Press Generate'}
                  </p>
                  <div className="flex items-center space-x-4 mb-4">
                    <label htmlFor="octave" className="text-lg font-semibold text-gray-200">Octave:</label>
                    <input
                      type="number"
                      id="octave"
                      min="0"
                      max="8"
                      value={noteOctave}
                      onChange={(e) => setNoteOctave(Number(e.target.value))}
                      className="w-20 p-2 border border-gray-600 rounded-md text-center text-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    />
                  </div>
                  <div className="flex space-x-4 mb-6">
                    <label className="inline-flex items-center text-lg">
                      <input
                        type="radio"
                        value="sharps"
                        checked={sharpsFlats === 'sharps'}
                        onChange={() => setSharpsFlats('sharps')}
                        className="form-radio text-blue-500 h-5 w-5"
                      />
                      <span className="ml-2 text-gray-200">Sharps (#)</span>
                    </label>
                    <label className="inline-flex items-center text-lg">
                      <input
                        type="radio"
                        value="flats"
                        checked={sharpsFlats === 'flats'}
                        onChange={() => setSharpsFlats('flats')}
                        className="form-radio text-blue-500 h-5 w-5"
                      />
                      <span className="ml-2 text-gray-200">Flats (b)</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={generateRandomNote}
                  className="px-8 py-4 rounded-full text-xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg transform transition-transform duration-200 ease-in-out active:scale-95"
                >
                  Generate Note
                </button>
              </div>
            )}

            {activePracticalTab === 'drone-player' && (
              <div className="text-center p-10">
                <p className="text-xl text-gray-400">
                  Drone Player is coming soon!
                </p>
              </div>
            )}
          </>
        )}

        {/* Theory Exercises Content */}
        {activeCategory === 'theory' && (
          <>
            {activeTheoryTab === 'intervals-quiz' && (
              <div className="flex flex-col items-center w-full">
                <SectionHeader title="Intervals Quiz" />
                <IntervalsQuizFrame />
              </div>
            )}
            {activeTheoryTab === 'name-the-interval-quiz' && (
              <div className="flex flex-col items-center w-full">
                <SectionHeader title="Name The Interval Quiz" />
                <NameTheIntervalQuizFrame />
              </div>
            )}
            {activeTheoryTab === 'music-theory-general' && (
              <div className="text-center p-10">
                <p className="text-xl text-gray-400">
                  More music theory exercises are coming soon!
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-400 text-sm">
        <p>&copy; 2024 Musical Practice Tools. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
