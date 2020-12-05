const getCanvas = ():HTMLCanvasElement => document.getElementById("myCanvas") as HTMLCanvasElement;

const canvas = getCanvas();
const context = canvas.getContext("2d");

if (context) {
  context.moveTo(0, 0);
  context.lineTo(200, 100);
  context.stroke();
}

console.log('start')