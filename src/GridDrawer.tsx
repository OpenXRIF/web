import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"

export default function GridDrawer() {
  const [gridSize, setGridSize] = useState(15)
  const [grid, setGrid] = useState<boolean[][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [specialNodes, setSpecialNodes] = useState([robotPosition]);

  // Initialize grid
  useEffect(() => {
    const newGrid = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(false))
    setGrid(newGrid)
  }, [gridSize])

  // Start drawing walls
  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    setIsDrawing(true)
    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = !newGrid[rowIndex][colIndex] // Toggle cell state
    newGrid[robotPosition.x][robotPosition.y] = false
    setGrid(newGrid)
  }

  // Continue drawing walls while mouse is down
  const handleMouseOver = (rowIndex: number, colIndex: number) => {
    if (!isDrawing) return
    if (rowIndex == robotPosition.x && colIndex == robotPosition.y) return

    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = true // Set cell to wall
    setGrid(newGrid)
  }

  // Stop drawing walls
  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  // Clear the grid
  const handleClear = () => {
    const newGrid = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(false))
    setGrid(newGrid)
  }

  // Handle grid size change
  const handleSizeChange = (value: number[]) => {
    setGridSize(value[0])
  }

  // Add event listener to stop drawing when mouse is released outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDrawing(false)
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 p-6 dark bg-background min-h-screen w-full">
      {/* <h1 className="text-2xl font-bold">Grid Wall Drawer</h1> */}

      <div className="flex flex-col gap-2 w-full max-w-md">
        <div className="flex justify-between">
          <span>
            Grid Size: {gridSize}×{gridSize}
          </span>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Clear Grid
          </button>
        </div>
        <Slider value={[gridSize]} onValueChange={handleSizeChange} min={5} max={30} step={1} />
      </div>

      <div
        ref={gridRef}
        className="border border-border rounded-md overflow-hidden"
        onMouseLeave={() => setIsDrawing(false)}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `min(80vw, 600px)`,
            height: `min(80vw, 600px)`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`border border-border ${cell ? "bg-white" : "bg-background"}`}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
                style={{ aspectRatio: "1/1" }}
              />
            )),
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">Click and drag to draw walls on the grid</div>
    </div>
  )
}