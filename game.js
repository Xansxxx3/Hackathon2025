console.log("Game loaded!");

const char1 = document.getElementById("char1");
const char2 = document.getElementById("char2");

const keys = {};

const gravity = 0.5;
const jumpStrength = -10;

const game = document.getElementById("game");
const gameWidth = game.clientWidth;
const gameHeight = game.clientHeight;

let player1 = { x: 100, y: gameHeight - 40, vy: 0, onGround: true, element: char1 }; // assumes 40px height
let player2 = { x: 200, y: gameHeight - 40, vy: 0, onGround: true, element: char2 };

document.addEventListener("keydown", e => {
  keys[e.key] = true;

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
});

function updatePlayer(p, leftKey, rightKey) {
  // horizontal movement
  if (keys[leftKey]) p.x -= 3;
  if (keys[rightKey]) p.x += 3;

  // apply gravity
  p.vy += gravity;
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
  updatePlayer(player1, "a", "d");              
  updatePlayer(player2, "ArrowLeft", "ArrowRight"); 

  requestAnimationFrame(gameLoop);
}

gameLoop();
