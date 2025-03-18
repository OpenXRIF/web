import { useEffect, useMemo, useRef, useState } from "react";

type Waypoint = {
  name: string;
  x: number;
  y: number;
};

type RobotGridProps = {
  rows: number;
  cols: number;
};

type Coordinate = {
  x: number;
  y: number;
};

const GRID_HEIGHT = 500;
const GRID_WIDTH = 500;

export const RobotGrid = ({ rows, cols }: RobotGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [walls, setDrawnCells] = useState<Set<string>>(new Set());
  const [waypoints, setWaypoints] = useState<Map<string, string>>(
    new Map([
      ["0,0", "Start"],
      ["10,0", "Home"],
      ["10,0", "10,0"],
    ])
  );
  const [path, setPath] = useState<Coordinate[]>([]);

  const pathSet = useMemo(
    () => new Set(path.map((p) => `${p.x},${p.y}`)),
    [path]
  );

  const squareSize = Math.min(GRID_HEIGHT / rows, GRID_WIDTH / cols);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Get type of cell
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);
    if (walls.has(`${x},${y}`)) {
      setIsRemoving(true);
      eraseCell(e);
    } else {
      setIsDrawing(true);
      drawCell(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      drawCell(e);
    } else if (isRemoving) {
      eraseCell(e);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsRemoving(false);
  };

  const drawCell = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);

    const cellKey = `${x},${y}`;
    if (!walls.has(cellKey)) {
      // Add wall if drawing and cell is not a wall
      setDrawnCells((prev) => new Set(prev).add(cellKey));
    }
  };

  const eraseCell = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);

    const cellKey = `${x},${y}`;
    if (walls.has(cellKey)) {
      // Remove wall if removing and cell is a wall
      setDrawnCells((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }
  };

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
    ctx.fillStyle = "#666";
    ctx.fillRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

    // Draw grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Select color based on cell type
        ctx.fillStyle = "#000"; // background color
        if (waypoints.has(`${x},${y}`)) {
          ctx.fillStyle = "#ff0"; // Highlight path cells
        } else if (pathSet.has(`${x},${y}`)) {
          ctx.fillStyle = "#00f"; // Highlight path cells
        } else if (walls.has(`${x},${y}`)) {
          ctx.fillStyle = "#fff"; // Highlight drawn cells
        }

        ctx.fillRect(
          x * squareSize + 0.5,
          y * squareSize + 0.5,
          squareSize - 1,
          squareSize - 1
        );

        if (y === robotPosition.y && x === robotPosition.x) {
          ctx.fillStyle = "#f00"; // Highlight robot position
          ctx.fillRect(
            x * squareSize + 2,
            y * squareSize + 2,
            squareSize - 4,
            squareSize - 4
          );
        }
      }
    }
  }, [robotPosition, rows, cols, squareSize, walls]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop drawing if the mouse leaves the canvas
    />
  );
};
