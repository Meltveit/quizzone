// Score Management for QuizZone
const scoreManager = {
    // Calculate final results based on scores
    calculateResults: function(players, scores) {
        // Create player objects with scores
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
    },
    
    // Save a quiz result to history
    saveQuizResult: function(theme, difficulty, questionCount, results) {
        const quizResult = {
            theme,
            difficulty,
            questionCount,
            results,
            date: new Date().toISOString()
        };
        
        storageManager.saveQuizResult(quizResult);
    },
    
    // Get the top player for a theme
    getTopPlayerForTheme: function(theme) {
        const history = storageManager.getQuizHistory();
        if (!history || history.length === 0) {
            return null;
        }
        
        // Filter by theme if specified
        const filteredResults = theme 
            ? history.filter(result => result.theme === theme)
            : history;
        
        if (filteredResults.length === 0) {
            return null;
        }
        
        // Find the best player
        const playerScores = {};
        
        filteredResults.forEach(result => {
            if (result.results && result.results.length > 0) {
                const winner = result.results[0];
                
                if (!playerScores[winner.name]) {
                    playerScores[winner.name] = {
                        wins: 0,
                        averageScore: 0,
                        totalScore: 0,
                        totalGames: 0
                    };
                }
                
                // Count first place as a win
                if (winner.position === 1) {
                    playerScores[winner.name].wins++;
                }
                
                playerScores[winner.name].totalScore += winner.score;
                playerScores[winner.name].totalGames++;
                playerScores[winner.name].averageScore = 
                    playerScores[winner.name].totalScore / playerScores[winner.name].totalGames;
            }
        });
        
        // Find player with most wins
        let topPlayer = null;
        let mostWins = 0;
        
        Object.keys(playerScores).forEach(player => {
            if (playerScores[player].wins > mostWins) {
                mostWins = playerScores[player].wins;
                topPlayer = {
                    name: player,
                    wins: playerScores[player].wins,
                    averageScore: playerScores[player].averageScore.toFixed(1),
                    totalGames: playerScores[player].totalGames
                };
            }
        });
        
        return topPlayer;
    },
    
    // Calculate stats about a player's performance
    getPlayerStats: function(playerName) {
        const history = storageManager.getQuizHistory();
        if (!history || history.length === 0 || !playerName) {
            return null;
        }
        
        const stats = {
            totalGames: 0,
            wins: 0,
            totalPoints: 0,
            averagePoints: 0,
            bestTheme: null,
            worstTheme: null
        };
        
        // Track performance by theme
        const themePerformance = {};
        
        history.forEach(result => {
            const theme = result.theme;
            
            // Initialize theme stats if needed
            if (!themePerformance[theme]) {
                themePerformance[theme] = {
                    totalGames: 0,
                    wins: 0,
                    totalPoints: 0,
                    averagePoints: 0
                };
            }
            
            // Find player in results
            const playerResult = result.results.find(r => r.name === playerName);
            if (playerResult) {
                stats.totalGames++;
                themePerformance[theme].totalGames++;
                
                if (playerResult.position === 1) {
                    stats.wins++;
                    themePerformance[theme].wins++;
                }
                
                stats.totalPoints += playerResult.score;
                themePerformance[theme].totalPoints += playerResult.score;
            }
        });
        
        // Calculate averages
        if (stats.totalGames > 0) {
            stats.averagePoints = (stats.totalPoints / stats.totalGames).toFixed(1);
            
            // Calculate theme averages and find best/worst
            let bestAverage = 0;
            let worstAverage = Infinity;
            
            Object.keys(themePerformance).forEach(theme => {
                const tp = themePerformance[theme];
                if (tp.totalGames > 0) {
                    tp.averagePoints = tp.totalPoints / tp.totalGames;
                    
                    if (tp.averagePoints > bestAverage) {
                        bestAverage = tp.averagePoints;
                        stats.bestTheme = theme;
                    }
                    
                    if (tp.averagePoints < worstAverage) {
                        worstAverage = tp.averagePoints;
                        stats.worstTheme = theme;
                    }
                }
            });
        }
        
        return stats;
    }
};