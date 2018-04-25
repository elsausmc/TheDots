class Dot {
  constructor() {
    this.vector = { x: 0, y: 0 };
    this.color = {
      r: Math.floor(Math.random() * 256), //127 + Math.floor(Math.random() * 127),
      g: Math.floor(Math.random() * 256), //127 + Math.floor(Math.random() * 127),
      b: Math.floor(Math.random() * 256) //127 + Math.floor(Math.random() * 127)
    };
    this.age = 0;
    this.life = Math.random()*10;
    this.tickRate = 0.01;
    this.nearestDot = null;
    this.nearestFood = null;
    this.x = Math.random() * ctx.canvas.width;
    this.y = Math.random() * ctx.canvas.height;
    // inputs
    this.inputCount = 15;
    this.inputs = new Array(this.inputCount).fill(0);
    this.layer1Count = 6;
    this.layer1 = [];
    // hidden layer 1
    for (let index = 0; index < this.layer1Count; index++) {
      this.layer1.push(new neuron(this.inputCount));
    }
    this.layer2Count = 6;
    this.layer2 = [];
    // hidden layer 1
    for (let index = 0; index < this.layer2Count; index++) {
      this.layer2.push(new neuron(this.layer1Count));
    }
    // output
    this.outputCount = 2;
    this.outputLayer = [];
    for (let index = 0; index < this.outputCount; index++) {
      this.outputLayer.push(new neuron(this.layer2Count));
    }
  }
  Bounce() {
    // Bounce
    var bounce = -0.5;
    if (this.x > ctx.canvas.width - 1) {
      this.x = ctx.canvas.width - 1;
      this.vector.x *= bounce;
      this.life -= this.vector.x + 0.1;
    }
    if (this.x < 1) {
      this.x = 0;
      this.vector.x *= bounce;
      this.life *= this.vector.x + 0.1;
    }
    if (this.y > ctx.canvas.height - 1) {
      this.y = ctx.canvas.height - 1;
      this.vector.y *= bounce;
      this.life *= this.vector.y + 0.1;
    }
    if (this.y < 1) {
      this.y = 0;
      this.vector.y *= bounce;
      this.life *= this.vector.y + 0.1;
    }
  }
  CheckDots(dots) {
    let smallestdistance = 100000;
    for (let closeIndex = 0; closeIndex < dots.length; closeIndex++) {
      let checkDot = dots[closeIndex];
      if (this !== checkDot) {
        // check closeness
        const distance = this.GetDistance(checkDot);
        if (closeIndex === 0 || distance < smallestdistance) {
          smallestdistance = distance;
          this.nearestDot = checkDot;
          //checkDot.nearestDot = this;

          // check closest food
          if (
            this.nearestFood === null ||
            checkDot.life <= this.nearestFood.life
          ) {
            this.nearestFood = checkDot;
          }
        }
      }
    }
  }
  CheckDeath() {
    return this.Consumed() || this.life < 0 || this.WallDeath();
  }
  Consumed() {
    if (this.nearestDot !== null) {
      const dx = this.x - this.nearestDot.x;
      const dy = this.y - this.nearestDot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 5 && this.life <= this.nearestDot.life) {
        this.nearestDot.life += 1;
        this.life = -1;
        return true;
      }
    }
    return false;
  }
  CopyBrain(otherDot) {
    // copy layer1
    for (let ni = 0; ni < this.layer1.length; ni++) {
      for (let nc = 0; nc < this.layer1[ni].connections.length; nc++) {
        this.layer1[ni].connections[nc].weight =
          otherDot.layer1[ni].connections[nc].weight;
      }
    }
    // copy layer2
    for (let ni = 0; ni < this.layer2.length; ni++) {
      for (let nc = 0; nc < this.layer2[ni].connections.length; nc++) {
        this.layer2[ni].connections[nc].weight =
          otherDot.layer2[ni].connections[nc].weight;
      }
    }
    // copy output
    for (let ni = 0; ni < this.outputLayer.length; ni++) {
      for (let nc = 0; nc < this.outputLayer[ni].connections.length; nc++) {
        this.outputLayer[ni].connections[nc].weight =
          otherDot.outputLayer[ni].connections[nc].weight;
      }
    }
  }
  DoMovement() {
    this.Think();
    this.vector.x += this.outputLayer[0].value;
    this.vector.y += this.outputLayer[1].value;
    this.x += this.vector.x;
    this.y += this.vector.y;

    const lastVector =
      Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y) /
      1000;
    this.life -= this.tickRate + lastVector;
    this.age++;
  }
  GetDistance(otherDot) {
    const dx = this.x - otherDot.x;
    const dy = this.y - otherDot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  }
  GetInputs() {
    this.inputs = [];
    this.inputs.push({ value: this.outputLayer[0].value });
    this.inputs.push({ value: this.outputLayer[1].value });
    this.inputs.push({ value: (centerX - this.x) / centerX });
    this.inputs.push({ value: (centerY - this.y) / centerY });
    
    this.inputs.push({ value: this.x });
    this.inputs.push({ value: this.y });
    this.inputs.push({ value: this.life });
    this.inputs.push({ value: this.vector.x });
    this.inputs.push({ value: this.vector.y });

    this.inputs.push({ value: this.nearestDot.x - this.x });
    this.inputs.push({ value: this.nearestDot.y - this.y });
    this.inputs.push({ value: this.nearestDot.life - this.life });

    this.inputs.push({ value: this.nearestFood.x - this.x });
    this.inputs.push({ value: this.nearestFood.y - this.y });
    this.inputs.push({ value: this.nearestFood.life - this.life });
  }
  MutateBrain() {
    const layer = Math.floor(Math.random() * 3);
    switch (layer) {
      case 0:
        this.MutateNeuron(this.layer1);
        break;
      case 1:
        this.MutateNeuron(this.layer2);
        break;
      default:
        this.MutateNeuron(this.outputLayer);
        break;
    }
  }
  MutateNeuron(outputLayer) {
    let neuronIndex = Math.floor(Math.random() * outputLayer.length);
    let connectionIndex = Math.floor(
      Math.random() * outputLayer[neuronIndex].connections.length
    );
    outputLayer[neuronIndex].connections[connectionIndex].weight +=
      Math.random() * 2 - 1;
  }
  ProcessLayer(layer, input) {
    layer.forEach(neuron => {
      let inputValues = 0;
      for (let ci = 0; ci < neuron.connections.length; ci++) {
        inputValues += input[ci].value * neuron.connections[ci].weight;
      }
      neuron.value = 1 / (1 + Math.exp(-inputValues)) - 0.5;
    });
  }
  RestoreBrain() {
    var oldBrain = JSON.parse(localStorage.getItem("BrainSave"));
    if (oldBrain !== null) {
      if (
        this.layer1[0].connections.length === oldBrain[0][0].connections.length &&
        this.layer2[0].connections.length === oldBrain[1][0].connections.length &&
        this.outputLayer[0].connections.length === oldBrain[2][0].connections.length
      ) {
        this.layer1 = oldBrain[0];
        this.layer2 = oldBrain[1];
        this.outputLayer = oldBrain[2];
      }
    }
  }
  SaveBrain() {
    var layers = [];
    layers.push(this.layer1);
    layers.push(this.layer2);
    layers.push(this.outputLayer);

    var dotString = JSON.stringify(layers);
    localStorage.setItem("BrainSave", dotString);
  }
  StopAtWall() {
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
  }
  Think() {
    this.GetInputs();
    // // this.ProcessLayer1();
    // // this.ProcessLayer2();
    // // this.ProcessOutput();

    this.ProcessLayer(this.layer1, this.inputs);
    this.ProcessLayer(this.layer2, this.layer1);
    this.ProcessLayer(this.outputLayer, this.layer2);
  }
  Wrap() {
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
  }
  WallDeath() {
    return (
      this.x > ctx.canvas.width - 1 ||
      this.x < 0 ||
      this.y > ctx.canvas.height - 1 ||
      this.y < 0
    );
  }
}
