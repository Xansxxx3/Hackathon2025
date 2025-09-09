console.log("Game loaded!");

const char1 = document.getElementById("char1"); // Fire
const char2 = document.getElementById("char2"); // Water

const keys = {};

const gravity = 0.5;
const jumpStrength = -10;

const game = document.getElementById("game");
const gameWidth = game.clientWidth;
const gameHeight = game.clientHeight;

const char1OriginalHeight = char1.offsetHeight;
const char2OriginalHeight = char2.offsetHeight;

const audioManager = new AudioManager();

// Start music after user presses any key
document.addEventListener("keydown", () => {
  audioManager.playBackgroundMusic();
}, { once: true });


let player1 = { x: 100, y: gameHeight - char1OriginalHeight, vy: 0, onGround: true, element: char1, type: "fire" };
let player2 = { x: 200, y: gameHeight - char2OriginalHeight, vy: 0, onGround: true, element: char2, type: "water" };

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // Jump controls
  if ((e.key === "w" || e.key === "W") && player1.onGround) {
    player1.vy = jumpStrength;
    player1.onGround = false;
  }
  if (e.key === "ArrowUp" && player2.onGround) {
    player2.vy = jumpStrength;
    player2.onGround = false;
  }

  // Reset with R
  if (e.key === "r" || e.key === "R") {
    resetGame();
  }
});

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

document.addEventListener("keyup", e => {
  keys[e.key] = false;

  // --- Reset ability states on key release ---
  // Player 1
  if (e.key === "f") {
    if (player1.type === "water") {
      char1.style.height = char1OriginalHeight + "px"; // reset puddle
    }
    if (player1.type === "fire") {
      player1.vy = 0; // stop floating
    }
  }

  // Player 2
  if (e.key === "g") {
    if (player2.type === "water") {
      char2.style.height = char2OriginalHeight + "px"; // reset puddle
    }
    if (player2.type === "fire") {
      player2.vy = 0; // stop floating
    }
  }
});

function updatePlayer(p, leftKey, rightKey, abilityKey) {
  if (keys[leftKey]) p.x -= 3;
  if (keys[rightKey]) p.x += 3;

  if (p.type === "fire" && keys[abilityKey]) {
    p.vy = -2; // Fire floats while holding key
  } else {
    p.vy += gravity;
  }

  if (p.type === "water" && keys[abilityKey]) {
    p.element.style.height = (p === player1 ? char1OriginalHeight : char2OriginalHeight) / 2 + "px"; // Water puddles
  }

  p.y += p.vy;

  const charWidth = p.element.offsetWidth;
  const charHeight = p.element.offsetHeight;

  if (p.x < 0) p.x = 0;
  if (p.x > gameWidth - charWidth) p.x = gameWidth - charWidth;

  if (p.y >= gameHeight - charHeight) {
    p.y = gameHeight - charHeight;
    p.vy = 0;
    p.onGround = true;
  }

  if (p.y < 0) {
    p.y = 0;
    p.vy = 0;
  }

  p.element.style.left = p.x + "px";
  p.element.style.top = p.y + "px";
}

function isColliding(p, zone) {
  const rect1 = p.element.getBoundingClientRect();
  const rect2 = zone.getBoundingClientRect();
  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right ||
    rect1.right < rect2.left
  );
}

function respawnPlayer(p, startX, startY) {
  setTimeout(() => {
    p.x = startX;
    p.y = startY;
    p.element.style.left = p.x + "px";
    p.element.style.top = p.y + "px";
    p.element.style.display = "block";
  }, 1000);
}

// Add flags to track if each player is inside the transmute zone
let inTransmute1 = false;
let inTransmute2 = false;

function checkLiquidCollisions() {
  const lava = document.querySelector(".lava");
  const water = document.querySelector(".water");
  const transmute = document.querySelector(".transmute");

  // --- Player 1 ---
  if (water && isColliding(player1, water) && player1.type === "fire") {
    char1.style.display = "none";
  }
  if (lava && isColliding(player1, lava) && player1.type === "water") {
    char1.style.display = "none";
  }

  // --- Player 2 ---
  if (water && isColliding(player2, water) && player2.type === "fire") {
    char2.style.display = "none";
  }
  if (lava && isColliding(player2, lava) && player2.type === "water") {
    char2.style.display = "none";
  }

  // --- Transmutation logic ---
  if (transmute && isColliding(player1, transmute)) {
    if (!inTransmute1) {
      player1.type = (player1.type === "fire") ? "water" : "fire";
      char1.style.height = char1OriginalHeight + "px";
      char1.style.background = (player1.type === "fire") ? "red" : "blue";
      inTransmute1 = true;
    }
  } else {
    inTransmute1 = false;
  }

  if (transmute && isColliding(player2, transmute)) {
    if (!inTransmute2) {
      player2.type = (player2.type === "water") ? "fire" : "water";
      char2.style.height = char2OriginalHeight + "px";
      char2.style.background = (player2.type === "fire") ? "red" : "blue";
      inTransmute2 = true;
    }
  } else {
    inTransmute2 = false;
  }
}


// Reset both players
function resetGame() {
  // Player 1 reset
  player1.x = 100;
  player1.y = gameHeight - char1OriginalHeight;
  player1.vy = 0;
  player1.onGround = true;
  player1.type = "fire";
  char1.style.display = "block";
  char1.style.left = player1.x + "px";
  char1.style.top = player1.y + "px";
  char1.style.height = char1OriginalHeight + "px";
  char1.style.background = "red";

  // Player 2 reset
  player2.x = 200;
  player2.y = gameHeight - char2OriginalHeight;
  player2.vy = 0;
  player2.onGround = true;
  player2.type = "water";
  char2.style.display = "block";
  char2.style.left = player2.x + "px";
  char2.style.top = player2.y + "px";
  char2.style.height = char2OriginalHeight + "px";
  char2.style.background = "blue";
}

function gameLoop() {
  updatePlayer(player1, "a", "d", "f");
  updatePlayer(player2, "ArrowLeft", "ArrowRight", "g");

  checkLiquidCollisions();

  requestAnimationFrame(gameLoop);
}

gameLoop();
