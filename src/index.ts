import { v4 as uuid } from "uuid";

const CHARSET =
  'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ012345789":・.=*+-<>¦｜&çﾘｸ日';
const CHAR_MAX_SIZE = 30;
const CHAR_SHADOW_BLUR = 8;
const CHAR_FLIP_RATE = 0.0006;

const LINE_MIN_HEIGHT = 30;
const LINE_MAX_HEIGHT = 110;

const LINE_SPAWN_RATE = 1.2;

const FRAMES_PER_CHAR = 4;
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
    this.char = this.getRandomChar();
  }

  private getRandomChar = () =>
    CHARSET.charAt(Math.floor(Math.random() * CHARSET.length - 1));

  public getChar = () => this.char;
  public flipChar = () => (this.char = this.getRandomChar());
}

class Line {
  private x: number;
  private y: number;
  private screenHeight: number;
  private size: number;
  private chars: Char[] = [];
  private startingChar = 0;
  private charsToDraw = 0;
  private frame = 0;
  private status: LineStates = LineStates.DRAWING;
  private charColor = "rgba(0, 128, 0, 1)";

  constructor(x: number, y: number, screenHeight: number) {
    this.x = x;
    this.y = y;
    this.screenHeight = screenHeight;
    this.size = Math.floor(Math.random() * CHAR_MAX_SIZE);
    for (
      let i = 0;
      i < Math.floor(LINE_MIN_HEIGHT + Math.random() * LINE_MAX_HEIGHT);
      i++
    ) {
      this.chars.push(new Char());
    }
  }

  public draw = (brush: CanvasRenderingContext2D) => {
    brush.save();
    brush.font = `${this.size}px Arial`;
    for (let i = this.startingChar; i < this.charsToDraw; i++) {
      // Flips a random amount of chars
      if (Math.random() < CHAR_FLIP_RATE) this.chars[i].flipChar();

      // Selects a color for the char
      if (this.status !== LineStates.DRAWING) brush.fillStyle = this.charColor;
      else {
        switch (i) {
          case this.charsToDraw - 4:
            brush.fillStyle = "#24a524";
            break;

          case this.charsToDraw - 3:
            brush.fillStyle = "#65c165";
            break;

          case this.charsToDraw - 2:
            brush.fillStyle = "#b3e0b3";
            break;

          case this.charsToDraw - 1:
            brush.fillStyle = "#fff";
            break;

          default:
            brush.fillStyle = this.charColor;
            break;
        }
      }

      // Add shadows to chars
      brush.shadowBlur = CHAR_SHADOW_BLUR;
      brush.shadowColor = this.charColor;

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
          if (
            this.charsToDraw === this.chars.length ||
            this.charsToDraw * this.size > this.screenHeight
          ) {
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
      lines.set(uuid(), new Line(Math.floor(Math.random() * width), 0, height));
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
