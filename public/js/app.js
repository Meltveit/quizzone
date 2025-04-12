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
    selectedAnswerIndex: null,
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
    currentPlayerName: document.getElementById('current-player-name'),
    scoreboard: document.getElementById('scoreboard'),
    nextQuestionBtn: document.getElementById('next-question-btn'),
    
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
    const question = appState.currentQuiz[appState.currentQuestionIndex];
    
    // Set question text
    elements.questionText.textContent = question.question;
    
    // Clear answer options
    elements.answerOptions.innerHTML = '';
    
    // Add answer options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('button');
        optionElement.className = 'answer-option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        
        optionElement.addEventListener('click', () => selectAnswer(index));
        
        elements.answerOptions.appendChild(optionElement);
    });
    
    // Update current player
    elements.currentPlayerName.textContent = appState.players[appState.currentPlayerIndex];
    
    // Hide next question button
    elements.nextQuestionBtn.classList.add('hidden');
    
    // Reset selected answer
    appState.selectedAnswerIndex = null;
}

// Handle answer selection
function selectAnswer(index) {
    // Store the selected answer
    appState.selectedAnswerIndex = index;
    
    // Get the current question
    const question = appState.currentQuiz[appState.currentQuestionIndex];
    const correctIndex = question.correctIndex;
    
    // Update UI to show correct/incorrect
    const answerOptions = elements.answerOptions.querySelectorAll('.answer-option');
    
    answerOptions.forEach((option, i) => {
        // Add selected class to the clicked option
        if (i === index) {
            option.classList.add('selected');
        }
        
        // Disable all options
        option.disabled = true;
        
        // Add correct/incorrect classes
        if (i === correctIndex) {
            option.classList.add('correct');
        } else if (i === index && i !== correctIndex) {
            option.classList.add('incorrect');
        }
    });
    
    // Update score if correct
    if (index === correctIndex) {
        const currentPlayer = appState.players[appState.currentPlayerIndex];
        appState.scores[currentPlayer]++;
        
        // Animate score update
        animateScoreUpdate(currentPlayer);
        
        // Update scoreboard
        renderScoreboard();
    }
    
    // Show next question button
    elements.nextQuestionBtn.classList.remove('hidden');
}

// Move to the next question or player
function showNextQuestion() {
    // Increment player index
    appState.currentPlayerIndex = (appState.currentPlayerIndex + 1) % appState.players.length;
    
    // If we've gone through all players, move to next question
    if (appState.currentPlayerIndex === 0) {
        appState.currentQuestionIndex++;
        
        // Check if quiz is complete
        if (appState.currentQuestionIndex >= appState.currentQuiz.length) {
            showResults();
            return;
        }
        
        // Update progress
        updateQuizProgress();
    }
    
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
                <span class="font-bold mr-3">${index+1}.</span>
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
    appState.selectedAnswerIndex = null;
    
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