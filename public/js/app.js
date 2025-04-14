// Main Application Logic for QuizZone
"use strict";

// Initialize the app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already ready, initialize immediately
    initApp();
}

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

// DOM elements cache
let elements = {};

// Ensure quizManager is available
function ensureQuizManager() {
    if (typeof window.quizManager === 'undefined') {
        console.warn('quizManager not found in window. Checking for global quizManager...');
        
        if (typeof quizManager === 'undefined') {
            console.error('quizManager not found. Creating a fallback implementation.');
            
            // Create a fallback quizManager with minimal implementation
            window.quizManager = {
                questionDatabases: {
                    easter: [], general: [], movies: [], sports: [], kids: []
                },
                loadQuestionDatabases: function(callback) {
                    console.warn('Using fallback loadQuestionDatabases function');
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                },
                generateQuiz: function(theme, difficulty, count, callback) {
                    console.warn('Using fallback generateQuiz function');
                    // Generate some dummy questions as a fallback
                    const dummyQuestions = [
                        {
                            question: "This is a sample question as the quiz manager failed to load properly.",
                            options: ["Answer A", "Answer B", "Answer C", "Answer D"],
                            correctIndex: 0,
                            category: "General",
                            difficulty: "medium"
                        }
                    ];
                    
                    if (callback && typeof callback === 'function') {
                        callback(dummyQuestions);
                    }
                    return dummyQuestions;
                },
                shuffleArray: function(array) {
                    return [...array].sort(() => Math.random() - 0.5);
                }
            };
        } else {
            // If quizManager exists but not in window, add it to window
            window.quizManager = quizManager;
        }
    }
    
    return window.quizManager;
}

// Initialize the application
function initApp() {
    // Cache all DOM elements for better performance
    cacheElements();
    
    // Ensure quizManager is available
    ensureQuizManager();
    
    // Set up event listeners with delegated events where possible
    setupEventListeners();
    
    // Initialize the start quiz button state
    updateStartQuizState();
    
    // Load any saved state from storage
    loadSavedState();
    
    // Load question databases in the background with a small delay
    setTimeout(() => {
        window.quizManager.loadQuestionDatabases(() => {
            console.log('Question databases loaded successfully.');
        });
    }, 1000);
}

// Cache DOM elements for better performance
function cacheElements() {
    // Use a more efficient query selector method
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    
    elements = {
        // Screens
        homeScreen: $('#home-screen'),
        quizScreen: $('#quiz-screen'),
        resultsScreen: $('#results-screen'),
        
        // Home Screen Elements
        themeButtons: $$('.theme-btn'),
        difficultySelect: $('#difficulty'),
        questionCountSelect: $('#question-count'),
        playersList: $('#players-list'),
        newPlayerName: $('#new-player-name'),
        addPlayerBtn: $('#add-player-btn'),
        startQuizBtn: $('#start-quiz-btn'),
        
        // Quiz Screen Elements
        backToHomeBtn: $('#back-to-home'),
        currentQuestionEl: $('#current-question'),
        totalQuestionsEl: $('#total-questions'),
        progressFill: $('.quiz-progress-fill'),
        questionText: $('#question-text'),
        answerOptions: $('#answer-options'),
        playerAnswersContainer: $('#player-answers-container'),
        scoreboard: $('#scoreboard'),
        nextQuestionBtn: $('#next-question-btn'),
        checkAnswersBtn: $('#check-answers-btn'),
        
        // Results Screen Elements
        winnerName: $('#winner-name'),
        firstPlaceName: $('#first-place-name'),
        firstPlaceScore: $('#first-place-score'),
        secondPlaceName: $('#second-place-name'),
        secondPlaceScore: $('#second-place-score'),
        thirdPlaceName: $('#third-place-name'),
        thirdPlaceScore: $('#third-place-score'),
        fullResults: $('#full-results'),
        playAgainBtn: $('#play-again-btn'),
        homeBtn: $('#home-btn'),
        confettiContainer: $('#confetti-container')
    };
}

