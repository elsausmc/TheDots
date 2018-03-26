function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

function Dot(x, y, m) {
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

Dot.prototype.Init = function() {
  this.x = centerX;
  this.y = centerY;
  this.loneliness = 0;
  this.loneRate = Math.random();
  this.closeness = Math.floor(Math.random() * 100);

  this.neurons = [];
  let neuronCount = 7;
  for (let index = 0; index < neuronCount; index++) {
    this.neurons.push(new neuron(neuronCount));
  }
};

Dot.prototype.Think = function() {
  // mix in inputs.
  this.neurons[4].value = (centerX - this.x) / centerX;
  this.neurons[5].value = (centerY - this.y) / centerY;
  this.neurons[6].value = 1 / (1 + Math.exp(this.loneliness));

  let newValues = [0,0,0,0,0,0,0];

  for (let index = 0; index < 7; index++) {
    for (
      let cindex = 0;
      cindex < this.neurons[index].connections.length;
      cindex++
    ) {
      newValues[index] +=
        (this.neurons[cindex].value *
          this.neurons[index].connections[cindex].weight);
    }
    //newValues[index] += this.neurons[index].bias;
  }

  for (let index = 0; index < this.neurons.length; index++) {
    this.neurons[index].value = 1 / (1 + Math.exp(newValues[index]));
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

Dot.prototype.CheckDeath = function() {
  return this.NearWall() || this.SpeedCheck() !== 0;
};

Dot.prototype.SpeedCheck = function() {
  if (Math.abs(this.vector.x) > 100 || Math.abs(this.vector.y) > 100) {
    return 1;
  }

  if (Math.abs(this.vector.x) < 1 && Math.abs(this.vector.y) < 1) { 
    return -1; 
  }

  return 0;
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

Dot.prototype.NearDot = function() {
  dots.forEach(otherDot => {
    if (
      !(this.x === otherDot.x && this.y === otherDot.y) &&
      Math.abs(this.x - otherDot.x) < this.closeness &&
      Math.abs(this.y - otherDot.y) < this.closeness
    ) {
      this.loneliness -= this.loneRate;
    }
  });

  this.loneliness += this.loneRate;
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
  this.NearDot();
  this.Think();

  this.vector.x += (this.neurons[0].value - this.neurons[1].value) ;
  this.vector.y += (this.neurons[2].value - this.neurons[3].value) ;

  //this.LimitSpeed();

  this.x += this.vector.x;
  this.y += this.vector.y;

  //this.Wrap();
  this.CheckDeath();
  this.ticks += 0.00000001;
};
