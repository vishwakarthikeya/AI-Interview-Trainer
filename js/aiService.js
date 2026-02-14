/**
 * AI Service for intelligent interview evaluation
 * WITH ENHANCED REASONING, SCORE EXPLANATIONS, AND ROLE INTELLIGENCE
 */

export class AIService {
    constructor() {
        // NEVER hardcode API keys - use environment variables
        this.apiKey = null;
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.useMockData = true;
        
        this.loadApiKey();
        
        // Enhanced knowledge base with domain-specific concepts
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        // Role domain mapping for intelligent questioning
        this.roleDomainMap = {
            "Data Scientist": ["statistics", "machine learning", "python", "data analysis", "visualization", "predictive modeling", "hypothesis testing"],
            "ML Engineer": ["deep learning", "model deployment", "tensorflow", "pytorch", "mlops", "neural networks", "model optimization"],
            "Frontend Developer": ["html", "css", "javascript", "react", "vue", "angular", "ui design", "responsive design", "browser apis"],
            "Backend Developer": ["node.js", "python", "java", "apis", "databases", "system design", "microservices", "caching", "security"],
            "Full Stack Developer": ["frontend", "backend", "databases", "api design", "deployment", "architecture", "devops"],
            "DevOps Engineer": ["ci/cd", "docker", "kubernetes", "aws", "cloud", "automation", "infrastructure", "monitoring", "terraform"],
            "Product Manager": ["product strategy", "user research", "roadmapping", "metrics", "agile", "stakeholder management", "market analysis"],
            "HR": ["recruitment", "talent acquisition", "employee relations", "performance management", "hr policies", "onboarding"],
            "Marketing": ["campaign strategy", "brand management", "analytics", "seo", "content marketing", "social media", "customer acquisition"]
        };
    }