// Load saved state from storage
function loadSavedState() {
    // Make sure storageManager is available
    if (typeof storageManager !== 'undefined') {
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
}

// Set up all event listeners - use event delegation where possible
function setupEventListeners() {
    // Theme selection
    const themeContainer = elements.themeButtons[0].parentNode;
    themeContainer.addEventListener('click', (e) => {
        const themeButton = e.target.closest('.theme-btn');
        if (themeButton) {
            selectTheme(themeButton.dataset.theme);
        }
    });
    
    // Quiz settings
    elements.difficultySelect.addEventListener('change', () => {
        appState.difficulty = elements.difficultySelect.value;
        if (typeof storageManager !== 'undefined') {
            storageManager.saveAppState(appState);
        }
    });
    
    elements.questionCountSelect.addEventListener('change', () => {
        appState.questionCount = parseInt(elements.questionCountSelect.value);
        if (typeof storageManager !== 'undefined') {
            storageManager.saveAppState(appState);
        }
    });
    
    // Player management with delegated events
    elements.addPlayerBtn.addEventListener('click', addPlayer);
    elements.newPlayerName.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            addPlayer();
        }
    });
    
    // Use event delegation for player removal
    elements.playersList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-player');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index);
            if (!isNaN(index)) {
                removePlayer(index);
            }
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
    
    // Delegated event for answer options
    elements.answerOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.answer-option');
        if (option && !appState.answersChecked) {
            // Handle answer selection
            const index = parseInt(option.dataset.index);
            if (!isNaN(index)) {
                selectCurrentPlayerAnswer(index);
            }
        }
    });
}

// Theme selection handler
function selectTheme(theme) {
    appState.selectedTheme = theme;
    
    // Update UI efficiently with classList
    elements.themeButtons.forEach(button => {
        button.classList.toggle('selected', button.dataset.theme === theme);
    });
    
    // Save state if storage is available
    if (typeof storageManager !== 'undefined') {
        storageManager.saveAppState(appState);
    }
    
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
        
        // Update UI using DocumentFragment for better performance
        renderPlayersList();
        
        // Clear input
        elements.newPlayerName.value = '';
        
        // Save state if storage is available
        if (typeof storageManager !== 'undefined') {
            storageManager.saveAppState(appState);
        }
        
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
    
    // Save state if storage is available
    if (typeof storageManager !== 'undefined') {
        storageManager.saveAppState(appState);
    }
    
    // Update start button state
    updateStartQuizState();
}

