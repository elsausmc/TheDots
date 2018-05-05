class Dot {
  constructor() {
    this.vector = {
      x: 0,
      y: 0
    };
    this.color = {
      r: Math.floor(Math.random() * 256), //127 + Math.floor(Math.random() * 127),
      g: Math.floor(Math.random() * 256), //127 + Math.floor(Math.random() * 127),
      b: Math.floor(Math.random() * 256) //127 + Math.floor(Math.random() * 127)
    };
    this.age = 0;
    this.life = Math.random() * 10;
    this.tickRate = 0.02;
    this.nearestDot = null;
    this.nearestFood = null;
    this.x = Math.random() * ctx.canvas.width;
    this.y = Math.random() * ctx.canvas.height;

    this.layers = [];
    this.layers.push(new Array(13));
    this.layers.push(new Array(6));
    this.layers.push(new Array(6));
    this.layers.push(new Array(4));

    // fill layers
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      for (let ni = 0; ni < this.layers[layerIndex].length; ni++) {
        this.layers[layerIndex][ni] = new neuron(this.layers[layerIndex-1].length);
      }
    }
   

  }
  CheckDots(population) {
    let smallestdistance = 100000000;
    for (let popI = 0; popI < population.length; popI++) {
      for (
        let closeIndex = 0; closeIndex < population[popI].dots.length; closeIndex++
      ) {
        if (this !== population[popI].dots[closeIndex]) {
          // check closeness
          const distance = this.GetDistance(population[popI].dots[closeIndex]);
          if (distance < smallestdistance) {
            smallestdistance = distance;
            this.nearestDot = population[popI].dots[closeIndex];
          }

          // check closest food
          if (this.DifferentColor(population[popI].dots[closeIndex].color)) {
            if (this.nearestFood === null) {
              this.nearestFood = population[popI].dots[closeIndex];
            }

            const foodDistance = this.GetDistance(
              population[popI].dots[closeIndex]
            );

            if (
              foodDistance <= this.GetDistance(this.nearestFood) &&
              population[popI].dots[closeIndex].life <= this.nearestFood.life
            ) {
              this.nearestFood = population[popI].dots[closeIndex];
            }
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
      if (distance < 5) {
        if (this.DifferentColor(this.nearestDot.color)) {
          if (this.life < this.nearestDot.life) {
            this.life = -2;
            return true;
          } else {
            this.life += 2;
            return false;
          }
        }
      }
    }
    return false;
  }
  DifferentColor(otherColor) {
    return (
      this.color.r !== otherColor.r ||
      this.color.g !== otherColor.g ||
      this.color.b !== otherColor.b
    );
  }
  CopyBrain(otherDot) {
    // loop through layers
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      // loop though neurons
      for (let ni = 0; ni < this.layers[layerIndex].length; ni++) {
        // loop though connections
        for (let nc = 0; nc < this.layers[layerIndex][ni].connections.length; nc++) {
          // copy that floppy
          this.layers[layerIndex][ni].connections[nc].weight = otherDot.layers[layerIndex][ni].connections[nc].weight;
        }
      }
    }
  }
  DoMovement() {
    this.ProcessLayers();
    let lastLayer = this.layers.length - 1;
    this.vector.x += this.layers[lastLayer][0].value - this.layers[lastLayer][1].value;
    this.vector.y += this.layers[lastLayer][2].value - this.layers[lastLayer][3].value;
    this.x += this.vector.x;
    this.y += this.vector.y;

    const lastVector = Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y) / 1000;
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
    this.layers[0] = [];

    let lastLayer = this.layers.length - 1;
    this.layers[0].push({
      value: this.layers[lastLayer][0].value
    });
    this.layers[0].push({
      value: this.layers[lastLayer][1].value
    });
    this.layers[0].push({
      value: this.layers[lastLayer][2].value
    });
    this.layers[0].push({
      value: this.layers[lastLayer][3].value
    });

    this.layers[0].push({
      value: this.life
    });
    this.layers[0].push({
      value: this.vector.x
    });
    this.layers[0].push({
      value: this.vector.y
    });

    this.layers[0].push({
      value: this.nearestDot.x - this.x
    });
    this.layers[0].push({
      value: this.nearestDot.y - this.y
    });
    this.layers[0].push({
      value: this.nearestDot.life - this.life
    });

    this.layers[0].push({
      value: this.nearestFood.x - this.x
    });
    this.layers[0].push({
      value: this.nearestFood.y - this.y
    });
    this.layers[0].push({
      value: this.nearestFood.life - this.life
    });
  }
  MutateBrain() {
    // pick a random layer
    const layer = 1 + Math.floor(Math.random() * (this.layers.length - 1));

    // pick a random neuron
    let neuronIndex = Math.floor(Math.random() * this.layers[layer].length);

    // pick a random connection
    let connectionIndex = Math.floor(Math.random() * this.layers[layer][neuronIndex].connections.length);

    // TODO: all the neurons have references to the same connection.
    // randomly adjust it.
    this.layers[layer][neuronIndex].connections[connectionIndex].weight += Math.random() * 2 - 1;
  }
 
  ProcessLayers() {
    this.GetInputs();
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      for (let ni = 0; ni < this.layers[layerIndex].length; ni++) {
        
        let inputValues = 0;
        for (let ci = 0; ci < this.layers[layerIndex][ni].connections.length - 1; ci++) {
          // input times a weight
          inputValues += this.layers[layerIndex - 1][ci].value * this.layers[layerIndex][ni].connections[ci].weight;
        }

        // add a bias
        inputValues += this.layers[layerIndex][ni].connections[this.layers[layerIndex][ni].connections.length - 1].weight;

        // activate
        //// this.layers[layerIndex][ni].value = 1 / (1 + Math.exp(-inputValues));  // sigmoid
        this.layers[layerIndex][ni].value = Math.tanh(inputValues);
        //// this.layers[layerIndex][ni].value = Math.max(0,inputValues); // ReLU
      }
    }
  }

  RestoreBrain(populationIndex) {
    var oldBrain = JSON.parse(localStorage.getItem("BrainSave" + populationIndex));
    if (oldBrain !== null) {
      if (
        this.layers[1].length === oldBrain[0].length && this.layers[1][0].connections.length === oldBrain[0][0].connections.length &&
        this.layers[2].length === oldBrain[1].length && this.layers[2][0].connections.length === oldBrain[1][0].connections.length &&
        this.layers[3].length === oldBrain[2].length && this.layers[3][0].connections.length === oldBrain[2][0].connections.length
      ) {
        this.layers = oldBrain;
        // this.layers[1] = oldBrain[1];
        // this.layers[2] = oldBrain[2];
        // this.layers[3] = oldBrain[3];
      }
    }
  }
  SaveBrain(populationIndex) {
    var dotString = JSON.stringify(this.layers);
    localStorage.setItem("BrainSave" + populationIndex, dotString);
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