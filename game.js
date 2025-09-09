console.log("Game loaded!");

// ---------------- LEVEL SYSTEM ----------------
const TILE_SIZE = 32;
const LEVEL_WIDTH = 25;
const LEVEL_HEIGHT = 15;

// Level data structure based on the image description
const level1 = {
  width: LEVEL_WIDTH,
  height: LEVEL_HEIGHT,
  tileSize: TILE_SIZE,
  tiles: []
};

// Initialize level tiles based on image coordinates
function initializeLevel() {
  // Clear existing tiles
  level1.tiles = [];
  
  // Create empty grid
  for (let y = 0; y < LEVEL_HEIGHT; y++) {
    level1.tiles[y] = [];
    for (let x = 0; x < LEVEL_WIDTH; x++) {
      level1.tiles[y][x] = 'empty';
    }
  }
  
  // Add perimeter walls (stone - tile1.svg)
  // Top and bottom walls
  for (let x = 0; x < LEVEL_WIDTH; x++) {
    level1.tiles[0][x] = 'stone'; // Top wall
    level1.tiles[LEVEL_HEIGHT - 1][x] = 'stone'; // Bottom wall
  }
  
  // Left and right walls
  for (let y = 1; y < LEVEL_HEIGHT - 1; y++) {
    level1.tiles[y][0] = 'stone'; // Left wall
    level1.tiles[y][LEVEL_WIDTH - 1] = 'stone'; // Right wall
  }
  
  // Internal L-shaped wall structure
  // Vertical segment: Column 10, Rows 4-13
  for (let y = 4; y <= 13; y++) {
    level1.tiles[y][10] = 'stone';
  }
  
  // Horizontal segment: Row 4, Columns 11-13 and 15-23
  for (let x = 11; x <= 13; x++) {
    level1.tiles[4][x] = 'stone';
  }
  for (let x = 15; x <= 23; x++) {
    level1.tiles[4][x] = 'stone';
  }
  
  // Platform blocks (tile2.svg)
  // Bottom-left block: Column 2, Rows 12-13
  level1.tiles[12][2] = 'platform';
  level1.tiles[13][2] = 'platform';
  
  // Top-middle block: Column 14, Rows 3-4
  level1.tiles[3][14] = 'platform';
  level1.tiles[4][14] = 'platform';
  
  // Doors (will be handled separately for collision detection)
  // Top-right door: Column 24, Rows 2-3
  level1.tiles[2][24] = 'fire-door';
  level1.tiles[3][24] = 'fire-door';
  
  // Bottom-right door: Column 24, Rows 11-12
  level1.tiles[11][24] = 'water-door';
  level1.tiles[12][24] = 'water-door';
}

// Render level tiles to DOM
function renderLevel() {
  const gameContainer = document.getElementById('game');
  
  // Create level container if it doesn't exist
  let levelContainer = document.getElementById('level-container');
  if (!levelContainer) {
    levelContainer = document.createElement('div');
    levelContainer.id = 'level-container';
    levelContainer.style.position = 'absolute';
    levelContainer.style.top = '0';
    levelContainer.style.left = '0';
    levelContainer.style.width = '100%';
    levelContainer.style.height = '100%';
    levelContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
    gameContainer.appendChild(levelContainer);
  }
  
  // Clear existing tiles
  levelContainer.innerHTML = '';
  
  // Render each tile
  for (let y = 0; y < LEVEL_HEIGHT; y++) {
    for (let x = 0; x < LEVEL_WIDTH; x++) {
      const tileType = level1.tiles[y][x];
      if (tileType !== 'empty') {
        const tileElement = createTileElement(tileType, x, y);
        levelContainer.appendChild(tileElement);
      }
    }
  }
}

// Create individual tile element
function createTileElement(tileType, x, y) {
  const tile = document.createElement('div');
  tile.className = `tile ${tileType}`;
  tile.style.position = 'absolute';
  tile.style.left = (x * TILE_SIZE) + 'px';
  tile.style.top = (y * TILE_SIZE) + 'px';
  tile.style.width = TILE_SIZE + 'px';
  tile.style.height = TILE_SIZE + 'px';
  
  // Set background image based on tile type
  if (tileType === 'stone') {
    tile.style.backgroundImage = 'url(assets/images/background/tile1.svg)';
    tile.style.backgroundSize = 'cover';
  } else if (tileType === 'platform') {
    tile.style.backgroundImage = 'url(assets/images/background/tile2.svg)';
    tile.style.backgroundSize = 'cover';
  } else if (tileType === 'fire-door') {
    tile.className = 'tile door fire-door';
    tile.style.background = 'darkred';
  } else if (tileType === 'water-door') {
    tile.className = 'tile door water-door';
    tile.style.background = 'darkblue';
  }
  
  return tile;
}

