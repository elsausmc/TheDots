let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels;
let dotCount = 100;

// // let populationData = {
// //   mostLife: 0,
// //   highestAverage: 0,
// //   averageAge: 0,
// //   highestAge: 0,
// //   oldestDot: 0
// // };

// // let dots = [];
let populationCount = 3;
let population = [];

function Init() {
  for (let popI = 0; popI < populationCount; popI++) {
    population.push({
      data: {
        mostLife: 0,
        highestAverage: 0,
        averageAge: 0,
        highestAge: 0,
        oldestDot: 0
      },
      dots: []
    });
    
    for (let i = 0; i < dotCount; i++) {
      population[popI].dots.push(new Dot());
      switch (popI) {
        case 0:
          population[popI].dots[i].color = { r: 0, g: 255, b: 0 };
          break;
        case 1:
          population[popI].dots[i].color = { r: 255, g: 0, b: 0 };
          break;
        case 2:
          population[popI].dots[i].color = { r: 127, g: 127, b: 255 };
          break;
      }

      if (i < dotCount * 0.5) {
        population[popI].dots[i].RestoreBrain();
      }
    }
  }

  DrawGrid();
}

function DrawGrid() {
  

  for (let popI = 0; popI < populationCount; popI++) {
    let totalLife = 0;
    population[popI].data.highestAge = 0;
    population[popI].data.mostLife = 0;
    for (let i = 0; i < dotCount; i++) {
      totalLife += population[popI].dots[i].life;
      population[popI].dots[i].CheckDots(population[popI].dots);

      population[popI].dots[i].DoMovement();
      if (population[popI].dots[i].life > population[popI].data.mostLife) {
        population[popI].data.mostLife = population[popI].dots[i].life;
      }

      if (population[popI].dots[i].age > population[popI].data.highestAge) {
        population[popI].data.oldestDot = i;
        population[popI].data.highestAge = population[popI].dots[i].age;
      }
    }

    let averageLife = totalLife / dotCount;
    if (averageLife > population[popI].data.highestAverage) {
      population[popI].data.highestAverage = averageLife;
    }

    for (
      let dotIndex = 0;
      dotIndex < population[popI].dots.length;
      dotIndex++
    ) {
      let dot = population[popI].dots[dotIndex];

      if (dot.CheckDeath() === true) {
        if (dot.age >= population[popI].data.highestAge) {
          dot.SaveBrain();
        }

        let copyDot = population[popI].data.oldestDot;
        if (Math.random() < 0.5) {
          copyDot = Math.floor(Math.random() * population[popI].dots.length);
        }

        dot.CopyBrain(population[popI].dots[copyDot]);
        dot.MutateBrain();

        dot.x = Math.random() * ctx.canvas.width;
        dot.y = Math.random() * ctx.canvas.height;

        dot.vector.x = 0;
        dot.vector.y = 0;
        dot.life = 10;
        dot.age = 0;
      }
    }
  }

  // clear screen
  pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  let index = 0;
  let dot;

  // draw
  for (let popI = 0; popI < populationCount; popI++) {
    for (let i = 0; i < dotCount; i++) {
      dot = population[popI].dots[i];
      let x = Math.floor(dot.x);
      let y = Math.floor(dot.y);

      ////let colorShift = dot.age / population[popI].data.highestAge * 255;
      let dotSize = 1;
      if (i === population[popI].data.oldestDot) {
        ////colorShift = 255;
        dotSize += 2;
      }

      for (let xx = x - dotSize; xx <= x + dotSize; xx++) {
        for (let yy = y - dotSize; yy <= y + dotSize; yy++) {
          index = (xx + yy * ctx.canvas.width) * 4;
          if (
            !(
              xx < 0 ||
              yy < 0 ||
              xx > ctx.canvas.width ||
              yy > ctx.canvas.height
            )
          ) {
            pixels.data[index] = dot.color.r; //colorShift;
            pixels.data[index + 1] = dot.color.g; //255 - colorShift;
            pixels.data[index + 2] = dot.color.b; //0;
            pixels.data[index + 3] = 255;
          }
        }
      }
    }
  }

  ctx.putImageData(pixels, 0, 0);

  // // ctx.font = "10px Arial";
  // // ctx.fillStyle = "white";
  // // ctx.fillText("average energy: " + averageLife.toFixed(3), 10, 40);
  // // ctx.fillText("most energy: " + population[popI].data.mostLife.toFixed(3), 10, 50);
  // // ctx.fillText("oldest age: " + population[popI].data.highestAge, 10, 60);

  setTimeout(function() {
    DrawGrid();
  }, 1);
  return;
}

Init();
