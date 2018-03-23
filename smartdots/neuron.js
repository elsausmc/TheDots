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
