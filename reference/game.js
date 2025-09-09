// Game initialization and constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configuration
const CONFIG = {
    GRAVITY: 0.6,
    PLAYER_SPEED: 3,
    JUMP_POWER: 12,
    FRICTION: 0.8
};

// Asset manager
class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.music = {};
        this.loaded = 0;
        this.total = 0;
    }
    
    loadImage(name, src) {
        this.total++;
        const img = new Image();
        img.onload = () => {
            this.images[name] = img;
            this.loaded++;
            this.updateProgress();
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            this.loaded++;
            this.updateProgress();
        };
        img.src = src;
    }
    
    loadSound(name, elementId) {
        this.total++;
        const audio = document.getElementById(elementId);
        if (audio) {
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                this.loaded++;
                this.updateProgress();
            });
            audio.addEventListener('error', () => {
                console.warn(`Failed to load sound: ${elementId}`);
                this.loaded++;
                this.updateProgress();
            });
            audio.load();
        } else {
            this.loaded++;
            this.updateProgress();
        }
    }
    
    updateProgress() {
        const progress = (this.loaded / this.total) * 100;
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (loadingText) {
            if (progress < 100) {
                loadingText.textContent = `Loading assets... ${Math.round(progress)}%`;
            } else {
                loadingText.textContent = 'Ready to play!';
                setTimeout(() => this.hideLoadingScreen(), 500);
            }
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                gameManager.start();
            }, 500);
        }
    }
    
    playSound(name, volume = 1) {
        if (audioManager.soundEnabled && this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].volume = volume;
            this.sounds[name].play().catch(e => console.warn('Sound play failed:', e));
        }
    }
}

// Audio manager
class AudioManager {
    constructor() {
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.setupControls();
    }
    
    setupControls() {
        const musicToggle = document.getElementById('musicToggle');
        const soundToggle = document.getElementById('soundToggle');
        
        if (musicToggle) {
            musicToggle.addEventListener('click', () => this.toggleMusic());
        }
        
        if (soundToggle) {
            soundToggle.addEventListener('click', () => this.toggleSound());
        }
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const musicToggle = document.getElementById('musicToggle');
        
        if (this.musicEnabled) {
            this.playBackgroundMusic();
            musicToggle.classList.remove('muted');
            musicToggle.textContent = '🎵';
        } else {
            if (this.backgroundMusic) this.backgroundMusic.pause();
            musicToggle.classList.add('muted');
            musicToggle.textContent = '🎵';
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        
        if (this.soundEnabled) {
            soundToggle.classList.remove('muted');
            soundToggle.textContent = '🔊';
        } else {
            soundToggle.classList.add('muted');
            soundToggle.textContent = '🔊';
        }
    }
    
    playBackgroundMusic() {
        if (this.musicEnabled && this.backgroundMusic) {
            this.backgroundMusic.volume = 0.3;
            this.backgroundMusic.play().catch(e => console.warn('Music play failed:', e));
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
}

// Game state management
class GameManager {
    constructor() {
        this.state = {
            gems: 0,
            totalGems: 4,
            level: 1,
            gameWon: false,
            startTime: 0,
            gameRunning: false
        };
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const restartBtn = document.getElementById('restartBtn');
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }
        
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => this.nextLevel());
        }
    }
    
    start() {
        this.state.gameRunning = true;
        this.state.startTime = Date.now();
        audioManager.playBackgroundMusic();
        this.gameLoop();
    }
    
    collectGem() {
        this.state.gems++;
        assetManager.playSound('gemCollect', 0.7);
        document.getElementById('gemCount').textContent = `${this.state.gems}/${this.state.totalGems}`;
    }
    
    playerDied() {
        assetManager.playSound('death', 0.8);
    }
    
    checkWinCondition() {
        if (this.state.gems === this.state.totalGems && 
            fireboy.atExit && watergirl.atExit && 
            !this.state.gameWon) {
            
            this.state.gameWon = true;
            this.showVictoryScreen();
        }
    }
    
