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

  // ---------------- PLATFORM CREATION ----------------
  function createPlatform() {
    const platform = document.getElementById("platform");
    const gameWidth = game.clientWidth;
    const tileSize = 32;
    const tilesNeeded = Math.ceil(gameWidth / tileSize);
    
    let platformHTML = "";
    for (let i = 0; i < tilesNeeded; i++) {
      const tileFile = i % 2 === 0 ? "../../assets/images/background/tile1.svg" : "../../assets/images/background/tile2.svg";
      platformHTML += `<img src="${tileFile}" style="position: absolute; left: ${i * tileSize}px; top: 0; width: ${tileSize}px; height: ${tileSize}px;" />`;
    }
    
    platform.innerHTML = platformHTML;
  }

  // ---------------- GAME SETUP ----------------
  const char1 = document.getElementById("char1"); // Fire
  const char2 = document.getElementById("char2"); // Water

  const fireDoor = document.querySelector(".fire-door");
  const waterDoor = document.querySelector(".water-door");
  const middlePlatform = document.querySelector(".middle-platform");

  const keys = {};
  const gravity = 0.5;
  const jumpStrength = -10;

  const game = document.getElementById("game");
  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  const char1OriginalHeight = char1.offsetHeight || 60;
  const char2OriginalHeight = char2.offsetHeight || 60;

  let player1 = {
    x: 100,
    y: gameHeight - 32 - char1OriginalHeight, // Position on platform surface
    vy: 0,
    onGround: true,
    element: char1,
    type: "fire"
  };
  let player2 = {
    x: 200,
    y: gameHeight - 32 - char2OriginalHeight, // Position on platform surface
    vy: 0,
    onGround: true,
    element: char2,
    type: "water"
  };

  // Create the platform
  createPlatform();

  // Ensure both characters are visible
  char1.style.display = "block";
  char2.style.display = "block";
  char1.style.background = "red";
  char2.style.background = "blue";

  // ---------------- CONTROLS ----------------
  document.addEventListener("keydown", e => {
    keys[e.key] = true;

    // Jump
    if ((e.key === "w" || e.key === "W") && player1.onGround) {
      player1.vy = jumpStrength;
      player1.onGround = false;
      audioManager.playSound("jumpSound"); // optional
    }
    if (e.key === "ArrowUp" && player2.onGround) {
      player2.vy = jumpStrength;
      player2.onGround = false;
      audioManager.playSound("jumpSound"); // optional
    }

    // Reset with R
    if (e.key === "r" || e.key === "R") {
      resetGame();
      audioManager.playSound("resetSound"); // optional
    }

    // Return to menu with M
    if (e.key === "m" || e.key === "M") {
      window.location.href = "../../menu/index.html";
    }
  });

  document.addEventListener("keyup", e => {
    keys[e.key] = false;
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
    } else {
      p.element.style.height =
        (p === player1 ? char1OriginalHeight : char2OriginalHeight) + "px";
    }

    p.y += p.vy;

    const charWidth = p.element.offsetWidth;
    const charHeight = p.element.offsetHeight;

    if (p.x < 0) p.x = 0;
    if (p.x > gameWidth - charWidth) p.x = gameWidth - charWidth;

    // Platform collision detection
    const platformTop = gameHeight - 32; // 32px is platform height
    if (p.y >= platformTop - charHeight) {
      p.y = platformTop - charHeight;
      p.vy = 0;
      p.onGround = true;
    }

    // Middle platform collision detection
    if (middlePlatform) {
      const middlePlatformRect = middlePlatform.getBoundingClientRect();
      const gameRect = game.getBoundingClientRect();
      
      // Convert to game coordinates
      const platformLeft = middlePlatformRect.left - gameRect.left;
      const platformRight = middlePlatformRect.right - gameRect.left;
      const platformTop = middlePlatformRect.top - gameRect.top;
      const platformBottom = middlePlatformRect.bottom - gameRect.top;
      
      // Check if character is within platform bounds
      const charRight = p.x + charWidth;
      const charBottom = p.y + charHeight;
      
      // Check for collision with platform
      const isColliding = charRight > platformLeft && p.x < platformRight && 
                         charBottom > platformTop && p.y < platformBottom;
      
      if (isColliding) {
        // Check if character can pass through based on abilities
        let canPassThrough = false;
        
        // For fire character: only allow passage when actively flying ABOVE the platform
        if (p.type === "fire") {
          const isFlying = keys["f"] || keys["F"];
          const isAbovePlatform = p.y + charHeight < platformTop; // Character's bottom is above platform's top
          canPassThrough = isFlying && isAbovePlatform;
        }
        // For water character: only allow passage when actively shrunk AND at bottom of platform
        else if (p.type === "water") {
          const isShrunk = keys["g"] || keys["G"];
          const isAtBottom = p.y + charHeight >= platformBottom - 10; // Near the bottom of platform (with small tolerance)
          canPassThrough = isShrunk && isAtBottom;
        }
        
        // If cannot pass through, block horizontal movement
        if (!canPassThrough) {
          // Block horizontal movement through the platform
          // Check if character is trying to move horizontally through the platform
          const charCenterX = p.x + charWidth / 2;
          const platformCenterX = (platformLeft + platformRight) / 2;
          
          // If character is on the left side of platform, keep them on the left
          if (charCenterX < platformCenterX) {
            p.x = platformLeft - charWidth;
          }
          // If character is on the right side of platform, keep them on the right
          else {
            p.x = platformRight;
          }
        }
      }
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

  // Removed hazard collision detection - no hazards in basic platform level

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
          
          // Mark level as completed
          const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
          if (!completedLevels.includes(1)) {
            completedLevels.push(1);
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
          }
          
          // Return to menu after a delay
          setTimeout(() => {
            window.location.href = "../../menu/index.html";
          }, 2000);
          
          winTimeout = null;
        }, 1000);
      }
    } else if (winTimeout) {
      clearTimeout(winTimeout);
      winTimeout = null;
    }
  }

  function resetGame() {
    // Player 1
    player1.x = 100;
    player1.y = gameHeight - 32 - char1OriginalHeight; // Position on platform surface
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
    player2.y = gameHeight - 32 - char2OriginalHeight; // Position on platform surface
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

    // checkLiquidCollisions(); // Removed - no hazards in basic platform
    checkDoors();

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});
