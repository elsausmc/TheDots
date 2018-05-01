class neuron {
  constructor(connectionCount) {
    //this.bias = Math.random() * 2 - 1;
    this.value = 0;
    this.connections = [];
    for (let index = 0; index <= connectionCount; index++) {
      this.connections.push({
        weight: 0 // Math.random() * 2 - 1
      });
    }
  }
}
