let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels;
let dotCount = 50;
let veryOldest = 0;

let populationCount = 3;
let populations = [];

function Init() {
  for (let popI = 0; popI < populationCount; popI++) {
    populations.push({
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
      populations[popI].dots.push(new Dot());
      switch (popI) {
        case 0:
          populations[popI].dots[i].color = {
            r: 0,
            g: 255,
            b: 0
          };
          break;
        case 1:
          populations[popI].dots[i].color = {
            r: 255,
            g: 0,
            b: 0
          };
          break;
        case 2:
          populations[popI].dots[i].color = {
            r: 0,
            g: 255,
            b: 255
          };
          break;
        case 3:
          populations[popI].dots[i].color = {
            r: 255,
            g: 255,
            b: 0
          };
          break;
        case 4:
          populations[popI].dots[i].color = {
            r: 0,
            g: 0,
            b: 255
          };
          break;
      }

      if (i < dotCount * 0.90) {
       populations[popI].dots[i].brain.Restore(popI);
      }
    }
  }

  DrawGrid();
}

function DoTheThings() {
  veryOldest = 0;
  for (let popI = 0; popI < populationCount; popI++) {
    let totalLife = 0;
    populations[popI].data.highestAge = 0;
    populations[popI].data.mostLife = 0;
    for (let i = 0; i < dotCount; i++) {
      totalLife += populations[popI].dots[i].life;
      populations[popI].dots[i].CheckDots(populations);

      populations[popI].dots[i].DoMovement();
      if (populations[popI].dots[i].life > populations[popI].data.mostLife) {
        populations[popI].data.mostLife = populations[popI].dots[i].life;
      }

      if (populations[popI].dots[i].age > populations[popI].data.highestAge) {
        populations[popI].data.oldestDot = i;
        populations[popI].data.highestAge = populations[popI].dots[i].age;
        if (populations[popI].dots[i].age > veryOldest) {
          veryOldest = populations[popI].dots[i].age;
        }
      }
    }

    let averageLife = totalLife / dotCount;
    if (averageLife > populations[popI].data.highestAverage) {
      populations[popI].data.highestAverage = averageLife;
    }

    for (
      let dotIndex = 0; dotIndex < populations[popI].dots.length; dotIndex++
    ) {
      if (populations[popI].dots[dotIndex].CheckDeath() === true) {
        if (populations[popI].dots[dotIndex].age >= populations[popI].data.highestAge) {
          populations[popI].dots[dotIndex].brain.Save(popI);
        }

        let copyDot = populations[popI].data.oldestDot;
        if (Math.random() < 0.5) {
          copyDot = Math.floor(Math.random() * populations[popI].dots.length);
        }

        populations[popI].dots[dotIndex].brain.Copy(
          populations[popI].dots[copyDot].brain
        );
        populations[popI].dots[dotIndex].brain.Mutate();

        populations[popI].dots[dotIndex].x = Math.random() * ctx.canvas.width;
        populations[popI].dots[dotIndex].y = Math.random() * ctx.canvas.height;

        populations[popI].dots[dotIndex].vector.x = 0;
        populations[popI].dots[dotIndex].vector.y = 0;
        populations[popI].dots[dotIndex].life = 10;
        populations[popI].dots[dotIndex].age = 0;
      }
    }
  }
}

function DrawGrid() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  DoTheThings();

  // clear screen
  pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  let index = 0;

  // draw
  for (let popI = 0; popI < populationCount; popI++) {
    for (let i = 0; i < dotCount; i++) {
      let x = Math.floor(populations[popI].dots[i].x);
      let y = Math.floor(populations[popI].dots[i].y);

      let dotSize = 1;
      // // if (i === populations[popI].data.oldestDot) {
      // //   dotSize = 2;
      // //   if (populations[popI].dots[i].age >= veryOldest) {
      // //     dotSize = 3;
      // //   }
      // // }


      for (let xx = x - dotSize; xx <= x + dotSize; xx++) {
        for (let yy = y - dotSize; yy <= y + dotSize; yy++) {
          index = (xx + yy * ctx.canvas.width) * 4;
          if (!(
              xx < 0 ||
              yy < 0 ||
              xx > ctx.canvas.width ||
              yy > ctx.canvas.height
            )) {
            pixels.data[index] = populations[popI].dots[i].color.r; //colorShift;
            pixels.data[index + 1] = populations[popI].dots[i].color.g; //255 - colorShift;
            pixels.data[index + 2] = populations[popI].dots[i].color.b; //0;
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
  // // ctx.fillText("most energy: " + populations[popI].data.mostLife.toFixed(3), 10, 50);
  // // ctx.fillText("oldest age: " + populations[popI].data.highestAge, 10, 60);

  setTimeout(function () {
    DrawGrid();
  }, 1);
  return;
}

Init();