function Dot() {
  this.vector = { x: 0, y: 0 };
  this.color = {
    r: 127 + Math.floor(Math.random() * 127),
    g: 127 + Math.floor(Math.random() * 127),
    b: 127 + Math.floor(Math.random() * 127)
  };

  this.life = 1;
  this.tickRate = 0.001;

  this.nearestDot = null;
  this.nearestFood = null;
  this.x = Math.random() * ctx.canvas.width;
  this.y = Math.random() * ctx.canvas.height;

  // inputs
  this.inputCount = 11;
  this.inputs = new Array(this.inputCount).fill(0);

  this.layer1Count = 10;
  this.layer1 = [];

  // hidden layer 1
  for (let index = 0; index < this.layer1Count; index++) {
    this.layer1.push(new neuron(this.inputCount));
  }

  this.layer2Count = 10;
  this.layer2 = [];

  // hidden layer 1
  for (let index = 0; index < this.layer2Count; index++) {
    this.layer2.push(new neuron(this.layer1Count));
  }

  // output
  this.outputCount = 4;
  this.neurons = [];
  for (let index = 0; index < this.outputCount; index++) {
    this.neurons.push(new neuron(this.layer2Count));
  }
}

Dot.prototype.CheckDots = function(dots) {
  let smallestdistance = 100000;

  for (let closeIndex = 0; closeIndex < dots.length; closeIndex++) {
    let checkDot = dots[closeIndex];
    if (this != checkDot) {
      // check closeness
      const distance = this.GetDistance(checkDot);

      if (closeIndex === 0 || distance < smallestdistance) {
        smallestdistance = distance;
        this.nearestDot = checkDot;
        checkDot.nearestDot = this;

        // check closest food
        if (
          this.nearestFood == null ||
          checkDot.life <= this.nearestFood.life
        ) {
          this.nearestFood = checkDot;
        }
      }
    }
  }
};

Dot.prototype.CheckDeath = function() {
  return this.Consumed() || this.life < 0 || this.WallDeath();
};

Dot.prototype.Consumed = function() {
  if (this.nearestDot != null) {
    const dx = this.x - this.nearestDot.x;
    const dy = this.y - this.nearestDot.y;
    const distance = Math.abs(Math.sqrt(dx * dx + dy * dy));

    if (distance < 2 && this.life <= this.nearestDot.life) {
      this.nearestDot.life += 0.5;
      this.life = 0;
      return true;
    }
  }
  return false;
};

Dot.prototype.CopyBrain = function(randot) {

  // copy layer1
  for (let ni = 0; ni < this.layer1.length; ni++) {
    for (let nc = 0; nc < this.layer1[ni].connections.length; nc++) {
      this.layer1[ni].connections[nc].weight =
        randot.layer1[ni].connections[nc].weight;
    }
  }

  // copy layer2
  for (let ni = 0; ni < this.layer2.length; ni++) {
    for (let nc = 0; nc < this.layer2[ni].connections.length; nc++) {
      this.layer2[ni].connections[nc].weight =
        randot.layer2[ni].connections[nc].weight;
    }
  }

  // copy output
  for (let ni = 0; ni < this.neurons.length; ni++) {
    for (let nc = 0; nc < this.neurons[ni].connections.length; nc++) {
      this.neurons[ni].connections[nc].weight =
        randot.neurons[ni].connections[nc].weight;
    }
  }
};

Dot.prototype.DoMovement = function() {
  const scale = 1;
  this.Think();

  this.vector.x += (this.neurons[0].value - this.neurons[1].value) / scale;
  this.vector.y += (this.neurons[2].value - this.neurons[3].value) / scale;

  this.x += this.vector.x;
  this.y += this.vector.y;
  //// this.StopAtWall();
  ////this.Bounce();
  const lastVector =
    Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y) /
    100;
  this.life -= lastVector; // + this.tickRate;
};

Dot.prototype.GetDistance = function(otherDot) {
  const dx = this.x - otherDot.x;
  const dy = this.y - otherDot.y;
  const distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
  return distance;
};

Dot.prototype.MutateBrain = function() {
  const layer = Math.floor(Math.random() * 2);
  if (layer === 0) {
    this.MutateNeuron(this.layer1);
  } else {
    this.MutateNeuron(this.neurons);
  }
};

