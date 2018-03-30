function neuron(connectionCount) {
  //this.bias = Math.random() * 2 - 1;
  this.value = Math.random() * 2 - 1;

  this.connections = [];
  for (let index = 0; index < connectionCount; index++) {
    this.connections.push({
      weight: Math.random() * 2 - 1
    });
  }
}
