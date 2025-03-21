import { useEffect, useMemo, useRef, useState } from "react";
import {
  e7_mapped,
  IMAGE_CROPPED_X,
  IMAGE_CROPPED_Y,
  IMAGE_START_X,
  IMAGE_START_Y,
  img,
  ROBOT_START,
} from "./E7";
import { E7_WALLS } from "./walls";

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

const GRID_HEIGHT = 700;
const GRID_WIDTH = 700;

export const RobotGrid = ({ rows, cols }: RobotGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [robotPosition, setRobotPosition] = useState(ROBOT_START);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [walls, setDrawnCells] = useState<Set<string>>(new Set(E7_WALLS));
  const [waypoints, setWaypoints] = useState<Map<string, string>>(
    new Map(e7_mapped)
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

    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    ctx.drawImage(
      img,
      IMAGE_START_X,
      IMAGE_START_Y,
      IMAGE_CROPPED_X,
      IMAGE_CROPPED_Y,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Draw grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Select color based on cell type
        const waypoint = waypoints.get(`${x},${y}`);
        if (waypoint) {
          ctx.fillStyle = "#00F"; // Highlight path cells
          ctx.fillRect(
            x * squareSize + 0.5,
            y * squareSize + 0.5,
            squareSize - 1,
            squareSize - 1
          );
          ctx.fillText(
            waypoint,
            x * squareSize + 0.5 + 0.5 * squareSize,
            y * squareSize
          );
        } else if (pathSet.has(`${x},${y}`)) {
          ctx.fillStyle = "#0F0"; // Highlight path cells
          ctx.fillRect(
            x * squareSize + 0.5,
            y * squareSize + 0.5,
            squareSize - 1,
            squareSize - 1
          );
        } else if (walls.has(`${x},${y}`)) {
          ctx.fillStyle = "#F00"; // Highlight drawn cells
          ctx.fillRect(
            x * squareSize + 0.5,
            y * squareSize + 0.5,
            squareSize - 1,
            squareSize - 1
          );
        }

        if (y === robotPosition.y && x === robotPosition.x) {
          console.log("Drawing robot");
          ctx.fillStyle = "#F0F"; // Highlight robot position
          ctx.fillRect(
            x * (squareSize - 1),
            y * (squareSize - 1),
            squareSize * 2,
            squareSize * 2
          );
        }
      }
    }
  }, [robotPosition, rows, cols, squareSize, walls]);

  // const exportWalls = () => {
  //   console.log(JSON.stringify(walls.keys().toArray()));
  // };

  return (
    <>
      {/* <button onClick={exportWalls}>Export Walls</button> */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop drawing if the mouse leaves the canvas
        className="rounded-md"
      />
    </>
  );
};
