// Main Application Logic for QuizZone
document.addEventListener('DOMContentLoaded', initApp);

// Global state for the application
const appState = {
    selectedTheme: null,
    difficulty: 'medium',
    questionCount: 10,
    players: [],
    currentQuiz: null,
    currentQuestionIndex: 0,
    currentPlayerIndex: 0,
    playerAnswers: {}, // Object to store each player's answer for current question
    answersChecked: false, // Flag to track if answers have been checked
    scores: {}
};

// DOM elements
const elements = {
    // Screens
    homeScreen: document.getElementById('home-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),
    
    // Home Screen Elements
    themeButtons: document.querySelectorAll('.theme-btn'),
    difficultySelect: document.getElementById('difficulty'),
    questionCountSelect: document.getElementById('question-count'),
    playersList: document.getElementById('players-list'),
    newPlayerName: document.getElementById('new-player-name'),
    addPlayerBtn: document.getElementById('add-player-btn'),
    startQuizBtn: document.getElementById('start-quiz-btn'),
    
    // Quiz Screen Elements
    backToHomeBtn: document.getElementById('back-to-home'),
    currentQuestionEl: document.getElementById('current-question'),
    totalQuestionsEl: document.getElementById('total-questions'),
    progressFill: document.querySelector('.quiz-progress-fill'),
    questionText: document.getElementById('question-text'),
    answerOptions: document.getElementById('answer-options'),
    playerAnswersContainer: document.getElementById('player-answers-container'),
    scoreboard: document.getElementById('scoreboard'),
    nextQuestionBtn: document.getElementById('next-question-btn'),
    checkAnswersBtn: document.getElementById('check-answers-btn'),
    
    // Results Screen Elements
    winnerName: document.getElementById('winner-name'),
    firstPlaceName: document.getElementById('first-place-name'),
    firstPlaceScore: document.getElementById('first-place-score'),
    secondPlaceName: document.getElementById('second-place-name'),
    secondPlaceScore: document.getElementById('second-place-score'),
    thirdPlaceName: document.getElementById('third-place-name'),
    thirdPlaceScore: document.getElementById('third-place-score'),
    fullResults: document.getElementById('full-results'),
    playAgainBtn: document.getElementById('play-again-btn'),
    homeBtn: document.getElementById('home-btn'),
    confettiContainer: document.getElementById('confetti-container')
};

// Initialize the application
function initApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize the start quiz button state
    updateStartQuizState();
    
    // Load any saved state from storage
    const savedState = storageManager.loadAppState();
    if (savedState) {
        // Restore saved state
        appState.players = savedState.players || [];
        appState.scores = savedState.scores || {};
        
        if (savedState.selectedTheme) {
            selectTheme(savedState.selectedTheme);
        }
        
        if (savedState.difficulty) {
            appState.difficulty = savedState.difficulty;
            elements.difficultySelect.value = savedState.difficulty;
        }
        
        if (savedState.questionCount) {
            appState.questionCount = savedState.questionCount;
            elements.questionCountSelect.value = savedState.questionCount;
        }
        
        // Render players list
        renderPlayersList();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Theme selection
    elements.themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectTheme(button.dataset.theme);
        });
    });
    
    // Quiz settings
    elements.difficultySelect.addEventListener('change', () => {
        appState.difficulty = elements.difficultySelect.value;
        storageManager.saveAppState(appState);
    });
    
    elements.questionCountSelect.addEventListener('change', () => {
        appState.questionCount = parseInt(elements.questionCountSelect.value);
        storageManager.saveAppState(appState);
    });
    
    // Player management
    elements.addPlayerBtn.addEventListener('click', addPlayer);
    elements.newPlayerName.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            addPlayer();
        }
    });
    
    // Quiz navigation
    elements.startQuizBtn.addEventListener('click', startQuiz);
    elements.backToHomeBtn.addEventListener('click', () => {
        showScreen(elements.homeScreen);
    });
    elements.nextQuestionBtn.addEventListener('click', showNextQuestion);
    elements.checkAnswersBtn.addEventListener('click', checkAnswers);
    
    // Results screen
    elements.playAgainBtn.addEventListener('click', () => {
        resetQuiz();
        startQuiz();
    });
    elements.homeBtn.addEventListener('click', () => {
        resetQuiz();
        showScreen(elements.homeScreen);
    });
}

