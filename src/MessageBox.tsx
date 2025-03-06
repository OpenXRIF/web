import { useState, type FormEvent, Suspense, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import JsonHighlighter from "./components/JsonHighlighter";
import { useXrifStore } from "./store";
import { Executor } from "./Executor";

const DEFAULT_PROMPT = "Enter a command...";

// This component will suspend until the promise resolves.
function Response({ promise }: { promise: Promise<any> }) {
  // The experimental use() hook will throw the promise and let Suspense handle the fallback.
  const data = use(promise);
  return (
    <textarea
      readOnly
      value={JSON.stringify(data, null, 2)}
      placeholder="Response will appear here..."
      className={cn(
        "w-full bg-card",
        "border border-input rounded-xl p-3",
        "font-mono resize-none",
        "placeholder:text-muted-foreground",
        "h-full"
      )}
    />
  );
}

export function MessageBox() {
  const responsePromise = useXrifStore((state) => state.xrifPromise);
  const xrifKey = useXrifStore((state) => state.xrifKey);
  const fetchXrif = useXrifStore((state) => state.getXrif);

  const testEndpoint = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = formData.get("message") as string;

    fetchXrif(message);
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl text-left",
        "flex flex-col gap-4"
      )}
    >
      <form
        onSubmit={testEndpoint}
        className={cn(
          "flex items-center",
          "gap-2 bg-card p-3 rounded-xl font-mono",
          "border border-input w-full"
        )}
      >
        <Input
          type="text"
          name="message"
          className={cn(
            "flex-1 font-mono",
            "bg-transparent border-0 shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
          placeholder={DEFAULT_PROMPT}
        />
        <Button type="submit" variant="secondary">
          Send
        </Button>
      </form>
      
      <Executor />

      {responsePromise && (
        <Suspense fallback={<Loading />}>
          {/* <Response promise={responsePromise} /> */}
          <JsonHighlighter obj={use(responsePromise)} path={xrifKey} />
        </Suspense>
      )}
    </div>
  );
}

const LOADING_PHRASES = [
  "Petting the turtles...",
  "Polishing the robots...",
  "Pleeding to the LLM overlords...",
  "Feeding the AI...",
  "Charging the hyperdrive...",
  "Reading white papers...",
  "Multiplying matrices...",
  "Ordering more GPUs...",
  "Appeasing Roko's basilisk...",
];

const Loading = () => {
  const [randomIndex, setRandomIndex] = useState(
    Math.floor(Math.random() * LOADING_PHRASES.length)
  );

  useEffect(() => {
    // Change the loading phrase every 2 seconds
    const interval = setTimeout(
      () => setRandomIndex((prev) => (prev + 1) % LOADING_PHRASES.length),
      2000
    );
    return () => clearTimeout(interval);
  }, []);

  return (
    <div
      className={cn(
        "p-3 text-center",
        "flex flex-row",
        "align-middle justify-center gap-2"
      )}
    >
      <div>{LOADING_PHRASES[randomIndex]}</div>
      {/* Loading spinner */}
      <svg
        className="animate-spin h-5 w-5 ml-3"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          stroke="#000"
          strokeWidth="8"
          r="35"
          strokeDasharray="165 57"
        />
      </svg>
    </div>
  );
};
