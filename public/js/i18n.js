// i18n.js - Internationalization module for QuizZone
// This handles all language-related functionality

// Language strings for the application UI
const translations = {
    'no': {
      appTitle: 'QuizZone',
      appSubtitle: 'Den ultimate quizopplevelsen',
      howToPlay: 'Hvordan spille',
      selectTheme: 'Velg quiz-tema',
      easter: 'Påske',
      general: 'Allmennkunnskap',
      movies: 'Film & TV',
      sports: 'Sport',
      kids: 'Barn',
      mixed: 'Blandet',
      quizSettings: 'Quiz-innstillinger',
      difficulty: 'Vanskelighetsgrad:',
      difficultyEasy: 'Lett',
      difficultyMedium: 'Middels',
      difficultyHard: 'Vanskelig',
      difficultyMixed: 'Blandet',
      questionCount: 'Antall spørsmål:',
      questionsFormat: '{count} spørsmål',
      players: 'Spillere',
      addPlayerPlaceholder: 'Legg til spiller...',
      addPlayer: 'Legg til',
      addPlayerMinimum: 'Legg til minst én spiller for å starte quizen.',
      startQuiz: 'Start Quiz',
      loading: 'Laster...',
      loadingQuestions: 'Laster spørsmål...',
      back: 'Tilbake',
      question: 'Spørsmål',
      of: 'av',
      checkAnswers: 'Sjekk svar',
      nextQuestion: 'Neste spørsmål',
      congratulations: 'Gratulerer med seieren,',
      allResults: 'Alle resultater',
      points: 'poeng',
      playAgain: 'Spill igjen',
      backToHome: 'Tilbake til hjem',
      error: {
        failedToLoad: 'Kunne ikke laste quiz-spørsmålene. Vennligst prøv igjen eller velg et annet tema.'
      },
      metaDescription: 'QuizZone er en gratis quiz-app med spørsmål for både barn og voksne. Velg tema, vanskelighetsgrad og spill sammen med venner og familie. Prøv nå!',
      metaKeywords: 'quiz, quizspill, spørrekonkurranse, kunnskapsspill, norsk quiz, barnequiz, voksenquiz, påskequiz'
    },
    'en': {
      appTitle: 'QuizZone',
      appSubtitle: 'The ultimate quiz experience',
      howToPlay: 'How to Play',
      selectTheme: 'Select quiz theme',
      easter: 'Easter',
      general: 'General Knowledge',
      movies: 'Movies & TV',
      sports: 'Sports',
      kids: 'Kids',
      mixed: 'Mixed',
      quizSettings: 'Quiz Settings',
      difficulty: 'Difficulty:',
      difficultyEasy: 'Easy',
      difficultyMedium: 'Medium',
      difficultyHard: 'Hard',
      difficultyMixed: 'Mixed',
      questionCount: 'Number of questions:',
      questionsFormat: '{count} questions',
      players: 'Players',
      addPlayerPlaceholder: 'Add player...',
      addPlayer: 'Add',
      addPlayerMinimum: 'Add at least one player to start the quiz.',
      startQuiz: 'Start Quiz',
      loading: 'Loading...',
      loadingQuestions: 'Loading questions...',
      back: 'Back',
      question: 'Question',
      of: 'of',
      checkAnswers: 'Check Answers',
      nextQuestion: 'Next Question',
      congratulations: 'Congratulations on your victory,',
      allResults: 'All Results',
      points: 'points',
      playAgain: 'Play Again',
      backToHome: 'Back to Home',
      error: {
        failedToLoad: 'Failed to load quiz questions. Please try again or choose a different theme.'
      },
      metaDescription: 'QuizZone is a free quiz app with questions for both kids and adults. Choose a theme, difficulty level and play together with friends and family. Try now!',
      metaKeywords: 'quiz, quiz game, trivia, knowledge game, English quiz, kids quiz, adult quiz, easter quiz'
    }
  };
  
  // Create the i18n module
  const i18n = {
    currentLanguage: 'no', // Default to Norwegian
    
    /**
     * Initialize the language based on domain, URL parameters, or browser settings
     */
    init() {
      // First check URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      
      if (langParam && ['en', 'no'].includes(langParam)) {
        this.setLanguage(langParam);
        return;
      }
      
      // Next check domain - THIS IS THE CRITICAL PART
      if (window.location.hostname.includes('quizzone.eu')) {
        this.setLanguage('en');
        return;
      }
      
      // For testing with localhost with "eu" in the URL path
      if (window.location.pathname.includes('eu')) {
        this.setLanguage('en');
        return;
      }
      
      // Fallback to browser language if needed
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.startsWith('en')) {
        this.setLanguage('en');
        return;
      }
      
      // Default to Norwegian if we're on quizzone.no or other detection failed
      this.setLanguage('no');
    },
    
    /**
     * Set the current language and update the UI
     */
    setLanguage(lang) {
      // Only accept supported languages
      if (!translations[lang]) {
        console.warn(`Language ${lang} not supported, falling back to Norwegian`);
        lang = 'no';
      }
      
      this.currentLanguage = lang;
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Update meta tags based on language
      this.updateMetaTags();
      
      // Set the URL parameter to persist language preference
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);
      
      // Update UI if the DOM is already loaded
      if (document.readyState !== 'loading') {
        this.updateUI();
      } else {
        document.addEventListener('DOMContentLoaded', () => this.updateUI());
      }
    },
    
    /**
     * Get a translation string
     */
    get(key, variables = {}) {
      const langStrings = translations[this.currentLanguage] || translations['no'];
      
      // Allow nested keys using dot notation (e.g., 'error.failedToLoad')
      const keyParts = key.split('.');
      let value = langStrings;
      
      for (const part of keyParts) {
        if (!value[part]) {
          console.warn(`Translation missing for key: ${key}`);
          return key; // Return the key itself as fallback
        }
        value = value[part];
      }
      
      // Replace variables in the string
      if (typeof value === 'string') {
        return Object.entries(variables).reduce((str, [varName, varValue]) => {
          return str.replace(`{${varName}}`, varValue);
        }, value);
      }
      
      return value;
    },
    
    /**
     * Update meta tags based on current language
     */
    updateMetaTags() {
      // Update page title
      document.title = this.get('appTitle') + ' - ' + this.get('appSubtitle');
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', this.get('metaDescription'));
      }
      
      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', this.get('metaKeywords'));
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', this.get('appTitle') + ' - ' + this.get('appSubtitle'));
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', this.get('metaDescription'));
      }
      
      // Update Twitter tags
      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', this.get('appTitle') + ' - ' + this.get('appSubtitle'));
      }
      
      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', this.get('metaDescription'));
      }
    },
    
    /**
     * Update all UI elements with current language strings
     */
    updateUI() {
      // Update all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // If there's a data-i18n-attr, set that attribute instead of innerText
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
          element.setAttribute(attr, this.get(key));
        } else {
          element.innerText = this.get(key);
        }
      });
      
      // Update placeholders for inputs
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = this.get(key);
      });
      
      // Update special cases that can't use data-i18n
      this.updateSpecialCases();
    },
    
    /**
     * Handle special cases that can't use data-i18n attribute
     */
    updateSpecialCases() {
      // App title and subtitle
      const appTitle = document.querySelector('.text-4xl.font-bold.text-indigo-600');
      if (appTitle) {
        appTitle.textContent = this.get('appTitle');
      }
      
      const appSubtitle = document.querySelector('.text-lg.text-gray-600');
      if (appSubtitle) {
        appSubtitle.textContent = this.get('appSubtitle');
      }
      
      // How to play link
      const howToPlayLink = document.querySelector('a[href="about.html"]');
      if (howToPlayLink) {
        howToPlayLink.textContent = this.get('howToPlay');
        // Update the href to include language parameter
        const aboutUrl = new URL(howToPlayLink.href, window.location.href);
        aboutUrl.searchParams.set('lang', this.currentLanguage);
        howToPlayLink.href = aboutUrl.pathname + aboutUrl.search;
      }
      
      // Theme section title
      const themeSectionTitle = document.querySelector('h2.text-xl.font-semibold.mb-4');
      if (themeSectionTitle) {
        themeSectionTitle.textContent = this.get('selectTheme');
      }
      
      // Theme buttons
      document.querySelectorAll('.theme-btn').forEach(button => {
        const theme = button.getAttribute('data-theme');
        if (theme) {
          const textSpan = button.querySelector('span.block.font-medium');
          if (textSpan) {
            textSpan.textContent = this.get(theme);
          }
        }
      });
      
      // Quiz settings section
      const settingsTitle = document.querySelectorAll('h2.text-xl.font-semibold.mb-4')[1];
      if (settingsTitle) {
        settingsTitle.textContent = this.get('quizSettings');
      }
      
      // Difficulty label
      const difficultyLabel = document.querySelector('label[for="difficulty"]');
      if (difficultyLabel) {
        difficultyLabel.textContent = this.get('difficulty');
      }
      
      // Difficulty options
      const difficultySelect = document.getElementById('difficulty');
      if (difficultySelect) {
        const options = [
          { value: 'easy', key: 'difficultyEasy' },
          { value: 'medium', key: 'difficultyMedium' },
          { value: 'hard', key: 'difficultyHard' },
          { value: 'mixed', key: 'difficultyMixed' }
        ];
        
        options.forEach(({ value, key }) => {
          const option = difficultySelect.querySelector(`option[value="${value}"]`);
          if (option) {
            option.textContent = this.get(key);
          }
        });
      }
      
      // Question count label
      const questionCountLabel = document.querySelector('label[for="question-count"]');
      if (questionCountLabel) {
        questionCountLabel.textContent = this.get('questionCount');
      }
      
      // Question count options
      const questionCountSelect = document.getElementById('question-count');
      if (questionCountSelect) {
        questionCountSelect.querySelectorAll('option').forEach(option => {
          const count = option.value;
          option.textContent = this.get('questionsFormat', { count });
        });
      }
      
      // Players section
      const playersTitle = document.querySelectorAll('h2.text-xl.font-semibold.mb-4')[2];
      if (playersTitle) {
        playersTitle.textContent = this.get('players');
      }
      
      // Add player input
      const newPlayerInput = document.getElementById('new-player-name');
      if (newPlayerInput) {
        newPlayerInput.placeholder = this.get('addPlayerPlaceholder');
      }
      
      // Add player button
      const addPlayerBtn = document.getElementById('add-player-btn');
      if (addPlayerBtn) {
        addPlayerBtn.textContent = this.get('addPlayer');
      }
      
      // Player minimum text
      const playerMinText = document.querySelector('.text-sm.text-gray-600');
      if (playerMinText) {
        playerMinText.textContent = this.get('addPlayerMinimum');
      }
      
      // Start quiz button
      const startQuizBtn = document.getElementById('start-quiz-btn');
      if (startQuizBtn) {
        startQuizBtn.textContent = startQuizBtn.disabled ? 
          this.get('loading') : this.get('startQuiz');
      }
      
      // Quiz screen elements
      this.updateQuizScreenElements();
      
      // Results screen elements
      this.updateResultsScreenElements();
    },
    
    /**
     * Update elements specific to the quiz screen
     */
    updateQuizScreenElements() {
      // Back button
      const backBtn = document.getElementById('back-to-home');
      if (backBtn) {
        const backText = backBtn.lastChild;
        if (backText && backText.nodeType === Node.TEXT_NODE) {
          backBtn.innerHTML = `<i class="fas fa-arrow-left mr-2" aria-hidden="true"></i> ${this.get('back')}`;
        }
      }
      
      // Question progress text
      const progressText = document.querySelector('.quiz-progress-text');
      if (progressText) {
        const currentQ = document.getElementById('current-question')?.textContent || '1';
        const totalQ = document.getElementById('total-questions')?.textContent || '10';
        progressText.innerHTML = `${this.get('question')} <span id="current-question">${currentQ}</span>/<span id="total-questions">${totalQ}</span>`;
      }
      
      // Check answers button
      const checkAnswersBtn = document.getElementById('check-answers-btn');
      if (checkAnswersBtn) {
        checkAnswersBtn.textContent = this.get('checkAnswers');
      }
      
      // Next question button
      const nextQuestionBtn = document.getElementById('next-question-btn');
      if (nextQuestionBtn) {
        nextQuestionBtn.textContent = this.get('nextQuestion');
      }
      
      // Player answers heading
      const playerAnswersHeading = document.querySelector('.player-answers h3');
      if (playerAnswersHeading) {
        playerAnswersHeading.textContent = this.get('playerAnswers', 'Players\' Answers');
      }
      
      // Player scores heading
      const playerScoresHeading = document.querySelector('.player-scores h3');
      if (playerScoresHeading) {
        playerScoresHeading.textContent = this.get('playerScores', 'Score');
      }
    },
    
    /**
     * Update elements specific to the results screen
     */
    updateResultsScreenElements() {
      // Congratulations text
      const congratsText = document.querySelector('#results-screen h1.text-4xl');
      if (congratsText) {
        const winnerName = document.getElementById('winner-name')?.textContent || '';
        congratsText.innerHTML = `${this.get('congratulations')} <span id="winner-name" class="text-indigo-600">${winnerName}</span>!`;
      }
      
      // All results text
      const allResultsTitle = document.querySelector('#results-screen h2.text-xl');
      if (allResultsTitle) {
        allResultsTitle.textContent = this.get('allResults');
      }
      
      // Update points text in results
      const updatePointsText = (element) => {
        if (element) {
          const score = element.textContent.split(' ')[0];
          element.textContent = `${score} ${this.get('points')}`;
        }
      };
      
      // Update podium scores
      updatePointsText(document.getElementById('first-place-score'));
      updatePointsText(document.getElementById('second-place-score'));
      updatePointsText(document.getElementById('third-place-score'));
      
      // Update all result scores
      document.querySelectorAll('#full-results .font-semibold').forEach(el => {
        updatePointsText(el);
      });
      
      // Play again button
      const playAgainBtn = document.getElementById('play-again-btn');
      if (playAgainBtn) {
        playAgainBtn.textContent = this.get('playAgain');
      }
      
      // Back to home button
      const homeBtn = document.getElementById('home-btn');
      if (homeBtn) {
        homeBtn.textContent = this.get('backToHome');
      }
    },
    
    /**
     * Get the appropriate question database URL based on language and theme
     */
    getQuestionDatabaseUrl(theme) {
      return `data/questions-${theme}${this.currentLanguage === 'en' ? '-en' : ''}.json`;
    }
  };
  
  // Export the i18n module globally
  window.i18n = i18n;
  
  // If DOM is already loaded, initialize
  if (document.readyState !== 'loading') {
    window.i18n.init();
  } else {
    document.addEventListener('DOMContentLoaded', () => window.i18n.init());
  }