// Initialize level when game starts
initializeLevel();
renderLevel();

// ---------------- AUDIO MANAGER ----------------
class AudioManager {
  constructor() {
    this.musicEnabled = true;
    this.soundEnabled = true;
    this.backgroundMusic = document.getElementById("backgroundMusic");
    this.setupControls();
  }

  setupControls() {
    const musicToggle = document.getElementById("musicToggle");
    const soundToggle = document.getElementById("soundToggle");

    if (musicToggle) {
      musicToggle.addEventListener("click", () => this.toggleMusic());
    }

    if (soundToggle) {
      soundToggle.addEventListener("click", () => this.toggleSound());
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    const musicToggle = document.getElementById("musicToggle");

    if (this.musicEnabled) {
      this.playBackgroundMusic();
      if (musicToggle) {
        musicToggle.classList.remove("muted");
        musicToggle.textContent = "🎵";
      }
    } else {
      if (this.backgroundMusic) this.backgroundMusic.pause();
      if (musicToggle) {
        musicToggle.classList.add("muted");
        musicToggle.textContent = "🎵";
      }
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const soundToggle = document.getElementById("soundToggle");

    if (this.soundEnabled) {
      if (soundToggle) {
        soundToggle.classList.remove("muted");
        soundToggle.textContent = "🔊";
      }
    } else {
      if (soundToggle) {
        soundToggle.classList.add("muted");
        soundToggle.textContent = "🔊";
      }
    }
  }

  playBackgroundMusic() {
    if (this.musicEnabled && this.backgroundMusic) {
      this.backgroundMusic.volume = 0.3;
      this.backgroundMusic.play().catch(e =>
        console.warn("Music play failed:", e)
      );
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  playSound(id) {
    if (!this.soundEnabled) return;
    const sfx = document.getElementById(id);
    if (sfx) {
      sfx.currentTime = 0;
      sfx.play().catch(e => console.warn("Sound play failed:", e));
    }
  }
}

// Create audio manager instance
const audioManager = new AudioManager();

// Start music after first key press
document.addEventListener(
  "keydown",
  () => {
    audioManager.playBackgroundMusic();
  },
  { once: true }
);

// ---------------- GAME SETUP ----------------
const char1 = document.getElementById("char1"); // Fire
const char2 = document.getElementById("char2"); // Water

const fireDoor = document.querySelector(".fire-door");
const waterDoor = document.querySelector(".water-door");

const keys = {};
const gravity = 0.5;
const jumpStrength = -10;

const game = document.getElementById("game");
const gameWidth = game.clientWidth;
const gameHeight = game.clientHeight;

const char1OriginalHeight = char1.offsetHeight;
const char2OriginalHeight = char2.offsetHeight;

let player1 = {
  x: 64, // 2 tiles from left
  y: 384, // 12 tiles from top (bottom area)
  vy: 0,
  onGround: true,
  element: char1,
  type: "fire"
};
let player2 = {
  x: 96, // 3 tiles from left
  y: 384, // 12 tiles from top (bottom area)
  vy: 0,
  onGround: true,
  element: char2,
  type: "water"
};

// ---------------- CONTROLS ----------------
document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // Jump
  if ((e.key === "w" || e.key === "W") && player1.onGround) {
    player1.vy = jumpStrength;
    player1.onGround = false;
    audioManager.playSound("jumpSound");
  }
  if (e.key === "ArrowUp" && player2.onGround) {
    player2.vy = jumpStrength;
    player2.onGround = false;
    audioManager.playSound("jumpSound");
  }

  // Reset with R
  if (e.key === "r" || e.key === "R") {
    resetGame();
    audioManager.playSound("resetSound");
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;

  // Reset abilities
  if (e.key === "f") {
    if (player1.type === "water") {
      char1.style.height = char1OriginalHeight + "px";
    }
    if (player1.type === "fire") {
      player1.vy = 0;
    }
  }

  if (e.key === "g") {
    if (player2.type === "water") {
      char2.style.height = char2OriginalHeight + "px";
    }
    if (player2.type === "fire") {
      player2.vy = 0;
    }
  }
});

// ---------------- GAME FUNCTIONS ----------------
function updatePlayer(p, leftKey, rightKey, abilityKey) {
  if (keys[leftKey]) p.x -= 3;
  if (keys[rightKey]) p.x += 3;

  if (p.type === "fire" && keys[abilityKey]) {
    p.vy = -2; // float
  } else {
    p.vy += gravity;
  }

  if (p.type === "water" && keys[abilityKey]) {
    p.element.style.height =
      (p === player1 ? char1OriginalHeight : char2OriginalHeight) / 2 + "px";
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

let inTransmute1 = false;
let inTransmute2 = false;

function checkLiquidCollisions() {
  const lava = document.querySelector(".lava");
  const water = document.querySelector(".water");
  const transmute = document.querySelector(".transmute");

  // Player 1
  if (water && isColliding(player1, water) && player1.type === "fire") {
    char1.style.display = "none";
    audioManager.playSound("gameOverSound1");
  }
  if (lava && isColliding(player1, lava) && player1.type === "water") {
    char1.style.display = "none";
    audioManager.playSound("gameOverSound1");
  }

  // Player 2
  if (water && isColliding(player2, water) && player2.type === "fire") {
    char2.style.display = "none";
    audioManager.playSound("gameOverSound2");
  }
  if (lava && isColliding(player2, lava) && player2.type === "water") {
    char2.style.display = "none";
    audioManager.playSound("gameOverSound2");
  }

  // Transmute
  if (transmute && isColliding(player1, transmute)) {
    if (!inTransmute1) {
      player1.type = player1.type === "fire" ? "water" : "fire";
      char1.style.height = char1OriginalHeight + "px";
      char1.style.background = player1.type === "fire" ? "red" : "blue";
      inTransmute1 = true;
      audioManager.playSound("wooshSound");
    }
  } else {
    inTransmute1 = false;
  }

  if (transmute && isColliding(player2, transmute)) {
    if (!inTransmute2) {
      player2.type = player2.type === "water" ? "fire" : "water";
      char2.style.height = char2OriginalHeight + "px";
      char2.style.background = player2.type === "fire" ? "red" : "blue";
      inTransmute2 = true;
      audioManager.playSound("wooshSound");
    }
  } else {
    inTransmute2 = false;
  }
}

function isTouchingDoor(character, door) {
  const cRect = character.getBoundingClientRect();
  const dRect = door.getBoundingClientRect();

  return !(
    cRect.top > dRect.bottom ||
    cRect.bottom < dRect.top ||
    cRect.right < dRect.left ||
    cRect.left > dRect.right
  );
}

let winTimeout = null;

function checkDoors() {
  if (!fireDoor || !waterDoor) return;

  const char1AtFire = isTouchingDoor(char1, fireDoor);
  const char1AtWater = isTouchingDoor(char1, waterDoor);
  const char2AtFire = isTouchingDoor(char2, fireDoor);
  const char2AtWater = isTouchingDoor(char2, waterDoor);

  const bothAtDoors =
    (char1AtFire && char2AtWater) || (char1AtWater && char2AtFire);

  if (bothAtDoors) {
    if (!winTimeout) {
      winTimeout = setTimeout(() => {
        alert("🎉 You Win! Both characters reached the doors!");
        audioManager.playSound("bonusSound");
        winTimeout = null;
      }, 1000);
    }
  } else {
    if (winTimeout) {
      clearTimeout(winTimeout);
      winTimeout = null;
    }
  }
}

function resetGame() {
  // Reset player 1
  player1.x = 64; // 2 tiles from left
  player1.y = 384; // 12 tiles from top (bottom area)
  player1.vy = 0;
  player1.onGround = true;
  player1.type = "fire";
  char1.style.display = "block";
  char1.style.left = player1.x + "px";
  char1.style.top = player1.y + "px";
  char1.style.height = char1OriginalHeight + "px";
  char1.style.background = "red";

  // Reset player 2
  player2.x = 96; // 3 tiles from left
  player2.y = 384; // 12 tiles from top (bottom area)
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
  checkDoors();

  requestAnimationFrame(gameLoop);
}

gameLoop();
