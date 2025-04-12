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
                        // Validate that the data is an array of questions with the expected properties
                        if (Array.isArray(data) && data.length > 0) {
                            // Check the first question for expected properties
                            const firstQuestion = data[0];
                            if (!firstQuestion.question || 
                                !firstQuestion.correctAnswer ||
                                !Array.isArray(firstQuestion.incorrectAnswers)) {
                                console.warn(`${theme} questions have invalid format, attempting to fix:`);
                                
                                // Try to normalize the data format
                                const normalizedData = data.map(q => {
                                    return {
                                        question: q.question || `Question ${Math.random().toString(36).substring(7)}`,
                                        correctAnswer: q.correctAnswer || (q.options ? q.options[0] : "Answer"),
                                        incorrectAnswers: Array.isArray(q.incorrectAnswers) ? q.incorrectAnswers : 
                                                        (q.options ? q.options.slice(1) : ["Option A", "Option B", "Option C"]),
                                        category: q.category || theme,
                                        difficulty: q.difficulty || "medium"
                                    }
                                });
                                
                                this.questionDatabases[theme] = normalizedData;
                                console.log(`Fixed and loaded ${theme} questions: ${normalizedData.length} items`);
                            } else {
                                this.questionDatabases[theme] = data;
                                console.log(`Loaded ${theme} questions: ${data.length} items`);
                            }
                        } else {
                            throw new Error(`Invalid data format for ${theme}`);
                        }
                        return theme;
                    })
                    .catch(error => {
                        console.error(`Error loading ${theme} questions:`, error);
                        this.questionDatabases[theme] = [];
                        return theme;
                    });
            });
            
            // Wait for all promises to resolve
            await Promise.all(promises);
            
            // Validate that we have at least one database with questions
            const hasQuestions = Object.values(this.questionDatabases).some(db => db && db.length > 0);
            
            if (!hasQuestions) {
                console.error('No question databases were loaded successfully. Quiz cannot proceed.');
            }
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        } catch (error) {
            console.error('Error loading question databases:', error);
            
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
        
        console.log(`Found ${questions.length} questions for theme: ${theme}`);
        
        // If we don't have any questions for this theme, try to load them again
        if (questions.length === 0) {
            console.warn(`No questions available for theme: ${theme}. Attempting to reload.`);
            // Try to reload just this theme's database
            fetch(`data/questions-${theme}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${theme} questions`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`Successfully reloaded ${theme} questions: ${data.length} items`);
                    this.questionDatabases[theme] = data;
                    // Retry generating the quiz with the newly loaded questions
                    this.generateQuiz(theme, difficulty, count, callback);
                })
                .catch(error => {
                    console.error(`Error reloading ${theme} questions:`, error);
                    // Alert user that no questions could be loaded
                    if (callback && typeof callback === 'function') {
                        callback([]);
                    }
                });
            return;
        }
        
        // Filter by difficulty if not mixed
        if (difficulty !== 'mixed') {
            const filteredQuestions = questions.filter(q => q.difficulty === difficulty);
            
            // Only apply the filter if we have enough questions after filtering
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
}