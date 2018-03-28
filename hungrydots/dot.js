function Dot() {
  this.vector = { x: 0, y: 0 };
  this.x = centerX;
  this.y = centerY;
  this.neurons = [];
  this.life = 0.005;
  this.tickRate = 0.001;
  this.InputCount = 11;
  this.nearestDot = null;
  this.Init();
}

Dot.prototype.CheckDeath = function() {
  return this.NearWall() || this.Consumed() || this.life < -2;
  
};

Dot.prototype.Consumed = function() {
  if (
    this.life > 0.005 + (this.tickRate * 100) &&
    Math.floor(this.x) === Math.floor(this.nearestDot.x) &&
    Math.floor(this.y) === Math.floor(this.nearestDot.y) &&
    this.life < this.nearestDot.life
  ) {
    this.nearestDot.life += this.life;
    this.life = 0;
    return true;
  }

  return false;
};

Dot.prototype.DoMovement = function() {
  const scale = 1;
  this.Think();

  this.vector.x = (this.neurons[0].value - this.neurons[1].value) / scale;
  this.vector.y = (this.neurons[2].value - this.neurons[3].value) / scale;

  this.x += this.vector.x;
  this.y += this.vector.y;

  this.life -= this.tickRate; //+ (Math.sqrt((this.vector.x*this.vector.x) + (this.vector.y * this.vector.y))/100);
};

Dot.prototype.Init = function() {
  this.x = centerX;
  this.y = centerY;

  this.neurons = [];
  for (let index = 0; index < this.InputCount; index++) {
    this.neurons.push(new neuron(this.InputCount));
  }
};

Dot.prototype.NearWall = function() {
  let padding = 10; // this.life * 100;
  return (
    this.x > ctx.canvas.width - padding ||
    this.x < padding ||
    this.y > ctx.canvas.height - padding ||
    this.y < padding
  );
};

Dot.prototype.Think = function() {
  this.neurons[4].value = (centerX - this.x) / centerX;
  this.neurons[5].value = (centerY - this.y) / centerY;
  //this.neurons[6].value = this.life;
  this.neurons[6].value = this.vector.x;
  this.neurons[7].value = this.vector.y;
  this.neurons[8].value = this.x - this.nearestDot.x;
  this.neurons[9].value = this.y - this.nearestDot.y;
  this.neurons[10].value = this.life - this.nearestDot.life;

  let newValues = [];
  for (let fillIndex = 0; fillIndex < this.InputCount; fillIndex++) {
    newValues.push(0);
  }

  for (let index = 0; index < 4; index++) {
    for (
      let cindex = 0;
      cindex < this.neurons[index].connections.length;
      cindex++
    ) {
      newValues[index] +=
        this.neurons[cindex].value *
        this.neurons[index].connections[cindex].weight;
    }
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
