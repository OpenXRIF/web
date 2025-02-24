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
