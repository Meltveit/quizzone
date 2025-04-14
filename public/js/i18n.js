// Create a new file: public/js/i18n.js
// This will handle all internationalization logic

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
        failedToLoad: 'Failed to load quiz questions. Please try again or choose a different theme.'
      }
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
      }
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
      
      // Next check domain
      if (window.location.hostname.includes('quizzone.eu')) {
        this.setLanguage('en');
        return;
      }
      
      // Fallback to browser language if we should
      // Uncomment this if you want to detect browser language
      /*
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.startsWith('en')) {
        this.setLanguage('en');
        return;
      }
      */
      
      // Default to Norwegian if we're on quizzone.no or any other detection failed
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
     * Update all UI elements with data-i18n attributes
     */
    updateUI() {
      // Update title and meta tags
      document.title = this.get('appTitle') + ' - ' + this.get('appSubtitle');
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        if (this.currentLanguage === 'en') {
          metaDescription.setAttribute('content', 
            'QuizZone is a free quiz app with questions for both kids and adults. Choose a theme, difficulty level and play together with friends and family. Try now!');
        } else {
          metaDescription.setAttribute('content', 
            'QuizZone er en gratis quiz-app med spørsmål for både barn og voksne. Velg tema, vanskelighetsgrad og spill sammen med venner og familie. Prøv nå!');
        }
      }
      
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
      // Difficulty select options
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
      
      // Question count select options
      const questionCountSelect = document.getElementById('question-count');
      if (questionCountSelect) {
        questionCountSelect.querySelectorAll('option').forEach(option => {
          const count = option.value;
          option.textContent = this.get('questionsFormat', { count });
        });
      }
      
      // Update theme buttons
      const themeButtons = document.querySelectorAll('.theme-btn');
      themeButtons.forEach(button => {
        const theme = button.getAttribute('data-theme');
        const nameSpan = button.querySelector('span:not(.text-2xl)'); // Get the name span, not the emoji
        
        if (nameSpan && theme) {
          nameSpan.textContent = this.get(theme);
        }
      });
    },
    
    /**
     * Get the appropriate question database based on language and theme
     */
    getQuestionDatabaseUrl(theme) {
      return `data/questions-${theme}${this.currentLanguage === 'en' ? '-en' : ''}.json`;
    }
  };
  
  // Export the i18n module
  window.i18n = i18n;