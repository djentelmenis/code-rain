import { v4 as uuid } from "uuid";

const CHARSET =
  'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ012345789":・.=*+-<>¦｜&çﾘｸ日';
const MAX_CHAR_SIZE = 40;
const MAX_LINE_HEIGHT = 40;
const LINE_SPAWN_RATE = 1.1;
const LINE_FALL_SPEED = 20;

const getCanvas = (): HTMLCanvasElement | null =>
  (document.getElementById("myCanvas") as HTMLCanvasElement) || null;

const initCanvas = (): {
  canvas: HTMLCanvasElement;
  brush: CanvasRenderingContext2D;
  width: number;
  height: number;
} => {
  const canvas = getCanvas();
  if (!canvas) throw new Error("No canvas found");

  const brush = canvas.getContext("2d");
  if (!brush) throw new Error("No context found");

  const width = window.innerWidth - 0;
  const height = window.innerHeight - 4;

  return { canvas, brush, width, height };
};

class Char {
  private char: string;

  constructor() {
    this.char = CHARSET.charAt(Math.floor(Math.random() * CHARSET.length - 1));
  }

  public getChar = () => this.char;
}

class Line {
  private x: number;
  private y: number;
  private size: number;
  private chars: Char[] = [];
  private currentChar = 0;
  private frame = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = Math.floor(Math.random() * MAX_CHAR_SIZE);
    for (let i = 0; i < Math.floor(1 + Math.random() * MAX_LINE_HEIGHT); i++) {
      this.chars.push(new Char());
    }
  }

  public draw = (brush: CanvasRenderingContext2D) => {
    brush.save();
    brush.fillStyle = "green";
    brush.font = `${this.size}px Arial`;
    brush.fillText(this.chars[this.currentChar].getChar(), this.x, this.y);
    brush.restore();
  };

  public update = (): boolean => {
    this.frame++;
    if (this.frame === 100 / LINE_FALL_SPEED) {
      this.currentChar++;
      this.frame = 0;
      this.y += this.size;
      if (this.currentChar === this.chars.length) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
}

const main = () => {
  const { canvas, brush, width, height } = initCanvas();

  canvas.width = width;
  canvas.height = height;

  const lines: Map<string, Line> = new Map();

  const animate = (): void => {
    requestAnimationFrame(animate);

    if (Math.random() * LINE_SPAWN_RATE > 1) {
      lines.set(
        uuid(),
        new Line(
          Math.floor(Math.random() * width),
          Math.floor(Math.random() * height)
        )
      );
    }

    // Draw black background
    brush.save();
    brush.fillStyle = "black";
    brush.fillRect(0, 0, width, height);
    brush.restore();

    for (const [, value] of lines) {
      value.draw(brush);
    }

    for (const [key, value] of lines) {
      if (value.update()) {
        lines.delete(key);
      }
    }
  };

  animate();
};

main();
