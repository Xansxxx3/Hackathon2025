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
  let waterHazard = null;
  let lavaHazard = null;

  function createPlatform() {
    const platform = document.getElementById("platform");
    const gameWidth = game.clientWidth;
    const tileSize = 32;
    const tilesNeeded = Math.ceil(gameWidth / tileSize);

    const segmentWidthPx = 320; // extended width of hazards to prevent jumping across
    const segmentTiles = Math.floor(segmentWidthPx / tileSize); // 10

    const waterStartIndex = Math.max(1, Math.floor(tilesNeeded * 0.25));
    const lavaStartIndex = Math.min(
      tilesNeeded - segmentTiles - 1,
      Math.floor(tilesNeeded * 0.55)
    );

    let platformHTML = "";
    for (let i = 0; i < tilesNeeded; ) {
      if (i === waterStartIndex) {
        const leftPx = i * tileSize;
        platformHTML += `<img class="water-hazard" src="../../assets/images/background/water.svg" style="position: absolute; left: ${leftPx}px; top: -8px; width: ${segmentWidthPx}px; height: 40px;" />`;
        i += segmentTiles;
        continue;
      }
      if (i === lavaStartIndex) {
        const leftPx = i * tileSize;
        platformHTML += `<img class="lava-hazard" src="../../assets/images/background/lava.svg" style="position: absolute; left: ${leftPx}px; top: -8px; width: ${segmentWidthPx}px; height: 40px;" />`;
        i += segmentTiles;
        continue;
      }
      const tileFile = i % 2 === 0 ? "../../assets/images/background/tile1.svg" : "../../assets/images/background/tile2.svg";
      platformHTML += `<img src="${tileFile}" style="position: absolute; left: ${i * tileSize}px; top: 0; width: ${tileSize}px; height: ${tileSize}px;" />`;
      i += 1;
    }

    platform.innerHTML = platformHTML;

    // Cache hazard elements for collision checks
    waterHazard = platform.querySelector('.water-hazard');
    lavaHazard = platform.querySelector('.lava-hazard');
  }

  function createMiddleWall() {
    const wall = document.getElementById("middleWall");
    const tileSize = 32;
    const tilesNeeded = Math.ceil(gameHeight / tileSize);
    let html = "";
    for (let i = 0; i < tilesNeeded; i++) {
      const tileFile = i % 2 === 0 ? "../../assets/images/background/tile1.svg" : "../../assets/images/background/tile2.svg";
      html += `<img src="${tileFile}" style="position: absolute; left: 0; top: ${i * tileSize}px; width: ${tileSize}px; height: ${tileSize}px;" />`;
    }
    wall.innerHTML = html;
  }

  // ---------------- GAME SETUP ----------------
  const char1 = document.getElementById("char1"); // Fire
  const char2 = document.getElementById("char2"); // Water

  // Hazards (assigned after createPlatform runs)


  const keys = {};
  const gravity = 0.2;
  const jumpStrength = -10;

  const game = document.getElementById("game");
  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  const char1OriginalHeight = char1.offsetHeight || 60;
  const char2OriginalHeight = char2.offsetHeight || 60;

  let player1 = {
    x: Math.max(20, Math.floor(gameWidth * 0.1)),
    y: gameHeight - 32 - char1OriginalHeight, // Position on platform surface
    vy: 0,
    onGround: true,
    element: char1,
    type: "fire"
  };
  let player2 = {
    x: Math.max(20, Math.floor(gameWidth * 0.9 - (char2.offsetWidth || 40))),
    y: gameHeight - 32 - char2OriginalHeight, // Position on platform surface
    vy: 0,
    onGround: true,
    element: char2,
    type: "water"
  };

  // Create the platform
  createPlatform();
  createMiddleWall();

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

    // Middle wall collision (centered, 32px wide)
    const wallLeft = gameWidth / 2 - 16;
    const wallRight = gameWidth / 2 + 16;
    const playerLeft = p.x;
    const playerRight = p.x + charWidth;
    // If player overlaps wall horizontally near ground or any height, push out
    if (playerRight > wallLeft && playerLeft < wallRight) {
      // Decide push direction by side
      const distToLeft = Math.abs(playerRight - wallLeft);
      const distToRight = Math.abs(wallRight - playerLeft);
      if (distToLeft < distToRight) {
        p.x = wallLeft - charWidth;
      } else {
        p.x = wallRight;
      }
    }

    // Platform collision detection
    const platformTop = gameHeight - 32; // 32px is platform height
    if (p.y >= platformTop - charHeight) {
      p.y = platformTop - charHeight;
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
    const doorLeft = document.querySelector('.door-left');
    const doorRight = document.querySelector('.door-right');
    if (!doorLeft || !doorRight) return;

    const char1AtLeft = isTouchingDoor(char1, doorLeft);
    const char2AtRight = isTouchingDoor(char2, doorRight);

    if (char1AtLeft && char2AtRight) {
      if (!winTimeout) {
        winTimeout = setTimeout(() => {
          alert("🎉 Level Complete!");
          audioManager.playSound("levelCompleteSound");
          
          const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
          if (!completedLevels.includes(2)) {
            completedLevels.push(2);
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
          }
          
          setTimeout(() => {
            window.location.href = "../../menu/index.html";
          }, 2000);
          
          winTimeout = null;
        }, 800);
      }
    } else if (winTimeout) {
      clearTimeout(winTimeout);
      winTimeout = null;
    }
  }

  let inTransmute1 = false;
  let inTransmute2 = false;

  function checkHazards() {
    if (waterHazard && isColliding(player1, waterHazard) && player1.type === "fire") {
      char1.style.display = "none";
      audioManager.playSound("gameOverSound1");
    }
    if (lavaHazard && isColliding(player2, lavaHazard) && player2.type === "water") {
      char2.style.display = "none";
      audioManager.playSound("gameOverSound2");
    }

    // Transmutation (supports multiple zones)
    const transmuteZones = document.querySelectorAll('.transmute');
    if (transmuteZones && transmuteZones.length > 0) {
      let p1InAny = false;
      let p2InAny = false;
      transmuteZones.forEach(zone => {
        if (!p1InAny && isColliding(player1, zone)) p1InAny = true;
        if (!p2InAny && isColliding(player2, zone)) p2InAny = true;
      });

      if (p1InAny) {
        if (!inTransmute1) {
          player1.type = player1.type === 'fire' ? 'water' : 'fire';
          char1.style.height = char1OriginalHeight + 'px';
          char1.style.background = player1.type === 'fire' ? 'red' : 'blue';
          inTransmute1 = true;
          audioManager.playSound('wooshSound');
        }
      } else {
        inTransmute1 = false;
      }

      if (p2InAny) {
        if (!inTransmute2) {
          player2.type = player2.type === 'water' ? 'fire' : 'water';
          char2.style.height = char2OriginalHeight + 'px';
          char2.style.background = player2.type === 'fire' ? 'red' : 'blue';
          inTransmute2 = true;
          audioManager.playSound('wooshSound');
        }
      } else {
        inTransmute2 = false;
      }
    }
  }




  function resetGame() {
    // Player 1
    player1.x = Math.max(20, Math.floor(gameWidth * 0.1));
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
    player2.x = Math.max(20, Math.floor(gameWidth * 0.9 - (char2.offsetWidth || 40)));
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
    checkHazards();
    checkDoors();

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});
