class neuron {
  constructor(connectionCount) {
    this.value = 0;
    this.connections = [];
    for (let index = 0; index <= connectionCount; index++) {
      this.connections.push({
        //weight: 0 // No brains
        //weight: (Math.random() * 2 - 1) * 0.001 // little bit of brains
        weight: (Math.random() * 2 - 1) // lots of brains
      });
    }
  }
}
