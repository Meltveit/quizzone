// Storage Management for QuizZone
const storageManager = {
    // Local storage keys
    keys: {
        appState: 'quizzone_app_state',
        quizHistory: 'quizzone_history'
    },
    
    // Save the application state to localStorage
    saveAppState: function(state) {
        try {
            // Create a simplified version of the state for storage
            const stateToSave = {
                selectedTheme: state.selectedTheme,
                difficulty: state.difficulty,
                questionCount: state.questionCount,
                players: state.players,
                scores: state.scores
            };
            
            localStorage.setItem(this.keys.appState, JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.error('Error saving app state:', error);
            return false;
        }
    },
    
    // Load the application state from localStorage
    loadAppState: function() {
        try {
            const savedState = localStorage.getItem(this.keys.appState);
            if (savedState) {
                return JSON.parse(savedState);
            }
            return null;
        } catch (error) {
            console.error('Error loading app state:', error);
            return null;
        }
    },
    
    // Add a quiz result to history
    saveQuizResult: function(result) {
        try {
            // Get existing history
            let history = this.getQuizHistory() || [];
            
            // Add new result with timestamp
            result.timestamp = new Date().toISOString();
            history.unshift(result);
            
            // Keep only the last 10 results
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            localStorage.setItem(this.keys.quizHistory, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving quiz result:', error);
            return false;
        }
    },
    
    // Get quiz history from localStorage
    getQuizHistory: function() {
        try {
            const history = localStorage.getItem(this.keys.quizHistory);
            if (history) {
                return JSON.parse(history);
            }
            return [];
        } catch (error) {
            console.error('Error loading quiz history:', error);
            return [];
        }
    },
    
    // Clear all app data
    clearAllData: function() {
        try {
            localStorage.removeItem(this.keys.appState);
            localStorage.removeItem(this.keys.quizHistory);
            return true;
        } catch (error) {
            console.error('Error clearing app data:', error);
            return false;
        }
    }
};