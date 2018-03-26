let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels;
let dotCount = 1000;
let oldestDot = 0;
let longestLife = 0.000000001;
let dots = [];

function Init() {
  for (let i = 0; i <= dotCount; i++) {
    dots.push(new Dot());
  }

  DrawGrid();
}

function DrawGrid() {
  for (let i = dotCount; i > 0; i--) {
    dots[i].DoMovement();
    if (dots[i].ticks > longestLife) {
      longestLife = dots[i].ticks;
      oldestDot = i;
    }
  }

  dots.forEach(dot => {
    if (dot.CheckDeath() === true) {
      dot = dots[oldestDot];
      dot.neurons[Math.floor(Math.random() * 7)] = new neuron(7);
      dot.x = Math.random() * ctx.canvas.width;
      dot.y = Math.random() * ctx.canvas.height;
      dot.vector.x = 0;
      dot.vector.y = 0;
      dot.loneliness = 0;
      dot.ticks = 0;
      
    }
  });

  // clear screen
  pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  let index = 0;
  let dot;

  // draw
  for (let i = dotCount; i > 0; i--) {
    dot = dots[i];
    let x = Math.floor(dot.x);
    let y = Math.floor(dot.y);
    index = (x + y * ctx.canvas.width) * 4;
    if (!(x < 0 || y < 0 || x > ctx.canvas.width || y > ctx.canvas.height)) {
      pixels.data[index] = 255;
      pixels.data[index + 1] = 255;
      pixels.data[index + 2] = 255;
      pixels.data[index + 3] = 255;
    }
  }

  ctx.putImageData(pixels, 0, 0);

  setTimeout(function() {
    DrawGrid();
  }, 1);
  return;
}

Init();
