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
    this.brain = new Brain();
    this.population = [];
  }

  CheckDots(population) {
    this.population = population;

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

  DoMovement() {
    this.ThinkAboutStuff();
    let lastLayer = this.brain.layers.length - 1;
    this.vector.x += this.brain.layers[lastLayer][0].value - this.brain.layers[lastLayer][1].value;
    this.vector.y += this.brain.layers[lastLayer][2].value - this.brain.layers[lastLayer][3].value;
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
    this.brain.layers[0] = [];

    let lastLayer = this.brain.layers.length - 1;
    this.brain.layers[0].push({
      value: this.brain.layers[lastLayer][0].value
    });
    this.brain.layers[0].push({
      value: this.brain.layers[lastLayer][1].value
    });
    this.brain.layers[0].push({
      value: this.brain.layers[lastLayer][2].value
    });
    this.brain.layers[0].push({
      value: this.brain.layers[lastLayer][3].value
    });

    this.brain.layers[0].push({
      value: this.life
    });
    this.brain.layers[0].push({
      value: this.vector.x
    });
    this.brain.layers[0].push({
      value: this.vector.y
    });

    this.brain.layers[0].push({
      value: this.nearestDot.x - this.x
    });
    this.brain.layers[0].push({
      value: this.nearestDot.y - this.y
    });
    this.brain.layers[0].push({
      value: this.nearestDot.life - this.life
    });

    this.brain.layers[0].push({
      value: this.nearestDot.color.r
    });
    this.brain.layers[0].push({
      value: this.nearestDot.color.g
    });
    this.brain.layers[0].push({
      value: this.nearestDot.color.b
    });

    // // this.brain.layers[0].push({
    // //   value: this.nearestFood.x - this.x
    // // });
    // // this.brain.layers[0].push({
    // //   value: this.nearestFood.y - this.y
    // // });
    // // this.brain.layers[0].push({
    // //   value: this.nearestFood.life - this.life
    // // });
  }

  ThinkAboutStuff() {
    this.GetInputs();
    this.brain.ProcessLayers();
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