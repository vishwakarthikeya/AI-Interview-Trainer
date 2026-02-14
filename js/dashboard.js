/**
 * Dashboard Controller
 * Manages dashboard page functionality and chart rendering
 */

import { StorageService } from './storage.js';

class DashboardController {
    constructor() {
        this.storage = new StorageService();
        this.charts = {};
        
        this.init();
    }

    init() {
        // Initialize storage
        this.storage.initialize();
        
        // Load and display data
        this.loadStats();
        this.loadHistory();
        this.initCharts();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Listen for storage updates
        window.addEventListener('storage-update', () => {
            this.refreshDashboard();
        });
    }

    setupEventListeners() {
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.confirmClearHistory());
        }
        
        // Export button (optional)
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.storage.exportData());
        }
    }

    loadStats() {
        const stats = this.storage.getStats();
        
        document.getElementById('totalInterviews').textContent = stats.totalInterviews;
        document.getElementById('avgScore').textContent = stats.averageScore + '%';
        document.getElementById('bestScore').textContent = stats.bestScore + '%';
        
        const improvementEl = document.getElementById('improvement');
        const trend = stats.recentTrend;
        improvementEl.textContent = (trend > 0 ? '+' : '') + trend + '%';
        improvementEl.style.color = trend >= 0 ? '#10b981' : '#ef4444';
    }

    loadHistory() {
        const history = this.storage.getHistory();
        const historyList = document.getElementById('historyList');
        
        if (!historyList) return;
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <p>No interviews yet. Start your first practice session!</p>
                    <a href="interview.html" class="btn-primary">Start Interview</a>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(item => this.renderHistoryItem(item)).join('');
        
        // Add delete listeners
        document.querySelectorAll('.delete-history-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.confirmDelete(id);
            });
        });
        
        // Add click listeners for details
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-history-item')) {
                    this.showInterviewDetails(item.dataset.id);
                }
            });
        });
    }

    renderHistoryItem(item) {
        const date = new Date(item.date || item.savedAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const role = this.formatRole(item.role);
        const score = item.score || 0;
        
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-info">
                    <span class="history-date">${formattedDate}</span>
                    <span class="history-role">${role} (${item.difficulty})</span>
                </div>
                <div class="history-score">${score}%</div>
                <button class="btn-text delete-history-item" data-id="${item.id}">Delete</button>
            </div>
        `;
    }

    formatRole(role) {
        const roles = {
            'software-engineer': 'Software Engineer',
            'product-manager': 'Product Manager',
            'data-scientist': 'Data Scientist',
            'ux-designer': 'UX Designer',
            'devops-engineer': 'DevOps Engineer'
        };
        return roles[role] || role;
    }

    initCharts() {
        this.initProgressChart();
        this.initRadarChart();
    }

    initProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        const data = this.storage.getProgressData();
        
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Interview Score',
                    data: data.scores,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9aa3af'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9aa3af'
                        }
                    }
                }
            }
        });
    }

    initRadarChart() {
        const ctx = document.getElementById('radarChart');
        if (!ctx) return;
        
        const skills = this.storage.getSkillData();
        
        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Technical', 'Communication', 'Problem Solving', 'Experience', 'Culture Fit'],
                datasets: [{
                    label: 'Skill Level',
                    data: [
                        skills.technical || 0,
                        skills.communication || 0,
                        skills.problemSolving || 0,
                        skills.experience || 0,
                        skills.culture || 0
                    ],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#9aa3af'
                        },
                        ticks: {
                            color: '#9aa3af',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    }

    refreshDashboard() {
        // Update stats
        this.loadStats();
        
        // Update history
        this.loadHistory();
        
        // Update charts
        if (this.charts.progress) {
            const data = this.storage.getProgressData();
            this.charts.progress.data.labels = data.labels;
            this.charts.progress.data.datasets[0].data = data.scores;
            this.charts.progress.update();
        }
        
        if (this.charts.radar) {
            const skills = this.storage.getSkillData();
            this.charts.radar.data.datasets[0].data = [
                skills.technical || 0,
                skills.communication || 0,
                skills.problemSolving || 0,
                skills.experience || 0,
                skills.culture || 0
            ];
            this.charts.radar.update();
        }
    }

    confirmClearHistory() {
        if (confirm('Are you sure you want to clear all interview history? This cannot be undone.')) {
            this.storage.clearHistory();
            this.refreshDashboard();
        }
    }

    confirmDelete(id) {
        if (confirm('Delete this interview from history?')) {
            this.storage.deleteInterview(id);
            this.refreshDashboard();
        }
    }

    showInterviewDetails(id) {
        const interview = this.storage.getInterview(id);
        if (!interview) return;
        
        // Could show a modal with details
        console.log('Interview details:', interview);
        alert(`Interview Details:\nRole: ${this.formatRole(interview.role)}\nScore: ${interview.score}%\nDate: ${new Date(interview.date).toLocaleString()}`);
    }
}

// Initialize dashboard
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new DashboardController();
    });
}