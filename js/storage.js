/**
 * Storage Service
 * Handles all localStorage operations for interview history
 */

export class StorageService {
    constructor() {
        this.storageKey = 'interview_trainer_history';
        this.maxHistoryItems = 50; // Limit storage size
    }

    initialize() {
        // Create storage if it doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Save interview to history
    saveInterview(interviewData) {
        try {
            let history = this.getHistory();
            
            // Add new interview
            const newInterview = {
                ...interviewData,
                id: interviewData.id || this.generateId(),
                savedAt: new Date().toISOString()
            };
            
            history.unshift(newInterview); // Add to beginning
            
            // Limit history size
            if (history.length > this.maxHistoryItems) {
                history = history.slice(0, this.maxHistoryItems);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            
            // Dispatch event for other components
            this.dispatchStorageEvent();
            
            return newInterview;
        } catch (error) {
            console.error('Failed to save interview:', error);
            return null;
        }
    }

    // Get all interview history
    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }

    // Get single interview by ID
    getInterview(id) {
        const history = this.getHistory();
        return history.find(item => item.id === id) || null;
    }

    // Delete interview from history
    deleteInterview(id) {
        try {
            const history = this.getHistory();
            const filtered = history.filter(item => item.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            this.dispatchStorageEvent();
            return true;
        } catch (error) {
            console.error('Failed to delete interview:', error);
            return false;
        }
    }

    // Clear all history
    clearHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            this.dispatchStorageEvent();
            return true;
        } catch (error) {
            console.error('Failed to clear history:', error);
            return false;
        }
    }

    // Get statistics
    getStats() {
        const history = this.getHistory();
        
        if (history.length === 0) {
            return {
                totalInterviews: 0,
                averageScore: 0,
                bestScore: 0,
                recentTrend: 0
            };
        }

        const scores = history.map(i => i.score || 0);
        const totalInterviews = history.length;
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalInterviews);
        const bestScore = Math.max(...scores);
        
        // Calculate recent trend (last 5 vs previous 5)
        const recentScores = scores.slice(0, 5);
        const previousScores = scores.slice(5, 10);
        
        let recentTrend = 0;
        if (previousScores.length > 0) {
            const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
            const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
            recentTrend = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
        }

        return {
            totalInterviews,
            averageScore,
            bestScore,
            recentTrend
        };
    }

    // Get data for progress chart
    getProgressData() {
        const history = this.getHistory();
        
        // Take last 10 interviews for chart
        const recent = history.slice(0, 10).reverse();
        
        return {
            labels: recent.map((item, index) => {
                const date = new Date(item.date || item.savedAt);
                return `#${index + 1} ${date.toLocaleDateString()}`;
            }),
            scores: recent.map(item => item.score || 0)
        };
    }

    // Get skill distribution for radar chart
    getSkillData() {
        const history = this.getHistory();
        
        if (history.length === 0) {
            return {
                technical: 0,
                communication: 0,
                problemSolving: 0,
                experience: 0,
                culture: 0
            };
        }

        // Average skills from last 5 interviews
        const recent = history.slice(0, 5);
        const skills = recent.reduce((acc, curr) => {
            if (curr.skills) {
                Object.keys(curr.skills).forEach(key => {
                    acc[key] = (acc[key] || 0) + curr.skills[key];
                });
            }
            return acc;
        }, {});

        // Calculate averages
        Object.keys(skills).forEach(key => {
            skills[key] = Math.round(skills[key] / recent.length);
        });

        return skills;
    }

    // Export data as JSON
    exportData() {
        const data = {
            history: this.getHistory(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview_history_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Import data from JSON
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.history && Array.isArray(data.history)) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.history));
                this.dispatchStorageEvent();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    generateId() {
        return 'int_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    dispatchStorageEvent() {
        window.dispatchEvent(new CustomEvent('storage-update', {
            detail: { storageKey: this.storageKey }
        }));
    }
}