    showVictoryScreen() {
        const completionTime = Math.floor((Date.now() - this.state.startTime) / 1000);
        const minutes = Math.floor(completionTime / 60);
        const seconds = completionTime % 60;
        
        document.getElementById('finalGemCount').textContent = `${this.state.gems}/${this.state.totalGems}`;
        document.getElementById('completionTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('victoryScreen').style.display = 'block';
        
        assetManager.playSound('levelComplete', 0.8);
        audioManager.stopBackgroundMusic();
    }
    
    restart() {
        this.state = {
            gems: 0,
            totalGems: 4,
            level: 1,
            gameWon: false,
            startTime: Date.now(),
            gameRunning: true
        };
        
        this.resetLevel();
        document.getElementById('victoryScreen').style.display = 'none';
        audioManager.playBackgroundMusic();
    }
    
    nextLevel() {
        this.state.level++;
        this.state.gems = 0;
        this.state.gameWon = false;
        this.state.startTime = Date.now();
        
        // For now, just restart the same level
        // In the future, you can load different level configurations
        this.resetLevel();
        document.getElementById('victoryScreen').style.display = 'none';
        audioManager.playBackgroundMusic();
    }
    
    resetLevel() {
        // Reset players
        fireboy = new Player(50, canvas.height - 150, 'fire');
        watergirl = new Player(100, canvas.height - 150, 'water');
        
        // Reset gems
        gems = [
            {x: 130, y: 320, size: 15, type: 'fire', collected: false},
            {x: 330, y: 220, size: 15, type: 'water', collected: false},
            {x: 620, y: 150, size: 15, type: 'fire', collected: false},
            {x: 430, y: 370, size: 15, type: 'water', collected: false}
        ];
        
        document.getElementById('gemCount').textContent = '0/4';
    }
    
    gameLoop() {
        if (!this.state.gameRunning) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw everything
        renderer.drawBackground();
        renderer.drawPlatforms();
        renderer.drawHazards();
        renderer.drawGems();
        renderer.drawExits();
        
        // Update and draw players
        if (fireboy) {
            fireboy.update();
            fireboy.draw();
        }
        if (watergirl) {
            watergirl.update();
            watergirl.draw();
        }
        
        // Check win condition
        this.checkWinCondition();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Input handling
class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
        
        // Prevent context menu on right click
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    isPressed(key) {
        return !!this.keys[key];
    }
}

// Player class
class Player {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.type = type;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.atExit = false;
        this.lastJumpTime = 0;
    }
    
    update() {
        this.handleInput();
        this.applyPhysics();
        this.checkCollisions();
    }
    
    handleInput() {
        const now = Date.now();
        
        if (this.type === 'fire') {
            if (inputManager.isPressed('ArrowLeft')) {
                this.velocityX = -CONFIG.PLAYER_SPEED;
            } else if (inputManager.isPressed('ArrowRight')) {
                this.velocityX = CONFIG.PLAYER_SPEED;
            } else {
                this.velocityX *= CONFIG.FRICTION;
            }
            
            if (inputManager.isPressed('ArrowUp') && this.onGround && now - this.lastJumpTime > 200) {
                this.jump();
            }
        } else if (this.type === 'water') {
            if (inputManager.isPressed('a') || inputManager.isPressed('A')) {
                this.velocityX = -CONFIG.PLAYER_SPEED;
            } else if (inputManager.isPressed('d') || inputManager.isPressed('D')) {
                this.velocityX = CONFIG.PLAYER_SPEED;
            } else {
                this.velocityX *= CONFIG.FRICTION;
            }
            
            if ((inputManager.isPressed('w') || inputManager.isPressed('W')) && 
                this.onGround && now - this.lastJumpTime > 200) {
                this.jump();
            }
        }
    }
    
    jump() {
        this.velocityY = -CONFIG.JUMP_POWER;
        this.onGround = false;
        this.lastJumpTime = Date.now();
        assetManager.playSound('jump', 0.5);
    }
    
    applyPhysics() {
        // Apply gravity
        this.velocityY += CONFIG.GRAVITY;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
        
        // Side boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
    
    checkCollisions() {
        this.checkPlatformCollisions();
        this.checkHazards();
        this.checkGemCollection();
        this.checkExit();
    }
    
    checkPlatformCollisions() {
        for (let platform of platforms) {
            if (this.isColliding(platform)) {
                // Landing on top of platform
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
                // Hitting platform from below
                else if (this.velocityY < 0 && this.y > platform.y) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Side collisions
                else if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                }
                else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                }
            }
        }
    }
    
