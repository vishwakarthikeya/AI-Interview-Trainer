/**
 * Interview Engine - WITH ROLE INTELLIGENCE LAYER AND ENHANCED VOICE HANDLING
 */

import { VoiceService } from './voice.js';
import { AIService } from './aiService.js';
import { StorageService } from './storage.js';
import { UIService } from './ui.js';

export class InterviewEngine {
    constructor() {
        this.voice = new VoiceService();
        this.ai = new AIService();
        this.storage = new StorageService();
        this.ui = new UIService();
        
        // Speech synthesis
        this.synth = window.speechSynthesis;
        this.voiceEnabled = true;
        this.currentUtterance = null;
        
        // Continuous recording with persistent buffer
        this.isRecording = false;
        this.recordingStartTime = null;
        this.sessionTranscript = ''; // Persistent across pauses
        
        this.state = {
            role: 'Data Scientist',
            difficulty: 'mid',
            totalQuestions: 5,
            currentIndex: 0,
            questions: [],
            answers: [],
            status: 'setup',
            sessionId: null,
            startTime: null,
            level: 'Intermediate'
        };

        // Role intelligence mapping
        this.roleDomainMap = {
            "Data Scientist": {
                domain: "Data Science",
                keywords: ["statistics", "machine learning", "python", "data analysis", "visualization"],
                difficultyLevels: {
                    junior: "Beginner - focus on fundamentals",
                    mid: "Intermediate - applied concepts",
                    senior: "Advanced - complex problem solving"
                }
            },
            "ML Engineer": {
                domain: "Machine Learning Engineering",
                keywords: ["deep learning", "model deployment", "mlops", "neural networks"],
                difficultyLevels: {
                    junior: "Basic ML concepts and implementation",
                    mid: "Model optimization and deployment",
                    senior: "System design and architecture"
                }
            },
            "Frontend Developer": {
                domain: "Frontend Development",
                keywords: ["html", "css", "javascript", "react", "ui/ux"],
                difficultyLevels: {
                    junior: "Core web technologies",
                    mid: "Framework expertise",
                    senior: "Architecture and performance"
                }
            },
            "Backend Developer": {
                domain: "Backend Development",
                keywords: ["apis", "databases", "system design", "scalability"],
                difficultyLevels: {
                    junior: "Basic server-side concepts",
                    mid: "API design and databases",
                    senior: "Distributed systems"
                }
            },
            "Product Manager": {
                domain: "Product Management",
                keywords: ["product strategy", "user research", "roadmaps", "metrics"],
                difficultyLevels: {
                    junior: "Product fundamentals",
                    mid: "Strategic thinking",
                    senior: "Leadership and vision"
                }
            }
        };

        this.roleOptions = [
            'Data Scientist',
            'ML Engineer',
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'DevOps Engineer',
            'Product Manager',
            'HR',
            'Marketing',
            'Other'
        ];

        this.init();
        this.initVoiceToggle();
        this.populateRoleDropdown();
    }

    init() {
        this.setupEventListeners();
    }

    populateRoleDropdown() {
        const roleSelect = document.getElementById('roleSelect');
        if (roleSelect) {
            roleSelect.innerHTML = this.roleOptions.map(role => 
                `<option value="${role}">${role}</option>`
            ).join('');
            
            roleSelect.addEventListener('change', (e) => {
                if (e.target.value === 'Other') {
                    this.showCustomRoleInput();
                } else {
                    this.hideCustomRoleInput();
                    this.state.role = e.target.value;
                    this.updateRoleContext();
                }
            });
        }
    }

    updateRoleContext() {
        const roleInfo = this.roleDomainMap[this.state.role];
        if (roleInfo) {
            console.log(`Role context: ${roleInfo.domain} - Focus: ${roleInfo.keywords.join(', ')}`);
        }
    }

    showCustomRoleInput() {
        const container = document.getElementById('customRoleContainer');
        if (!container) {
            const roleSelect = document.getElementById('roleSelect');
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'customRole';
            input.placeholder = 'Enter your role';
            input.className = 'form-control';
            input.style.marginTop = '10px';
            
            const container = document.createElement('div');
            container.id = 'customRoleContainer';
            container.appendChild(input);
            
            roleSelect.parentNode.appendChild(container);
            
            input.addEventListener('input', (e) => {
                this.state.role = e.target.value || 'Custom Role';
            });
        }
    }

