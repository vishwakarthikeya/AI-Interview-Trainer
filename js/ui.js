/**
 * UI Service
 * Handles common UI interactions and animations
 */

export class UIService {
    constructor() {
        this.toastTimeout = null;
    }

    // Switch between phases (setup, interview, evaluation)
    switchPhase(fromPhase, toPhase) {
        const phases = ['setup', 'interview', 'evaluation'];
        
        phases.forEach(phase => {
            const element = document.getElementById(phase + 'Phase');
            if (element) {
                element.classList.remove('active');
            }
        });
        
        const newPhase = document.getElementById(toPhase + 'Phase');
        if (newPhase) {
            newPhase.classList.add('active');
        }
    }

    // Typing animation for questions
    typeText(element, text, speed = 30) {
        if (!element) return;
        
        element.textContent = '';
        element.classList.add('typing-animation');
        
        let i = 0;
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing-animation');
            }
        };
        
        type();
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style toast
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'error' ? '#ef4444' : '#6366f1',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: '9999',
            fontSize: '14px',
            fontWeight: '500',
            animation: 'slideUp 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // Auto remove
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        this.toastTimeout = setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Show loading spinner
    showLoading(container) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner"></div>
            <p>Loading...</p>
        `;
        
        container.innerHTML = '';
        container.appendChild(spinner);
    }

    // Hide loading spinner
    hideLoading(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    // Format time (ms to readable)
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update progress bar
    updateProgressBar(percent) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercentage');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        
        if (progressPercent) {
            progressPercent.textContent = `${Math.round(percent)}%`;
        }
    }

    // Scroll to element smoothly
    scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Show confirmation dialog
    async confirm(message) {
        return new Promise((resolve) => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    }

    // Add CSS animation styles
    static addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            
            .toast {
                animation: slideUp 0.3s ease;
            }
            
            .fade-out {
                animation: fadeOut 0.3s ease forwards;
            }
        `;
        document.head.appendChild(style);
    }
}

// Add animation styles on load
UIService.addAnimationStyles();