    checkHazards() {
        for (let hazard of hazards) {
            if (this.isColliding(hazard)) {
                // Check if player can handle this hazard
                if ((hazard.type === 'fire' && this.type === 'water') ||
                    (hazard.type === 'water' && this.type === 'fire')) {
                    this.die();
                }
            }
        }
    }
    
    checkGemCollection() {
        for (let i = gems.length - 1; i >= 0; i--) {
            let gem = gems[i];
            if (!gem.collected && this.isCollidingWithGem(gem)) {
                if ((gem.type === 'fire' && this.type === 'fire') ||
                    (gem.type === 'water' && this.type === 'water')) {
                    gem.collected = true;
                    gems.splice(i, 1);
                    gameManager.collectGem();
                }
            }
        }
    }
    
    checkExit() {
        let wasAtExit = this.atExit;
        this.atExit = false;
        
        for (let exit of exits) {
            if (this.isColliding(exit) && exit.type === this.type) {
                this.atExit = true;
                break;
            }
        }
    }
    
    die() {
        // Reset player position
        this.x = this.type === 'fire' ? 50 : 100;
        this.y = canvas.height - 150;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        gameManager.playerDied();
    }
    
    isColliding(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    isCollidingWithGem(gem) {
        return this.x < gem.x + gem.size &&
               this.x + this.width > gem.x &&
               this.y < gem.y + gem.size &&
               this.y + this.height > gem.y;
    }
    
    draw() {
        // Try to use sprite image, fallback to gradient drawing
        const spriteName = `${this.type}_idle`;
        if (assetManager.images[spriteName]) {
            ctx.drawImage(assetManager.images[spriteName], this.x, this.y, this.width, this.height);
        } else {
            this.drawFallback();
        }
    }
    
    drawFallback() {
        // Draw character with gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        if (this.type === 'fire') {
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, '#ff3333');
        } else {
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#339999');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw face
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 5, this.y + 5, 3, 3); // Left eye
        ctx.fillRect(this.x + 12, this.y + 5, 3, 3); // Right eye
        
        // Draw smile
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 15, 5, 0, Math.PI);
        ctx.stroke();
    }
}

// Renderer class
class Renderer {
    constructor() {
        this.particleTime = 0;
    }
    
    drawBackground() {
        // Try to use background image, fallback to gradient
        if (assetManager.images['background']) {
            ctx.drawImage(assetManager.images['background'], 0, 0, canvas.width, canvas.height);
        } else {
            this.drawBackgroundFallback();
        }
    }
    
