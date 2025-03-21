import "./index.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import logo from "./logo.svg";
import { MessageBox } from "./MessageBox";
import { Executor } from "./Executor";
import GridDrawer from "./GridDrawer";
import SpeechBubble from "./SpeechBubble";
import { RobotGrid } from "./RobotGrid";
import { GRID_X, GRID_Y } from "./E7";
import { Legend } from "./Legend";

// 3400 x 2200
// crop -440, -270
// 148 x 97

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <Card className="bg-card/50 backdrop-blur-sm border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center mb-8">
            <a href="https://github.com/OpenXRIF">
              <img
                src={logo}
                alt="OpenXRIF Logo"
                className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
              />
            </a>
            <h1 className="text-5xl font-bold my-4 leading-tight text-start flex-grow">
              OpenXRIF
            </h1>
          </div>
          {/* <p>This is a demo project for OpenXRIF.</p> */}
          <div className="grid grid-cols-[30%_70%] gap-8">
            <div>
              <MessageBox />
            </div>
            <div>
              <div className="flex flex-row">
                <Executor />
                <SpeechBubble />
              </div>
              <div className="flex flex-row gap-2">
                <RobotGrid rows={GRID_Y} cols={GRID_X} />
                {/* <GridDrawer /> */}
                <Legend />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
