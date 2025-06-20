// Get the canvas element and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas fill the screen and adjust on window resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let clawX = 0, clawY = 10;
let clawDirection = 1;
let arrowDropping = false;
let arrowY = clawY;
let balloons = [];
let score = 0, highScore = 0;
let gameOver = false, gameWon = false, startScreen = true;
let touched = false; // Prevent mobile double-trigger

// Game settings
const balloonCount = 10;
const balloonW = 50, balloonH = 35;
const clawSpeed = 4;
// const clawSpeedIncrement = 0.05;
// const maxClawSpeed = 12;
const balloonColors = ['hotpink', 'skyblue', 'lightyellow', 'lightgreen', 'violet', 'peachpuff', 'lightcoral', 'lightcyan'];
spawnBalloons(); // 👈 Add this line right after defining the canvas and ctx

// Load game sounds
const popSound = new Audio('pop.mp3');
const sadSound = new Audio('sad.mp3');
const winSound = new Audio('victory.mp3');
const bgMusic = new Audio('arcade.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;
bgMusic.play();

// Random balloon spawner
function spawnBalloons() {
  balloons = [];
  for (let i = 0; i < balloonCount; i++) {
    let x = Math.random() * (canvas.width - 40) + 20;
    let y = Math.random() * (canvas.height * 0.5) + canvas.height * 0.3;
    let color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    balloons.push({ x, y, color });
  }
}

// Overlay display (start/win/lose)
function drawOverlay(textLines) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 28px Courier New';
  textLines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2 - ctx.measureText(line).width / 2, canvas.height / 2 + i * 40);
  });
}

// Game rendering
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Claw line
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(clawX, 0);
  ctx.lineTo(clawX, clawY);
  ctx.stroke();

  // Claw oval
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(clawX, clawY + 5, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arrow
  if (arrowDropping) {
    ctx.strokeStyle = '#f0f';
    ctx.beginPath();
    ctx.moveTo(clawX, clawY);
    ctx.lineTo(clawX, arrowY);
    ctx.stroke();

    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.moveTo(clawX - 5, arrowY);
    ctx.lineTo(clawX, arrowY + 8);
    ctx.lineTo(clawX + 5, arrowY);
    ctx.fill();
  }

  // Balloons
  balloons.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, balloonW / 2, balloonH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // ❌ Removed balloon string for clean look
  });

  // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Courier New';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`High: ${highScore}`, 20, 50);
}

// Game reset
function resetGame() {
  clawX = 20;
  clawDirection = 1;
  arrowDropping = false;
  arrowY = clawY;
  score = 0;
  gameOver = false;
  gameWon = false;
  spawnBalloons();
}


// Main update loop
function update() {
  if (startScreen) {
    drawOverlay(["🎮 CLAW OF CODE 🎮", "", "Tap anywhere or press ENTER to Start"]);
    return;
  }

  if (gameOver) {
    drawOverlay(["💀 GAME OVER 💀", `Score: ${score} | High: ${highScore}`, "Tap or press R to Restart"]);
    return;
  }

  if (gameWon) {
    drawOverlay(["🎉 YOU WON! 🎉", `Score: ${score} | High: ${highScore}`, "Tap or press R to Restart"]);
    return;
  }

  // Move claw
  if (!arrowDropping) {
    // clawSpeed = Math.min(clawSpeed + clawSpeedIncrement, maxClawSpeed);
    clawX += clawSpeed * clawDirection;
    if (clawX <= 0 || clawX >= canvas.width) {
      clawDirection *= -1;
    }
  }

  // Drop logic
  if (arrowDropping) {
    arrowY += 5;
    let hit = false;

    balloons = balloons.filter(b => {
      let dx = Math.abs(clawX - b.x);
      let dy = Math.abs(arrowY - b.y);
      if (dx < balloonW / 2 && dy < balloonH / 2) {
        score += 10;
        popSound.play();
        hit = true;
        return false;
      }
      return true;
    });

    if (hit || arrowY > canvas.height) {
      arrowDropping = false;
      arrowY = clawY;

      if (!hit) {
        sadSound.play();
        gameOver = true;
        if (score > highScore) highScore = score;
      }
    }

    if (balloons.length === 0) {
      gameWon = true;
      winSound.play();
      if (score > highScore) highScore = score;
    }
  }

  drawGame();
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if (startScreen && e.key === 'Enter') {
    startScreen = false;
    resetGame();
  } else if (!arrowDropping && !gameOver && !gameWon && e.key === 'Enter') {
    arrowDropping = true;
  } else if ((gameOver || gameWon) && e.key.toLowerCase() === 'r') {
    startScreen = true;
    resetGame();
  }
});

// Game input handler
function handleGameInput() {
  if (startScreen || gameOver || gameWon) {
    startScreen = false;
    gameOver = false;
    gameWon = false;
    resetGame();
  } else if (!arrowDropping) {
    arrowDropping = true;
  }
}



// Touch and click with protection from double input
canvas.addEventListener('touchstart', () => {
  touched = true;
  handleGameInput();
}, { passive: true });

canvas.addEventListener('click', () => {
  if (!touched) {
    handleGameInput();
  }
  touched = false;
});

// Device orientation reminder
function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    alert("🔄 Rotate your phone to landscape mode for best experience!");
  }
}
checkOrientation();
window.addEventListener('resize', checkOrientation);

// Pause music when tab is not active
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    bgMusic.pause();
  } else {
    bgMusic.play();
  }
});

// Game loop
function gameLoop() {
  if (!document.hidden) update();
  requestAnimationFrame(gameLoop);
}
gameLoop();
