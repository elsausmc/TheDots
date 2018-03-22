let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels;
let dotCount = 10000;
let friction = 1; //.025;
let kick = 0;
let halfKick = kick / 2;
let gravity = 1;
let oldestDot = 0;
let longestLife = 0.000000001;

function Color(r, g, b, a) {
  this.r = r || 255;
  this.g = g || 255;
  this.b = b || 255;
  this.a = a || 255;
}

function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

function Dot(x, y, m) {
  let self = this;
  self.color = new Color();
  self.vector = new Point(0, 0);
  self.x = centerX; //// x || Math.floor(Math.random() * ctx.canvas.width);
  self.y = centerY; //// y || Math.floor(Math.random() * ctx.canvas.height);
  this.neurons = [];
  this.ticks = 0;
  this.Init();
}

Dot.prototype.Init = function() {
  this.x = centerX;
  this.y = centerY;
  this.neurons = [];
  let neuronCount = 4;
  for (let index = 0; index < neuronCount; index++) {
    this.neurons.push(new neuron(neuronCount));
  }
};

Dot.prototype.Think = function() {
  // mix in inputs.
  // this.neurons[3].value = this.NearWall ? 1 : -1;
  this.neurons[2].value = (centerX - this.x) / centerX;
  this.neurons[3].value = (centerY - this.y) / centerY;

  let newValues = [0, 0, 0, 0];

  for (let index = 0; index < this.neurons.length; index++) {
    for (
      let cindex = 0;
      cindex < this.neurons[index].connections.length;
      cindex++
    ) {
      newValues[index] +=
        this.neurons[cindex].value *
          this.neurons[index].connections[cindex].weight +
        this.neurons[index].bias;
    }
  }

  for (let index = 0; index < this.neurons.length; index++) {
    this.neurons[index].value = Math.sin(newValues[index]);
  }
};

Dot.prototype.Wrap = function() {
  if (this.x > ctx.canvas.width) {
    this.x = 0;
  }
  if (this.x < 0) {
    this.x = ctx.canvas.width;
  }
  if (this.y > ctx.canvas.height) {
    this.y = 0;
  }
  if (this.y < 0) {
    this.y = ctx.canvas.height;
  }
};

Dot.prototype.CheckWallDeath = function() {
  if (this.NearWall()) {
    this.Init();
  }
};

Dot.prototype.NearWall = function() {
  let padding = 10; // shrinking wall longestLife * 10000000;
  return (
    this.x > ctx.canvas.width - padding ||
    this.x < padding ||
    this.y > ctx.canvas.height - padding ||
    this.y < padding
  );
};

Dot.prototype.LimitSpeed = function() {
  if (this.vector.x > 1) {
    this.vector.x = 1;
  }
  if (this.vector.x < -1) {
    this.vector.x = -1;
  }
  if (this.vector.y > 1) {
    this.vector.y = 1;
  }
  if (this.vector.y < -1) {
    this.vector.y = -1;
  }
};

Dot.prototype.DoMovement = function() {
  this.Think();

  this.vector.x = this.neurons[0].value;
  this.vector.y = this.neurons[1].value;

  //this.LimitSpeed();

  this.x += this.vector.x;
  this.y += this.vector.y;

  //this.Wrap();
  this.CheckWallDeath();
  this.ticks += 0.00000001;
  if (this.ticks > longestLife) {
    longestLife = this.ticks;
  }
};

function neuron(neuronCount) {
  this.bias = Math.random() * 3 - 1;
  this.threshold = 1;
  this.connections = [];
  this.value = Math.random() * 3 - 1;
  this.Init();
}

neuron.prototype.Init = function() {
  for (let index = 0; index < 4; index++) {
    this.connections.push({
      nindex: index,
      weight: Math.random() * 3 - 1
    });
  }
};

// function connection() {
// 	this.nindex = 0;
// 	this.weight = 0;
// };

function init() {
  let vectors = [];
  for (let i = 0; i <= dotCount; i++) {
    vectors.push(new Dot());
  }

  DrawGrid(vectors);
}

function DrawGrid(dots) {
  for (let i = dotCount; i > 0; i--) {
    dots[i].DoMovement();
  }

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
      pixels.data[index] = dot.color.r;
      pixels.data[index + 1] = dot.color.g;
      pixels.data[index + 2] = dot.color.b;
      pixels.data[index + 3] = dot.color.a;
    }
  }

  ctx.putImageData(pixels, 0, 0);

  setTimeout(function() {
    DrawGrid(dots);
  }, 1);
  return;
}

init();
