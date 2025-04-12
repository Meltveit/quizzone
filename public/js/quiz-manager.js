// Quiz Management for QuizZone
const quizManager = {
    // Question databases (will be loaded from JSON files)
    questionDatabases: {
        easter: null,
        general: null,
        movies: null,
        sports: null,
        kids: null
    },
    
    // Initialize by loading question databases
    loadQuestionDatabases: async function(callback) {
        try {
            // Load all question databases in parallel
            const themes = ['easter', 'general', 'movies', 'sports', 'kids'];
            const promises = themes.map(theme => {
                return fetch(`data/questions-${theme}.json`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${theme} questions`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        this.questionDatabases[theme] = data;
                        return theme;
                    })
                    .catch(error => {
                        console.error(`Error loading ${theme} questions:`, error);
                        // Create empty array if loading fails
                        this.questionDatabases[theme] = [];
                        return theme;
                    });
            });
            
            await Promise.all(promises);
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        } catch (error) {
            console.error('Error loading question databases:', error);
            
            // Initialize empty databases if loading fails
            const themes = ['easter', 'general', 'movies', 'sports', 'kids'];
            themes.forEach(theme => {
                this.questionDatabases[theme] = [];
            });
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    },
    
    // Generate a quiz based on theme, difficulty, and count
    generateQuiz: function(theme, difficulty, count, callback) {
        // Check if databases are loaded, if not load them first
        if (!this.questionDatabases.general) {
            this.loadQuestionDatabases(() => {
                this.generateQuiz(theme, difficulty, count, callback);
            });
            return;
        }
        
        let questions = [];
        
        // Get questions based on theme
        if (theme === 'mixed') {
            // For mixed theme, get questions from all databases
            const allQuestions = [];
            Object.keys(this.questionDatabases).forEach(dbTheme => {
                if (this.questionDatabases[dbTheme] && this.questionDatabases[dbTheme].length > 0) {
                    allQuestions.push(...this.questionDatabases[dbTheme]);
                }
            });
            questions = allQuestions;
        } else {
            // Get questions from the specific theme
            questions = this.questionDatabases[theme] || [];
        }
        
        // Filter by difficulty if not mixed
        if (difficulty !== 'mixed') {
            questions = questions.filter(q => q.difficulty === difficulty);
        }
        
        // If we don't have enough questions, fallback to using all questions
        if (questions.length < count) {
            if (theme !== 'mixed') {
                questions = this.questionDatabases[theme] || [];
            }
        }
        
        // Shuffle questions and take the requested count
        const shuffledQuestions = this.shuffleArray([...questions]);
        const selectedQuestions = shuffledQuestions.slice(0, count);
        
        // Further shuffle each question's options
        const quizQuestions = selectedQuestions.map(q => {
            // Create a copy of the question
            const question = { ...q };
            
            // Get all options including the correct answer
            const options = [...question.incorrectAnswers, question.correctAnswer];
            
            // Shuffle options
            const shuffledOptions = this.shuffleArray(options);
            
            // Find the index of the correct answer in the shuffled options
            const correctIndex = shuffledOptions.indexOf(question.correctAnswer);
            
            return {
                question: question.question,
                options: shuffledOptions,
                correctIndex: correctIndex,
                category: question.category,
                difficulty: question.difficulty
            };
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
    },
    
    // Create a placeholder question if needed
    createPlaceholderQuestion: function() {
        return {
            question: "Eksempelspørsmål: Hva er hovedstaden i Norge?",
            options: ["Stockholm", "Oslo", "København", "Helsinki"],
            correctIndex: 1,
            category: "Geografi",
            difficulty: "easy"
        };
    },
    
    // Generate placeholder questions for testing
    generatePlaceholderQuiz: function(count) {
        const placeholders = [];
        
        for (let i = 0; i < count; i++) {
            placeholders.push(this.createPlaceholderQuestion());
        }
        
        return placeholders;
    }
};