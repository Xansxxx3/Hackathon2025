window.addEventListener("load", () => {
  console.log("Game loaded!");

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
        this.backgroundMusic.volume = 0.8;
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

  const audioManager = new AudioManager();

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

  const char1OriginalHeight = char1.offsetHeight || 60;
  const char2OriginalHeight = char2.offsetHeight || 60;

  // Game state variables
  let gameRunning = true;
  let char1AtDoorPrevious = false;
  let char2AtDoorPrevious = false;

  let player1 = {
    x: 100,
    y: gameHeight - char1OriginalHeight,
    vy: 0,
    onGround: true,
    element: char1,
    type: "fire"
  };
  let player2 = {
    x: 200,
    y: gameHeight - char2OriginalHeight,
    vy: 0,
    onGround: true,
    element: char2,
    type: "water"
  };

  // Ensure both characters are visible
  char1.style.display = "block";
  char2.style.display = "block";
  char1.style.background = "red";
  char2.style.background = "blue";

  // ---------------- CONTROLS ----------------
  document.addEventListener("keydown", e => {
    keys[e.key] = true;

    // Jump
    if ((e.key === "w" || e.key === "W") && player1.onGround && gameRunning) {
      player1.vy = jumpStrength;
      player1.onGround = false;
      audioManager.playSound("jumpSound");
    }
    if (e.key === "ArrowUp" && player2.onGround && gameRunning) {
      player2.vy = jumpStrength;
      player2.onGround = false;
      audioManager.playSound("jumpSound");
    }

    // Reset with R
    if (e.key === "r" || e.key === "R") {
      resetGame();
    }
  });

  document.addEventListener("keyup", e => {
    keys[e.key] = false;
  });

  // ---------------- GAME FUNCTIONS ----------------
  function updatePlayer(p, leftKey, rightKey, abilityKey) {
    if (!gameRunning) return;

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
    } else {
      p.element.style.height =
        (p === player1 ? char1OriginalHeight : char2OriginalHeight) + "px";
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
    if (!gameRunning) return;
    
    const lava = document.querySelector(".lava");
    const water = document.querySelector(".water");
    const transmute = document.querySelector(".transmute");

    // Game over conditions - any character touching wrong liquid
    if (water && isColliding(player1, water) && player1.type === "fire") {
      gameRunning = false;
      alert("💀 Game Over! Press R to restart.");
      audioManager.playSound("gameOverSound2");
      return;
    }
    if (lava && isColliding(player1, lava) && player1.type === "water") {
      gameRunning = false;
      alert("💀 Game Over! Press R to restart.");
      audioManager.playSound("gameOverSound2");
      return;
    }
    if (water && isColliding(player2, water) && player2.type === "fire") {
      gameRunning = false;
      alert("💀 Game Over! Press R to restart.");
      audioManager.playSound("gameOverSound2");
      return;
    }
    if (lava && isColliding(player2, lava) && player2.type === "water") {
      gameRunning = false;
      alert("💀 Game Over! Press R to restart.");
      audioManager.playSound("gameOverSound2");
      return;
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
    } else inTransmute1 = false;

    if (transmute && isColliding(player2, transmute)) {
      if (!inTransmute2) {
        player2.type = player2.type === "water" ? "fire" : "water";
        char2.style.height = char2OriginalHeight + "px";
        char2.style.background = player2.type === "fire" ? "red" : "blue";
        inTransmute2 = true;
        audioManager.playSound("wooshSound");
      }
    } else inTransmute2 = false;
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
    if (!gameRunning || !fireDoor || !waterDoor) return;

    const char1AtFire = isTouchingDoor(char1, fireDoor);
    const char1AtWater = isTouchingDoor(char1, waterDoor);
    const char2AtFire = isTouchingDoor(char2, fireDoor);
    const char2AtWater = isTouchingDoor(char2, waterDoor);

    const char1AtDoor = char1AtFire || char1AtWater;
    const char2AtDoor = char2AtFire || char2AtWater;

    // Play bonus sound when entering doors
    if (char1AtDoor && !char1AtDoorPrevious) {
      audioManager.playSound("bonusSound");
    }
    if (char2AtDoor && !char2AtDoorPrevious) {
      audioManager.playSound("bonusSound");
    }

    char1AtDoorPrevious = char1AtDoor;
    char2AtDoorPrevious = char2AtDoor;

    const bothAtDoors = char1AtDoor && char2AtDoor;

    if (bothAtDoors) {
      if (!winTimeout) {
        winTimeout = setTimeout(() => {
          gameRunning = false;
          alert("🎉 Round Completed! Both characters reached the doors!");
          audioManager.playSound("levelCompleteSound");
          winTimeout = null;
        }, 1000);
      }
    } else if (winTimeout) {
      clearTimeout(winTimeout);
      winTimeout = null;
    }
  }

  function resetGame() {
    gameRunning = true;
    char1AtDoorPrevious = false;
    char2AtDoorPrevious = false;
    
    if (winTimeout) {
      clearTimeout(winTimeout);
      winTimeout = null;
    }

    // Player 1
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

    // Player 2
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
    checkDoors();

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});