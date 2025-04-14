// Quiz Management for QuizZone - With Internationalization Support
const quizManager = {
    // Question databases (will be loaded on-demand)
    questionDatabases: {
        easter: null,
        general: null,
        movies: null,
        sports: null,
        kids: null
    },
    
    // Load a specific question database 
    loadQuestionDatabase: async function(theme, callback) {
        try {
            console.log(`Loading question database for theme: ${theme}`);
            // If already loaded, use the cached version
            if (this.questionDatabases[theme] && this.questionDatabases[theme].length > 0) {
                console.log(`Using cached questions for theme: ${theme}`);
                if (callback && typeof callback === 'function') {
                    callback(this.questionDatabases[theme]);
                }
                return this.questionDatabases[theme];
            }
            
            // Use i18n to get the correct URL with language
            let url = `data/questions-${theme}.json`;
            
            // If i18n is available, use it to get the language-specific URL
            if (window.i18n) {
                url = window.i18n.getQuestionDatabaseUrl(theme);
            } else if (window.location.hostname.includes('quizzone.eu')) {
                // Fallback if i18n is not loaded yet but we're on the English domain
                url = `data/questions-${theme}-en.json`;
            }
            
            // Load the question database
            const response = await fetch(url);
            
            // If language-specific file fails, try the default one
            if (!response.ok && url.includes('-en.json')) {
                console.warn(`Failed to load English questions for ${theme}, falling back to Norwegian`);
                const fallbackResponse = await fetch(`data/questions-${theme}.json`);
                
                if (!fallbackResponse.ok) {
                    throw new Error(`Failed to load ${theme} questions`);
                }
                
                const data = await fallbackResponse.json();
                this.questionDatabases[theme] = this.validateAndNormalizeData(data, theme);
            } else if (!response.ok) {
                throw new Error(`Failed to load ${theme} questions`);
            } else {
                const data = await response.json();
                this.questionDatabases[theme] = this.validateAndNormalizeData(data, theme);
            }
            
            if (callback && typeof callback === 'function') {
                callback(this.questionDatabases[theme]);
            }
            
            return this.questionDatabases[theme];
        } catch (error) {
            console.error(`Error loading ${theme} questions:`, error);
            this.questionDatabases[theme] = [];
            
            if (callback && typeof callback === 'function') {
                callback([]);
            }
            
            return [];
        }
    },
    
    // Validate and normalize question data
    validateAndNormalizeData: function(data, theme) {
        // Validate that the data is an array of questions with expected properties
        if (Array.isArray(data) && data.length > 0) {
            // Check first question for expected properties
            const firstQuestion = data[0];
            if (!firstQuestion.question || 
                !firstQuestion.correctAnswer ||
                !Array.isArray(firstQuestion.incorrectAnswers)) {
                console.warn(`${theme} questions have invalid format, attempting to fix`);
                
                // Normalize the data format
                return data.map(q => {
                    return {
                        question: q.question || `Question ${Math.random().toString(36).substring(7)}`,
                        correctAnswer: q.correctAnswer || (q.options ? q.options[0] : "Answer"),
                        incorrectAnswers: Array.isArray(q.incorrectAnswers) ? q.incorrectAnswers : 
                                        (q.options ? q.options.slice(1) : ["Option A", "Option B", "Option C"]),
                        category: q.category || theme,
                        difficulty: q.difficulty || "medium"
                    }
                });
            }
        } else {
            throw new Error(`Invalid data format for ${theme}`);
        }
        
        return data;
    },
    
    // For backward compatibility
    loadQuestionDatabases: async function(callback) {
        console.log('Legacy loadQuestionDatabases called - this method is deprecated');
        if (callback && typeof callback === 'function') {
            callback();
        }
    },
    
    // Generate a quiz based on theme, difficulty, and count
    generateQuiz: async function(theme, difficulty, count, callback) {
        console.log(`Generating quiz: theme=${theme}, difficulty=${difficulty}, count=${count}`);
        
        // For mixed theme, load all databases as needed
        if (theme === 'mixed') {
            const availableThemes = ['easter', 'general', 'movies', 'sports', 'kids'];
            const loadThemePromises = [];
            
            for (const themeToLoad of availableThemes) {
                // Only load themes that haven't been loaded already
                if (!this.questionDatabases[themeToLoad] || this.questionDatabases[themeToLoad].length === 0) {
                    loadThemePromises.push(this.loadQuestionDatabase(themeToLoad));
                }
            }
            
            if (loadThemePromises.length > 0) {
                await Promise.all(loadThemePromises);
            }
            
            let allQuestions = [];
            Object.keys(this.questionDatabases).forEach(dbTheme => {
                if (this.questionDatabases[dbTheme] && this.questionDatabases[dbTheme].length > 0) {
                    allQuestions = allQuestions.concat(this.questionDatabases[dbTheme]);
                }
            });
            
            return this.processQuestions(allQuestions, difficulty, count, callback);
        } else {
            // Load specific theme
            const questions = await this.loadQuestionDatabase(theme);
            return this.processQuestions(questions, difficulty, count, callback);
        }
    },
    
    // Process questions based on difficulty and count
    processQuestions: function(questions, difficulty, count, callback) {
        if (!questions || questions.length === 0) {
            console.warn('No questions available for this theme');
            if (callback && typeof callback === 'function') {
                callback([]);
            }
            return [];
        }
        
        console.log(`Found ${questions.length} questions to process`);
        
        // Filter by difficulty if not mixed
        if (difficulty !== 'mixed') {
            const filteredQuestions = questions.filter(q => q.difficulty === difficulty);
            
            // Only apply filter if we have enough questions after filtering
            if (filteredQuestions.length >= count || filteredQuestions.length >= questions.length * 0.5) {
                questions = filteredQuestions;
            } else {
                console.warn(`Not enough questions with difficulty: ${difficulty}. Using all difficulties.`);
            }
        }
        
        console.log(`After difficulty filter: ${questions.length} questions remaining`);
        
        // Shuffle questions and take the requested count
        const shuffledQuestions = this.shuffleArray([...questions]);
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(count, shuffledQuestions.length));
        
        // Further shuffle each question's options
        const quizQuestions = selectedQuestions.map(q => {
            // Create a copy of the question
            const question = { ...q };
            
            // Get all options including the correct answer
            // Make sure incorrectAnswers is an array, with a fallback if it's not
            const incorrectAnswers = Array.isArray(question.incorrectAnswers) 
                ? question.incorrectAnswers 
                : [];
            
            // If we have incorrectAnswers, use them with the correct answer
            // Otherwise, generate some random options
            let options;
            if (incorrectAnswers.length > 0) {
                options = [...incorrectAnswers, question.correctAnswer];
            } else if (question.options) {
                // If the question already has options property, use it
                options = question.options;
            } else {
                // Create options based on the correct answer with dummy options
                options = [
                    question.correctAnswer,
                    `Not ${question.correctAnswer}`,
                    `Option C`,
                    `Option D`
                ];
            }
            
            // Shuffle options
            const shuffledOptions = this.shuffleArray(options);
            
            // Find the index of the correct answer in the shuffled options
            const correctIndex = shuffledOptions.indexOf(question.correctAnswer);
            
            return {
                question: question.question,
                options: shuffledOptions,
                correctIndex: correctIndex >= 0 ? correctIndex : 0, // Default to first option if not found
                category: question.category || 'General',
                difficulty: question.difficulty || 'medium'
            }
        });
        
        // Return the quiz questions
        if (callback && typeof callback === 'function') {
            callback(quizQuestions);
        }
        
        return quizQuestions;
    },
    
    // Fisher-Yates shuffle algorithm
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Make quizManager globally available
window.quizManager = quizManager;

// Also expose it in the global scope for script tags loading
if (typeof globalThis !== 'undefined') {
    globalThis.quizManager = quizManager;
}