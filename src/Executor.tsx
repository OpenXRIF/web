import { cn } from "./lib/utils";
import { useXrifStore } from "./store";

export const Executor = () => {
  const executeAction = useXrifStore((state) => state.executeAction);
  const actionExists = useXrifStore(
    (state) => !!state.xrifValue?.actions[state.highlightedAction]
  );
  return (
    <div className="p-2">
      <button
        disabled={!actionExists}
        className={cn(
          "rounded-xl border-2 p-2",
          actionExists ? "" : "text-gray-700"
        )}
        onClick={executeAction}
      >
        Next Action
      </button>
    </div>
  );
};