// Theme selection handler
function selectTheme(theme) {
    appState.selectedTheme = theme;
    
    // Update UI
    elements.themeButtons.forEach(button => {
        if (button.dataset.theme === theme) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
    
    // Save state
    storageManager.saveAppState(appState);
    
    // Update start button state
    updateStartQuizState();
}

// Player management
function addPlayer() {
    const playerName = elements.newPlayerName.value.trim();
    
    if (playerName) {
        // Add to state
        appState.players.push(playerName);
        appState.scores[playerName] = 0;
        
        // Update UI
        renderPlayersList();
        
        // Clear input
        elements.newPlayerName.value = '';
        
        // Save state
        storageManager.saveAppState(appState);
        
        // Update start button state
        updateStartQuizState();
    }
}

function removePlayer(index) {
    const playerName = appState.players[index];
    
    // Remove from state
    appState.players.splice(index, 1);
    delete appState.scores[playerName];
    
    // Update UI
    renderPlayersList();
    
    // Save state
    storageManager.saveAppState(appState);
    
    // Update start button state
    updateStartQuizState();
}

function renderPlayersList() {
    elements.playersList.innerHTML = '';
    
    appState.players.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <span class="player-name">${player}</span>
            <span class="remove-player" data-index="${index}">
                <i class="fas fa-times"></i>
            </span>
        `;
        elements.playersList.appendChild(playerItem);
        
        // Add event listener to remove button
        playerItem.querySelector('.remove-player').addEventListener('click', () => {
            removePlayer(index);
        });
    });
}

// Update start quiz button state
function updateStartQuizState() {
    const canStart = appState.selectedTheme && appState.players.length > 0;
    elements.startQuizBtn.disabled = !canStart;
}

// Start a new quiz
function startQuiz() {
    // Generate quiz questions
    quizManager.generateQuiz(
        appState.selectedTheme,
        appState.difficulty,
        appState.questionCount,
        quiz => {
            appState.currentQuiz = quiz;
            appState.currentQuestionIndex = 0;
            appState.currentPlayerIndex = 0;
            appState.playerAnswers = {}; // Reset player answers
            appState.answersChecked = false;
            
            // Reset scores
            appState.players.forEach(player => {
                appState.scores[player] = 0;
            });
            
            // Show quiz screen
            showScreen(elements.quizScreen);
            
            // Render first question
            renderCurrentQuestion();
            
            // Update progress
            updateQuizProgress();
            
            // Update scoreboard
            renderScoreboard();
            
            // Render player answer selection
            renderPlayerAnswerSelection();
        }
    );
}

// Show the specified screen
function showScreen(screenToShow) {
    // Hide all screens
    elements.homeScreen.classList.remove('active');
    elements.homeScreen.classList.add('hidden');
    
    elements.quizScreen.classList.remove('active');
    elements.quizScreen.classList.add('hidden');
    
    elements.resultsScreen.classList.remove('active');
    elements.resultsScreen.classList.add('hidden');
    
    // Show the requested screen
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

// Render the current question
function renderCurrentQuestion() {
    // Safety check - make sure we have quizzes loaded
    if (!appState.currentQuiz || appState.currentQuiz.length === 0 || 
        appState.currentQuestionIndex >= appState.currentQuiz.length) {
        console.error('Unable to render question. Quiz not loaded or invalid question index.');
        // Show an error message in the question area
        elements.questionText.textContent = "Error: Could not load question. Please try again.";
        elements.answerOptions.innerHTML = '';
        elements.nextQuestionBtn.classList.remove('hidden');
        return;
    }
    
    const question = appState.currentQuiz[appState.currentQuestionIndex];
    
    // Set question text
    elements.questionText.textContent = question.question;
    
    // Clear answer options
    elements.answerOptions.innerHTML = '';
    
    // Add answer options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.innerHTML = `
            <span class="inline-block w-6 h-6 text-center bg-indigo-100 rounded-full mr-2">${String.fromCharCode(65 + index)}</span>
            ${option}
        `;
        optionElement.dataset.index = index;
        elements.answerOptions.appendChild(optionElement);
    });
    
    // Hide buttons
    elements.nextQuestionBtn.classList.add('hidden');
    elements.checkAnswersBtn.classList.add('hidden');
    
    // Reset player answers for new question
    appState.playerAnswers = {};
    appState.answersChecked = false;
    
    // Reset player answers display
    renderPlayerAnswerSelection();
}

// Render the player answer selection interface
function renderPlayerAnswerSelection() {
    elements.playerAnswersContainer.innerHTML = '';
    
    // Create answer selection for each player
    appState.players.forEach(player => {
        const playerRow = document.createElement('div');
        playerRow.className = 'player-answer-row flex items-center justify-between mb-2 p-3 bg-white rounded-lg shadow-sm';
        
        // Player name
        const nameElement = document.createElement('div');
        nameElement.className = 'player-name font-medium';
        nameElement.textContent = player;
        
        // Answer selection buttons
        const answerButtons = document.createElement('div');
        answerButtons.className = 'answer-buttons flex space-x-2';
        
        const question = appState.currentQuiz[appState.currentQuestionIndex];
        const options = ['A', 'B', 'C', 'D']; // Letter options
        
        // Only show as many options as we have answers
        const numOptions = Math.min(options.length, question.options.length);
        
        for (let i = 0; i < numOptions; i++) {
            const button = document.createElement('button');
            
            // Check if this player has already selected this answer
            const isSelected = appState.playerAnswers[player] === i;
            
            button.className = `w-8 h-8 rounded-full text-sm font-medium ${
                isSelected 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`;
            button.textContent = options[i];
            
            // After answers are checked, style buttons according to correctness
            if (appState.answersChecked) {
                const correctIndex = question.correctIndex;
                if (i === correctIndex) {
                    button.className = 'w-8 h-8 rounded-full text-sm font-medium bg-green-600 text-white';
                } else if (isSelected) {
                    button.className = 'w-8 h-8 rounded-full text-sm font-medium bg-red-600 text-white';
                }
                
                // Disable buttons after checking
                button.disabled = true;
            } else {
                // Add click handler when not checked yet
                button.addEventListener('click', () => selectPlayerAnswer(player, i));
            }
            
            answerButtons.appendChild(button);
        }
        
        playerRow.appendChild(nameElement);
        playerRow.appendChild(answerButtons);
        elements.playerAnswersContainer.appendChild(playerRow);
    });
    
    // Show check answers button if all players have answered
    const allPlayersAnswered = appState.players.every(player => 
        appState.playerAnswers[player] !== undefined
    );
    
    if (allPlayersAnswered && !appState.answersChecked) {
        elements.checkAnswersBtn.classList.remove('hidden');
    } else {
        elements.checkAnswersBtn.classList.add('hidden');
    }
    
    // Show next question button if answers have been checked
    if (appState.answersChecked) {
        elements.nextQuestionBtn.classList.remove('hidden');
    } else {
        elements.nextQuestionBtn.classList.add('hidden');
    }
}

// Handle player answer selection
function selectPlayerAnswer(player, answerIndex) {
    // Store the selected answer
    appState.playerAnswers[player] = answerIndex;
    
    // Update the UI to reflect the selection
    renderPlayerAnswerSelection();
}

// Check all player answers
function checkAnswers() {
    const question = appState.currentQuiz[appState.currentQuestionIndex];
    const correctIndex = question.correctIndex;
    
    // Update scores for correct answers
    appState.players.forEach(player => {
        if (appState.playerAnswers[player] === correctIndex) {
            appState.scores[player]++;
            
            // Animate score update
            animateScoreUpdate(player);
        }
    });
    
    // Mark answers as checked
    appState.answersChecked = true;
    
    // Update scoreboard
    renderScoreboard();
    
    // Update the UI to show correct/incorrect answers
    renderPlayerAnswerSelection();
    
    // Highlight correct answer in the options list
    const answerOptions = elements.answerOptions.querySelectorAll('.answer-option');
    answerOptions.forEach((option, index) => {
        if (index === correctIndex) {
            option.classList.add('correct');
        }
    });
}

// Move to the next question
function showNextQuestion() {
    appState.currentQuestionIndex++;
    
    // Check if quiz is complete
    if (appState.currentQuestionIndex >= appState.currentQuiz.length) {
        showResults();
        return;
    }
    
    // Update progress
    updateQuizProgress();
    
    // Render the next question
    renderCurrentQuestion();
}

// Update quiz progress indicators
function updateQuizProgress() {
    const currentQuestion = appState.currentQuestionIndex + 1;
    const totalQuestions = appState.currentQuiz.length;
    
    elements.currentQuestionEl.textContent = currentQuestion;
    elements.totalQuestionsEl.textContent = totalQuestions;
    
    const progressPercent = (currentQuestion / totalQuestions) * 100;
    elements.progressFill.style.width = `${progressPercent}%`;
}

// Render the scoreboard
function renderScoreboard() {
    elements.scoreboard.innerHTML = '';
    
    // Create sorted player list by score
    const sortedPlayers = [...appState.players].sort((a, b) => {
        return appState.scores[b] - appState.scores[a];
    });
    
    sortedPlayers.forEach(player => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <span class="player-name">${player}</span>
            <span class="player-score" data-player="${player}">${appState.scores[player]} poeng</span>
        `;
        
        elements.scoreboard.appendChild(scoreItem);
    });
}

// Animate a score update
function animateScoreUpdate(playerName) {
    const scoreElement = elements.scoreboard.querySelector(`.player-score[data-player="${playerName}"]`);
    if (scoreElement) {
        scoreElement.classList.add('score-updated');
        setTimeout(() => {
            scoreElement.classList.remove('score-updated');
        }, 500);
    }
}

// Show the results screen
function showResults() {
    // Calculate results
    const sortedPlayers = scoreManager.calculateResults(appState.players, appState.scores);
    
    // Update UI with results
    if (sortedPlayers.length > 0) {
        elements.winnerName.textContent = sortedPlayers[0].name;
        elements.firstPlaceName.textContent = sortedPlayers[0].name;
        elements.firstPlaceScore.textContent = `${sortedPlayers[0].score} poeng`;
    }
    
    if (sortedPlayers.length > 1) {
        elements.secondPlaceName.textContent = sortedPlayers[1].name;
        elements.secondPlaceScore.textContent = `${sortedPlayers[1].score} poeng`;
    } else {
        elements.secondPlaceName.textContent = "—";
        elements.secondPlaceScore.textContent = "0 poeng";
    }
    
    if (sortedPlayers.length > 2) {
        elements.thirdPlaceName.textContent = sortedPlayers[2].name;
        elements.thirdPlaceScore.textContent = `${sortedPlayers[2].score} poeng`;
    } else {
        elements.thirdPlaceName.textContent = "—";
        elements.thirdPlaceScore.textContent = "0 poeng";
    }
    
    // Render full results
    elements.fullResults.innerHTML = '';
    
    sortedPlayers.forEach((player, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `flex justify-between items-center p-3 ${index < sortedPlayers.length - 1 ? 'border-b border-gray-200' : ''} ${index === 0 ? 'bg-indigo-50 rounded-md' : ''}`;
        resultItem.innerHTML = `
            <div class="flex items-center">
                <span class="font-bold mr-3">${player.position}.</span>
                <span class="${index === 0 ? 'font-bold text-indigo-600' : ''}">${player.name}</span>
            </div>
            <div class="font-semibold">${player.score} poeng</div>
        `;
        
        elements.fullResults.appendChild(resultItem);
    });
    
    // Show results screen
    showScreen(elements.resultsScreen);
    
    // Create confetti animation
    animations.createConfetti(elements.confettiContainer);
    
    // Trigger results animations
    setTimeout(() => {
        document.querySelector('.trophy-animation').classList.add('show-trophy');
        
        setTimeout(() => {
            document.querySelector('.victory-title').classList.add('show-title');
            
            setTimeout(() => {
                document.querySelector('.podium-container').classList.add('show-podium');
                
                setTimeout(() => {
                    document.querySelector('.results-list').classList.add('show-results');
                    
                    setTimeout(() => {
                        document.querySelector('.action-buttons').classList.add('show-buttons');
                    }, 300);
                }, 300);
            }, 300);
        }, 300);
    }, 500);
}

// Reset the quiz state
function resetQuiz() {
    appState.currentQuiz = null;
    appState.currentQuestionIndex = 0;
    appState.currentPlayerIndex = 0;
    appState.playerAnswers = {};
    appState.answersChecked = false;
    
    // Reset scores
    appState.players.forEach(player => {
        appState.scores[player] = 0;
    });
    
    // Reset animations
    document.querySelector('.trophy-animation').classList.remove('show-trophy');
    document.querySelector('.victory-title').classList.remove('show-title');
    document.querySelector('.podium-container').classList.remove('show-podium');
    document.querySelector('.results-list').classList.remove('show-results');
    document.querySelector('.action-buttons').classList.remove('show-buttons');
    
    // Clear confetti
    elements.confettiContainer.innerHTML = '';
}