// Animations and Visual Effects for QuizZone
const animations = {
    // Create confetti animation for celebration
    createConfetti: function(container, count = 100) {
        // Clear container first
        container.innerHTML = '';
        
        // Define confetti colors
        const colors = [
            '#f94144', '#f3722c', '#f8961e', '#f9c74f', 
            '#90be6d', '#43aa8b', '#577590', '#4361ee'
        ];
        
        // Create confetti pieces
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            
            // Randomize properties
            const leftPos = Math.random() * 100;
            const animationDelay = Math.random() * 5;
            const animationDuration = Math.random() * 3 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const rotationDirection = Math.random() > 0.5 ? 'normal' : 'reverse';
            
            // Apply styles
            piece.style.left = `${leftPos}%`;
            piece.style.backgroundColor = color;
            piece.style.width = `${size}px`;
            piece.style.height = `${size * 1.5}px`;
            piece.style.animationDelay = `${animationDelay}s`;
            piece.style.animationDuration = `${animationDuration}s`;
            piece.style.animationDirection = rotationDirection;
            
            // Add to container
            container.appendChild(piece);
        }
    },
    
    // Create a flashing effect for correct answers
    flashCorrectAnswer: function(element) {
        element.classList.add('flash-correct');
        setTimeout(() => {
            element.classList.remove('flash-correct');
        }, 1000);
    },
    
    // Create a shaking effect for incorrect answers
    shakeIncorrectAnswer: function(element) {
        element.classList.add('shake-incorrect');
        setTimeout(() => {
            element.classList.remove('shake-incorrect');
        }, 500);
    },
    
    // Animate the progress bar
    animateProgressBar: function(element, fromPercent, toPercent) {
        // Set initial width
        element.style.width = `${fromPercent}%`;
        
        // Trigger animation by setting new width after a small delay
        setTimeout(() => {
            element.style.width = `${toPercent}%`;
        }, 50);
    },
    
    // Create a pulse animation on an element
    pulseElement: function(element, duration = 500) {
        element.classList.add('pulse-animation');
        setTimeout(() => {
            element.classList.remove('pulse-animation');
        }, duration);
    },
    
    // Create a fade-in animation
    fadeIn: function(element, delay = 0) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease';
            element.style.opacity = '1';
        }, delay);
    },
    
    // Create a fade-out animation
    fadeOut: function(element, delay = 0, callback) {
        element.style.opacity = '1';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease';
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, 500);
        }, delay);
    },
    
    // Create a slide-in animation
    slideIn: function(element, direction = 'right', delay = 0) {
        const originalDisplay = element.style.display || 'block';
        element.style.display = 'none';
        
        let initialTransform = '';
        switch (direction) {
            case 'left':
                initialTransform = 'translateX(-100%)';
                break;
            case 'right':
                initialTransform = 'translateX(100%)';
                break;
            case 'up':
                initialTransform = 'translateY(-100%)';
                break;
            case 'down':
                initialTransform = 'translateY(100%)';
                break;
        }
        
        setTimeout(() => {
            element.style.transform = initialTransform;
            element.style.opacity = '0';
            element.style.display = originalDisplay;
            
            setTimeout(() => {
                element.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                element.style.transform = 'translate(0, 0)';
                element.style.opacity = '1';
            }, 50);
        }, delay);
    },
    
    // Create a slide-out animation
    slideOut: function(element, direction = 'right', delay = 0, callback) {
        element.style.opacity = '1';
        element.style.transform = 'translate(0, 0)';
        
        let finalTransform = '';
        switch (direction) {
            case 'left':
                finalTransform = 'translateX(-100%)';
                break;
            case 'right':
                finalTransform = 'translateX(100%)';
                break;
            case 'up':
                finalTransform = 'translateY(-100%)';
                break;
            case 'down':
                finalTransform = 'translateY(100%)';
                break;
        }
        
        setTimeout(() => {
            element.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            element.style.transform = finalTransform;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, 500);
        }, delay);
    },
    
    // Bounce animation for elements
    bounce: function(element, intensity = 'medium', delay = 0) {
        let keyframes;
        
        switch (intensity) {
            case 'low':
                keyframes = [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-5px)' },
                    { transform: 'translateY(0)' }
                ];
                break;
            case 'medium':
                keyframes = [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-10px)' },
                    { transform: 'translateY(0)' }
                ];
                break;
            case 'high':
                keyframes = [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-20px)' },
                    { transform: 'translateY(0)' }
                ];
                break;
        }
        
        const options = {
            duration: 500,
            iterations: 1,
            easing: 'ease-in-out'
        };
        
        setTimeout(() => {
            element.animate(keyframes, options);
        }, delay);
    },
    
    // Create a typing animation effect
    typeText: function(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    },
    
    // Create a count-up animation for scores
    countUp: function(element, startValue, endValue, duration = 1000) {
        const startTime = performance.now();
        const updateCount = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + progress * (endValue - startValue));
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = endValue;
            }
        };
        
        requestAnimationFrame(updateCount);
    },
    
    // Create a scale animation (grow/shrink)
    scale: function(element, fromScale = 0, toScale = 1, duration = 500, delay = 0) {
        element.style.transform = `scale(${fromScale})`;
        
        setTimeout(() => {
            element.style.transition = `transform ${duration}ms ease`;
            element.style.transform = `scale(${toScale})`;
        }, delay);
    }
};