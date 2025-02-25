import "./index.css";
import { Card, CardContent } from "@/components/ui/card";

import logo from "./logo.svg";
import { RobotGrid } from "./RobotGrid";
import { MessageBox } from "./MessageBox";

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
              OpenXRIF Demo
            </h1>
          </div>
          {/* <p>This is a demo project for OpenXRIF.</p> */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <MessageBox />
            <RobotGrid rows={30} cols={30} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
