import { useEffect, useRef, useState } from "react";

type RobotGridProps = {
  rows: number;
  cols: number;
};

const GRID_HEIGHT = 500;
const GRID_WIDTH = 500;

export const RobotGrid = ({ rows, cols }: RobotGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });

  const squareSize = Math.min(GRID_HEIGHT / rows, GRID_WIDTH / cols);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Set canvas size based on rows and cols
    canvas.width = cols * squareSize;
    canvas.height = rows * squareSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        ctx.fillStyle = "#000";
        if (i === robotPosition.y && j === robotPosition.x) {
          ctx.fillStyle = "#f00";
        }

        ctx.fillRect(
          j * squareSize + 1,
          i * squareSize + 1,
          squareSize - 2,
          squareSize - 2
        );
      }
    }
  }, [robotPosition, rows, cols, squareSize]);

  return <canvas ref={canvasRef} />;
};
