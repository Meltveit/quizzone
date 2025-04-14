(function() {
    "use strict";

    // Global state for the application
    const appState = {
        selectedTheme: null,
        difficulty: 'medium',
        questionCount: 10,
        players: [],
        currentQuiz: null,
        currentQuestionIndex: 0,
        currentPlayerIndex: 0,
        playerAnswers: {},
        answersChecked: false,
        scores: {},
        isLoading: false
    };

    // DOM elements cache
    let elements = {};

    // Initialize the app when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // Initialize the application
    function initApp() {
        cacheElements();
        setupEventListeners();
        updateStartQuizState();
        loadSavedState();
    }

    // Cache DOM elements for better performance
    function cacheElements() {
        const $ = document.querySelector.bind(document);
        const $$ = document.querySelectorAll.bind(document);

        elements = {
            homeScreen: $('#home-screen'),
            quizScreen: $('#quiz-screen'),
            resultsScreen: $('#results-screen'),
            themeButtons: $$('.theme-btn'),
            difficultySelect: $('#difficulty'),
            questionCountSelect: $('#question-count'),
            playersList: $('#players-list'),
            newPlayerName: $('#new-player-name'),
            addPlayerBtn: $('#add-player-btn'),
            startQuizBtn: $('#start-quiz-btn'),
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
            confettiContainer: $('#confetti-container'),
            loadingIndicator: $('#loading-indicator')
        };
    }

    // Load saved state from storage
    function loadSavedState() {
        if (typeof storageManager !== 'undefined') {
            const savedState = storageManager.loadAppState();
            if (savedState) {
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
                
                renderPlayersList();
            }
        }
    }

    // Set up all event listeners
    function setupEventListeners() {
        const themeContainer = elements.themeButtons[0]?.parentNode;
        if (themeContainer) {
            themeContainer.addEventListener('click', (e) => {
                const themeButton = e.target.closest('.theme-btn');
                if (themeButton) {
                    selectTheme(themeButton.dataset.theme);
                }
            });
        }
        
        if (elements.difficultySelect) {
            elements.difficultySelect.addEventListener('change', () => {
                appState.difficulty = elements.difficultySelect.value;
                if (typeof storageManager !== 'undefined') {
                    storageManager.saveAppState(appState);
                }
            });
        }
        
        if (elements.questionCountSelect) {
            elements.questionCountSelect.addEventListener('change', () => {
                appState.questionCount = parseInt(elements.questionCountSelect.value);
                if (typeof storageManager !== 'undefined') {
                    storageManager.saveAppState(appState);
                }
            });
        }
        
        if (elements.addPlayerBtn) {
            elements.addPlayerBtn.addEventListener('click', addPlayer);
        }
        
        if (elements.newPlayerName) {
            elements.newPlayerName.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                    addPlayer();
                }
            });
        }
        
        if (elements.playersList) {
            elements.playersList.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.remove-player');
                if (removeBtn) {
                    const index = parseInt(removeBtn.dataset.index);
                    if (!isNaN(index)) {
                        removePlayer(index);
                    }
                }
            });
        }
        
        if (elements.startQuizBtn) {
            elements.startQuizBtn.addEventListener('click', startQuiz);
        }
        
        if (elements.backToHomeBtn) {
            elements.backToHomeBtn.addEventListener('click', () => {
                showScreen(elements.homeScreen);
            });
        }
        
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.addEventListener('click', showNextQuestion);
        }
        
        if (elements.checkAnswersBtn) {
            elements.checkAnswersBtn.addEventListener('click', checkAnswers);
        }
        
        if (elements.playAgainBtn) {
            elements.playAgainBtn.addEventListener('click', () => {
                resetQuiz();
                startQuiz();
            });
        }
        
        if (elements.homeBtn) {
            elements.homeBtn.addEventListener('click', () => {
                resetQuiz();
                showScreen(elements.homeScreen);
            });
        }
        
        if (elements.answerOptions) {
            elements.answerOptions.addEventListener('click', (e) => {
                const option = e.target.closest('.answer-option');
                if (option && !appState.answersChecked) {
                    const index = parseInt(option.dataset.index);
                    if (!isNaN(index)) {
                        selectCurrentPlayerAnswer(index);
                    }
                }
            });
        }
    }

    // Theme selection handler
    function selectTheme(theme) {
        appState.selectedTheme = theme;
        
        elements.themeButtons.forEach(button => {
            button.classList.toggle('selected', button.dataset.theme === theme);
        });
        
        if (typeof storageManager !== 'undefined') {
            storageManager.saveAppState(appState);
        }
        
        updateStartQuizState();
    }

    // Player management
    function addPlayer() {
        const playerName = elements.newPlayerName?.value.trim();
        
        if (playerName) {
            appState.players.push(playerName);
            appState.scores[playerName] = 0;
            
            renderPlayersList();
            
            if (elements.newPlayerName) {
                elements.newPlayerName.value = '';
            }
            
            if (typeof storageManager !== 'undefined') {
                storageManager.saveAppState(appState);
            }
            
            updateStartQuizState();
        }
    }

    function removePlayer(index) {
        const playerName = appState.players[index];
        
        appState.players.splice(index, 1);
        delete appState.scores[playerName];
        
        renderPlayersList();
        
        if (typeof storageManager !== 'undefined') {
            storageManager.saveAppState(appState);
        }
        
        updateStartQuizState();
    }

    function renderPlayersList() {
        if (!elements.playersList) return;
        
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
        
        elements.playersList.innerHTML = '';
        elements.playersList.appendChild(fragment);
    }

    // Update start quiz button state
    function updateStartQuizState() {
        const canStart = appState.selectedTheme && appState.players.length > 0 && !appState.isLoading;
        if (elements.startQuizBtn) {
            elements.startQuizBtn.disabled = !canStart;
            elements.startQuizBtn.classList.toggle('opacity-50', !canStart);
            elements.startQuizBtn.classList.toggle('cursor-not-allowed', !canStart);
        }
    }

    function showLoadingState(isLoading) {
        appState.isLoading = isLoading;
        updateStartQuizState();
        
        if (elements.startQuizBtn) {
            elements.startQuizBtn.textContent = isLoading ? 'Laster...' : 'Start Quiz';
            elements.startQuizBtn.disabled = isLoading;
        }
        
        if (elements.loadingIndicator) {
            elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        }
    }

    async function startQuiz() {
        showLoadingState(true);
        
        try {
            if (!window.quizManager) {
                throw new Error('Quiz manager not found');
            }
            
            const quiz = await window.quizManager.generateQuiz(
                appState.selectedTheme,
                appState.difficulty,
                appState.questionCount
            );
            
            if (!quiz || quiz.length === 0) {
                throw new Error('No questions were returned from the quiz generator');
            }
            
            appState.currentQuiz = quiz;
            appState.currentQuestionIndex = 0;
            appState.currentPlayerIndex = 0;
            appState.playerAnswers = {};
            appState.answersChecked = false;
            
            appState.players.forEach(player => {
                appState.scores[player] = 0;
            });
            
            showScreen(elements.quizScreen);
            
            renderCurrentQuestion();
            updateQuizProgress();
            renderScoreboard();
            renderPlayerAnswerSelection();
        } catch (error) {
            console.error('Failed to start quiz:', error);
            alert('Failed to load quiz questions. Please try again or choose a different theme.');
        } finally {
            showLoadingState(false);
        }
    }

    function showScreen(screenToShow) {
        if (!screenToShow) return;
        
        [elements.homeScreen, elements.quizScreen, elements.resultsScreen].forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
                screen.classList.remove('active');
            }
        });
        
        screenToShow.classList.remove('hidden');
        
        requestAnimationFrame(() => {
            screenToShow.classList.add('active');
        });
    }

    function renderCurrentQuestion() {
        if (!appState.currentQuiz || appState.currentQuiz.length === 0 || 
            appState.currentQuestionIndex >= appState.currentQuiz.length) {
            console.error('Unable to render question. Quiz not loaded or invalid question index.');
            if (elements.questionText) {
                elements.questionText.textContent = "Error: Could not load question. Please try again.";
            }
            if (elements.answerOptions) {
                elements.answerOptions.innerHTML = '';
            }
            return;
        }
        
        const question = appState.currentQuiz[appState.currentQuestionIndex];
        
        if (elements.questionText) {
            elements.questionText.textContent = question.question;
        }
        
        const fragment = document.createDocumentFragment();
        
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
        
        if (elements.answerOptions) {
            elements.answerOptions.innerHTML = '';
            elements.answerOptions.appendChild(fragment);
        }
        
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.classList.add('hidden');
        }
        if (elements.checkAnswersBtn) {
            elements.checkAnswersBtn.classList.add('hidden');
        }
        
        appState.playerAnswers = {};
        appState.answersChecked = false;
        
        renderPlayerAnswerSelection();
    }

    function renderPlayerAnswerSelection() {
        if (!elements.playerAnswersContainer) return;
        
        const fragment = document.createDocumentFragment();
        
        appState.players.forEach(player => {
            const playerRow = document.createElement('div');
            playerRow.className = 'player-answer-row flex items-center justify-between mb-2 p-3 bg-white rounded-lg shadow-sm';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'player-name font-medium';
            nameElement.textContent = player;
            
            if (appState.players[appState.currentPlayerIndex] === player && !appState.answersChecked) {
                nameElement.classList.add('current-player');
            }
            
            const answerButtons = document.createElement('div');
            answerButtons.className = 'answer-buttons flex space-x-2';
            
            const question = appState.currentQuiz[appState.currentQuestionIndex];
            const options = ['A', 'B', 'C', 'D'];
            
            const numOptions = Math.min(options.length, question.options.length);
            
            for (let i = 0; i < numOptions; i++) {
                const button = document.createElement('button');
                
                const isSelected = appState.playerAnswers[player] === i;
                
                button.className = `w-8 h-8 rounded-full text-sm font-medium ${
                    isSelected 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`;
                button.textContent = options[i];
                button.setAttribute('aria-label', `${player} velger svar ${options[i]}`);
                
                if (appState.answersChecked) {
                    const correctIndex = question.correctIndex;
                    if (i === correctIndex) {
                        button.className = 'w-8 h-8 rounded-full text-sm font-medium bg-green-600 text-white';
                    } else if (isSelected) {
                        button.className = 'w-8 h-8 rounded-full text-sm font-medium bg-red-600 text-white';
                    }
                    
                    button.disabled = true;
                } else {
                    button.dataset.player = player;
                    button.dataset.answerIndex = i;
                }
                
                answerButtons.appendChild(button);
            }
            
            playerRow.appendChild(nameElement);
            playerRow.appendChild(answerButtons);
            fragment.appendChild(playerRow);
        });
        
        elements.playerAnswersContainer.innerHTML = '';
        elements.playerAnswersContainer.appendChild(fragment);
        
        elements.playerAnswersContainer.addEventListener('click', handleAnswerButtonClick);
        
        const allPlayersAnswered = appState.players.every(player => 
            appState.playerAnswers[player] !== undefined
        );
        
        if (elements.checkAnswersBtn) {
            elements.checkAnswersBtn.classList.toggle('hidden', !allPlayersAnswered || appState.answersChecked);
            
            // Add pulse animation if all players have answered
            if (allPlayersAnswered && !appState.answersChecked) {
                elements.checkAnswersBtn.classList.add('pulse');
            } else {
                elements.checkAnswersBtn.classList.remove('pulse');
            }
        }
        
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.classList.toggle('hidden', !appState.answersChecked);
        }
    }

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

    function selectPlayerAnswer(player, answerIndex) {
        appState.playerAnswers[player] = answerIndex;
        
        // If this is the current player, advance to next player
        if (appState.players[appState.currentPlayerIndex] === player) {
            appState.currentPlayerIndex = (appState.currentPlayerIndex + 1) % appState.players.length;
        }
        
        renderPlayerAnswerSelection();
    }

    function selectCurrentPlayerAnswer(answerIndex) {
        const currentPlayer = appState.players[appState.currentPlayerIndex];
        selectPlayerAnswer(currentPlayer, answerIndex);
    }

    function checkAnswers() {
        if (!appState.currentQuiz || !appState.currentQuiz[appState.currentQuestionIndex]) {
            console.error('Cannot check answers: quiz data is missing');
            return;
        }
        
        const question = appState.currentQuiz[appState.currentQuestionIndex];
        const correctIndex = question.correctIndex;
        
        appState.players.forEach(player => {
            if (appState.playerAnswers[player] === correctIndex) {
                appState.scores[player]++;
                requestAnimationFrame(() => {
                    animateScoreUpdate(player);
                });
            }
        });
        
        appState.answersChecked = true;
        
        renderScoreboard();
        renderPlayerAnswerSelection();
        
        const answerOptions = elements.answerOptions?.querySelectorAll('.answer-option');
        if (answerOptions) {
            answerOptions.forEach((option, index) => {
                if (index === correctIndex) {
                    option.classList.add('correct');
                    animations?.flashCorrectAnswer?.(option);
                } else if (Object.values(appState.playerAnswers).includes(index)) {
                    option.classList.add('incorrect');
                    animations?.shakeIncorrectAnswer?.(option);
                }
            });
        }
    }

    function showNextQuestion() {
        appState.currentQuestionIndex++;
        
        if (appState.currentQuestionIndex >= appState.currentQuiz.length) {
            showResults();
            return;
        }
        
        appState.currentPlayerIndex = 0;
        updateQuizProgress();
        renderCurrentQuestion();
    }

    function updateQuizProgress() {
        const currentQuestion = appState.currentQuestionIndex + 1;
        const totalQuestions = appState.currentQuiz.length;
        
        if (elements.currentQuestionEl) {
            elements.currentQuestionEl.textContent = currentQuestion;
        }
        if (elements.totalQuestionsEl) {
            elements.totalQuestionsEl.textContent = totalQuestions;
        }
        
        const progressPercent = (currentQuestion / totalQuestions) * 100;
        
        requestAnimationFrame(() => {
            if (elements.progressFill) {
                elements.progressFill.style.width = `${progressPercent}%`;
            }
        });
    }

    function renderScoreboard() {
        if (!elements.scoreboard) return;
        
        const fragment = document.createDocumentFragment();
        
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
        
        elements.scoreboard.innerHTML = '';
        elements.scoreboard.appendChild(fragment);
    }

    function animateScoreUpdate(playerName) {
        const scoreElement = elements.scoreboard?.querySelector(`.player-score[data-player="${playerName}"]`);
        if (scoreElement) {
            scoreElement.classList.add('score-updated');
            setTimeout(() => {
                scoreElement.classList.remove('score-updated');
            }, 500);
        }
    }

    function showResults() {
        // Use scoreManager if available, otherwise fallback to internal calculation
        let sortedPlayers;
        
        if (typeof scoreManager !== 'undefined' && scoreManager.calculateResults) {
            sortedPlayers = scoreManager.calculateResults(appState.players, appState.scores);
        } else {
            // Fallback implementation
            sortedPlayers = appState.players.map(player => ({
                name: player,
                score: appState.scores[player] || 0
            }));
            
            sortedPlayers.sort((a, b) => b.score - a.score);
            
            let currentPosition = 1;
            let previousScore = null;
            let skipPositions = 0;
            
            sortedPlayers.forEach((player, index) => {
                if (index === 0) {
                    player.position = 1;
                    previousScore = player.score;
                } else {
                    if (player.score === previousScore) {
                        player.position = currentPosition;
                        skipPositions++;
                    } else {
                        currentPosition += skipPositions + 1;
                        player.position = currentPosition;
                        skipPositions = 0;
                    }
                    previousScore = player.score;
                }
            });
        }
        
        showScreen(elements.resultsScreen);
        
        if (sortedPlayers.length > 0) {
            if (elements.winnerName) elements.winnerName.textContent = sortedPlayers[0].name;
            if (elements.firstPlaceName) elements.firstPlaceName.textContent = sortedPlayers[0].name;
            if (elements.firstPlaceScore) elements.firstPlaceScore.textContent = `${sortedPlayers[0].score} poeng`;
        }
        
        if (sortedPlayers.length > 1) {
            if (elements.secondPlaceName) elements.secondPlaceName.textContent = sortedPlayers[1].name;
            if (elements.secondPlaceScore) elements.secondPlaceScore.textContent = `${sortedPlayers[1].score} poeng`;
        } else {
            if (elements.secondPlaceName) elements.secondPlaceName.textContent = "—";
            if (elements.secondPlaceScore) elements.secondPlaceScore.textContent = "0 poeng";
        }
        
        if (sortedPlayers.length > 2) {
            if (elements.thirdPlaceName) elements.thirdPlaceName.textContent = sortedPlayers[2].name;
            if (elements.thirdPlaceScore) elements.thirdPlaceScore.textContent = `${sortedPlayers[2].score} poeng`;
        } else {
            if (elements.thirdPlaceName) elements.thirdPlaceName.textContent = "—";
            if (elements.thirdPlaceScore) elements.thirdPlaceScore.textContent = "0 poeng";
        }
        
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
        
        if (elements.fullResults) {
            elements.fullResults.innerHTML = '';
            elements.fullResults.appendChild(fragment);
        }
        
        createConfettiEffect();
        animateResultsElements();
        
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

    function createConfettiEffect() {
        if (typeof animations !== 'undefined' && animations.createConfetti) {
            animations.createConfetti(elements.confettiContainer);
        } else {
            // Fallback implementation
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
    }

    function animateResultsElements() {
        const animationSequence = [
            { selector: '.trophy-animation', className: 'show-trophy', delay: 300 },
            { selector: '.victory-title', className: 'show-title', delay: 600 },
            { selector: '.podium-container', className: 'show-podium', delay: 900 },
            { selector: '.results-list', className: 'show-results', delay: 1200 },
            { selector: '.action-buttons', className: 'show-buttons', delay: 1500 }
        ];
        
        animationSequence.forEach(item => {
            setTimeout(() => {
                const element = document.querySelector(item.selector);
                if (element) element.classList.add(item.className);
            }, item.delay);
        });
    }

    function resetQuiz() {
        appState.currentQuiz = null;
        appState.currentQuestionIndex = 0;
        appState.currentPlayerIndex = 0;
        appState.playerAnswers = {};
        appState.answersChecked = false;
        
        appState.players.forEach(player => {
            appState.scores[player] = 0;
        });
        
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
        
        if (elements.confettiContainer) {
            elements.confettiContainer.innerHTML = '';
        }
    }
})();