    initializeKnowledgeBase() {
        return {
            'Data Scientist': {
                keywords: ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'statistics', 'visualization'],
                concepts: ['data cleaning', 'feature engineering', 'model evaluation', 'cross-validation', 'hypothesis testing'],
                explanations: {
                    'statistics': 'Statistical understanding is crucial for data interpretation and model validation.',
                    'machine learning': 'Understanding ML algorithms and their trade-offs is fundamental.',
                    'python': 'Python is the primary language for data science with rich ecosystem.'
                }
            },
            'Frontend Developer': {
                keywords: ['html', 'css', 'javascript', 'react', 'components', 'state', 'props'],
                concepts: ['virtual dom', 'rendering', 'performance', 'accessibility', 'responsive design'],
                explanations: {
                    'javascript': 'JavaScript is the core language for frontend interactivity.',
                    'react': 'React components should be reusable and maintainable.',
                    'css': 'CSS requires understanding of layout, specificity, and responsive design.'
                }
            },
            'Backend Developer': {
                keywords: ['api', 'database', 'server', 'node.js', 'python', 'java', 'sql'],
                concepts: ['rest', 'graphql', 'orm', 'scalability', 'caching', 'security'],
                explanations: {
                    'api': 'APIs should be RESTful, versioned, and properly documented.',
                    'database': 'Database choice depends on data structure and access patterns.',
                    'scalability': 'Systems should scale horizontally with load balancing.'
                }
            },
            'Product Manager': {
                keywords: ['product', 'user', 'market', 'roadmap', 'stakeholder', 'metrics'],
                concepts: ['prioritization', 'user research', 'agile', 'product strategy', 'go-to-market'],
                explanations: {
                    'prioritization': 'Features should be prioritized based on value vs effort.',
                    'user research': 'Understanding user needs drives product success.',
                    'metrics': 'Success should be measured with actionable metrics.'
                }
            }
        };
    }

    loadApiKey() {
        try {
            // For development - in production, use backend proxy
            const savedKey = localStorage.getItem('openai_api_key');
            if (savedKey && savedKey.length > 0) {
                this.apiKey = savedKey;
                this.useMockData = false;
                console.log('API key loaded (development mode)');
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    }

    /**
     * Generate highly relevant role-specific questions
     */
    async generateIntelligentQuestions(role, difficulty, count = 5) {
        // Get domain keywords for the role
        const domainKeywords = this.roleDomainMap[role] || [];
        
        if (this.useMockData || !this.apiKey) {
            return this.generateMockQuestions(role, difficulty, count, domainKeywords);
        }

        try {
            const prompt = this.buildIntelligentQuestionPrompt(role, domainKeywords, difficulty, count);
            const response = await this.callLLMApi(prompt);
            return this.parseQuestions(response, count);
        } catch (error) {
            console.error('Question generation error:', error);
            return this.generateMockQuestions(role, difficulty, count, domainKeywords);
        }
    }

    buildIntelligentQuestionPrompt(role, domainKeywords, difficulty, count) {
        const difficultyLevel = difficulty === 'junior' ? 'Beginner' : difficulty === 'mid' ? 'Intermediate' : 'Advanced';
        
        return `Generate ${count} highly relevant interview questions.

ROLE: ${role}
DOMAIN FOCUS: ${domainKeywords.join(', ')}
DIFFICULTY: ${difficultyLevel}
COUNT: ${count}

IMPORTANT REQUIREMENTS:
- Questions MUST be specific to ${role} role
- Focus on ${domainKeywords.slice(0, 3).join(', ')} concepts
- Mix of technical and scenario-based questions
- Progressive difficulty within the set
- Real-world practical problems

Return as JSON array with format:
[
  {
    "question": "detailed question text",
    "expectedConcepts": ["concept1", "concept2", "concept3"],
    "difficulty": "${difficulty}",
    "role": "${role}"
  }
]`;
    }

    generateMockQuestions(role, difficulty, count, domainKeywords) {
        const mockQuestions = {
            'Data Scientist': [
                {
                    question: "Explain the bias-variance tradeoff and how it affects model performance.",
                    expectedConcepts: ["bias", "variance", "overfitting", "underfitting", "model complexity"],
                    difficulty: difficulty
                },
                {
                    question: "How would you handle imbalanced classes in a classification problem?",
                    expectedConcepts: ["resampling", "SMOTE", "class weights", "evaluation metrics", "cost-sensitive learning"],
                    difficulty: difficulty
                },
                {
                    question: "Explain the difference between L1 and L2 regularization.",
                    expectedConcepts: ["lasso", "ridge", "feature selection", "sparsity", "overfitting prevention"],
                    difficulty: difficulty
                },
                {
                    question: "Describe a project where you used cross-validation and why it was important.",
                    expectedConcepts: ["k-fold", "validation", "overfitting", "model selection", "bias reduction"],
                    difficulty: difficulty
                }
            ],
            'Frontend Developer': [
                {
                    question: "Explain React's virtual DOM and how it improves performance.",
                    expectedConcepts: ["virtual DOM", "diffing", "reconciliation", "batching", "performance optimization"],
                    difficulty: difficulty
                },
                {
                    question: "How would you optimize a slow-loading React application?",
                    expectedConcepts: ["code splitting", "lazy loading", "memoization", "bundle optimization", "caching"],
                    difficulty: difficulty
                },
                {
                    question: "Explain CSS specificity and how it affects styling.",
                    expectedConcepts: ["selectors", "cascade", "inheritance", "importance", "inline styles"],
                    difficulty: difficulty
                }
            ],
            'Product Manager': [
                {
                    question: "How do you prioritize features when stakeholders have conflicting requirements?",
                    expectedConcepts: ["value vs effort", "stakeholder management", "data-driven decisions", "user impact", "strategic alignment"],
                    difficulty: difficulty
                },
                {
                    question: "Describe your process for validating a new product idea.",
                    expectedConcepts: ["user research", "MVP", "prototyping", "feedback loops", "market analysis"],
                    difficulty: difficulty
                }
            ]
        };

        const roleQuestions = mockQuestions[role] || mockQuestions['Data Scientist'];
        const selected = [];
        
        // Randomly select unique questions
        const shuffled = [...roleQuestions].sort(() => 0.5 - Math.random());
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            selected.push({...shuffled[i]});
        }
        
        // If we need more questions, duplicate with variation
        while (selected.length < count) {
            const baseQuestion = {...roleQuestions[selected.length % roleQuestions.length]};
            baseQuestion.question = baseQuestion.question + " (follow-up)";
            selected.push(baseQuestion);
        }
        
        return selected;
    }

    parseQuestions(response, count) {
        try {
            // Sanitize response - prevent injection
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('No JSON found');
            
            const jsonStr = jsonMatch[0]
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable chars
                
            const questions = JSON.parse(jsonStr);
            
            // Validate and sanitize each question
            return questions.slice(0, count).map(q => ({
                question: this.sanitizeText(q.question || ''),
                expectedConcepts: (q.expectedConcepts || []).map(c => this.sanitizeText(c)),
                difficulty: q.difficulty || 'mid'
            }));
        } catch (e) {
            console.error('Failed to parse questions:', e);
            return this.generateMockQuestions('Data Scientist', 'mid', count, []);
        }
    }

    sanitizeText(text) {
        if (!text) return '';
        // Remove any potential HTML/script tags
        return String(text).replace(/<[^>]*>/g, '').trim();
    }

    /**
     * Clean transcript before evaluation
     */
    cleanTranscript(rawText) {
        if (!rawText) return '';
        
        let cleaned = rawText
            // Remove filler words
            .replace(/\b(um|uh|ah|er|like|you know|sort of|kind of|actually|basically)\b/gi, '')
            // Fix common speech artifacts
            .replace(/\s+/g, ' ')
            .replace(/\s+([.,!?])/g, '$1')
            // Fix fragmented sentences
            .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase())
            // Ensure first letter capital
            .replace(/^[a-z]/, c => c.toUpperCase())
            .trim();
        
        if (cleaned.length > 0 && !['.', '!', '?'].includes(cleaned[cleaned.length - 1])) {
            cleaned += '.';
        }
        
        return cleaned;
    }

    /**
     * INTELLIGENT EVALUATION with score explanation
     */
    async evaluateInterview(sessionData) {
        if (!sessionData || !sessionData.questions || sessionData.questions.length === 0) {
            return this.getEmptyEvaluation();
        }

        try {
            // Clean answers
            const cleanedQuestions = sessionData.questions.map(q => ({
                ...q,
                cleanedAnswer: this.cleanTranscript(q.userAnswer || ''),
                originalAnswer: q.userAnswer
            }));

            const questionAnalyses = await this.analyzeAllAnswers({
                ...sessionData,
                questions: cleanedQuestions
            });
            
            return this.generateIntelligentReport(questionAnalyses, sessionData);
        } catch (error) {
            console.error('Evaluation error:', error);
            return this.getFallbackEvaluation(sessionData);
        }
    }

    async analyzeAllAnswers(sessionData) {
        const analyses = [];
        const role = sessionData.role || 'Data Scientist';

        for (let i = 0; i < sessionData.questions.length; i++) {
            const q = sessionData.questions[i];
            const analysis = await this.analyzeSingleAnswerIntelligently(q, role, i);
            analyses.push(analysis);
        }

        return analyses;
    }

    async analyzeSingleAnswerIntelligently(q, role, index) {
        const question = q.question || '';
        const answer = q.cleanedAnswer || q.userAnswer || '';
        const expectedConcepts = q.expectedConcepts || [];
        
        const analysis = {
            questionIndex: index,
            question: question,
            originalAnswer: q.userAnswer || '',
            cleanedAnswer: answer,
            score: 0,
            correctness: 'incorrect',
            strengths: [],
            weaknesses: [],
            missingConcepts: [],
            conceptCorrections: [],
            feedback: '',
            scoreReason: ''
        };

        if (!answer || answer.trim().length === 0) {
            analysis.score = 0;
            analysis.correctness = 'incorrect';
            analysis.weaknesses.push('No answer provided');
            analysis.feedback = 'Please provide an answer to receive feedback.';
            analysis.scoreReason = 'No answer given - score 0%';
            return analysis;
        }

        const result = this.evaluateAnswerIntelligently(question, answer, expectedConcepts, role);
        
        analysis.score = result.score;
        analysis.correctness = result.correctness;
        analysis.strengths = result.strengths;
        analysis.weaknesses = result.weaknesses;
        analysis.missingConcepts = result.missingConcepts;
        analysis.conceptCorrections = result.conceptCorrections;
        analysis.scoreReason = result.scoreReason;
        analysis.feedback = this.generateDetailedFeedback(analysis);

        return analysis;
    }

    evaluateAnswerIntelligently(question, answer, expectedConcepts, role) {
        const result = {
            score: 0,
            correctness: 'incorrect',
            strengths: [],
            weaknesses: [],
            missingConcepts: [],
            conceptCorrections: [],
            scoreReason: ''
        };

        const answerLower = answer.toLowerCase();
        const wordCount = answer.split(/\s+/).length;
        
        // Track concept coverage
        let conceptsCovered = 0;
        const coveredConcepts = [];
        const conceptDetails = [];

        expectedConcepts.forEach(concept => {
            const conceptLower = concept.toLowerCase();
            if (answerLower.includes(conceptLower)) {
                conceptsCovered++;
                coveredConcepts.push(concept);
                conceptDetails.push(`✓ Mentioned ${concept}`);
            } else {
                result.missingConcepts.push(concept);
                conceptDetails.push(`✗ Missing ${concept}`);
            }
        });

        // Check depth indicators
        const hasExamples = this.containsExamples(answer);
        const hasStructure = this.hasStructure(answer);
        const hasTechnicalTerms = this.hasTechnicalTerms(answer, role);

        // Calculate scores with explanations
        const conceptScore = expectedConcepts.length > 0 
            ? (conceptsCovered / expectedConcepts.length) * 40 
            : 30;
        
        const depthScore = Math.min(20, (wordCount / 15) * 10);
        const examplesScore = hasExamples ? 15 : 0;
        const structureScore = hasStructure ? 10 : 0;
        const technicalScore = hasTechnicalTerms ? 15 : 0;

        result.score = Math.min(100, Math.round(
            conceptScore + depthScore + examplesScore + structureScore + technicalScore
        ));

        // Generate detailed score reason
        const reasons = [];
        if (conceptsCovered > 0) {
            reasons.push(`Covered ${conceptsCovered}/${expectedConcepts.length} key concepts`);
        } else {
            reasons.push('Missed all key concepts');
        }
        
        if (hasExamples) reasons.push('Good use of examples');
        else reasons.push('Missing concrete examples');
        
        if (wordCount < 30) reasons.push('Answer too brief');
        else if (wordCount > 100) reasons.push('Comprehensive detail');
        
        result.scoreReason = `Score: ${result.score}% - ` + reasons.join(', ');

        // Determine correctness with explanation
        if (result.score >= 80) {
            result.correctness = 'correct';
            result.strengths.push('Strong understanding demonstrated');
            result.strengths.push(`Covered key concepts: ${coveredConcepts.slice(0, 3).join(', ')}`);
            if (hasExamples) result.strengths.push('Excellent use of examples');
            if (hasStructure) result.strengths.push('Well-structured response');
        } else if (result.score >= 50) {
            result.correctness = 'partial';
            result.weaknesses.push('Partial understanding - needs more depth');
            if (result.missingConcepts.length > 0) {
                result.weaknesses.push(`Missing: ${result.missingConcepts.slice(0, 3).join(', ')}`);
            }
            if (!hasExamples) result.weaknesses.push('Add concrete examples');
            if (wordCount < 50) result.weaknesses.push('Elaborate more');
        } else {
            result.correctness = 'incorrect';
            result.weaknesses.push('Significant gaps in understanding');
            result.missingConcepts.forEach(concept => {
                result.conceptCorrections.push(
                    `Missing: ${concept} - ${this.getConceptExplanation(concept, role)}`
                );
            });
        }

        return result;
    }

    containsExamples(answer) {
        const indicators = ['for example', 'such as', 'like when', 'instance', 'case study', 'in practice'];
        return indicators.some(i => answer.toLowerCase().includes(i));
    }

    hasStructure(answer) {
        const indicators = ['first', 'second', 'finally', 'in conclusion', '1.', '2.', 'firstly', 'secondly'];
        return indicators.some(i => answer.toLowerCase().includes(i));
    }

    hasTechnicalTerms(answer, role) {
        const roleBase = this.knowledgeBase[role] || this.knowledgeBase['Data Scientist'];
        const keywords = roleBase?.keywords || [];
        const answerLower = answer.toLowerCase();
        return keywords.some(k => answerLower.includes(k.toLowerCase()));
    }

    getConceptExplanation(concept, role) {
        const roleBase = this.knowledgeBase[role] || this.knowledgeBase['Data Scientist'];
        return roleBase.explanations?.[concept.toLowerCase()] || 
               `${concept} is an important concept for ${role} role. Review fundamentals.`;
    }

    generateDetailedFeedback(analysis) {
        let feedback = '';
        
        switch(analysis.correctness) {
            case 'correct':
                feedback = `✅ Excellent answer! ${analysis.strengths[0]}. `;
                if (analysis.strengths.length > 1) {
                    feedback += `Particularly strong: ${analysis.strengths.slice(1, 3).join(', ')}.`;
                }
                break;
            case 'partial':
                feedback = `⚠️ Good attempt. ${analysis.weaknesses[0]}. `;
                if (analysis.missingConcepts.length > 0) {
                    feedback += `Focus on: ${analysis.missingConcepts.slice(0, 3).join(', ')}.`;
                }
                break;
            case 'incorrect':
                feedback = `❌ Needs significant improvement. ${analysis.weaknesses[0]}.\n\n`;
                feedback += `Key concepts to review:\n`;
                analysis.missingConcepts.slice(0, 3).forEach(concept => {
                    feedback += `• ${concept}\n`;
                });
                break;
        }
        
        return feedback;
    }

    generateIntelligentReport(analyses, sessionData) {
        const totalScore = analyses.reduce((sum, a) => sum + a.score, 0);
        const overallScore = Math.round(totalScore / analyses.length);

        const correctCount = analyses.filter(a => a.correctness === 'correct').length;
        const partialCount = analyses.filter(a => a.correctness === 'partial').length;
        const incorrectCount = analyses.filter(a => a.correctness === 'incorrect').length;

        // Collect personalized feedback
        const allStrengths = analyses.flatMap(a => a.strengths);
        const allWeaknesses = analyses.flatMap(a => a.weaknesses);
        const allMissingConcepts = [...new Set(analyses.flatMap(a => a.missingConcepts))];

        // Generate comprehensive score explanation
        let scoreExplanation = `Overall Score: ${overallScore}%\n\n`;
        scoreExplanation += `Breakdown:\n`;
        scoreExplanation += `✅ Correct answers: ${correctCount}\n`;
        scoreExplanation += `⚠️ Partially correct: ${partialCount}\n`;
        scoreExplanation += `❌ Needs improvement: ${incorrectCount}\n\n`;
        
        if (overallScore >= 80) {
            scoreExplanation += `Strong performance! You demonstrated good understanding of most concepts.`;
        } else if (overallScore >= 60) {
            scoreExplanation += `Solid foundation but needs reinforcement in key areas.`;
        } else {
            scoreExplanation += `Significant gaps identified. Focus on fundamentals.`;
        }

        if (allMissingConcepts.length > 0) {
            scoreExplanation += `\n\nPriority concepts to review:\n`;
            allMissingConcepts.slice(0, 5).forEach(c => {
                scoreExplanation += `• ${c}\n`;
            });
        }

        // Generate improvement suggestions
        const suggestions = [];
        if (incorrectCount > 0) {
            suggestions.push(`Review fundamentals: ${allMissingConcepts.slice(0, 3).join(', ')}`);
        }
        if (analyses.some(a => !this.containsExamples(a.cleanedAnswer))) {
            suggestions.push('Include concrete examples in your answers');
        }
        if (analyses.some(a => (a.cleanedAnswer?.length || 0) < 50)) {
            suggestions.push('Provide more detailed, elaborated responses');
        }
        if (suggestions.length < 3) {
            suggestions.push('Practice with timed mock interviews');
            suggestions.push('Study role-specific case studies');
        }

        return {
            overallScore,
            scoreExplanation,
            strengths: this.deduplicateArray(allStrengths).slice(0, 5),
            weaknesses: this.deduplicateArray(allWeaknesses).slice(0, 5),
            missingConcepts: allMissingConcepts.slice(0, 5),
            suggestions: suggestions.slice(0, 5),
            knowledgeLevel: this.determineKnowledgeLevel(overallScore, analyses),
            questionAnalyses: analyses,
            stats: { correct: correctCount, partial: partialCount, incorrect: incorrectCount }
        };
    }

    determineKnowledgeLevel(overallScore, analyses) {
        const avgDepth = analyses.reduce((sum, a) => sum + (a.cleanedAnswer?.length || 0), 0) / analyses.length;
        
        if (overallScore >= 85 && avgDepth > 150) return 'Expert';
        if (overallScore >= 70 && avgDepth > 100) return 'Advanced';
        if (overallScore >= 50 && avgDepth > 60) return 'Intermediate';
        return 'Beginner';
    }

    deduplicateArray(arr) {
        return [...new Set(arr)];
    }

    getEmptyEvaluation() {
        return {
            overallScore: 0,
            scoreExplanation: 'No answers provided for evaluation',
            strengths: ['Complete an interview first'],
            weaknesses: ['No data available'],
            missingConcepts: [],
            suggestions: ['Start a new interview session'],
            knowledgeLevel: 'Not assessed',
            questionAnalyses: [],
            stats: { correct: 0, partial: 0, incorrect: 0 }
        };
    }

    getFallbackEvaluation(sessionData) {
        const analyses = sessionData.questions.map((q, i) => ({
            questionIndex: i,
            question: q.question,
            cleanedAnswer: q.userAnswer || '',
            score: 50,
            correctness: 'partial',
            strengths: ['Answer provided'],
            weaknesses: ['Could be more detailed'],
            missingConcepts: q.expectedConcepts || [],
            conceptCorrections: [],
            feedback: 'Review the concepts mentioned.',
            scoreReason: 'Partial answer - needs more detail'
        }));

        return this.generateIntelligentReport(analyses, sessionData);
    }

    async callLLMApi(prompt) {
        if (!this.apiKey) {
            throw new Error('No API key configured');
        }

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an expert technical interviewer. Generate highly relevant, role-specific questions.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

export const aiService = new AIService();