    drawBackgroundFallback() {
        // Draw temple background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#87CEEB');
        bgGradient.addColorStop(1, '#4682B4');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        
        // Add some temple decorations
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < canvas.width; i += 100) {
            ctx.fillRect(i, canvas.height - 60, 10, 60);
        }
    }
    
    drawPlatforms() {
        for (let platform of platforms) {
            const platformGradient = ctx.createLinearGradient(
                platform.x, platform.y, platform.x, platform.y + platform.height
            );
            platformGradient.addColorStop(0, '#D2691E');
            platformGradient.addColorStop(1, '#A0522D');
            ctx.fillStyle = platformGradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add platform border
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
    }
    
    drawHazards() {
        this.particleTime += 0.1;
        
        for (let hazard of hazards) {
            if (hazard.type === 'fire') {
                this.drawFireHazard(hazard);
            } else {
                this.drawWaterHazard(hazard);
            }
        }
    }
    
    drawFireHazard(hazard) {
        // Fire hazard base
        const fireGradient = ctx.createLinearGradient(
            hazard.x, hazard.y, hazard.x, hazard.y + hazard.height
        );
        fireGradient.addColorStop(0, '#ff6b6b');
        fireGradient.addColorStop(0.5, '#ff3333');
        fireGradient.addColorStop(1, '#cc0000');
        ctx.fillStyle = fireGradient;
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        
        // Animated fire particles
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 8; i++) {
            const x = hazard.x + (i / 8) * hazard.width + Math.sin(this.particleTime + i) * 5;
            const y = hazard.y + Math.sin(this.particleTime * 2 + i) * 10;
            ctx.fillRect(x, y, 2, 2);
        }
        
        // Orange particles
        ctx.fillStyle = '#ff8800';
        for (let i = 0; i < 5; i++) {
            const x = hazard.x + Math.random() * hazard.width;
            const y = hazard.y + Math.sin(this.particleTime + i * 2) * 15;
            ctx.fillRect(x, y, 1, 3);
        }
    }
    
    drawWaterHazard(hazard) {
        // Water hazard base
        const waterGradient = ctx.createLinearGradient(
            hazard.x, hazard.y, hazard.x, hazard.y + hazard.height
        );
        waterGradient.addColorStop(0, '#4ecdc4');
        waterGradient.addColorStop(0.5, '#339999');
        waterGradient.addColorStop(1, '#006666');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        
        // Animated water surface
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = hazard.x; x < hazard.x + hazard.width; x += 5) {
            const waveY = hazard.y + Math.sin(this.particleTime + x * 0.01) * 3;
            if (x === hazard.x) {
                ctx.moveTo(x, waveY);
            } else {
                ctx.lineTo(x, waveY);
            }
        }
        ctx.stroke();
        
        // Water bubbles
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let i = 0; i < 6; i++) {
            const x = hazard.x + (i / 6) * hazard.width + Math.sin(this.particleTime + i) * 10;
            const y = hazard.y + 5 + Math.sin(this.particleTime * 1.5 + i) * 10;
            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.sin(this.particleTime + i) * 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawGems() {
        for (let gem of gems) {
            if (gem.collected) continue;
            
            // Gem glow effect
            ctx.shadowColor = gem.type === 'fire' ? '#ff6b6b' : '#4ecdc4';
            ctx.shadowBlur = 15 + Math.sin(this.particleTime * 3) * 5;
            
            // Main gem body
            const gemGradient = ctx.createRadialGradient(
                gem.x + gem.size/2, gem.y + gem.size/2, 0,
                gem.x + gem.size/2, gem.y + gem.size/2, gem.size/2
            );
            
            if (gem.type === 'fire') {
                gemGradient.addColorStop(0, '#ffff88');
                gemGradient.addColorStop(0.5, '#ff6b6b');
                gemGradient.addColorStop(1, '#cc0000');
            } else {
                gemGradient.addColorStop(0, '#88ffff');
                gemGradient.addColorStop(0.5, '#4ecdc4');
                gemGradient.addColorStop(1, '#006666');
            }
            
            ctx.fillStyle = gemGradient;
            ctx.beginPath();
            ctx.arc(gem.x + gem.size/2, gem.y + gem.size/2, gem.size/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            // Gem facets
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(gem.x + gem.size/3, gem.y + gem.size/3, gem.size/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Sparkle effect
            ctx.fillStyle = 'white';
            const sparkleOffset = Math.sin(this.particleTime * 4) * 2;
            ctx.fillRect(gem.x + gem.size/2 - 1 + sparkleOffset, gem.y + gem.size/4, 2, 8);
            ctx.fillRect(gem.x + gem.size/4, gem.y + gem.size/2 - 1 + sparkleOffset, 8, 2);
        }
    }
    
    drawExits() {
        for (let exit of exits) {
            // Exit portal effect with animation
            const exitGradient = ctx.createRadialGradient(
                exit.x + exit.width/2, exit.y + exit.height/2, 0,
                exit.x + exit.width/2, exit.y + exit.height/2, exit.width/2
            );
            
            const alpha = 0.6 + Math.sin(this.particleTime * 2) * 0.2;
            
            if (exit.type === 'fire') {
                exitGradient.addColorStop(0, `rgba(255, 107, 107, ${alpha})`);
                exitGradient.addColorStop(0.5, `rgba(255, 51, 51, ${alpha * 0.8})`);
                exitGradient.addColorStop(1, `rgba(204, 0, 0, ${alpha * 0.3})`);
            } else {
                exitGradient.addColorStop(0, `rgba(78, 205, 196, ${alpha})`);
                exitGradient.addColorStop(0.5, `rgba(51, 153, 153, ${alpha * 0.8})`);
                exitGradient.addColorStop(1, `rgba(0, 102, 102, ${alpha * 0.3})`);
            }
            
            ctx.fillStyle = exitGradient;
            ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
            
            // Animated portal rings
            ctx.strokeStyle = exit.type === 'fire' ? '#ff3333' : '#339999';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const radius = 15 + i * 8 + Math.sin(this.particleTime + i) * 3;
                ctx.globalAlpha = 0.5 - i * 0.15;
                ctx.beginPath();
                ctx.arc(exit.x + exit.width/2, exit.y + exit.height/2, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            
            // Exit symbol
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(exit.type === 'fire' ? '🔥' : '💧', 
                        exit.x + exit.width/2, exit.y + exit.height/2 + 7);
        }
    }
}

// Game objects initialization
let fireboy, watergirl;
let gems = [];

// Static game objects
const platforms = [
    {x: 200, y: 500, width: 150, height: 20},
    {x: 400, y: 400, width: 100, height: 20},
    {x: 550, y: 300, width: 150, height: 20},
    {x: 100, y: 350, width: 80, height: 20},
    {x: 300, y: 250, width: 120, height: 20},
    {x: 600, y: 180, width: 100, height: 20}
];

const hazards = [
    {x: 250, y: 520, width: 50, height: 30, type: 'fire'},
    {x: 420, y: 420, width: 60, height: 30, type: 'water'},
    {x: 580, y: 320, width: 40, height: 30, type: 'fire'},
    {x: 320, y: 270, width: 80, height: 30, type: 'water'}
];

const exits = [
    {x: 720, y: 150, width: 30, height: 50, type: 'fire'},
    {x: 750, y: 150, width: 30, height: 50, type: 'water'}
];

// Initialize game systems
const assetManager = new AssetManager();
const audioManager = new AudioManager();
const inputManager = new InputManager();
const gameManager = new GameManager();
const renderer = new Renderer();

// Load assets
function loadAssets() {
    // Load images (these will fallback gracefully if not found)
    assetManager.loadImage('background', 'assets/images/background.png');
    assetManager.loadImage('fire_idle', 'assets/images/fireboy_idle.png');
    assetManager.loadImage('water_idle', 'assets/images/watergirl_idle.png');
    assetManager.loadImage('platform', 'assets/images/platform.png');
    assetManager.loadImage('fire_gem', 'assets/images/fire_gem.png');
    assetManager.loadImage('water_gem', 'assets/images/water_gem.png');
    
    // Load sounds
    assetManager.loadSound('jump', 'jumpSound');
    assetManager.loadSound('gemCollect', 'gemCollectSound');
    assetManager.loadSound('death', 'deathSound');
    assetManager.loadSound('levelComplete', 'levelCompleteSound');
    assetManager.loadSound('fireHazard', 'fireHazardSound');
    assetManager.loadSound('waterHazard', 'waterHazardSound');
}

// Initialize the game
function initGame() {
    // Reset game state
    gameManager.resetLevel();
    
    // Load all assets
    loadAssets();
    
    // Show loading screen
    document.getElementById('loadingScreen').style.display = 'flex';
}

// Start the game when the page loads
window.addEventListener('load', initGame);

// Handle visibility change to pause/resume music
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        audioManager.stopBackgroundMusic();
    } else if (audioManager.musicEnabled) {
        audioManager.playBackgroundMusic();
    }
});