console.log("Game loaded!");

const char1 = document.getElementById("char1"); // Fire
const char2 = document.getElementById("char2"); // Water

const keys = {};

const gravity = 0.5;
const jumpStrength = -10;

const game = document.getElementById("game");
const gameWidth = game.clientWidth;
const gameHeight = game.clientHeight;

// store original sizes for reset
const char1OriginalHeight = char1.offsetHeight;
const char2OriginalHeight = char2.offsetHeight;

let player1 = { x: 100, y: gameHeight - char1OriginalHeight, vy: 0, onGround: true, element: char1 };
let player2 = { x: 200, y: gameHeight - char2OriginalHeight, vy: 0, onGround: true, element: char2 };

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // jump logic
  if ((e.key === "w" || e.key === "W") && player1.onGround) {
    player1.vy = jumpStrength;
    player1.onGround = false;
  }
  if (e.key === "ArrowUp" && player2.onGround) {
    player2.vy = jumpStrength;
    player2.onGround = false;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;

  // reset watergirl size when ability released
  if (e.key === "g") {
    player2.element.style.height = char2OriginalHeight + "px";
  }
});

function updatePlayer(p, leftKey, rightKey, abilityKey, type) {
  // horizontal movement
  if (keys[leftKey]) p.x -= 3;
  if (keys[rightKey]) p.x += 3;

  // FIREBOY: rise if ability key pressed
  if (type === "fire" && keys[abilityKey]) {
    p.vy = -2; // float upward slowly
  } else {
    // apply gravity otherwise
    p.vy += gravity;
  }

  // WATERGIRL: puddle form if ability key pressed
  if (type === "water" && keys[abilityKey]) {
    p.element.style.height = (char2OriginalHeight / 2) + "px"; // shrink height
  }

  // apply velocity
  p.y += p.vy;

  // get character dimensions
  const charWidth = p.element.offsetWidth;
  const charHeight = p.element.offsetHeight;

  // clamp inside horizontal bounds
  if (p.x < 0) p.x = 0;
  if (p.x > gameWidth - charWidth) p.x = gameWidth - charWidth;

  // ground collision
  if (p.y >= gameHeight - charHeight) {
    p.y = gameHeight - charHeight;
    p.vy = 0;
    p.onGround = true;
  }

  // ceiling clamp
  if (p.y < 0) {
    p.y = 0;
    p.vy = 0;
  }

  // update position
  p.element.style.left = p.x + "px";
  p.element.style.top = p.y + "px";
}

function gameLoop() {
  updatePlayer(player1, "a", "d", "f", "fire");              // Fireboy uses "f" to float
  updatePlayer(player2, "ArrowLeft", "ArrowRight", "g", "water"); // Watergirl uses "/" to puddle

  requestAnimationFrame(gameLoop);
}

gameLoop();
