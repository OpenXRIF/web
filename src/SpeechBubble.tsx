import { useXrifStore } from "./store";

const SpeechBubble = () => {
  const action = useXrifStore(
    (state) => state.xrifValue?.actions[state.highlightedAction]
  );

  if (!action) {
    return (
      <div className="p-4 rounded-xl">
        <p>Finished executing XRIF.</p>
      </div>
    );
  }

  if (action?.action === "speak") {
    return (
      <div className="p-4 rounded-xl">
        <p>
          Robot says: <span className="text-pink-300">{action.input}</span>
        </p>
      </div>
    );
  }

  if (action?.action === "wait") {
    return (
      <div className="p-4 rounded-xl">
        <p>Waiting for {action.input} seconds...</p>
      </div>
    );
  }

  if (action?.action === "navigate") {
    return (
      <div className="p-4 rounded-xl">
        <p>
          Navigating to{" "}
          <span className="text-blue-500">{action.input.name}</span>
          ...
        </p>
      </div>
    );
  }
};

export default SpeechBubble;
