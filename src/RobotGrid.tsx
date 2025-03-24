import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  convertCoordinate,
  E7_MAPPED,
  IMAGE_CROPPED_X,
  IMAGE_CROPPED_Y,
  IMAGE_START_X,
  IMAGE_START_Y,
  img,
  ROBOT_START,
} from "./E7";
import { E7_WALLS } from "./walls";
import { useXrifStore } from "./store";
import { createPath } from "./lib/utils";

type Waypoint = {
  name: string;
  x: number;
  y: number;
};

type RobotGridProps = {
  rows: number;
  cols: number;
};

export type Coordinate = {
  x: number;
  y: number;
};

const GRID_HEIGHT = 700;
const GRID_WIDTH = 700;

export const RobotGrid = ({ rows, cols }: RobotGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentAction = useXrifStore(
    (state) => state.xrifValue?.actions?.[state.highlightedAction]
  );

  const [robotPosition, setRobotPosition] = useState(ROBOT_START);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [walls, setDrawnCells] = useState<Set<string>>(new Set(E7_WALLS));
  const [waypoints, setWaypoints] = useState<Map<string, string>>(
    new Map(E7_MAPPED)
  );
  const [path, setPath] = useState<Coordinate[]>([]);

  const queuedPath = useRef<Coordinate[]>(null);
  const robotNavPosition = useRef<Coordinate>(ROBOT_START);

  const pathSet = useMemo(
    () => new Set(path.map((p) => `${p.x},${p.y}`)),
    [path]
  );

  const squareSize = Math.min(GRID_HEIGHT / rows, GRID_WIDTH / cols);

  useEffect(() => {
    if (currentAction?.action == "navigate") {
      const { x: x1, y: y1 } = robotNavPosition.current;
      const { x, y } = currentAction.input;

      const { x: x2, y: y2 } = convertCoordinate(x, y);

      console.log("Attempting to navigate:", x1, y1, "to", x2, y2);

      const newPath = createPath(x1, y1, x2, y2, walls);

      console.log("Setting path: ", newPath);

      // Check if we are done animating
      if (queuedPath.current == null) {
        setPath(newPath);
      }

      // Queue path to be animated when we move to next action
      queuedPath.current = newPath;
      // Set robot position to goal to prepare for next navigation action
      robotNavPosition.current = { x: x2, y: y2 };

      // Updates the rendered location over time, following the path
      const animate = async () => {
        const frameTime = 35;

        // Animate robot and path
        newPath.forEach((coord, i) => {
          setTimeout(() => {
            setRobotPosition(coord);
            setPath(newPath.slice(i, undefined));
          }, i * frameTime);
        });

        // Show next path when done if one is queued
        setTimeout(() => {
          setPath(queuedPath.current ?? []);
        }, newPath.length * frameTime);
      };

      return () => {
        // Run animation when we move to the next action
        animate();
      };
    } else {
      // Reset queue when we are not navigating
      queuedPath.current = null;
    }
  }, [walls, currentAction]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Get type of cell
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);
    console.log(`${x},${y}`);
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

  // Drawing
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
          // ctx.fillStyle = "#F00"; // Highlight drawn cells
          // ctx.fillRect(
          //   x * squareSize + 0.5,
          //   y * squareSize + 0.5,
          //   squareSize - 1,
          //   squareSize - 1
          // );
        }

        if (y === robotPosition.y && x === robotPosition.x) {
          ctx.fillStyle = "#F0F"; // Highlight robot position
          ctx.fillRect(
            x * squareSize - squareSize / 2,
            y * squareSize - squareSize / 2,
            squareSize * 2,
            squareSize * 2
          );
        }
      }
    }
  }, [robotPosition, rows, cols, squareSize, walls, pathSet]);

  // const exportWalls = () => {
  //   console.log(JSON.stringify(walls.keys().toArray()));
  // };

  return (
    <>
      {/* <button onClick={exportWalls}>Export Walls</button> */}
      <canvas
        ref={canvasRef}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
        // onMouseLeave={handleMouseUp} // Stop drawing if the mouse leaves the canvas
        className="rounded-md"
      />
    </>
  );
};
