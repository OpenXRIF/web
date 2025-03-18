import { useXrifStore } from "./store";

export const Executor = () => {
  const executeAction = useXrifStore((state) => state.executeAction);

  return (
    <div>
      <button onClick={executeAction}>Next Action</button>
    </div>
  );
};
