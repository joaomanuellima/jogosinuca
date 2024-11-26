let balls = []
let pockets = [];
let tableWidth = 800;
let tableHeight = 400;
let whiteBall; // Referência à bola branca
let chargingForce = false; // Indica se o mouse está sendo segurado
let forceStartTime = 0; // Tempo inicial de carregamento da força
let maxForce = 15; // Força máxima permitida

function setup() {
  createCanvas(tableWidth, tableHeight);
  setupTable();
  setupBalls();
}

function draw() {
  background(50, 150, 50); // Mesa verde
  drawTable();
  drawBalls();
  drawCue();
  checkCollisions();
}

function setupTable() {
  let pocketRadius = 15;
  pockets = [
    { x: 0, y: 0 },
    { x: width / 2, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width / 2, y: height },
    { x: width, y: height },
  ].map(p => ({ ...p, radius: pocketRadius }));
}

function drawTable() {
  noStroke();
  fill(0);
  pockets.forEach(pocket => {
    ellipse(pocket.x, pocket.y, pocket.radius * 2);
  });
}

function setupBalls() {
  let ballRadius = 10;
  let colors = [
    color(255, 0, 0), color(0, 255, 0), color(0, 0, 255), color(255, 255, 0),
    color(255, 165, 0), color(128, 0, 128), color(0, 255, 255), color(139, 69, 19),
    color(osinuca is availab192, 192, 192), color(255, 20, 147), color(128, 128, 0), color(0, 128, 128),
    color(75, 0, 130), color(255, 105, 180), color(154, 205, 50)
  ];

  // Adiciona bolas coloridas
  for (let i = 0; i < 15; i++) {
    let angle = random(TWO_PI);
    let x = width / 2 + cos(angle) * random(50, 100);
    let y = height / 2 + sin(angle) * random(50, 100);
    balls.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      color: colors[i % colors.length],
      isWhite: false,
    });
  }

  // Adiciona a bola branca
  whiteBall = {
    x: width / 4,
    y: height / 2,
    vx: 0,
    vy: 0,
    radius: ballRadius * 1.2,
    color: color(255),
    isWhite: true,
  };
  balls.push(whiteBall);
}

function drawBalls() {
  noStroke();
  balls.forEach(ball => {
    fill(ball.color);
    ellipse(ball.x, ball.y, ball.radius * 2);
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Atrito para desacelerar as bolas
    ball.vx *= 0.99;
    ball.vy *= 0.99;

    // Colisão com bordas
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
      ball.vx *= -1;
    }
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
      ball.vy *= -1;
    }
  });

  // Remove bolas que caíram nos buracos
  balls = balls.filter(ball => {
    let inPocket = pockets.some(pocket => dist(ball.x, ball.y, pocket.x, pocket.y) < pocket.radius);
    return !(inPocket && !ball.isWhite); // Remove apenas bolas coloridas
  });
}

function drawCue() {
  if (whiteBall) {
    // Calcula a posição do taco (apenas no mouse)
    let dx = mouseX - whiteBall.x;
    let dy = mouseY - whiteBall.y;
    let angle = atan2(dy, dx);
    let cueLength = 100;

    // Calcula a posição inicial e final do taco
    let cueX1 = mouseX;
    let cueY1 = mouseY;
    let cueX2 = cueX1 - cos(angle) * cueLength;
    let cueY2 = cueY1 - sin(angle) * cueLength;

    // Desenha o taco
    stroke(200, 150, 50);
    strokeWeight(4);
    line(cueX1, cueY1, cueX2, cueY2);

    // Indica a força visualmente
    if (chargingForce) {
      let charge = constrain((millis() - forceStartTime) / 700, 0, maxForce);
      stroke(255, 0, 0);
      line(cueX1, cueY1, cueX1 - cos(angle) * charge * 5, cueY1 - sin(angle) * charge * 5);
    }
  }
}

function mousePressed() {
  // Começa a carregar a força
  if (whiteBall) {
    chargingForce = true;
    forceStartTime = millis();
  }
}

function mouseReleased() {
  // Aplica a força na bola branca
  if (chargingForce) {
    chargingForce = false;

    let dx = whiteBall.x - mouseX; // Direção oposta ao taco
    let dy = whiteBall.y - mouseY;
    let distance = dist(mouseX, mouseY, whiteBall.x, whiteBall.y);
    let force = constrain((millis() - forceStartTime) / 1, 0, maxForce);

    whiteBall.vx = (dx / distance) * force; // Velocidade proporcional à força
    whiteBall.vy = (dy / distance) * force;
  }
}

function checkCollisions() {
  // Verifica colisões entre bolas
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let ballA = balls[i];
      let ballB = balls[j];
      let dx = ballB.x - ballA.x;
      let dy = ballB.y - ballA.y;
      let distance = sqrt(dx * dx + dy * dy);

      if (distance < ballA.radius + ballB.radius) {
        // Calcula a direção do impacto
        let angle = atan2(dy, dx);
        let overlap = ballA.radius + ballB.radius - distance;

        // Corrige a posição para evitar sobreposição
        ballA.x -= (overlap / 2) * cos(angle);
        ballA.y -= (overlap / 2) * sin(angle);
        ballB.x += (overlap / 2) * cos(angle);
        ballB.y += (overlap / 2) * sin(angle);

        // Colisão elástica
        let vx1 = ballA.vx;
        let vy1 = ballA.vy;
        let vx2 = ballB.vx;
        let vy2 = ballB.vy;

        ballA.vx = vx2 * cos(angle) + vy2 * sin(angle);
        ballA.vy = vy2 * cos(angle) - vx2 * sin(angle);

        ballB.vx = vx1 * cos(angle) + vy1 * sin(angle);
        ballB.vy = vy1 * cos(angle) - vx1 * sin(angle);
      }
    }
  }
}
