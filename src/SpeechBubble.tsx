import { useXrifStore } from "./store";

const SpeechBubble = () => {
  const action = useXrifStore(
    (state) => state.xrifValue?.actions[state.highlightedAction]
  );

  if (!action) {
    return (
      <div className="bg-card p-4 rounded-xl">
        <p>Finished executing XRIF.</p>
      </div>
    )
  }

  if (action?.action === "speak") {
    return (
      <div className="bg-card p-4 rounded-xl">
        <p>Robot says: {action.input}</p>
      </div>
    );
  }

  if (action?.action === "wait") {
    return (
      <div className="bg-card p-4 rounded-xl">
        <p>Waiting for {action.input} seconds...</p>
      </div>
    );
  }

  if (action?.action === "navigate") {
    return (
      <div className="bg-card p-4 rounded-xl">
        <p>Navigating to {action.input.name}...</p>
      </div>
    );
  }
};

export default SpeechBubble;
