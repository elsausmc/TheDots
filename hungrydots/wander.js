let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels;
let dotCount = 1000;
let oldestDot = 0;
let longestLife = 0.00000001;
let dots = [];

function Init() {
  for (let i = 0; i <= dotCount; i++) {
    dots.push(new Dot());
  }

  DrawGrid();
}

function FindNearest(di) {
  let dot = dots[di];
  let smallestdistance = 100000;

  for (let closeIndex = 0; closeIndex < dots.length; closeIndex++) {
    let checkDot = dots[closeIndex];
    if (di != closeIndex) {
      var dx = dot.x - checkDot.x;
      var dy = dot.y - checkDot.y;
      var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));

      if (distance < smallestdistance) {
        smallestdistance = distance;
        dot.nearestDot = checkDot;
        checkDot.nearestDot = dot;
      }
    }
  }
}

function DrawGrid() {
  for (let i = 0; i < dotCount; i++) {
    FindNearest(i);
    dots[i].DoMovement();
    if (dots[i].life > longestLife) {
      longestLife = dots[i].life;
      oldestDot = i;
    }
  }

  for (let dotIndex = 0; dotIndex < dots.length; dotIndex++) {
    let dot = dots[dotIndex];

    if (dot.CheckDeath() === true) {
      let randot = Math.floor(Math.random() * dots.length);
      for (let ni = 0; ni < dot.neurons.length; ni++) {
        for (let nc = 0; nc < dot.neurons[ni].connections.length; nc++) {
          dot.neurons[ni].connections[nc].weight =
            dots[randot].neurons[ni].connections[nc].weight;
        }
      }

      let randomNeuron =
        dot.neurons[Math.floor(Math.random() * 4)];
      let randomConnection =
        randomNeuron.connections[
          Math.floor(Math.random() * randomNeuron.connections.length)
        ];
      randomConnection.weight += (Math.random() * 2 - 1) /1;

      dot.x = Math.random() * ctx.canvas.width;
      dot.y = Math.random() * ctx.canvas.height;
      dot.vector.x = 0;
      dot.vector.y = 0;
      dot.life = 1;

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
    index = (x + y * ctx.canvas.width) * 4;
    if (!(x < 0 || y < 0 || x > ctx.canvas.width || y > ctx.canvas.height)) {
      pixels.data[index] = dot.color.r;
      pixels.data[index + 1] = dot.color.g;
      pixels.data[index + 2] = dot.color.b;
      pixels.data[index + 3] = 255;
    }
  }

  ctx.putImageData(pixels, 0, 0);

  setTimeout(function () {
    DrawGrid();
  }, 1);
  return;
}

Init();