    hideCustomRoleInput() {
        const container = document.getElementById('customRoleContainer');
        if (container) {
            container.remove();
        }
    }

    initVoiceToggle() {
        if (!document.getElementById('voiceToggle')) {
            const micButton = document.getElementById('micButton');
            if (micButton && micButton.parentNode) {
                const toggleBtn = document.createElement('button');
                toggleBtn.id = 'voiceToggle';
                toggleBtn.className = 'btn-secondary voice-toggle';
                toggleBtn.innerHTML = '🔊 Voice On';
                toggleBtn.onclick = () => this.toggleVoiceOutput();
                micButton.parentNode.insertBefore(toggleBtn, micButton.nextSibling);
            }
        }
    }

    toggleVoiceOutput() {
        this.voiceEnabled = !this.voiceEnabled;
        const toggleBtn = document.getElementById('voiceToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = this.voiceEnabled ? '🔊 Voice On' : '🔈 Voice Off';
        }
        if (this.synth) {
            this.synth.cancel();
        }
    }

    speakQuestion(question) {
        if (!this.voiceEnabled || !this.synth) return;
        
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(question);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startSessionBtn');
        const micBtn = document.getElementById('micButton');
        const submitBtn = document.getElementById('submitAnswerBtn');
        const submitTextBtn = document.getElementById('submitTextBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startInterview());
        }

        if (micBtn) {
            micBtn.addEventListener('click', () => this.toggleRecording());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitVoiceAnswer());
        }

