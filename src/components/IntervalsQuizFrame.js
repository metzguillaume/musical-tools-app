import React from 'react';

const IntervalsQuizFrame = () => (
  <div className="w-full h-[80vh] flex justify-center items-center">
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

export default IntervalsQuizFrame;
