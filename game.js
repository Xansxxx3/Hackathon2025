console.log("Game loaded!");

const char1 = document.getElementById("char1");
const char2 = document.getElementById("char2");

const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function gameLoop() {
  // char1 movement
  let fireLeft = parseInt(char1.style.left) || 100;
  if (keys["a"] || keys["A"]) fireLeft -= 3;
  if (keys["d"] || keys["D"]) fireLeft += 3;
  char1.style.left = fireLeft + "px";

  // char2 movement
  let waterLeft = parseInt(char2.style.left) || 200;
  if (keys["ArrowLeft"]) waterLeft -= 3;
  if (keys["ArrowRight"]) waterLeft += 3;
  char2.style.left = waterLeft + "px";

  requestAnimationFrame(gameLoop);
}

gameLoop();