        if (submitTextBtn) {
            submitTextBtn.addEventListener('click', () => this.submitTextAnswer());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        const roleSelect = document.getElementById('roleSelect');
        const difficultySelect = document.getElementById('difficultySelect');
        const questionCount = document.getElementById('questionCount');

        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                if (e.target.value !== 'Other') {
                    this.state.role = e.target.value;
                }
            });
        }

        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.state.difficulty = e.target.value;
                this.state.level = this.getLevelFromDifficulty(e.target.value);
            });
        }

        if (questionCount) {
            questionCount.addEventListener('change', (e) => {
                this.state.totalQuestions = parseInt(e.target.value);
            });
        }
    }

    getLevelFromDifficulty(difficulty) {
        const levels = { 'junior': 'Beginner', 'mid': 'Intermediate', 'senior': 'Advanced' };
        return levels[difficulty] || 'Intermediate';
    }

    /**
     * START INTERVIEW with intelligent role-based questions
     */
    async startInterview() {
        // Clear previous session
        localStorage.removeItem('currentInterviewSession');
        localStorage.removeItem('ai_interview_session_v1');
        
        this.state.status = 'active';
        this.state.sessionId = this.generateSessionId();
        this.state.startTime = Date.now();
        this.state.answers = [];
        this.state.currentIndex = 0;

        this.ui.showToast(`Generating ${this.state.role} questions...`, 'info');

        try {
            // Generate role-specific intelligent questions
            this.state.questions = await this.ai.generateIntelligentQuestions(
                this.state.role,
                this.state.difficulty,
                this.state.totalQuestions
            );
            
            console.log(`Generated ${this.state.questions.length} questions for ${this.state.role}`);
        } catch (error) {
            console.error('Failed to generate questions:', error);
            this.state.questions = this.ai.generateMockQuestions(
                this.state.role,
                this.state.difficulty,
                this.state.totalQuestions,
                this.roleDomainMap[this.state.role]?.keywords || []
            );
        }

        this.initializeSessionInStorage();
        this.ui.switchPhase('setup', 'interview');
        this.displayCurrentQuestion();
        this.updateProgress();
    }

    initializeSessionInStorage() {
        const sessionData = {
            sessionId: this.state.sessionId,
            role: this.state.role,
            difficulty: this.state.difficulty,
            level: this.state.level,
            startTime: this.state.startTime,
            questions: this.state.questions.map(q => ({
                question: q.question,
                expectedConcepts: q.expectedConcepts || [],
                userAnswer: null,
                cleanedAnswer: null,
                answeredAt: null
            }))
        };
        
        localStorage.setItem('ai_interview_session_v1', JSON.stringify(sessionData));
    }

    displayCurrentQuestion() {
        const questionElement = document.getElementById('currentQuestion');
        if (questionElement) {
            const question = this.state.questions[this.state.currentIndex].question;
            this.ui.typeText(questionElement, question);
            this.speakQuestion(question);
        }
        
        this.updateQuestionCounter();
        this.resetForNewQuestion();
    }

    updateQuestionCounter() {
        const counter = document.getElementById('questionCounter');
        if (counter) {
            counter.textContent = `Question ${this.state.currentIndex + 1}/${this.state.totalQuestions}`;
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercentage');
        
        if (progressFill && progressPercent) {
            const percent = (this.state.currentIndex / this.state.totalQuestions) * 100;
            progressFill.style.width = `${percent}%`;
            progressPercent.textContent = `${Math.round(percent)}%`;
        }
    }

    /**
     * ENHANCED RECORDING - Persistent transcript across pauses
     */
    toggleRecording() {
        const micButton = document.getElementById('micButton');
        
        if (this.isRecording) {
            // Stop recording but KEEP accumulated transcript
            this.voice.stopListening();
            this.isRecording = false;
            micButton.classList.remove('listening');
            micButton.querySelector('.mic-status').textContent = 'Start Speaking';
            
            console.log('Recording paused. Current transcript length:', this.sessionTranscript.length);
        } else {
            // Continue recording, appending to existing transcript
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            this.voice.startListening(
                (transcript) => this.handleContinuousTranscript(transcript),
                (error) => this.handleVoiceError(error)
            );
            
            micButton.classList.add('listening');
            micButton.querySelector('.mic-status').textContent = 'Recording...';
        }
    }

    /**
     * Handle continuous transcript - APPENDS to session transcript
     */
    handleContinuousTranscript(transcript) {
        // Update session transcript - this accumulates over time
        if (transcript && transcript.length > 0) {
            // Only update if we have new content
            this.sessionTranscript = transcript;
        }
        
        // Show in UI
        const transcriptArea = document.getElementById('transcriptArea');
        if (transcriptArea && this.sessionTranscript) {
            transcriptArea.innerHTML = `<p>${this.sessionTranscript}</p>`;
        }
        
        // Enable submit button if we have content
        const submitBtn = document.getElementById('submitAnswerBtn');
        if (submitBtn && this.sessionTranscript && this.sessionTranscript.trim().length > 0) {
            submitBtn.disabled = false;
        }
    }

    handleVoiceError(error) {
        console.error('Voice error:', error);
        this.ui.showToast('Voice input error. Using text fallback.', 'error');
        document.querySelector('.text-input-fallback').classList.remove('hidden');
        this.isRecording = false;
        
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.classList.remove('listening');
            micButton.querySelector('.mic-status').textContent = 'Start Speaking';
        }
    }

    /**
     * Submit final answer - Save accumulated transcript
     */
    submitVoiceAnswer() {
        if (this.sessionTranscript && this.sessionTranscript.trim().length > 0) {
            // Stop recording if still going
            if (this.isRecording) {
                this.voice.stopListening();
                this.isRecording = false;
            }
            
            this.saveAnswer(this.sessionTranscript);
        }
    }

    submitTextAnswer() {
        const textInput = document.getElementById('textAnswer');
        if (textInput && textInput.value.trim()) {
            this.saveAnswer(textInput.value.trim());
            textInput.value = '';
        }
    }

    /**
     * SAVE ANSWER - Store in localStorage
     */
    saveAnswer(answer) {
        const questionObj = this.state.questions[this.state.currentIndex];
        
        this.state.answers.push({
            question: questionObj.question,
            expectedConcepts: questionObj.expectedConcepts || [],
            answer: answer,
            rawAnswer: answer,
            timestamp: Date.now()
        });
        
        this.updateSessionInStorage(answer);
        
        // Update UI
        document.getElementById('submitAnswerBtn').disabled = true;
        document.getElementById('submitTextBtn').disabled = true;
        document.getElementById('nextQuestionBtn').disabled = false;
        
        // Stop recording if active
        if (this.isRecording) {
            this.voice.stopListening();
            this.isRecording = false;
        }
        
        // Update mic button
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.classList.remove('listening');
            micButton.querySelector('.mic-status').textContent = 'Start Speaking';
        }
        
        console.log('Answer saved for question', this.state.currentIndex + 1);
    }

    updateSessionInStorage(answer) {
        try {
            const sessionData = JSON.parse(localStorage.getItem('ai_interview_session_v1'));
            if (sessionData && sessionData.questions[this.state.currentIndex]) {
                sessionData.questions[this.state.currentIndex].userAnswer = answer;
                sessionData.questions[this.state.currentIndex].answeredAt = Date.now();
                localStorage.setItem('ai_interview_session_v1', JSON.stringify(sessionData));
            }
        } catch (error) {
            console.error('Failed to update session:', error);
        }
    }

    nextQuestion() {
        if (this.synth) {
            this.synth.cancel();
        }

        if (this.state.currentIndex < this.state.totalQuestions - 1) {
            this.state.currentIndex++;
            this.displayCurrentQuestion();
            this.updateProgress();
            
            document.getElementById('nextQuestionBtn').disabled = true;
            document.getElementById('submitAnswerBtn').disabled = true;
            
            document.getElementById('transcriptArea').innerHTML = '<p class="placeholder-text">Your answer will appear here...</p>';
        } else {
            this.completeInterview();
        }
    }

    resetForNewQuestion() {
        // Reset transcript for new question
        this.sessionTranscript = '';
        this.isRecording = false;
        
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.classList.remove('listening');
            micButton.querySelector('.mic-status').textContent = 'Start Speaking';
        }
        
        if (this.voice.isListening) {
            this.voice.stopListening();
        }
    }

    /**
     * COMPLETE INTERVIEW - Generate intelligent report
     */
    async completeInterview() {
        this.state.status = 'evaluating';
        this.ui.switchPhase('interview', 'evaluation');
        
        document.getElementById('evaluationLoading').classList.remove('hidden');
        document.getElementById('evaluationContent').classList.add('hidden');
        
        try {
            const sessionData = JSON.parse(localStorage.getItem('ai_interview_session_v1'));
            
            if (!sessionData) {
                throw new Error('No session data found');
            }
            
            const evaluation = await this.ai.evaluateInterview(sessionData);
            this.saveInterviewResult(evaluation, sessionData);
            this.displayPersonalizedEvaluation(evaluation);
            
        } catch (error) {
            console.error('Evaluation error:', error);
            
            const sessionData = {
                questions: this.state.answers.map(a => ({
                    question: a.question,
                    userAnswer: a.answer,
                    expectedConcepts: a.expectedConcepts || []
                }))
            };
            
            const evaluation = await this.ai.evaluateInterview(sessionData);
            this.displayPersonalizedEvaluation(evaluation);
        }
        
        document.getElementById('evaluationLoading').classList.add('hidden');
        document.getElementById('evaluationContent').classList.remove('hidden');
        
        // Clear session after analysis
        localStorage.removeItem('ai_interview_session_v1');
    }

    displayPersonalizedEvaluation(evaluation) {
        // Update overall score
        document.getElementById('overallScore').textContent = evaluation.overallScore + '%';
        
        // Display detailed score explanation
        const scoreExplanationEl = document.getElementById('scoreExplanation');
        if (scoreExplanationEl && evaluation.scoreExplanation) {
            scoreExplanationEl.textContent = evaluation.scoreExplanation;
        }
        
        // Display stats
        const statsEl = document.getElementById('performanceStats');
        if (statsEl && evaluation.stats) {
            statsEl.innerHTML = `
                <div class="stat-badge correct">✅ Correct: ${evaluation.stats.correct}</div>
                <div class="stat-badge partial">⚠️ Partial: ${evaluation.stats.partial}</div>
                <div class="stat-badge incorrect">❌ Incorrect: ${evaluation.stats.incorrect}</div>
            `;
        }
        
        // Display personalized feedback
        this.updateList('strengthsList', evaluation.strengths);
        this.updateList('weaknessesList', evaluation.weaknesses);
        document.getElementById('communicationFeedback').textContent = 'Analysis complete';
        this.updateList('suggestionsList', evaluation.suggestions);
        
        // Display knowledge level
        const knowledgeEl = document.getElementById('knowledgeLevel');
        if (knowledgeEl && evaluation.knowledgeLevel) {
            knowledgeEl.textContent = evaluation.knowledgeLevel;
        }
        
        // Display question review
        this.displayQuestionReview(evaluation.questionAnalyses);
        
        // Set up action buttons
        document.getElementById('newInterviewBtn').addEventListener('click', () => {
            window.location.href = 'interview.html';
        });
        
        document.getElementById('viewDashboardBtn').addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    displayQuestionReview(analyses) {
        const container = document.getElementById('questionReview');
        if (!container || !analyses) return;
        
        let html = '<h3>Detailed Answer Analysis</h3>';
        
        analyses.forEach((analysis, index) => {
            const correctnessClass = {
                'correct': 'correct-answer',
                'partial': 'partial-answer',
                'incorrect': 'incorrect-answer'
            }[analysis.correctness] || '';
            
            const correctnessIcon = {
                'correct': '✅',
                'partial': '⚠️',
                'incorrect': '❌'
            }[analysis.correctness] || '❓';
            
            html += `
                <div class="question-review-card ${correctnessClass}">
                    <div class="review-header">
                        <span class="question-number">Q${index + 1}</span>
                        <span class="question-score">Score: ${analysis.score}%</span>
                        <span class="correctness-badge">${correctnessIcon} ${analysis.correctness}</span>
                    </div>
                    
                    <div class="review-question">
                        <strong>Question:</strong>
                        <p>${analysis.question}</p>
                    </div>
                    
                    <div class="review-answer">
                        <strong>Your Answer:</strong>
                        <p>${analysis.cleanedAnswer || analysis.answer || 'No answer provided'}</p>
                    </div>
                    
                    <div class="score-reason">
                        <strong>Why this score:</strong>
                        <p>${analysis.scoreReason || 'Analysis complete'}</p>
                    </div>
                    
                    <div class="review-feedback">
                        <p class="feedback-text">${analysis.feedback || ''}</p>
                    </div>
                    
                    ${analysis.missingConcepts && analysis.missingConcepts.length > 0 ? `
                        <div class="missing-concepts">
                            <strong>Concepts to Review:</strong>
                            <ul>
                                ${analysis.missingConcepts.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    updateList(elementId, items) {
        const list = document.getElementById(elementId);
        if (list && items) {
            list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }
    }

    saveInterviewResult(evaluation, sessionData) {
        const interviewData = {
            id: this.state.sessionId,
            date: new Date().toISOString(),
            role: this.state.role,
            difficulty: this.state.difficulty,
            score: evaluation.overallScore,
            skills: this.extractSkills(evaluation),
            summary: {
                questionsCount: sessionData.questions.length,
                answeredCount: sessionData.questions.filter(q => q.userAnswer).length,
                duration: Date.now() - this.state.startTime,
                knowledgeLevel: evaluation.knowledgeLevel,
                strengths: evaluation.strengths.slice(0, 3),
                weaknesses: evaluation.weaknesses.slice(0, 3),
                stats: evaluation.stats
            }
        };
        
        this.storage.saveInterview(interviewData);
    }

    extractSkills(evaluation) {
        const baseScore = evaluation.overallScore;
        return {
            technical: Math.min(100, baseScore + (Math.random() * 10 - 5)),
            communication: Math.min(100, baseScore + (Math.random() * 15 - 7)),
            problemSolving: Math.min(100, baseScore + (Math.random() * 10 - 5)),
            experience: Math.min(100, baseScore + (Math.random() * 20 - 10))
        };
    }

    generateSessionId() {
        return 'int_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize
if (window.location.pathname.includes('interview.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.interviewEngine = new InterviewEngine();
    });
}