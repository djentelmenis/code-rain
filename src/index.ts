import { v4 as uuid } from "uuid";

const CHARSET =
  'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ012345789":・.=*+-<>¦｜&çﾘｸ日';
const MAX_CHAR_SIZE = 35;
const MIN_LINE_HEIGHT = 30;
const MAX_LINE_HEIGHT = 110;
const LINE_SPAWN_RATE = 1.2;
const FRAMES_PER_CHAR = 5;
const LINE_DRAWN_FRAMES = 60;
const LINE_FADE_FRAMES = 120;

enum LineStates {
  DRAWING = "DRAWING",
  DRAWN = "DRAWN",
  FADING = "FADING",
  ERASING = "ERASING",
}

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
  private startingChar = 0;
  private charsToDraw = 0;
  private frame = 0;
  private status: LineStates = LineStates.DRAWING;
  private charColor = "rgba(0, 128, 0, 1)";

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = Math.floor(Math.random() * MAX_CHAR_SIZE);
    for (
      let i = 0;
      i < Math.floor(MIN_LINE_HEIGHT + Math.random() * MAX_LINE_HEIGHT);
      i++
    ) {
      this.chars.push(new Char());
    }
  }

  public draw = (brush: CanvasRenderingContext2D) => {
    brush.save();
    brush.font = `${this.size}px Arial`;
    for (let i = this.startingChar; i < this.charsToDraw; i++) {
      brush.fillStyle =
        this.status === LineStates.DRAWING && i === this.charsToDraw - 1
          ? "white"
          : this.charColor;
      brush.fillText(this.chars[i].getChar(), this.x, this.y + this.size * i);
    }
    brush.restore();
  };

  public update = (): boolean => {
    this.frame++;

    switch (this.status) {
      case LineStates.DRAWING:
        if (this.frame > FRAMES_PER_CHAR) {
          this.charsToDraw++;
          this.frame = 0;
          if (this.charsToDraw === this.chars.length) {
            this.status = LineStates.DRAWN;
          }
        }
        break;

      case LineStates.DRAWN:
        if (this.frame > LINE_DRAWN_FRAMES) {
          this.status = LineStates.FADING;
          this.frame = 0;
        }
        break;

      case LineStates.FADING:
        this.charColor = `rgba(0, 128, 0, ${
          1 - this.frame / (LINE_FADE_FRAMES * 1.2)
        })`;
        if (this.frame > LINE_FADE_FRAMES) {
          this.status = LineStates.ERASING;
          this.frame = 0;
        }
        break;

      case LineStates.ERASING:
        if (this.frame > FRAMES_PER_CHAR) {
          if (this.startingChar !== this.charsToDraw) {
            this.startingChar++;
            this.frame = 0;
          } else return true;
        }
        break;

      default:
        return false;
    }

    return false;
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
      lines.set(uuid(), new Line(Math.floor(Math.random() * width), 0));
    }

    // Draw black background
    brush.save();
    brush.fillStyle = "black";
    brush.fillRect(0, 0, width, height);
    brush.restore();

    // Draw lines
    for (const [, value] of lines) {
      value.draw(brush);
    }

    // Update lines
    for (const [key, value] of lines) {
      if (value.update()) {
        lines.delete(key);
      }
    }
  };

  animate();
};

main();
