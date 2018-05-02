class neuron {
  constructor(connectionCount) {
    this.value = 0;
    this.connections = [];
    for (let index = 0; index <= connectionCount; index++) {
      this.connections.push({
        weight: (Math.random() * 2 - 1) * 0.001
      });
    }
  }
}
