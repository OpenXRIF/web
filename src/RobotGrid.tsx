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

  const currentAction = useXrifStore((state) => state.xrifValue?.actions?.[state.highlightedAction]);

  const [robotPosition, setRobotPosition] = useState(ROBOT_START);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [walls, setDrawnCells] = useState<Set<string>>(new Set(E7_WALLS));
  const [waypoints, setWaypoints] = useState<Map<string, string>>(
    new Map(E7_MAPPED)
  );
  const [path, setPath] = useState<Coordinate[]>([]);

  const pathSet = useMemo(
    () => new Set(path.map((p) => `${p.x},${p.y}`)),
    [path]
  );

  const squareSize = Math.min(GRID_HEIGHT / rows, GRID_WIDTH / cols);

  const navigate = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const start = { x: x1, y: y1 };
    const goal = { x: x2, y: y2 };

    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    
    const neighbors = (node) => {
      const directions = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
      ];
      return directions
        .map((dir) => ({ x: node.x + dir.x, y: node.y + dir.y }))
        .filter(
          (n) =>
            n.x >= 0 &&
            n.y >= 0 &&
            n.x < cols &&
            n.y < rows &&
            !walls.has(`${n.x},${n.y}`)
        );
    };
    
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(`${start.x},${start.y}`, 0);
    fScore.set(`${start.x},${start.y}`, heuristic(start, goal));

    while (openSet.length > 0) {
      openSet.sort((a, b) => fScore.get(`${a.x},${a.y}`) - fScore.get(`${b.x},${b.y}`));
      const current = openSet.shift();

      if (current.x === goal.x && current.y === goal.y) {
        let path: Coordinate[] = [];
        let temp = `${goal.x},${goal.y}`;
        while (cameFrom.has(temp)) {
          const [px, py] = temp.split(',').map(Number);
          path.push({ x: px, y: py });
          temp = cameFrom.get(temp);
        }
        path.reverse();
        return path;
      }

      for (const neighbor of neighbors(current)) {
        const tentativeGScore = gScore.get(`${current.x},${current.y}`) + 1;
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, `${current.x},${current.y}`);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));
          if (!openSet.some((n) => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    return [];
  }, [walls]);

  useEffect(() => {
    if (currentAction?.action == "navigate") {
        const {x: x1, y: y1} = robotPosition;
        const {x, y} = currentAction.input;

        const {x: x2, y: y2} = convertCoordinate(x, y);

        console.log("Attempting to navigate:", x1, y1, "to", x2, y2);

        const newPath = navigate(x1, y1, x2, y2);
        setPath(newPath);
        console.log("Setting path: ", newPath);

        return () => {
            console.log("cleaning up")
            newPath.forEach((coord, i) => {
                setTimeout(() => {
                    setRobotPosition(coord)
                    setPath(newPath.slice(i, undefined))
                }, i*35);
            })
            // setPath([]);
        }
    }
  }, [navigate, currentAction, robotPosition]);

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
        //   ctx.fillStyle = "#F00"; // Highlight drawn cells
        //   ctx.fillRect(
        //     x * squareSize + 0.5,
        //     y * squareSize + 0.5,
        //     squareSize - 1,
        //     squareSize - 1
        //   );
        }

        if (y === robotPosition.y && x === robotPosition.x) {
          ctx.fillStyle = "#F0F"; // Highlight robot position
          ctx.fillRect(
            x * (squareSize) - squareSize / 2,
            y * (squareSize) - squareSize / 2,
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