// Use DocumentFragment for better performance when rendering lists
function renderPlayersList() {
    // Create a document fragment (doesn't cause reflow until appended)
    const fragment = document.createDocumentFragment();
    
    appState.players.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <span class="player-name">${player}</span>
            <span class="remove-player" data-index="${index}" role="button" aria-label="Remove ${player}">
                <i class="fas fa-times" aria-hidden="true"></i>
            </span>
        `;
        fragment.appendChild(playerItem);
    });
    
    // Clear existing content and append fragment (single reflow)
    elements.playersList.innerHTML = '';
    elements.playersList.appendChild(fragment);
}

// Update start quiz button state
function updateStartQuizState() {
    const canStart = appState.selectedTheme && appState.players.length > 0;
    elements.startQuizBtn.disabled = !canStart;
    
    // Add visual indication
    elements.startQuizBtn.classList.toggle('opacity-50', !canStart);
    elements.startQuizBtn.classList.toggle('cursor-not-allowed', !canStart);
}

// Start a new quiz
function startQuiz() {
    // Show loading state
    elements.startQuizBtn.textContent = 'Laster...';
    elements.startQuizBtn.disabled = true;
    
    // Make sure quizManager is available
    const quizManagerInstance = ensureQuizManager();
    
    // Use requestAnimationFrame to prevent blocking UI
    requestAnimationFrame(() => {
        // Generate quiz questions
        quizManagerInstance.generateQuiz(
            appState.selectedTheme,
            appState.difficulty,
            appState.questionCount,
            quiz => {
                if (!quiz || quiz.length === 0) {
                    console.error('No questions were returned from the quiz generator');
                    alert('Failed to load quiz questions. Please try again or choose a different theme.');
                    elements.startQuizBtn.textContent = 'Start Quiz';
                    elements.startQuizBtn.disabled = false;
                    return;
                }
                
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
                
                // Reset button text
                elements.startQuizBtn.textContent = 'Start Quiz';
                elements.startQuizBtn.disabled = false;
            }
        );
    });
}

// Show the specified screen
function showScreen(screenToShow) {
    // Hide all screens
    [elements.homeScreen, elements.quizScreen, elements.resultsScreen].forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    screenToShow.classList.remove('hidden');
    
    // Use requestAnimationFrame to ensure proper transition
    requestAnimationFrame(() => {
        screenToShow.classList.add('active');
    });
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
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Add answer options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.setAttribute('role', 'button');
        optionElement.setAttribute('tabindex', '0');
        optionElement.innerHTML = `
            <span class="inline-block w-6 h-6 text-center bg-indigo-100 rounded-full mr-2">${String.fromCharCode(65 + index)}</span>
            ${option}
        `;
        optionElement.dataset.index = index;
        fragment.appendChild(optionElement);
    });
    
    // Clear and append in a single operation
    elements.answerOptions.innerHTML = '';
    elements.answerOptions.appendChild(fragment);
    
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
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
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
            button.setAttribute('aria-label', `${player} velger svar ${options[i]}`);
            
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
                // Add data attributes for delegated event handling
                button.dataset.player = player;
                button.dataset.answerIndex = i;
            }
            
            answerButtons.appendChild(button);
        }
        
        playerRow.appendChild(nameElement);
        playerRow.appendChild(answerButtons);
        fragment.appendChild(playerRow);
    });
    
    // Replace content in a single operation
    elements.playerAnswersContainer.innerHTML = '';
    elements.playerAnswersContainer.appendChild(fragment);
    
    // Add delegated event listener for answer buttons
    elements.playerAnswersContainer.addEventListener('click', handleAnswerButtonClick);
    
    // Show check answers button if all players have answered
    const allPlayersAnswered = appState.players.every(player => 
        appState.playerAnswers[player] !== undefined
    );
    
    elements.checkAnswersBtn.classList.toggle('hidden', !allPlayersAnswered || appState.answersChecked);
    elements.nextQuestionBtn.classList.toggle('hidden', !appState.answersChecked);
}

// Handle answer button clicks via event delegation
function handleAnswerButtonClick(e) {
    const button = e.target.closest('button');
    if (button && !appState.answersChecked && button.dataset.player && button.dataset.answerIndex) {
        const player = button.dataset.player;
        const answerIndex = parseInt(button.dataset.answerIndex);
        
        if (!isNaN(answerIndex)) {
            selectPlayerAnswer(player, answerIndex);
        }
    }
}

// Handle player answer selection
function selectPlayerAnswer(player, answerIndex) {
    // Store the selected answer
    appState.playerAnswers[player] = answerIndex;
    
    // Update the UI to reflect the selection
    renderPlayerAnswerSelection();
}

// For direct answer selection (used when clicking on answer options)
function selectCurrentPlayerAnswer(answerIndex) {
    // Get the current player in rotation
    const currentPlayer = appState.players[appState.currentPlayerIndex];
    
    // Store answer
    selectPlayerAnswer(currentPlayer, answerIndex);
    
    // Move to next player if needed
    appState.currentPlayerIndex = (appState.currentPlayerIndex + 1) % appState.players.length;
}

// Check all player answers
function checkAnswers() {
    if (!appState.currentQuiz || !appState.currentQuiz[appState.currentQuestionIndex]) {
        console.error('Cannot check answers: quiz data is missing');
        return;
    }
    
    const question = appState.currentQuiz[appState.currentQuestionIndex];
    const correctIndex = question.correctIndex;
    
    // Update scores for correct answers
    appState.players.forEach(player => {
        if (appState.playerAnswers[player] === correctIndex) {
            appState.scores[player]++;
            
            // Animate score update
            requestAnimationFrame(() => {
                animateScoreUpdate(player);
            });
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
            option.setAttribute('aria-label', 'Correct answer');
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
    
    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
        elements.progressFill.style.width = `${progressPercent}%`;
    });
}

// Render the scoreboard
function renderScoreboard() {
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
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
        
        fragment.appendChild(scoreItem);
    });
    
    // Replace content in a single operation
    elements.scoreboard.innerHTML = '';
    elements.scoreboard.appendChild(fragment);
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
    // Ensure scoreManager is available
    if (typeof scoreManager === 'undefined' || !scoreManager.calculateResults) {
        console.error('scoreManager not found or missing calculateResults method');
        
        // Create a fallback score calculation
        const calculateResults = function(players, scores) {
            const playerResults = players.map(player => {
                return {
                    name: player,
                    score: scores[player] || 0
                };
            });
            
            // Sort by score (highest first)
            playerResults.sort((a, b) => b.score - a.score);
            
            // Assign positions (handling ties)
            let currentPosition = 1;
            let previousScore = null;
            let skipPositions = 0;
            
            playerResults.forEach((player, index) => {
                if (index === 0) {
                    // First player is always position 1
                    player.position = 1;
                    previousScore = player.score;
                } else {
                    // Check if tied with previous player
                    if (player.score === previousScore) {
                        player.position = currentPosition;
                        skipPositions++;
                    } else {
                        // Skip positions for ties
                        currentPosition += skipPositions + 1;
                        player.position = currentPosition;
                        skipPositions = 0;
                    }
                    previousScore = player.score;
                }
            });
            
            return playerResults;
        };
        
        // Use the fallback function
        var sortedPlayers = calculateResults(appState.players, appState.scores);
    } else {
        // Use the actual scoreManager
        var sortedPlayers = scoreManager.calculateResults(appState.players, appState.scores);
    }
    
    // Show results screen first to start transition
    showScreen(elements.resultsScreen);
    
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
    
    // Render full results with DocumentFragment
    const fragment = document.createDocumentFragment();
    
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
        
        fragment.appendChild(resultItem);
    });
    
    elements.fullResults.innerHTML = '';
    elements.fullResults.appendChild(fragment);
    
    // Create confetti with animation effects
    createConfettiEffect();
    
    // Trigger results animations with staggered timing
    animateResultsElements();
    
    // Save quiz history if storage manager is available
    if (typeof scoreManager !== 'undefined' && typeof scoreManager.saveQuizResult === 'function') {
        try {
            scoreManager.saveQuizResult(
                appState.selectedTheme, 
                appState.difficulty, 
                appState.questionCount,
                sortedPlayers
            );
        } catch (e) {
            console.warn('Failed to save quiz result:', e);
        }
    }
}

// Create confetti effect for results screen
function createConfettiEffect() {
    // Check if animations module is available
    if (typeof animations !== 'undefined' && animations.createConfetti) {
        // Create confetti animation
        animations.createConfetti(elements.confettiContainer);
    } else {
        console.warn('Animations module not found or missing createConfetti method');
        // Basic fallback for confetti
        createBasicConfetti();
    }
}

// Animate results screen elements with staggered timing
function animateResultsElements() {
    const animationSequence = [
        { selector: '.trophy-animation', className: 'show-trophy', delay: 500 },
        { selector: '.victory-title', className: 'show-title', delay: 800 },
        { selector: '.podium-container', className: 'show-podium', delay: 1100 },
        { selector: '.results-list', className: 'show-results', delay: 1400 },
        { selector: '.action-buttons', className: 'show-buttons', delay: 1700 }
    ];
    
    // Execute each animation in sequence
    animationSequence.forEach(item => {
        setTimeout(() => {
            const element = document.querySelector(item.selector);
            if (element) element.classList.add(item.className);
        }, item.delay);
    });
}

// Basic fallback for confetti if animations module is missing
function createBasicConfetti() {
    const confettiContainer = elements.confettiContainer;
    if (!confettiContainer) return;
    
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        const leftPos = Math.random() * 100;
        const animationDelay = Math.random() * 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        piece.style.left = `${leftPos}%`;
        piece.style.backgroundColor = color;
        piece.style.width = `${Math.random() * 10 + 5}px`;
        piece.style.height = `${Math.random() * 15 + 5}px`;
        piece.style.animationDelay = `${animationDelay}s`;
        
        fragment.appendChild(piece);
    }
    
    confettiContainer.appendChild(fragment);
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
    
    // Reset animations by removing classes
    const animationElements = [
        { selector: '.trophy-animation', className: 'show-trophy' },
        { selector: '.victory-title', className: 'show-title' },
        { selector: '.podium-container', className: 'show-podium' },
        { selector: '.results-list', className: 'show-results' },
        { selector: '.action-buttons', className: 'show-buttons' }
    ];
    
    animationElements.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) element.classList.remove(item.className);
    });
    
    // Clear confetti
    if (elements.confettiContainer) {
        elements.confettiContainer.innerHTML = '';
    }
}