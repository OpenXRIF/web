import type { Coordinate } from "@/RobotGrid";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const linesFromNumber = (lines: string[], number: number) => {
    // Get the item at the index from the json string lines
    let inArray = false;
    let idx = 0;
    let start = null;
    let end = null;
    const bracketStack = [];

    for (let i = 0; i < lines.length; i++) {
        // First [ is start of array
        if (!inArray) {
            if (lines[i].trimEnd().endsWith("[")) {
                bracketStack.push("[");
                inArray = true;
            }
        } else {
            if (bracketStack.length === 1 && idx === number) {
                // Start of object
                start = i;
            }
            // Check for end of array
            let bracket = lines[i].trimEnd().split(" ").pop()[0];
            if (bracket === "{" || bracket === "[") {
                bracketStack.push(bracket);
            } else if (bracket === "}" || bracket === "]") {
                bracketStack.pop();
            }
            if (bracketStack.length === 1) {
                if (start) {
                    end = i;
                    break;
                }
                // End of object
                idx++;
            }
        }
    }

    return { start, end };
};
const linesFromKey = (lines: string[], key: string) => {
    let start: number = null;
    let end: number = null;
    const bracketStack = [];

    for (let i = 0; i < lines.length; i++) {
        if (start === null) {
            if (lines[i].trimStart().includes(`"${key}":`)) {
                start = i;
            }
        }
        if (start !== null) {
            // We have a start, check for end
            let bracket = lines[i].trimEnd().split(" ").pop()[0];
            if (bracket === "{" || bracket === "[") {
                bracketStack.push(bracket);
            } else if (bracket === "}" || bracket === "]") {
                bracketStack.pop();
            }
            if (bracketStack.length === 0) {
                end = i;
                break;
            }
        }
    }
    return { start, end, lines };
};
export const getHighlightedLines = (obj, path: string) => {
    const lines = JSON.stringify(obj, null, 2).split("\n");

    const keys = path.split(".");

    let localLines = lines;

    let globalStart = 0;
    let globalEnd = null;

    for (let key of keys) {
        if (!key) {
            continue;
        }

        let bracket = localLines[0].trimEnd().split(" ").pop()[0];

        let { start, end } = bracket === "["
            ? linesFromNumber(localLines, Number(key))
            : linesFromKey(localLines, key);
        if (start === null || end === null) {
            // Could not find key
            return { start: null, end: null, lines };
        }

        start += globalStart;
        end += globalStart;

        // Get the selected lines for the next iteration
        globalStart = start;
        globalEnd = end;
        localLines = lines.slice(globalStart, globalEnd + 1);
    }

    //   const { start, end } = linesFromKey(lines, path);
    return { start: globalStart, end: globalEnd, lines };
};
export function createPath(x1: number, y1: number, x2: number, y2: number, walls: Set<string>) {
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
          // n.x >= 0 &&
          // n.y >= 0 &&
          // n.x < cols &&
          // n.y < rows &&
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
}
;