Dot.prototype.MutateNeuron = function(neurons) {
  let neuronIndex = Math.floor(Math.random() * neurons.length);
  let neuronConnections = neurons[neuronIndex].connections;
  let connectionIndex = Math.floor(Math.random() * neuronConnections.length);
  let randomConnection = neuronConnections[connectionIndex];
  randomConnection.weight += (Math.random() * 2 - 1) / 1;
};

Dot.prototype.GetInputs = function() {
  this.inputs = [];

  // this.inputs.push(this.neurons[0].value);
  // this.inputs.push(this.neurons[1].value);
  // this.inputs.push(this.neurons[2].value);
  // this.inputs.push(this.neurons[3].value);
  this.inputs.push(this.vector.x);
  this.inputs.push(this.vector.y);

  this.inputs.push((centerX - this.x) / centerX);
  this.inputs.push((centerY - this.y) / centerY);
  this.inputs.push(this.life);

  this.inputs.push(this.nearestDot.x - this.x);
  this.inputs.push(this.nearestDot.y - this.y);
  this.inputs.push(this.life - this.nearestDot.life);

  this.inputs.push(this.nearestFood.x - this.x);
  this.inputs.push(this.nearestFood.y - this.y);
  this.inputs.push(this.life - this.nearestFood.life);
};

Dot.prototype.ProcessLayer1 = function() {
  this.layer1.forEach(neuron => {
    let inputValues = 0;
    for (let ci = 0; ci < neuron.connections.length; ci++) {
      inputValues += this.inputs[ci] * neuron.connections[ci].weight;
    }
    neuron.value = 1 / (1 + Math.exp(-inputValues));
  });
};

Dot.prototype.ProcessLayer2 = function() {
  this.layer2.forEach(neuron => {
    let inputValues = 0;
    for (let ci = 0; ci < neuron.connections.length; ci++) {
      inputValues += this.layer1[ci].value * neuron.connections[ci].weight;
    }
    neuron.value = 1 / (1 + Math.exp(-inputValues));
  });
};

Dot.prototype.ProcessOutput = function() {
  this.neurons.forEach(neuron => {
    let inputValues = 0;
    for (let ci = 0; ci < neuron.connections.length; ci++) {
      inputValues += this.layer2[ci].value * neuron.connections[ci].weight;
    }
    neuron.value = 1 / (1 + Math.exp(-inputValues));
  });
};

Dot.prototype.Think = function() {
  this.GetInputs();
  this.ProcessLayer1();
  this.ProcessLayer2();
  this.ProcessOutput();
};

Dot.prototype.StopAtWall = function() {
  if (this.x > ctx.canvas.width - 1) {
    this.x = ctx.canvas.width - 1;
    this.vector.x = 0;
  }
  if (this.x < 0) {
    this.x = 0;
    this.vector.x = 0;
  }
  if (this.y > ctx.canvas.height - 1) {
    this.y = ctx.canvas.height - 1;
    this.vector.y = 0;
  }
  if (this.y < 0) {
    this.y = 0;
    this.vector.y = 0;
  }
};

Dot.prototype.Bounce = function() {
  // Bounce
  var bounce = -0.5;
  if (this.x > ctx.canvas.width - 1) {
    this.x = ctx.canvas.width - 1;
    this.vector.x *= bounce;
  }
  if (this.x < 0) {
    this.x = 0;
    this.vector.x *= bounce;
  }
  if (this.y > ctx.canvas.height - 1) {
    this.y = ctx.canvas.height - 1;
    this.vector.y *= bounce;
  }
  if (this.y < 0) {
    this.y = 0;
    this.vector.y *= bounce;
  }
};

Dot.prototype.Wrap = function() {
  if (this.x > ctx.canvas.width - 1) {
    this.x = 0;
  }
  if (this.x < 0) {
    this.x = ctx.canvas.width - 1;
  }
  if (this.y > ctx.canvas.height - 1) {
    this.y = 0;
  }
  if (this.y < 0) {
    this.y = ctx.canvas.height - 1;
  }
};

Dot.prototype.WallDeath = function() {
  return (
    this.x > ctx.canvas.width - 1 ||
    this.x < 0 ||
    this.y > ctx.canvas.height - 1 ||
    this.y < 0
  );
};
