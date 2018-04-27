let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels;
let dotCount = 200;
let oldestDot = 0;
let highestAge = 0;
let populationData = {
  mostLife: 0,
  highestAverage: 0,
  averageAge: 0,
  highestAge: 0
};
let previousPopulation = populationData;
let dots = [];

function Init() {
  for (let i = 0; i <= dotCount; i++) {
    dots.push(new Dot());
    if (i < dotCount * 0.5) {
      dots[i].RestoreBrain();
    }
  }

  DrawGrid();
}

function DrawGrid() {
  let totalLife = 0;
  populationData.highestAge = 0;
  populationData.mostLife = 0;
  for (let i = 0; i < dotCount; i++) {
    totalLife += dots[i].life;
    dots[i].CheckDots(dots);

    dots[i].DoMovement();
    if (dots[i].life > populationData.mostLife) {
      populationData.mostLife = dots[i].life;
    }

    if (dots[i].age > populationData.highestAge) {
      oldestDot = i;
      populationData.highestAge = dots[i].age;
    }
  }

  let averageLife = totalLife / dotCount;
  if (averageLife > populationData.highestAverage) {
    populationData.highestAverage = averageLife;
  }

  for (let dotIndex = 0; dotIndex < dots.length; dotIndex++) {
    let dot = dots[dotIndex];

    if (dot.CheckDeath() === true) {
      if (dot.age >= populationData.highestAge) {
        dot.SaveBrain();
      }

      let copyDot = oldestDot;
      if (Math.random() < 0.5) {
        copyDot = Math.floor(Math.random() * dots.length);
      }

      dot.CopyBrain(dots[copyDot]);
      dot.MutateBrain();

      dot.x = Math.random() * ctx.canvas.width;
      dot.y = Math.random() * ctx.canvas.height;

      dot.vector.x = 0;
      dot.vector.y = 0;
      dot.life = 10;
      dot.age = 0;
    }
  }

  // clear screen
  pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  let index = 0;
  let dot;

  // draw
  for (let i = 0; i < dotCount; i++) {
    dot = dots[i];
    let x = Math.floor(dot.x);
    let y = Math.floor(dot.y);

    let colorShift = dot.age / populationData.highestAge * 255;
    let dotSize = 1;
    if (i === oldestDot) {
      colorShift = 255;
      dotSize += 2;
    }

    for (let xx = x - dotSize; xx <= x + dotSize; xx++) {
      for (let yy = y - dotSize; yy <= y + dotSize; yy++) {
        index = (xx + yy * ctx.canvas.width) * 4;
        if (
          !(xx < 0 || yy < 0 || xx > ctx.canvas.width || yy > ctx.canvas.height)
        ) {
          pixels.data[index] = dot.color.r; //colorShift;
          pixels.data[index + 1] = dot.color.g; //255 - colorShift;
          pixels.data[index + 2] = dot.color.b; //0;
          pixels.data[index + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(pixels, 0, 0);

  ctx.font = "10px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("average energy: " + averageLife.toFixed(3), 10, 40);
  ctx.fillText("most energy: " + populationData.mostLife.toFixed(3), 10, 50);
  ctx.fillText("oldest age: " + populationData.highestAge, 10, 60);

  setTimeout(function() {
    DrawGrid();
  }, 1);
  return;
}

Init();
