let cvs: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gridCanvas");
let ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D >cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX: number = ctx.canvas.width / 2;
let centerY: number = ctx.canvas.height / 2;

let pixels: ImageData ;
let dotCount: number = 100;
let oldestDot: number = 0;
let longestLife: number = 0.000000001;
let dots: any = [];

function Point (x: number, y: number): void {
  this.x = x || 0;
  this.y = y || 0;
}

function Dot(): void {
  this.vector = new Point(0, 0);
  this.x = centerX;
  this.y = centerY;
  this.neurons = [];
  this.ticks = 0;
  this.loneliness = 0;
  this.loneRate = 0;
  this.closeness = 0;
  this.Init();
}

Dot.prototype.Init = function(): void {
  this.x = centerX;
  this.y = centerY;
  this.loneliness = 0;
  this.loneRate = Math.random();
  this.closeness = Math.floor(Math.random() * 100);

  this.neurons = [];
  let neuronCount: number = 5;
  for (let index: number = 0; index < neuronCount; index++) {
    this.neurons.push(new neuron(neuronCount));
  }
};

Dot.prototype.Think = function(): any {
  // mix in inputs.
  // this.neurons[3].value = this.NearWall ? 1 : -1;
  this.neurons[2].value = (centerX - this.x) / centerX;
  this.neurons[3].value = (centerY - this.y) / centerY;
  this.neurons[4].value = this.loneliness;

  let newValues: number[] = [0, 0, 0, 0, 0];

  for (let index: number = 0; index < 2; index++) {
    for (
      let cindex: number = 0;
      cindex < this.neurons[index].connections.length;
      cindex++
    ) {
      newValues[index] +=
        this.neurons[cindex].value *
          this.neurons[index].connections[cindex].weight +
        this.neurons[index].bias;
    }
  }

  for (let index: number = 0; index < this.neurons.length; index++) {
    this.neurons[index].value = Math.sin(newValues[index]);
  }
};

Dot.prototype.Wrap = function(): void {
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

Dot.prototype.CheckDeath = function(): boolean {
  return this.NearWall() || this.loneliness > 1;
  //   if (this.NearWall() || this.loneliness > 1) {
  // 	this.Init();
  //   }
};

Dot.prototype.NearWall = function(): boolean {
  let padding: number = 10; // shrinking wall longestLife * 10000000;
  return (
    this.x > ctx.canvas.width - padding ||
    this.x < padding ||
    this.y > ctx.canvas.height - padding ||
    this.y < padding
  );
};

Dot.prototype.NearDot = function(): void {
  dots.forEach(otherDot => {
    if (
      !(this.x === otherDot.x && this.y === otherDot.y) &&
      Math.abs(this.x - otherDot.x) < this.closeness &&
      Math.abs(this.y - otherDot.y) < this.closeness
    ) {
      this.loneliness = 0;
    }
  });

  this.loneliness += this.loneRate;
};

Dot.prototype.LimitSpeed = function(): void {
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

Dot.prototype.DoMovement = function(): void {
  this.NearDot();
  this.Think();

  this.vector.x = this.neurons[0].value;
  this.vector.y = this.neurons[1].value;

  // this.LimitSpeed();

  this.x += this.vector.x;
  this.y += this.vector.y;

  // this.Wrap();
  this.CheckDeath();
  this.ticks += 0.00000001;
  if (this.ticks > longestLife) {
    longestLife = this.ticks;
  }
};

function neuron(neuronCount: number): void {
  this.bias = Math.random() * 3 - 1;
  this.threshold = 1;
  this.connections = [];
  this.value = Math.random() * 3 - 1;
  this.Init();
}

neuron.prototype.Init = function(): void {
  for (let index: number = 0; index < 4; index++) {
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

function Init(): void {
  for (let i: number = 0; i <= dotCount; i++) {
    dots.push(new Dot());
  }

  DrawGrid();
}

function DrawGrid(): void {
  for (let i: number = dotCount; i > 0; i--) {
    dots[i].DoMovement();
    if (dots[i].ticks > longestLife) {
      longestLife = dots[i].ticks;
      oldestDot = i;
    }
  }

  dots.forEach(dot => {
    if (dot.CheckDeath()) {
      dot = dots[oldestDot];
      dot.x = centerX;
      dot.y = centerY;
      dot.ticks = 0;
    }
  });

  // clear screen
  pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  let index: number = 0;
  let dot: any;

  // draw
  for (let i: number = dotCount; i > 0; i--) {
    dot = dots[i];
    let x: number = Math.floor(dot.x);
    let y: number = Math.floor(dot.y);
    index = (x + y * ctx.canvas.width) * 4;
    if (!(x < 0 || y < 0 || x > ctx.canvas.width || y > ctx.canvas.height)) {
      pixels.data[index] = 255;
      pixels.data[index + 1] = 255;
      pixels.data[index + 2] = 255;
      pixels.data[index + 3] = 255;
    }
  }

  ctx.putImageData(pixels, 0, 0);

  setTimeout(function(): void {
    DrawGrid();
  }, 1);
}

Init();
