function neuron(neuronCount) {
  this.bias = Math.random() * 2 - 1;
  this.connections = [];
  this.value = Math.random() * 2 - 1;
  this.Init(neuronCount);
}

neuron.prototype.Init = function(connectionCount) {
  for (let index = 0; index < connectionCount; index++) {
    this.connections.push({
      nindex: index,
      weight: Math.random() * 2 - 1
    });
  }
};
