// Menu JavaScript
class GameMenu {
  constructor() {
    this.selectedLevel = null;
    this.gameSettings = {
      musicVolume: 80,
      soundVolume: 80,
      difficulty: 'normal'
    };
    this.loadSettings();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Main menu buttons
    document.getElementById('playBtn').addEventListener('click', () => this.showLevelSelection());
    document.getElementById('instructions').addEventListener('click', () => this.showModal('instructionsModal'));
    
    // Level selection
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.addEventListener('click', () => this.selectLevel(card));
    });

    // Level selection buttons
    document.getElementById('startGame').addEventListener('click', () => this.startGame());
    document.getElementById('backToMenu').addEventListener('click', () => this.showMainMenu());

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          this.closeModal(openModal);
        }
      }
    });
  }

  showLevelSelection() {
    document.querySelector('.main-menu').style.display = 'none';
    document.getElementById('levelSelection').style.display = 'block';
    this.checkLevelProgress();
  }

  showMainMenu() {
    document.querySelector('.main-menu').style.display = 'block';
    document.getElementById('levelSelection').style.display = 'none';
    this.selectedLevel = null;
    
    // Reset start game button
    const startBtn = document.getElementById('startGame');
    startBtn.disabled = true;
    startBtn.textContent = 'Start Game';
  }

  selectLevel(card) {
    const level = card.dataset.level;
    const isLocked = card.classList.contains('locked');

    if (isLocked) {
      this.showNotification('This level is locked! Complete previous levels to unlock.', 'warning');
      return;
    }

    // Remove previous selection
    document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
    
    // Add selection to clicked card
    card.classList.add('selected');
    this.selectedLevel = level;

    // Enable start game button
    const startBtn = document.getElementById('startGame');
    startBtn.disabled = false;
    startBtn.textContent = `Start Level ${level}`;

    // Add visual feedback
    this.showNotification(`Level ${level} selected!`, 'success');
  }

  startGame() {
    if (!this.selectedLevel) {
      this.showNotification('Please select a level first!', 'warning');
      return;
    }

    // Save current settings
    this.saveSettings();

    // Navigate to selected level
    const levelPath = `../levels/level${this.selectedLevel}/main.html`;
    window.location.href = levelPath;
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add show class for animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  closeModal(modal) {
    // Remove show class for animation
    modal.classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  }


  saveSettings() {
    localStorage.setItem('fireWaterGameSettings', JSON.stringify(this.gameSettings));
  }

  loadSettings() {
    const saved = localStorage.getItem('fireWaterGameSettings');
    if (saved) {
      this.gameSettings = { ...this.gameSettings, ...JSON.parse(saved) };
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 'bold',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    // Set background color based on type
    const colors = {
      success: '#4ecdc4',
      warning: '#ff6b6b',
      info: '#2a5298'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Check for completed levels and unlock new ones
  checkLevelProgress() {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    document.querySelectorAll('.level-card').forEach((card, index) => {
      const levelNum = index + 1;
      
      if (completedLevels.includes(levelNum)) {
        card.classList.add('completed');
        card.querySelector('.level-status').textContent = '✓ Completed';
        card.querySelector('.level-status').className = 'level-status completed';
      } else if (levelNum === 1 || completedLevels.includes(levelNum - 1)) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        card.querySelector('.level-status').textContent = '✓ Available';
        card.querySelector('.level-status').className = 'level-status unlocked';
      }
    });
  }
}

// Initialize menu when page loads
document.addEventListener('DOMContentLoaded', () => {
  const menu = new GameMenu();
  menu.checkLevelProgress();
  
  // Add some visual effects
  const levelCards = document.querySelectorAll('.level-card');
  levelCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.animation = 'fadeInUp 0.6s ease forwards';
  });
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .level-card.completed {
    background: rgba(78, 205, 196, 0.2);
    border-color: #4ecdc4;
  }
  
  .level-card.completed .level-status {
    background: rgba(78, 205, 196, 0.4);
    color: #4ecdc4;
  }
`;
document.head.appendChild(style);
